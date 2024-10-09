// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MarketplaceContract is Ownable {
    struct Listing {
        uint256 price;
        address seller;
        bool isSold;
    }

    NFTContract private nftContract;
    mapping(uint256 => Listing) public listings;
    uint256[] public listedTokenIds;

    event Minted(uint256 tokenId, address seller);
    event Listed(uint256 tokenId, uint256 price, address seller);
    event Sold(uint256 tokenId, address buyer, uint256 price);
    event ListingCancelled(uint256 tokenId);

    constructor(address _nftContractAddress) Ownable(msg.sender) {
        nftContract = NFTContract(_nftContractAddress);
    }

    function mintNFT(string calldata _tokenURI) external {
        uint256 tokenId = nftContract.mintNFT(msg.sender, _tokenURI); 
        emit Minted(tokenId, msg.sender);
    }

    function listItem(uint256 tokenId, uint256 price) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(listings[tokenId].seller == address(0), "NFT already listed");
        require(!listings[tokenId].isSold, "NFT has already been sold");
        require(price > 0, "Price must be greater than zero");

        listings[tokenId] = Listing(price, msg.sender, false);
        listedTokenIds.push(tokenId); 
        emit Listed(tokenId, price, msg.sender);
    }

    function buyItem(uint256 tokenId) external payable {
        Listing storage listing = listings[tokenId];
        require(listing.seller != address(0), "Item not for sale");
        require(!listing.isSold, "Item already sold"); 
        require(msg.value >= listing.price, "Insufficient funds");

        address seller = listing.seller;
        nftContract.transferFrom(seller, msg.sender, tokenId);
        listing.isSold = true;
        payable(seller).transfer(listing.price);

        emit Sold(tokenId, msg.sender, listing.price);

        delete listings[tokenId];
    }

    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.seller != address(0), "Listing does not exist");
        require(listing.seller == msg.sender, "Not the seller");

        delete listings[tokenId];
        emit ListingCancelled(tokenId);
    }

    function getAllListedTokenIds() external view returns (uint256[] memory) {
        return listedTokenIds;
    }

    function getListing(uint256 tokenId) external view returns (Listing memory) {
        Listing memory listing = listings[tokenId];
        require(listing.seller != address(0), "Listing does not exist");

        return listing;
    }

    function getNFTMetadata(uint256 tokenId) external view returns (string memory) {
        return nftContract.tokenURI(tokenId);
    }
}

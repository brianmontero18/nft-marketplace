// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTContract is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => string) private _tokenURIs;
    
    constructor() ERC721("MyNFTMarketplace", "NFTMKT") Ownable(msg.sender) {}

    function mintNFT(address to, string calldata _tokenURI) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        nextTokenId++;
        
        return tokenId; 
    }

    function _setTokenURI(uint256 tokenId, string calldata _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
}

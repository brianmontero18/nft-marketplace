import { expect } from "chai";
import { ethers } from "hardhat";

describe("MarketplaceContract", function () {
  let nftContract: any;
  let marketplaceContract: any;
  let owner: any;
  let addr1: any;
  const tokenIdMinted = 0;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    // Deploy NFT contract
    const NFTContract = await ethers.getContractFactory("NFTContract");
    nftContract = await NFTContract.deploy();
    await nftContract.waitForDeployment();

    // Deploy Marketplace contract
    const MarketplaceContract = await ethers.getContractFactory(
      "MarketplaceContract",
    );
    marketplaceContract = await MarketplaceContract.deploy(
      await nftContract.getAddress(),
    );
    await marketplaceContract.waitForDeployment();

    await marketplaceContract.mintNFT("https://example.com/nft-metadata");
  });

  it("Should list an NFT for sale", async function () {
    await marketplaceContract.listItem(tokenIdMinted, ethers.parseEther("1.0"));
    const listing = await marketplaceContract.getListing(tokenIdMinted);
    expect(listing.price.toString()).to.equal(
      ethers.parseEther("1.0").toString(),
    );
    expect(listing.seller).to.equal(owner.address);
  });

  it("Should allow a buyer to purchase an NFT", async function () {
    await marketplaceContract.listItem(tokenIdMinted, ethers.parseEther("1.0"));

    await nftContract.approve(
      await marketplaceContract.getAddress(),
      tokenIdMinted,
    );
    await marketplaceContract
      .connect(addr1)
      .buyItem(tokenIdMinted, { value: ethers.parseEther("1.0") });

    await expect(
      marketplaceContract.getListing(tokenIdMinted),
    ).to.be.revertedWith("Listing does not exist");
  });

  it("Should fail to buy if insufficient funds", async function () {
    await marketplaceContract.listItem(tokenIdMinted, ethers.parseEther("1.0"));
    await expect(
      marketplaceContract
        .connect(addr1)
        .buyItem(tokenIdMinted, { value: ethers.parseEther("0.5") }),
    ).to.be.revertedWith("Insufficient funds");
  });

  it("Should allow the seller to cancel a listing", async function () {
    await marketplaceContract.listItem(tokenIdMinted, ethers.parseEther("1.0"));
    await marketplaceContract.cancelListing(tokenIdMinted);

    await expect(
      marketplaceContract.getListing(tokenIdMinted),
    ).to.be.revertedWith("Listing does not exist");
  });

  it("Should fail to list an NFT if not the owner", async function () {
    await expect(
      marketplaceContract
        .connect(addr1)
        .listItem(tokenIdMinted, ethers.parseEther("1.0")),
    ).to.be.reverted;
  });

  it("Should get the correct NFT metadata from the marketplace", async function () {
    await marketplaceContract.listItem(tokenIdMinted, ethers.parseEther("1.0"));
    const metadata = await marketplaceContract.getNFTMetadata(tokenIdMinted);

    expect(metadata).to.equal("https://example.com/nft-metadata");
  });

  it("Should return all listed token IDs", async function () {
    await marketplaceContract.mintNFT("https://example.com/nft-metadata-2");
    await marketplaceContract.listItem(tokenIdMinted, ethers.parseEther("1.0"));
    await marketplaceContract.listItem(1, ethers.parseEther("2.0"));

    const listedTokenIds = await marketplaceContract.getAllListedTokenIds();

    expect(listedTokenIds.length).to.equal(2);
  });
});

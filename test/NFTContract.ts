import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTContract", function () {
  let nftContract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const NFTContract = await ethers.getContractFactory("NFTContract");
    nftContract = await NFTContract.deploy();
    await nftContract.waitForDeployment();
  });

  it("Should mint a new NFT", async function () {
    await nftContract.mintNFT(
      owner.address,
      "https://example.com/nft-metadata",
    );
    expect(await nftContract.tokenURI(0)).to.equal(
      "https://example.com/nft-metadata",
    );
  });

  it("Should return correct tokenURI", async function () {
    await nftContract.mintNFT(
      owner.address,
      "https://example.com/nft-metadata",
    );
    const tokenURI = await nftContract.tokenURI(0);
    expect(tokenURI).to.equal("https://example.com/nft-metadata");
  });
});

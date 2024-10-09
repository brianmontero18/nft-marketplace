import { ethers } from "hardhat";

async function main() {
  // Deploy NFTContract
  const NFTContract = await ethers.getContractFactory("NFTContract");
  const nftContract = await NFTContract.deploy();
  await nftContract.waitForDeployment();

  console.log("NFTContract deployed to:", await nftContract.getAddress());

  // Deploy MarketplaceContract
  const MarketplaceContract = await ethers.getContractFactory(
    "MarketplaceContract",
  );
  const marketplaceContract = await MarketplaceContract.deploy(
    await nftContract.getAddress(),
  );
  await marketplaceContract.waitForDeployment();

  console.log(
    "MarketplaceContract deployed to:",
    await marketplaceContract.getAddress(),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

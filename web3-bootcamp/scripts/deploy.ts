import { ethers, run, network } from "hardhat";

async function main() {
  // We get the contract to deploy
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.deployed();

  console.log("SimpleStorage deployed to:", simpleStorage.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

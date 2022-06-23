const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token deployed to:", token.address);

  const EthSwap = await hre.ethers.getContractFactory("EthSwap");
  const ethSwap = await EthSwap.deploy(token.address);
  await ethSwap.deployed();

  console.log("EthSwap deployed to:", ethSwap.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

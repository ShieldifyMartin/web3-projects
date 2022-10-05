const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helpers/helper-hardhat-config");

const AMOUNT = ethers.utils.parseEther("0.01");

const getWeth = async () => {
  const { deployer } = await getNamedAccounts();

  const iWeth = await ethers.getContractAt(
    "IWeth",
    networkConfig[network.config.chainId].wethToken,
    deployer
  );
  const txResponse = await iWeth.deposit({
    value: AMOUNT,
  });
  await txResponse.wait(1);
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log(`Got ${ethers.utils.formatEther(wethBalance)} WETH`);
};

module.exports = { getWeth, AMOUNT };

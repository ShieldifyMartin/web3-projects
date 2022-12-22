const { network } = require("hardhat");
const { TASK_ETHERSCAN_VERIFY } = require("hardhat-deploy");
const { developmentChains, networkConfig } = require("../helpers/helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
        ethUsdPriceFeedAddress = EthUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeedAddress;
    }

    const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" });
    const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" });

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: [ethUsdPriceFeedAddress, lowSVG, highSVG],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(randomNft.address, args);
    }
}

module.exports.tags = ["all", "dynamicNft", "main"];
const { network } = require("hardhat");
const { developmentChains } = require("../helpers/hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts;

    if (developmentChains.includes(network.name)) {
        log("Local network detected. Deploying mocks...");
        await deploy("VRFCoordinaorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        });
        log("Mocks Deployed!");
        log("-------");
    }
};

module.exports.tags = ["all", "mocks"];

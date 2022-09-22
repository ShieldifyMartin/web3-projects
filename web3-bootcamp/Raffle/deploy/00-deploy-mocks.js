const { network } = require("hardhat");
const { developmentChains } = require("../helpers/hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts;
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log("Local network detected. Deploying mocks...");
    }
};

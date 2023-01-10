import { network } from "hardhat";
import {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helpers/helper-hardhat-config";
import { verify } from "../utils/verify";

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const waitConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS;

    log("-------------------");
    let args = [];
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args,
        log: true,
        waitConfirmations,
    });
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(basicNft.address, args);
    }
    log("-------------------");
};

module.exports.tags = ["all", "basicnft"];

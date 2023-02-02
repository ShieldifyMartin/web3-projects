const {
    FRONT_END_CONTRACTS_FILE,
    FRONT_END_ABI_LOCATION,
} = require("../helpers/helper-hardhat-config");
require("dotenv").config();
const fs = require("fs");
const { network, ethers } = require("hardhat");

module.exports = async ({ deployments }) => {
    const { deploy, log } = deployments;

    if (process.env.UPDATE_FRONT_END) {
        log("-------------------");
        log("Writing to front-end...");
        await updateContractAddresses();
        await updateAbi();
        log("Front-end written!");
        log("-------------------");
    }
};

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    fs.writeFileSync(
        `${FRONT_END_ABI_LOCATION}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    );

    const basicNft = await ethers.getContract("BasicNft");
    fs.writeFileSync(
        `${FRONT_END_ABI_LOCATION}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    );
}

async function updateContractAddresses() {
    const chainId = network.config.chainId;
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const contractAddresses = JSON.parse(fs.readFileSync(FRONT_END_CONTRACTS_FILE, "utf8"));
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address);
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] };
    }
    fs.writeFileSync(FRONT_END_CONTRACTS_FILE, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "frontend"];

const { ethers, network } = require("hardhat");

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // Basic NFT
    const basicNft = await ethers.getContract("BasicNft", deployer);
    const basicNftMintTx = await basicNft.mintNft();
    basicNftMintTx.wait(1);
    const basicNftTokenCounter = await basicNft.getTokenCounter();
    console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(basicNftTokenCounter)}`);

    // Random IPFS NFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
    // const mintFee = await randomIpfsNft.getMintFee();
    // const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() });
    // const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);

    // await new Promise(async (resolve, reject) => {
    //     setTimeout(() => reject("Timeout: 'NftMinted' event did not fire"), 300000); // 5 minute timeout time
    //     randomIpfsNft.once("NftMinted", async () => {
    //         resolve();
    //     })
    //     if (chainId == 31337) {
    //         const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString();
    //         const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
    //         await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address);
    //     }
    // });
    // const randomIpfsNftTokenCounter = await dynamicNft.getTokenCounter();
    // console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`);

    // Dynamic SVG NFT
    const highValue = ethers.utils.parseEther("4000");
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString());
    await dynamicSvgNftMintTx.wait(1);
    const dynamicSvgNftTokenCounter = await dynamicSvgNft.getTokenCounter();
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(dynamicSvgNftTokenCounter)}`);
}

module.exports.tags = ["all", "mint"];
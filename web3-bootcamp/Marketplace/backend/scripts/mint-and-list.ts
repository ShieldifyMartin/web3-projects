const { ethers } = require("hardhat");

const PRICE = ethers.utils.parseEther("0.1");

async function mintAndList() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNft");

    console.log("Minting...");
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;

    console.log("Approving Nft...");
    const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
    await approvalTx.wait(1);

    console.log("Listing Nft...");
    const listingTx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
    await listingTx.wait(1);
    console.log("Listed!");
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

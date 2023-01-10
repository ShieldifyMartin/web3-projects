import { describe } from "mocha";
const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helpers/helper-hardhat-config");

if (!developmentChains.includes(network.name)) {
    describe.skip;
}

describe("NftMarketplace", () => {
    let nftMarketplaceContract, nftMarketplace, basicNft, withdrawTestHelper;
    const PRICE = ethers.utils.parseEther("0.1");
    const TOKEN_ID = 0;
    let deployer, user;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("NftMarketplace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        basicNft = await ethers.getContract("BasicNft", deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplace.address, TOKEN_ID);
    });

    describe("listItem", () => {
        it("should list item successfully and emit ItemListed event", async () => {
            await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit(
                nftMarketplace,
                "ItemListed"
            );
            const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
            assert(listing.price.toString() == PRICE.toString());
            assert(listing.seller.toString() == (await deployer.getAddress()));
        });
        it("should revert with InvalidPrice", async () => {
            await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, 0)).to.be.revertedWith(
                "NftMarketplace__InvalidPrice"
            );
        });
        it("should revert with AlreadyListed", async () => {
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await expect(
                nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NftMarketplace__AlreadyListed");
        });
        it("should revert with NotApprovedForMarketplace", async () => {
            await basicNft.mintNft();
            await expect(nftMarketplace.listItem(basicNft.address, 1, PRICE)).to.be.revertedWith(
                "NftMarketplace__NotApprovedForMarketplace"
            );
        });
        it("should revert with NotOwner", async () => {
            nftMarketplace = nftMarketplaceContract.connect(user);
            await expect(
                nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NftMarketplace__NotOwner");
        });
    });

    describe("buyItem", () => {
        it("should buy item successfully and emit ItemBought event", async () => {
            // deployer list the nft
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            // user buys it
            nftMarketplace = await nftMarketplaceContract.connect(user);
            await expect(
                nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
            ).to.emit(nftMarketplace, "ItemBought");
            // perform owner and deployer balance checks
            const newOwner = await basicNft.ownerOf(TOKEN_ID);
            const deployerProceeds = await nftMarketplace.getProceeds(deployer.getAddress());
            assert(newOwner.toString() == (await user.getAddress()));
            assert(deployerProceeds.toString() == PRICE);
        });
        it("should revert with PriceNotMet", async () => {
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await expect(nftMarketplace.buyItem(basicNft.address, TOKEN_ID)).to.be.revertedWith(
                "NftMarketplace__PriceNotMet"
            );
        });
        it("should revert with NotListed", async () => {
            await expect(nftMarketplace.buyItem(basicNft.address, TOKEN_ID)).to.be.revertedWith(
                "NftMarketplace__NotListed"
            );
        });
    });

    describe("cancelListing", () => {
        it("emits an event after deleting an item", async () => {
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await expect(nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.emit(
                nftMarketplace,
                "ItemCanceled"
            );
            const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
            assert(listing.price.toString() == "0");
        });
        it("should revert with NotListed", async () => {
            await expect(
                nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
            ).to.be.revertedWith("NftMarketplace__NotListed");
        });
    });

    describe("updateListing", () => {
        it("emits an event after successfully updating an item", async () => {
            const updatedPrice = ethers.utils.parseEther("0.2");
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await expect(
                nftMarketplace.updateListing(basicNft.address, TOKEN_ID, updatedPrice)
            ).to.emit(nftMarketplace, "ItemListed");
            const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
            assert(listing.price.toString() == updatedPrice.toString());
        });
        it("should revert with NotListed and NotOwner", async function () {
            await expect(
                nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NftMarketplace__NotListed");
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = await nftMarketplaceContract.connect(user);
            await expect(
                nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NftMarketplace__NotOwner");
        });
    });

    describe("withdrawProceeds", () => {
        it("should withdraw proceeds successfully", async () => {
            // deployer lists the item
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            //user buys it
            nftMarketplace = await nftMarketplace.connect(user);
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE });
            // deployer withdraws
            nftMarketplace = await nftMarketplace.connect(deployer);
            await expect(nftMarketplace.withdrawProceeds()).to.emit(
                nftMarketplace,
                "WithdrawnProceeds"
            );
        });
        it("should revert with NoProceeds", async () => {
            await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
                "NftMarketplace__NoProceeds"
            );
        });
    });

    describe("getListing", () => {
        it("should return correct data", async () => {
            const listings = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
            assert(listings.length > 0);
        });
    });

    describe("getProceeds", () => {
        it("should return correct data", async () => {
            const proceeds = await nftMarketplace.getProceeds(await deployer.getAddress());
            assert(proceeds.toString() == 0);
        });
    });
});

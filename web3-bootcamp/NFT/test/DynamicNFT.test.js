const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helpers/helper-hardhat-config");
const fs = require("fs");

if (!developmentChains.includes(network.name)) {
    describe.skip;
}

describe("Dynamic NFT smart contract unit tests", () => {
    const expectedLowTokenURI = "{\"name\":\"Dynamic SVG NFT\", \"description\":\"An NFT that changes based on the Chainlink Feed\", \"attributes\": [{\"trait_type\": \"coolness\", \"value\": 100}], \"image\":\"data:image/svg+xml;base64PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgIGhlaWdodD0iNDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGcgY2xhc3M9ImV5ZXMiPgogICAgPGNpcmNsZSBjeD0iNjEiIGN5PSI4MiIgcj0iMTIiLz4KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPgogIDwvZz4KICA8cGF0aCBkPSJtMTM2LjgxIDExNi41M2MuNjkgMjYuMTctNjQuMTEgNDItODEuNTItLjczIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGJsYWNrOyBzdHJva2Utd2lkdGg6IDM7Ii8+Cjwvc3ZnPg==\"}";
    const baseURI = "data:image/svg+xml;base64";
    let dynamicNft, deployer;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["mocks", "dynamicNft"]);
        dynamicNft = await ethers.getContract("DynamicSvgNft");
    });

    describe("Constructor", () => {
        it("should initialise dynamicSvgNft correctly", async () => {
            const name = await dynamicNft.name();
            const symbol = await dynamicNft.symbol();
            const tokenCounter = await dynamicNft.getTokenCounter();
            const lowSvg = await dynamicNft.getLowSvg();
            const highSvg = await dynamicNft.getHighSvg();

            assert.equal(name, "Dynamic SVG NFT");
            assert.equal(symbol, "DSN");
            assert.equal(tokenCounter.toString(), 0);
            assert.equal(lowSvg.startsWith(baseURI), true);
            assert.equal(highSvg.startsWith(baseURI), true);
        });
    });

    describe("DynamicNft base functionality", () => {
        it("should revert when tokenURI is called with invalid tokenId", async () => {
            await expect(dynamicNft.tokenURI(123)).to.be.revertedWith("ERC721Metadata_URI_QueryFor_NonExistentToken");
        })

        it("should return valid imageURI from a svg", async () => {
            const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" });
            const imageURI = await dynamicNft.svgToImageURI(lowSVG);
            assert(imageURI.length > baseURI.length);
            assert(imageURI.startsWith(baseURI));
        })

        describe("DynamicNft minting functionality", () => {
            it("should return valid tokenURI after successfull mint", async () => {
                const highValue = ethers.utils.parseEther("1");
                await dynamicNft.mintNft(highValue);

                const tokenCounter = await dynamicNft.getTokenCounter();
                const result = await dynamicNft.tokenURI(tokenCounter);
                assert(result.includes("name", "description", "attributes", "image"));
            })

            it("should mint nft successfully", async () => {
                const highValue = ethers.utils.parseEther("1");
                const previousTokenCounter = await dynamicNft.getTokenCounter();
                await expect(dynamicNft.mintNft(highValue)).to.emit(
                    dynamicNft,
                    "NftCreated"
                );
                await new Promise(async (resolve, reject) => {
                    dynamicNft.once("NftCreated", async () => {
                        try {
                            const currentTokenCounter = await dynamicNft.getTokenCounter();
                            assert.equal(previousTokenCounter.toString(), (currentTokenCounter - 1).toString());
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    })
                })
            })

            it("should revert when more time than the limit has passed after last price feed update", async () => {
                const highValue = ethers.utils.parseEther("1");
                const delay = 10 * 24 * 60 * 60; // seconds in 10 days (stale price feed data time period limit)

                console.log("Before the mint -> " + await dynamicNft.getBlockTimestamp());
                await dynamicNft.mintNft(highValue);

                await ethers.provider.send('evm_increaseTime', [delay]);
                await ethers.provider.send('evm_mine');
                console.log("After the mint and evm_increaseTime -> " + await dynamicNft.getBlockTimestamp());

                const tokenCounter = await dynamicNft.getTokenCounter();
                await expect(dynamicNft.tokenURI(tokenCounter)).to.be.revertedWith("Stale_Data");
            })

            it("shifts the token uri to lower when the price doesn't surpass the highvalue", async function () {
                const highValue = ethers.utils.parseEther("100000000") // $100,000,000 dollar per ether.
                const txResponse = await dynamicNft.mintNft(highValue);
                await txResponse.wait(1);

                const tokenCounter = await dynamicNft.getTokenCounter();
                const tokenURI = await dynamicNft.tokenURI(tokenCounter);
                assert.equal(tokenURI.toString(), expectedLowTokenURI.toString());
            })
        })
    });
});
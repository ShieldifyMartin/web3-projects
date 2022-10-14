const { assert } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helpers/helper-hardhat-config");

if (!developmentChains.includes(network.name)) {
  describe.skip;
}

describe("Basic NFT smart contract unit tests", () => {
  let basicNft, deployer;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    await deployments.fixture(["basicNft"]);
    basicNft = await ethers.getContract("BasicNft");
  });

  describe("Constructor", () => {
    it("should initialise BasicNtf contract correctly", async () => {
      const name = await basicNft.name();
      const symbol = await basicNft.symbol();
      const tokenCounter = await basicNft.getTokenCounter();

      assert.equal(name, "BasicToken");
      assert.equal(symbol, "BT");
      assert.equal(tokenCounter.toString(), 0);
    });
  });

  describe("NFT Mint", () => {
    let tokenCounter;
    beforeEach(async () => {
      const txResponse = await basicNft.mintNft();
      await txResponse.wait(1);
      tokenCounter = await basicNft.getTokenCounter();
    });

    it("should correctly update contract values after nft mint", async () => {
      const tokenUri = await basicNft.tokenURI(0);
      assert(tokenUri.startsWith("ipfs://"));
      assert.equal(tokenCounter.toString(), "1");
    });

    it("should correctly update owner and balance values after nft mint", async () => {
      const deployerAddress = deployer.address;
      const deployerBalance = await basicNft.balanceOf(deployerAddress);
      const owner = await basicNft.ownerOf("0");

      assert.equal(deployerBalance.toString(), "1");
      assert.equal(owner, deployerAddress);
    });
  });
});

const { assert, expect } = require("chai");
const { network, deployments, ethers, waffle } = require("hardhat");
const { developmentChains } = require("../helpers/helper-hardhat-config");

if (!developmentChains.includes(network.name)) {
  describe.skip;
}

describe("Random NFT smart contract unit tests", () => {
  let randomIpfsNft, vrfCoordinatorV2Mock, deployer;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    await deployments.fixture(["mocks", "randomIpfsNft"]);
    randomIpfsNft = await ethers.getContract("RandomIpfsNft");
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    tokenUries = await randomIpfsNft.getTokenUries(0);
  });

  describe("Constructor", () => {
    it("should initialise RandomIpfsNft contract correctly", async () => {
      const name = await randomIpfsNft.name();
      const symbol = await randomIpfsNft.symbol();
      const tokenCounter = await randomIpfsNft.getTokenCounter();
      const firstTokenUri = await randomIpfsNft.getTokenUries(0);

      assert.equal(name, "Random IPFS NFT");
      assert.equal(symbol, "RAN");
      assert.equal(tokenCounter.toString(), 0);
      assert(firstTokenUri.includes("ipfs://"));
    })
  });

  describe("RequestNft", () => {
    it("should revert when payment isn't sent with the request", async () => {
      await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
        "RandomIpfsNft__NeedMoreETHSent"
      );
    });

    it("should revert if the provided payment amount is less than the mint fee", async () => {
      const mintFee = await randomIpfsNft.getMintFee();
      await expect(randomIpfsNft.requestNft({
        value: mintFee.sub(ethers.utils.parseEther("0.001")).toString()
      })).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
    })

    it.skip("should emit NftRequested event after successful nft request", async () => {
      const mintFee = await randomIpfsNft.getMintFee();
      await expect(randomIpfsNft.requestNft({ value: mintFee.toString() })).to.emit(
        randomIpfsNft,
        "NftRequested"
      );
    })
  });

  describe("FulfillRandomWords", () => {
    it("mints NFT after random number is returned", async function () {
      await new Promise(async (resolve, reject) => {
        randomIpfsNft.once("NftMinted", async () => {
          try {
            const tokenUri = await randomIpfsNft.tokenURI("0");
            const tokenCounter = await randomIpfsNft.getTokenCounter();
            assert.equal(tokenUri.toString().includes("ipfs://"), true);
            assert.equal(tokenCounter.toString(), "1");
            resolve();
          } catch (e) {
            console.log(e);
            reject(e);
          }
        })
        try {
          const fee = await randomIpfsNft.getMintFee();
          const requestNftResponse = await randomIpfsNft.requestNft({
            value: fee.toString(),
          });
          const requestNftReceipt = await requestNftResponse.wait(1);
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            requestNftReceipt.events[1].args.requestId,
            randomIpfsNft.address
          );
        } catch (e) {
          console.log(e);
          reject(e);
        }
      })
    })
  });

  describe("GetBreedFromModdedRng", () => {
    it("should return pug if moddedRng < 10", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7)
      assert.equal(0, expectedValue)
    })
    it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(21)
      assert.equal(1, expectedValue)
    })
    it("should return st. bernard if moddedRng is between 40 - 99", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(77)
      assert.equal(2, expectedValue)
    })
    it("should revert if moddedRng > 99", async function () {
      await expect(randomIpfsNft.getBreedFromModdedRng(100)).to.be.revertedWith(
        "RandomIpfsNft__RangeOutOfBounds"
      )
    })
  })

  describe("Withdraw", () => {
    // beforeEach(async () => {
    //   const fee = await randomIpfsNft.getMintFee();
    //   const requestNftResponse = await randomIpfsNft.requestNft({
    //     value: fee.toString(),
    //   });
    //   const requestNftReceipt = await requestNftResponse.wait(1);
    //   await vrfCoordinatorV2Mock.fulfillRandomWords(
    //     requestNftReceipt.events[1].args.requestId,
    //     randomIpfsNft.address
    //   );
    // });

    it("should update balances correctly", async () => {
      const provider = waffle.provider;
      const deployerStartingBalance = await provider.getBalance(deployer.address);
      const contractBalance = await provider.getBalance(randomIpfsNft.address);
      await randomIpfsNft.withdraw();
      const deployerEndingBalance = await provider.getBalance(deployer.address);

      if (contractBalance > 0) {
        assert(deployerEndingBalance > deployerStartingBalance);
      } else {
        assert(deployerEndingBalance < deployerStartingBalance);
      }
    });
  });
});

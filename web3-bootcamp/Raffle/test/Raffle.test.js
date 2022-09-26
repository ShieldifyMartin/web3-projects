const { network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains, networkConfig } = require("../helpers/hardhat-config");

if (!developmentChains.includes(network.name)) {
    describe.skip;
}

describe("Raffle Unit Tests", async () => {
    let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer;

    beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
    });

    describe("contructor", async function () {
        it("initializes the raffle correctly", async function () {
            const raffleState = await raffle.getRaffleState();
            const interval = await raffle.getInterval();
            assert.equal(raffleState.toString(), "0");
            assert.equal(interval.toString(), networkConfig[network.config.chainId]["interval"]);
        });
    });

    describe("Raffle entering", async function () {
        const inputNumber = 11;
        it("reverts when you don't pay enough", async function () {
            await expect(raffle.enterRaffle(inputNumber)).to.be.revertedWith("Raffle_NotEnoughETH");
        });

        it("records players when they enter raffle", async function () {
            await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee });
            const contractPlayer = await raffle.getPlayer(0);
            assert.equal(deployer.address, contractPlayer);
        });
    });
});

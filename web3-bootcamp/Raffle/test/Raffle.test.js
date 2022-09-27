const { network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains, networkConfig } = require("../helpers/hardhat-config");

if (!developmentChains.includes(network.name)) {
    describe.skip;
}

describe("Raffle Unit Tests", () => {
    let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
    });

    describe("contructor", () => {
        it("initializes the raffle correctly", async () => {
            const raffleState = await raffle.getRaffleState();
            assert.equal(raffleState.toString(), "0");
            assert.equal(interval.toString(), networkConfig[network.config.chainId]["interval"]);
        });
    });

    describe("raffle entering", () => {
        const inputNumber = 11;
        it("reverts when you don't pay enough", async () => {
            await expect(raffle.enterRaffle(inputNumber)).to.be.revertedWith("Raffle_NotEnoughETH");
        });
        it("records players when they enter raffle", async () => {
            await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee });
            const contractPlayer = await raffle.getPlayer(0);
            assert.equal(deployer.address, contractPlayer);
        });
        it("emits event on raffle enter", async () => {
            await expect(
                await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee })
            ).to.emit(raffle, "RaffleEnter");
        });
        it("doesn't allow entrance when raffle is calculating", async () => {
            await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee });
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
            await network.provider.send("evm_mine", []);

            await raffle.performUpkeep([]);
            await expect(
                raffle.enterRaffle(inputNumber, { value: raffleEntranceFee })
            ).to.be.revertedWith("Raffle_NotOpen");
        });

        describe("checkUpkeep", () => {
            it("returns false if people haven't sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.send("evm_mine", []);
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
                assert(!upkeepNeeded);
            });
            it("returns false if raffle isn't open", async () => {
                await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.send("evm_mine", []);
                await raffle.performUpkeep([]);
                const raffleState = await raffle.getRaffleState();
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
                assert.equal(raffleState.toString(), "1");
                assert.equal(upkeepNeeded, false);
            });
            it("returns false if enough time has not passed", async () => {
                await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]);
                await network.provider.send("evm_mine", []);
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
                assert(!upkeepNeeded);
            });
            it("returns true if enough time has passed, has players and ether and raffle is open", async () => {
                await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee });
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.send("evm_mine", []);
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
                assert(upkeepNeeded);
            });
            describe("performUpkeep", () => {
                it("can only run if checkupkeep is true", async () => {
                    await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee });
                    await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]);
                    await network.provider.send("evm_mine", []);
                    const tx = await raffle.performUpkeep([]);
                    assert(tx);
                });
                it("reverts when checkupkeep is false", async () => {
                    const expectedRaffleBalance = 0;
                    const expectedPlayersLength = 0;
                    const expectedRaffleState = await raffle.getRaffleState();
                    await expect(raffle.performUpkeep([])).to.be.revertedWith(
                        `Raffle_UpkeepNotNeeded(${expectedRaffleBalance}, ${expectedPlayersLength}, ${expectedRaffleState})`
                    );
                });
                it("updates the raffle state, emits an event and calls the vrf coordinator", async () => {
                    await raffle.enterRaffle(inputNumber, { value: raffleEntranceFee });
                    await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]);
                    await network.provider.send("evm_mine", []);
                    const txResponse = await raffle.performUpkeep([]);
                    const txReceipt = await txResponse.wait(1);
                    const raffleState = await raffle.getRaffleState();
                    const requestId = txReceipt.events[1].args.requestId;
                    assert(requestId.toNumber() > 0);
                    // raffle state should be OPEN
                    assert(raffleState === 1);
                });
            });
        });
    });
});

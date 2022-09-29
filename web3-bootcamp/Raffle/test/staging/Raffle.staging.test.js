const { getNamedAccounts, network, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains, networkConfig } = require("../../helpers/hardhat-config");

if (developmentChains.includes(network.name)) {
    describe.skip;
}

describe("Raffle Unit Tests", () => {
    const raffleInputNumber = 12;
    let raffle, raffleEntranceFee, deployer;

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
    });

    describe("fulfillRandomWords", () => {
        it("works with live chainlink Keepers and chainlink VRF, we should get a random winner", async () => {
            const startingTimestamp = await raffle.getLatestTimestamp();
            const accounts = await ethers.getSigners();

            await new Promise(async (resolve, reject) => {
                raffle.once("WinnerPicked event fired!", async () => {
                    try {
                        const recentWinner = await raffle.getRecentWinner();
                        const raffleState = await raffle.getRaffleState();
                        const winnerEndingBalance = await accounts[0].getBalance();
                        const endingTimestamp = await raffle.getLatestTimestamp();

                        await expect(raffle.getPlayer(0)).to.be.reverted;
                        assert.equal(recentWinner.toString(), accounts[0].address);
                        assert.equal(raffleState, 0);
                        assert.equal(
                            winnerEndingBalance.toString(),
                            winnerStartingBalance.add(raffleEntranceFee).toString()
                        );
                        assert(endingTimestamp > startingTimestamp);
                        resolve();
                    } catch (error) {
                        console.log(error);
                        reject(error);
                    }
                });
            });

            await raffle.enterRaffle(raffleInputNumber, { value: raffleEntranceFee });
            const winnerStartingBalance = await accounts[0].getBalance();
        });
    });
});

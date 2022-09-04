const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

if (!developmentChains.includes(network.name)) describe.skip

describe("FundMe", () => {
    let fundMe
    let mockV3Aggregator
    let deployer
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    it("Should return priceFeed", async function () {
        await expect(await fundMe.s_priceFeed()).equal(
            "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        )
    })
    it("Should return smart contract owner", async () => {
        await expect(await fundMe.i_owner()).equal(deployer)
    })

    describe("fund functionality", () => {
        it("Should fund successfully", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            await expect(response.toString()).equal(sendValue.toString())
        })
        it("Fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.reverted
        })
        it("Adds new funder to storage funders array", async () => {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)
            await expect(funder).equal(deployer)
        })
    })

    describe("withdraw", () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })

        it("Should withdraw from a single funder correctly", async () => {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            const fundersCount = await fundMe.getFundersCount()
            await expect(fundersCount).equal(0)
        })
        it.skip("Should withdraw from multiple funders correctly", async () => {
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance.toString(), 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            const fundersCount = await fundMe.getFundersCount()
            assert(fundersCount.toString(), 0)
        })
        it("Should allow only owner to withdraw funds", async () => {
            const accounts = await ethers.getSigners()
            const user = accounts[1]

            const fundMeConnectedContract = await fundMe.connect(user)
            await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
                "FundMe_NotOwner"
            )
        })
    })
})

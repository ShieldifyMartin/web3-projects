const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const INITIAL_ETHSWAP_BALANCE = "1000000";
function tokens(n) {
  return ethers.utils.parseUnits(n, "ether");
}

describe("EthSwap and Token contracts", () => {
  let token, ethSwap;

  before(async () => {
    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy();
    await token.deployed();

    const EthSwap = await hre.ethers.getContractFactory("EthSwap");
    ethSwap = await EthSwap.deploy(token.address);
    await ethSwap.deployed();

    // Transfer all tokens to EthSwap (1 million)
    await token.transfer(ethSwap.address, tokens(INITIAL_ETHSWAP_BALANCE));
  });

  describe("EthSwap and Token main properties", () => {
    it("Should return the Token contract name", async function () {
      assert.equal(await token.name(), "DApp Token");
    });

    it("Should return the Token contract symbol", async function () {
      assert.equal(await token.symbol(), "DAPP");
    });

    it("Should return the EthSwap contract name", async function () {
      assert.equal(await ethSwap.name(), "EthSwap Instant Exchange");
    });

    it("Should return the correct amount of tokens", async () => {
      let balance = await token.balanceOf(ethSwap.address);
      assert(balance.toString(), tokens(INITIAL_ETHSWAP_BALANCE));
    });
  });

  describe("EthSwap buy and sell tokens functionalities", () => {
    it("Should allow user to purchase tokens from EthSwap contract", async () => {
      const [investor] = await ethers.getSigners();

      const tx = await ethSwap.buyTokens({
        from: investor.address,
        value: ethers.utils.parseUnits("1", "ether"),
      });
      const res = await tx.wait();

      let investorBalance = await token.balanceOf(investor.address);
      let ethSwapBalance = await token.balanceOf(ethSwap.address);

      // Check ethSwap balance after purchase
      assert.equal(investorBalance.toString(), tokens("100"));
      assert.equal(
        ethSwapBalance.toString(),
        tokens((1000000 - 100).toString())
      );

      // Check logs to ensure event was emitted with correct data
      const event = res.events[1].args;
      assert.equal(event.account, investor.address);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100"));
      assert.equal(event.rate.toString(), "100");
    });

    it("Should allow user to sell tokens to EthSwap contract", async () => {
      const [investor] = await ethers.getSigners();

      // Investor must approve tokens before the purchase
      await token.approve(ethSwap.address, tokens("100"), {
        from: investor.address,
      });

      // Investor sells tokens
      const tx = await ethSwap.sellTokens(tokens("100"), {
        from: investor.address,
      });
      const res = await tx.wait();

      let investorBalance = await token.balanceOf(investor.address);
      let ethSwapBalance = await token.balanceOf(ethSwap.address);

      // Check ethSwap balance after purchase
      assert.equal(investorBalance.toString(), tokens("0"));
      assert.equal(ethSwapBalance.toString(), tokens(INITIAL_ETHSWAP_BALANCE));

      // Check logs to ensure event was emitted with correct data
      const event = res.events[1].args;
      assert.equal(event.account, investor.address);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100"));
      assert.equal(event.rate.toString(), "100");

      //Investor can't sell more tokens than they have
      await expect(
        ethSwap.sellTokens(tokens("500"), { from: investor.address })
      ).to.be.reverted;
    });
  });
});

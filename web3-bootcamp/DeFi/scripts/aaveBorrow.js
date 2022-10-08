const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth } = require("../scripts/getWeth");

const main = async () => {
  await getWeth();
  const { deployer } = await getNamedAccounts();

  // Lending Pool
  const lendingPool = await getLendingPool(deployer);
  console.log(`LendingPool address: ${lendingPool.address}`);

  // Approve and Deposit
  await approveERC20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
  console.log("Depositing...");
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0, {
    gasLimit: 800000,
  });
  console.log("Deposited!");

  // Borrow
  const { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  );
  const daiPrice = await getDaiPrice();
  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
  console.log(`You can borrow ${amountDaiToBorrow} DAI.`);
  const amountDaiToBorrowWei = ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );
  await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer);
};

const getDaiPrice = async () => {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH price is ${price.toString()}`);
  return price;
};

const getBorrowUserData = async (lendingPool, account) => {
  const {
    totalCollateralETH,
    totalDebtETH,
    availableBorrowsETH,
  } = await lendingPool.getUserAccountData(account);
  console.log("-----------");
  console.log(
    `You have ${ethers.utils.formatEther(
      totalCollateralETH
    )} worth of ETH deposited.`
  );
  console.log(
    `You have ${ethers.utils.formatEther(totalDebtETH)} worth of ETH borrowed`
  );
  console.log(
    `You can borrow ${ethers.utils.formatEther(
      availableBorrowsETH
    )} worth of ETH.`
  );
  console.log("-----------");
  return { availableBorrowsETH, totalDebtETH };
};

const getLendingPool = async (account) => {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );
  const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
};

const approveERC20 = async (erc20Address, spenderAddress, amount, signer) => {
  const erc20Token = await ethers.getContractAt("IERC20", erc20Address, signer);
  txResponse = await erc20Token.approve(spenderAddress, amount);
  await txResponse.wait(1);
  console.log("Approved!");
  console.log("-----------");
};

const borrowDai = async (
  daiAddress,
  lendingPool,
  amountDaiToBorrowWei,
  account
) => {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrowWei,
    1,
    0,
    account
  );
  await borrowTx.wait(1);
  console.log(
    `You have borrowed ${ethers.utils.formatEther(amountDaiToBorrowWei)} ETH!`
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

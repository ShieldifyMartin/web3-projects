const { ethers, network } = require("hardhat");

// async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed contract to: ${simpleStorage.address}`);
  // what happens when we deploy to our hardhat network?
  if (network.config.chainId === 4 && "DXH1YXVTT5ASUMQA7APHTN16BVJW8VBSQB") {
    console.log("Waiting for block confirmations...");
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current Value is: ${currentValue}`);

  // Update the current value
  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated Value is: ${updatedValue}`);
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress: any, args: any) => {
  console.log("Verifying contract...");
  // try {
  //   await run("verify:verify", {
  //     address: contractAddress,
  //     constructorArguments: args,
  //   });
  // } catch (e) {
  //   if (e.message.toLowerCase().includes("already verified")) {
  //     console.log("Already Verified!");
  //   } else {
  //     console.log(e);
  //   }
  // }
};

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

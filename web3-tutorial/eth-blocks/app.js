const Web3 = require("web3");
const web3 = new Web3(
  "https://ropsten.infura.io/v3/f8fa9beca9e94a5b880fe72e18c59b19"
);

web3.eth.getBlock("latest").then((block) => {
  console.log({
    blockHash: block.hash,
    blockNumber: block.number,
  });
});

web3.eth.getBlockNumber().then((latest) => {
  for (let i = 0; i < 10; i++) {
    web3.eth.getBlock(latest - i).then((block) => {
      console.log(block.number);
    });
  }
});

const hash =
  "0xd06e99db4a67950bcfc4c7032597ce78b399a7e66874441c00b42a1cea4a7d01";
web3.eth.getTransactionFromBlock(hash, 0).then(console.log);

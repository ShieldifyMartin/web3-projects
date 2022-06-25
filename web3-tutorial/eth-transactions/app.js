const Tx = require("ethereumjs-tx").Transaction;
const Web3 = require("web3");
const web3 = new Web3(
  "https://ropsten.infura.io/v3/f8fa9beca9e94a5b880fe72e18c59b19"
);

const account1 = "0xB6C97C7060CF889D026b374623c941F74c7c3336";
const account2 = "0x709C1b7e68014dfC39E8dE5235Ada9929F19da87";

const privateKey1 = Buffer.from(process.env.PRIVATE_KEY_1, "hex");
const privateKey2 = Buffer.from(process.env.PRIVATE_KEY_2, "hex");

web3.eth.getBalance(account1, (err, bal) => {
  console.log("account 1 balance:", web3.utils.fromWei(bal, "ether"));
});

web3.eth.getBalance(account2, (err, bal) => {
  console.log("account 2 balance:", web3.utils.fromWei(bal, "ether"));
});

web3.eth.getTransactionCount(account1, (err, txCount) => {
  //create transaction
  const txObject = {
    nonce: web3.utils.toHex(txCount),
    to: account2,
    value: web3.utils.toHex(web3.utils.toWei("0.2", "ether")),
    gasLimit: web3.utils.toHex("21000"),
    gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
  };

  //sign transaction
  const tx = new Tx(txObject, { chain: "ropsten" });
  tx.sign(privateKey1);

  const serializedTransaction = tx.serialize();
  const raw = "0x" + serializedTransaction.toString("hex");

  //broadcast transaction
  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    console.log(err, "txHash:", txHash);
  });
});

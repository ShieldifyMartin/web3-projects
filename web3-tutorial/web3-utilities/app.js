const Web3 = require("web3");
const { fromWei } = require("web3-utils");
const web3 = new Web3(
  "https://ropsten.infura.io/v3/f8fa9beca9e94a5b880fe72e18c59b19"
);

web3.eth.getGasPrice().then((result) => {
  console.log(web3.utils.fromWei(result, "ether"));
});

const hash = web3.utils.sha3("defi");
const hash1 = web3.utils.keccak256("defi");

console.log({
  hash,
  hash1,
});

//underscore library
const _ = web3.utils._;

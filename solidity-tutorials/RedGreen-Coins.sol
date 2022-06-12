// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

contract CoinContract {
    struct coinsWalletStruct {
        uint256 RedCoin;
        uint256 GreenCoin;
    }

    mapping(address => coinsWalletStruct) public balances;

    constructor() {
        balances[msg.sender].RedCoin = 10000;
        balances[msg.sender].GreenCoin = 5000;
    }

    function sendRed(address _to, uint256 _amount) public {
        require(balances[msg.sender].RedCoin >= _amount);
        balances[msg.sender].RedCoin -= _amount;
        balances[_to].RedCoin += _amount;
    }

    function sendGreen(address _to, uint256 _amount) public {
        require(balances[msg.sender].GreenCoin >= _amount);
        balances[msg.sender].GreenCoin -= _amount;
        balances[_to].GreenCoin += _amount;
    }
}

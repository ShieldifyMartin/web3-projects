// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

error Raffle_NotEnoughETH();

contract Raffle {
    /* State Variables */
    address immutable owner;
    uint256 private immutable i_entraceFee;
    address payable[] private s_players;
    mapping(address => int256) bets;

    event RaffleEnter(address indexed player);

    constructor(uint256 entraceFee) {
        owner = msg.sender;
        i_entraceFee = entraceFee;
    }

    function pickNumber(int256 n) public payable {
        if (msg.value < i_entraceFee) {
            revert Raffle_NotEnoughETH();
        }
        bets[msg.sender] = n;
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entraceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}

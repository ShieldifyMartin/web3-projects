// SPDX-License-Identifier: RANDOM_TEXT
pragma solidity ^0.8.7;

contract HotelRoom {
    enum Statuses { Vacant, Occupied }
    Statuses currentStatus;
    
    address public owner;
    
    constructor() {
        owner = msg.sender;
        currentStatus = Statuses.Vacant;
    }

    modifier onlyWhileVacant {
        require(currentStatus == Statuses.Vacant, "Currently occupied.");
        _;
    }
    
    modifier costs(uint _amount) {
        require(msg.value >= _amount, "Not enough Ether provided.");
        _;
    }

    receive() external payable onlyWhileVacant costs(2 ether) {
        payable(owner).transfer(msg.value);
        currentStatus = Statuses.Occupied;
    }
}
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

contract ScrumManager {
    struct Ticket {
        uint8 status;
        string name;
    }

    Ticket[] public tickets;

    function createTicket(string memory _name) public {
        tickets.push(Ticket(0, _name));
    }

    function updateTicketName(uint256 _index, string memory _name) public {
        tickets[_index].name = _name;
    }

    function updateTicketStatus(uint256 _index, uint8 _status) public {
        tickets[_index].status = _status;
    }

    function getTickets() external view returns (Ticket[] memory) {
        return tickets;
    }
}

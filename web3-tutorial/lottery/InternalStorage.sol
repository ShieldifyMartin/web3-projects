// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InternalStorage is Ownable {
    
    using Counters for Counters.Counter;
    Counters.Counter public ticketsCount;

    mapping (address=>address) public nftContractsBook;
    mapping (uint256=> ticketInfo) public tickets;

    // Ticket Information.
    // @param ticketId The NFT id of the ticket.
    // @param nftProxy The address of the NFT Contract Proxy.
    struct ticketInfo {
        uint ticketId;
        address nftProxy;
    }

    // Appends new Contracts to the contracts mapping.
    // @param _userAddress The address of the contract owner.
    // @param _contractAddress The address of the NFT contract Proxy.
    function addNftContract (address _userAddress, address _contractAddress) external onlyOwner {  
        nftContractsBook[_userAddress] = _contractAddress;
    }

    // Appends new tickets to the tickets mapping.
    // @param _ticketId the number of the ticket.
    // @param _nftProxy the address of The NFT contract that owns the NFT that represents the ticket.
    function addTicket(uint _ticketId, address _nftProxy) external onlyOwner {
        tickets[ticketsCount.current()] = ticketInfo(_ticketId, _nftProxy);
        ticketsCount.increment();
    }

    // Returns Tickets count.
    function getTicketsCount() public view returns(uint) {
        return ticketsCount.current();
    }

    // Returns NFT id of the ticket.
    // @param _id the id of the ticket in the tickets mapping.
    function getNFTid(uint _id) public view returns(uint) {
        return tickets[_id].ticketId;
    }

    // Returns NFT proxy of the ticket.
    // @param _id the id of the ticket in the tickets mapping.
    function getNFTproxy(uint _id) public view returns(address) {
        return tickets[_id].nftProxy;
    }
}
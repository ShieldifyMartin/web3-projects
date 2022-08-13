// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./InternalStorage.sol";
import "./NFTFactory.sol";
import "./NFTBeacon.sol";
import "./NFT.sol";

contract Lottery is ReentrancyGuard {
    InternalStorage internalStorage; // Instance of the storage contract.
    NFTFactory factory; // Instance of the Factory contract.
    uint256 start_block; // At this block users can start buying tickets. Enter 0 to start from the current block.
    uint256 end_block; // Users should not be able to buy tickets after this block.
    bool FirstWinnerSelected; // Boolean to indicate if first Random user have been already selected.
    bool FinalWinnerSelected; // Boolean to indicate if the final winner is already selected.

    constructor(uint256 _startblock) {
        internalStorage = new InternalStorage();
        factory = new NFTFactory();

        if (_startblock == 0) {
            start_block = block.number;
        } else {
            start_block = _startblock;
        }

        end_block = start_block + 400;
    }

    // Address to String using OpenZeppelin Strings.
    // @param _addr The address that has to be turned into string.
    function toHexString(address _addr) internal pure returns (string memory) {
        return (Strings.toHexString(uint160(_addr), 20));
    }

    // Allows users to Buy tickets.
    // @param _externalStoragePointer The NFT Uri e.x: Link pointing to off-chain hosted data.
    function buyTicket(string memory _externalStoragePointer)
        public
        payable
        nonReentrant
    {
        require(block.number >= start_block, "Tickets cannot be bouught yet.");
        require(block.number <= end_block, "Tickets cannot be bought anymore.");
        require(msg.value >= 0.001 * 10**18, "Ticket Price is 0.001 ETH.");

        if (internalStorage.nftContractsBook(msg.sender) == address(0)) {
            // Notice 111 used as create2 salt.
            BeaconProxy nftContract = BeaconProxy(
                payable(
                    factory.create2NFTContract(
                        toHexString(msg.sender),
                        "LOTTERY",
                        111
                    )
                )
            );
            internalStorage.addNftContract(msg.sender, address(nftContract));
        }

        NFT nftProxy = NFT(internalStorage.nftContractsBook(msg.sender));
        uint256 nftId = nftProxy.mint(_externalStoragePointer, msg.sender);
        internalStorage.addTicket(nftId, address(nftProxy));

        // User has a chance of winning surprice reward after buying a ticket.
        // @param if(1) checks that 50% of the game time is already passed.
        // @param if(2) checks if surprice reward have been given already.
        if (
            block.number >= start_block + ((end_block - start_block) / 2) &&
            !FirstWinnerSelected
        ) {
            pickSurpriseWinner(msg.sender);
        }
    }

    // Returns Current Ticket Count.
    function getTicketsCount() public view returns (uint256) {
        return internalStorage.getTicketsCount();
    }

    //Used to send money to an address from the contract treasury instead msg.sender.
    // @param _to The address of the receiver.
    // @param value the amount of ether (wei).
    function sendMoney(address _to, uint256 value) internal {
        address payable receiver = payable(_to);
        receiver.transfer(value);
    }

    /*
     *
     * TIP - KECCAK MUST BE REPLACED WITH CHAINLINK VRF WHEN DEPLOYED ON MAINNET
     *
     */
    // Used to Pick and pay a surprise winner.
    function pickSurpriseWinner(address _winner) internal {
        if (
            //User have a chance of 1/5 winning the surprise reward.
            // TIP: Replace %1 with %5 for normal winning chances. %1 used for test purposes.
            ((uint256(
                keccak256(
                    abi.encodePacked(
                        block.difficulty,
                        block.timestamp,
                        getTicketsCount()
                    )
                )
            ) % getTicketsCount()) + 1) %
                1 ==
            0
        ) {
            sendMoney(_winner, address(this).balance / 2);
            FirstWinnerSelected = true;
        }
    }

    /*
     *
     * TIP - KECCAK MUST BE REPLACED WITH CHAINLINK VRF WHEN DEPLOYED ON MAINNET
     *
     */
    // Used to Pick and pay the final winner.
    function pickFinalWinner() public payable nonReentrant returns (address) {
        require(block.number > end_block, "Lottery Game is still in progress.");
        require(!FinalWinnerSelected, "Winner have been selected already.");

        uint256 ticketId = (uint256(
            keccak256(
                abi.encodePacked(
                    block.difficulty,
                    block.timestamp,
                    getTicketsCount()
                )
            )
        ) % getTicketsCount()) + 1;
        address winner = NFT(internalStorage.getNFTproxy(ticketId)).ownerOf(
            internalStorage.getNFTid(ticketId)
        );

        sendMoney(winner, address(this).balance);
        FinalWinnerSelected = true;
        return winner;
    }

    // Used to check contract balance (Testing).
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

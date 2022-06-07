// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

contract Auction {
    address highestBidder;
    uint256 highestBid;
    mapping(address => uint256) refunds;

    function bid() external payable {
        require(msg.value >= highestBid);

        if (highestBidder != address(0)) {
            refunds[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function withdrawRefund() external {
        uint256 refund = refunds[msg.sender];
        refunds[msg.sender] = 0;
        payable(msg.sender).transfer(refund);
    }
}

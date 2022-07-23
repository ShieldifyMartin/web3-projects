// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

contract Ballot {
    struct Voter {
        uint256 weight;
        bool voted;
        address delegate;
        uint256 vote;
    }

    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    address public chairperson;

    mapping(address => Voter) public voters;

    Proposal[] public proposals;

    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function giveRightToVote(address voter) external {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(!voters[voter].voted, "The voter already voted.");
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }
}

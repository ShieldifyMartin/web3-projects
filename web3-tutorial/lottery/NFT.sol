// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorageUpgradeable {
    using Counters for Counters.Counter;
    Counters.Counter public tokenCount;

    // Used to initialize the new NFT Contract.
    // @param _name the name of the NFT collection.
    // @param _ticker the symbol of the NFT collection.
    function initialize(string memory _name, string memory _ticker)
        external
        initializer
    {
        __ERC721_init(_name, _ticker);
    }

    //Used to mint new NFT (create new ticket).
    // @param _tokenURI the token URI. Can be a link pointing to off-chain data storage.
    // @param _owner the address of the user who is buying the ticket.
    function mint(string memory _tokenURI, address _owner)
        external
        returns (uint256)
    {
        tokenCount.increment();
        _safeMint(_owner, tokenCount.current());
        _setTokenURI(tokenCount.current(), _tokenURI);
        return (tokenCount.current());
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./NFT.sol";
import "./NFTBeacon.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract NFTFactory is Ownable {
    NFTBeacon immutable beacon; // Instance of the Beacon Contract.

    constructor() {
        beacon = new NFTBeacon(address(new NFT()));
    }

    // Creates new NFT Contracts as well together with proxies.
    // @param _name the Name of the NFT collection.
    // @param _ticker the symbol of the NFT collection.
    function createNFTContract(string memory _name, string memory _ticker)
        external
        onlyOwner
        returns (address)
    {
        //NFTBeacon beacon = new NFTBeacon(address(new NFT()));
        BeaconProxy nft = new BeaconProxy(
            address(beacon),
            abi.encodeWithSelector(
                NFT(address(0)).initialize.selector,
                _name,
                _ticker
            )
        );
        return address(nft);
    }

    // Creates new NFT Contracts using create2.
    // @param _name the Name of the NFT Collection.
    // @param _ticker the symbol of the NFT collection.
    // @param _salt the salt for create2.
    function create2NFTContract(
        string memory _name,
        string memory _ticker,
        uint256 _salt
    ) external onlyOwner returns (address) {
        //NFTBeacon beacon = new NFTBeacon(address(new NFT()));
        BeaconProxy nft = new BeaconProxy{salt: bytes32(_salt)}(
            address(beacon),
            abi.encodeWithSelector(
                NFT(address(0)).initialize.selector,
                _name,
                _ticker
            )
        );
        return address(nft);
    }
}

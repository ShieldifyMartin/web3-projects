// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTBeacon is Ownable {
    UpgradeableBeacon immutable beacon;
    address public implementation;

    constructor(address _implementation) {
        beacon = new UpgradeableBeacon(_implementation);
        implementation = _implementation;

        // Can be uncommented to transfer owner rights from contract to user's address.
        //transferOwnership(tx.origin);
    }

    // Can be used to change the Implementation Address.
    // @param _newImplementation The address of the new Implementation.
    function updateImplementation(address _newImplementation)
        external
        onlyOwner
    {
        beacon.upgradeTo(_newImplementation);
        implementation = _newImplementation;
    }

    // Returns Current implementation.
    function currentImplementation() public view returns (address) {
        return beacon.implementation();
    }
}

// SPDX-License-Identifier: RANDOM_TEXT
pragma solidity ^0.8.7;

contract MyContract {
    uint[] public uintArray = [1,2,11];
    string[] public stringArray = ["a", "b", "c"];
    string[] public values;
    uint[][] public array2D = [[1,2,3], [4,5,6]];
    
    function addValue(string memory _value) public {
        values.push(_value);
    }
    
    function valueCount() public view returns (uint) {
        return values.length;
    }
}
// SPDX-License-Identifier: RANDOM_TEXT
pragma solidity ^0.8.7;

contract MyContract {
    //State Variables
    string public myString = "something";
    bytes32 public myBites32 = "sothing else";
    int public myInt = 1;
    uint public myUint = 1;
    uint256 public myUint256 = 1;
    uint8 public myUint8 = 1;
    address public myAddress = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    uint[] public myUintArray = [1, 2, 11];
    string[] public myStringArray = ["a", "b", "c"];
    string[] public values;
    
    function addValue(string memory _value) public {
        values.push(_value);
    }
    
    struct Person {
        uint id;
        string name;
        int256 age;
    }
    
    Person public person = Person(1, "John", 33);
    
    //Local Variables
    function getValue() public pure returns(uint) {
        uint value = 1;
        return value;
    }
    
   
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Account {
  string public ipfsCID;

  constructor(string memory _ipfsCID) {
    ipfsCID = _ipfsCID;
  }

  function get() view public returns (string memory) {
    return ipfsCID;
  }
}

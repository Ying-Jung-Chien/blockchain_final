// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Account {
  bytes32  private rootName;
  bytes32  private rootPassword;
  address public owner;
  bool private hasSetOwner = false;

  string public accountsIPFS;

  constructor(string memory _name, string memory _password) {
    rootName = keccak256(bytes(_name));
    rootPassword = keccak256(bytes(_password));
  }

  function setOwner(string memory _name, string memory _password) public {
    require(!hasSetOwner, "Owner already set");
    require(keccak256(bytes(_name)) == rootName && keccak256(bytes(_password)) == rootPassword, "Invalid credentials");
    owner = msg.sender;
    hasSetOwner = true;
  }

  function updateAccountsIPFS(string memory _ipfs) public {
    require(msg.sender == owner, "Only owner can update Accounts IPFS");
    accountsIPFS = _ipfs;
  }

  function getOwner() view public returns (address) {
    return owner;
  }

  function getAccountsIPFS() view public returns (string memory) {
    return accountsIPFS;
  }
}

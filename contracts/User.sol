// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./provableAPI.sol";
import "./Account.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract User is usingProvable {
  
  struct AccountInfo {
    string ID;
    string role;
    address wallet;
    bool isExist;
  }

  mapping(string => AccountInfo) public idToAccount;
  mapping(string => AccountInfo) public nameToAccount;

  Account public account;

  constructor(address _accountAddress) {
    account = Account(_accountAddress);
  }

  function addAccountInfo(string memory _name, string memory _password) public {
    require(!nameToAccount[_name].isExist, "The account has been bound to the wallet");
    bytes32 name = keccak256(bytes(_name));
    bytes32 password = keccak256(bytes(_password));

    string memory ipfs = account.getAccountsIPFS();

    provable_query("IPFS", ipfs);
    // require(_name == rootName && _password == rootPassword, "Invalid credentials");
    // owner = msg.sender;
    // hasSetOwner = true;
  }

  function __callback(bytes32 _myid, string memory _result, bytes memory _proof) public {
    require(msg.sender == provable_cbAddress());
    // update(); // Recursively update the price stored in the contract...
    // priceETHXBT = _result;
    // emit LogNewKrakenPriceTicker(priceETHXBT);
}

//   function updateAccountsIPFS(string memory _ipfs) public {
//     require(msg.sender == owner, "Only owner can update Accounts IPFS");
//     accountsIPFS = _ipfs;
//   }

//   function getOwner() view public returns (address) {
//     return owner;
//   }

//   function getAccountsIPFS() view public returns (string memory) {
//     return accountsIPFS;
//   }
}

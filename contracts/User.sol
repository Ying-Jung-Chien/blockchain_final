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

  event LogResult(string result);

  constructor(address _accountAddress) {
    account = Account(_accountAddress);
  }

  function addAccountInfo(string memory _name, string memory _password) public {
    require(!nameToAccount[_name].isExist, "The account has been bound to the wallet");
    bytes32 name = keccak256(bytes(_name));
    bytes32 password = keccak256(bytes(_password));

    string memory ipfs = account.getAccountsIPFS();
    // string memory arvg1 = "json(";
    // string memory arvg2 = ")";
    // string memory arvg3 = string.concat(string.concat(arvg1, ipfs), arvg2);

    // provable_query("IPFS", ipfs);
    provable_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
    // require(_name == rootName && _password == rootPassword, "Invalid credentials");
    // owner = msg.sender;
    // hasSetOwner = true;
  }

  function __callback(bytes32 _myid, string memory _result, bytes memory _proof) public {
    require(msg.sender == provable_cbAddress(), "Callback address is not provable_cbAddress");
    emit LogResult(_result);
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

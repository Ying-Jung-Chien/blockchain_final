// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./Account.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract User {
  
  struct AccountInfo {
    string _id;
    string role;
    string infoIPFS;
    address _address;
    bool isExist;
  }

  // address[] public boundAccountsList;
  mapping(address => AccountInfo) public addressToAccount;
  mapping(string => AccountInfo) public idToAccount;

  Account private account;

  event LogResult(string result);

  constructor(address _accountAddress) {
    account = Account(_accountAddress);
  }

  function isBound(address targetAddress) public view returns (bool) {
    if (addressToAccount[targetAddress].isExist) return true;
    return false;
  }

  function blindAccount(string memory _name, string memory _password, string memory _role) public {
    require(!addressToAccount[msg.sender].isExist, "The account has been bound to the wallet");
    require(account.isAccountCorrect(_name, _password, _role), "Invalid credentials");
    addressToAccount[msg.sender] = AccountInfo("", _role, "", msg.sender, true);
    account.removeUsedAccount(_name, _password, _role);
    // boundAccountsList.push(msg.sender);
  }

  function updateAccountInfo(string memory _id, string memory infoIPFS) public {
    require(isBound(msg.sender), "The account has not been bound to the wallet");
    // require(msg.sender == addressToAccount[msg.sender]._address, "Only the account owner can update the account info");
    addressToAccount[msg.sender]._id = _id;
    addressToAccount[msg.sender].infoIPFS = infoIPFS;
    idToAccount[_id] = addressToAccount[msg.sender];
  }

  function getAccountInfoByAddress(address _address) public view returns (string memory, string memory, string memory, bool) {
    require(isBound(_address), "The account has not been bound to the wallet");
    return (addressToAccount[_address]._id, addressToAccount[_address].role, addressToAccount[_address].infoIPFS, addressToAccount[_address].isExist);
  }

  function getAccountInfoById(string memory _id) public view returns (string memory, string memory, string memory, bool) {
    require(idToAccount[_id].isExist, "The account has not been bound to the wallet");
    return (idToAccount[_id]._id, idToAccount[_id].role, idToAccount[_id].infoIPFS, idToAccount[_id].isExist);
  }
}

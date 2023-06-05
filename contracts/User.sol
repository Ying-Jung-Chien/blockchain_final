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
    string accessKey;
    address _address;
    bool isExist;
  }

  mapping(address => AccountInfo) public addressToAccount;
  mapping(string => AccountInfo) public idToAccount;

  Account private account;

  event LogResult(string result);

  constructor(address _accountAddress) {
    account = Account(_accountAddress);
  }

  function isBound(address targetAddress) public view returns (bool) {
    if (addressToAccount[targetAddress]._address != address(0)) return true;
    return false;
  }

  function blindAccount(string memory _name, string memory _password, string memory _role) public {
    require(!isBound(msg.sender), "The account has been bound to the wallet");
    require(account.isAccountCorrect(_name, _password, _role), "Invalid credentials");
    addressToAccount[msg.sender] = AccountInfo("", _role, "", "", msg.sender, true);
    account.removeUsedAccount(_name, _password, _role);
  }

  function updateAccountInfo(string memory _id, string memory infoIPFS) public {
    require(isBound(msg.sender), "The account has not been bound to the wallet");
    require(msg.sender == addressToAccount[msg.sender]._address, "Only the account owner can update the account info");
    addressToAccount[msg.sender]._id = _id;
    addressToAccount[msg.sender].infoIPFS = infoIPFS;
    idToAccount[_id] = addressToAccount[msg.sender];
  }

  function updateAccessKey(string memory accessKey) public {
    require(isBound(msg.sender), "The account has not been bound to the wallet");
    require(msg.sender == addressToAccount[msg.sender]._address, "Only the account owner can update the account info");
    
    addressToAccount[msg.sender].accessKey = accessKey;
  }

  function checkAccessKey(string memory _id, string memory accessKey) public view returns (bool) {
    require(idToAccount[_id]._address != address(0), "The account has not been bound to the wallet");
    return keccak256(bytes(idToAccount[_id].accessKey)) == keccak256(bytes(accessKey));
  }

  function removeAccount(address accountAddress) public {
    require(isBound(accountAddress), "The account has not been bound to the wallet");
    require(account.isAdminInList(msg.sender), "Only admin can remove account");
    addressToAccount[accountAddress].isExist = false;
  }

  function getAccountInfoByAddress(address _address) public view returns (string memory, string memory, string memory, bool) {
    require(isBound(_address), "The account has not been bound to the wallet");
    return (addressToAccount[_address]._id, addressToAccount[_address].role, addressToAccount[_address].infoIPFS, addressToAccount[_address].isExist);
  }

  function getAccountInfoById(string memory _id) public view returns (address, string memory, string memory, bool) {
    require(idToAccount[_id]._address != address(0), "The account has not been bound to the wallet");
    return (idToAccount[_id]._address, idToAccount[_id].role, idToAccount[_id].infoIPFS, idToAccount[_id].isExist);
  }

  function getAccessKey(string memory _id) public view returns (string memory) {
    require(idToAccount[_id]._address != address(0), "The account has not been bound to the wallet");
    require(idToAccount[_id]._address == msg.sender, "Only the account owner can get the access key");
    return (idToAccount[_id].accessKey);
  }
}

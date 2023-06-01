// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./User.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Account {
  bytes32  private rootName;
  bytes32  private rootPassword;
  address[] public adminList;
  bool private hasFirstAdmin = false;
  // string public accountsIPFS;
  bytes32[][] public accountsList;
  User public user;

  mapping(address => address) public adminRemover;

  constructor(string memory _name, string memory _password) {
    rootName = keccak256(bytes(_name));
    rootPassword = keccak256(bytes(_password));
  }

  function setUserContract(address _userAddress) public {
    require(user == User(address(0)), "User contract has been set");
    user = User(_userAddress);
  }

  function addFirstAdmin(string memory _name, string memory _password) public {
    require(!hasFirstAdmin, "First admin already exists");
    require(keccak256(bytes(_name)) == rootName && keccak256(bytes(_password)) == rootPassword, "Invalid credentials");
    adminList.push(msg.sender);
    hasFirstAdmin = true;
  }

  function isAdminInList(address targetAddress) public view returns (bool) {
    if (getAdminId(targetAddress) < adminList.length) return true;
    return false;
  }

  function getAdminId(address targetAddress) private view returns (uint256) {
    for (uint256 i = 0; i < adminList.length; i++) {
        if (adminList[i] == targetAddress) {
            return i;
        }
    }
    return adminList.length;
  }

  function addAdmin(address newAdmin) public {
    require(!isAdminInList(newAdmin), "Admin already exists");
    require(isAdminInList(msg.sender), "Only admin can add new admin");
    adminList.push(newAdmin);
  }

  function removeAdmin(address oldAdmin) public {
    require(adminList.length > 1, "At least one admin must exist");
    require(isAdminInList(msg.sender), "Only admin can remove admin");
    
    uint256 index = getAdminId(oldAdmin);
    require(index < adminList.length, "Admin does not exist");
    
    adminRemover[adminList[index]] = msg.sender;
    adminList[index] = adminList[adminList.length - 1];
    adminList.pop();
  }

  function addNewAccount(string memory _name, string memory _password) public {
    require(isAdminInList(msg.sender), "Only admin can add new account");
    bytes32 hashName = keccak256(bytes(_name));
    bytes32 hashPassword = keccak256(bytes(_password));
    accountsList.push([hashName, hashPassword]);
  }

  function removeUsedAccount(string memory _name, string memory _password) public {
    require(isAdminInList(msg.sender) || msg.sender == address(user), "Only admin or User contract can remove admin");
    
    uint256 index = isAccountExist(_name, _password);
    require(index < accountsList.length, "Account does not exist");

    accountsList[index] = accountsList[accountsList.length - 1];
    accountsList.pop();
  }


  function isAccountExist(string memory _name, string memory _password) private view returns (uint256) {
    bytes32 hashName = keccak256(bytes(_name));
    bytes32 hashPassword = keccak256(bytes(_password));
    
    for (uint256 i = 0; i < accountsList.length; i++) {
      if (accountsList[i][0] == hashName && accountsList[i][1] == hashPassword) {
        return i;
      }
    }
    return accountsList.length;
  }

  function isAccountCorrect(string memory _name, string memory _password) public view returns (bool) {
    if (isAccountExist(_name, _password) < accountsList.length) return true;
    return false;
  }

  // function updateAccountsIPFS(string memory _ipfs) public {
  //   require(isAdminInList(msg.sender) < adminList.length, "Only admin can update Accounts IPFS");
  //   accountsIPFS = _ipfs;
  // }

  function getAdminList() view public returns (address[] memory) {
    return adminList;
  }

  // function getAccountsIPFS() view public returns (string memory) {
  //   return accountsIPFS;
  // }

  function getAdminRemover(address removedAdmin) view public returns (address) {
    return adminRemover[removedAdmin];
  }
}

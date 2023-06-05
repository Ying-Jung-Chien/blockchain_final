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
  bytes32[][] private accountsList;
  User private user;

  mapping(address => address) public adminRemover;
  mapping(address => string) public adminInfo;

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

  function addNewAccount(string memory _name, string memory _password, string memory _role) public {
    require(isAdminInList(msg.sender), "Only admin can add new account");
    require(!isAccountCorrect(_name, _password, _role), "Account already exists");
    
    bytes32 hashName = keccak256(bytes(_name));
    bytes32 hashPassword = keccak256(bytes(_password));
    bytes32 hashRole = keccak256(bytes(_role));
    accountsList.push([hashName, hashPassword, hashRole]);
  }

  function removeUsedAccount(string memory _name, string memory _password, string memory _role) public {
    require(isAdminInList(msg.sender) || msg.sender == address(user), "Only admin or User contract can remove account");
    
    uint256 index = getAccountId(_name, _password, _role);
    require(index < accountsList.length, "Account does not exist");

    accountsList[index] = accountsList[accountsList.length - 1];
    accountsList.pop();
  }


  function getAccountId(string memory _name, string memory _password, string memory _role) private view returns (uint256) {
    bytes32 hashName = keccak256(bytes(_name));
    bytes32 hashPassword = keccak256(bytes(_password));
    
    for (uint256 i = 0; i < accountsList.length; i++) {
      if (accountsList[i][0] == hashName && accountsList[i][1] == hashPassword && accountsList[i][2] == keccak256(bytes(_role))) {
        return i;
      }
    }
    return accountsList.length;
  }

  function isAccountCorrect(string memory _name, string memory _password, string memory _role) public view returns (bool) {
    if (getAccountId(_name, _password, _role) < accountsList.length) return true;
    return false;
  }

  function getAdminList() view public returns (address[] memory) {
    return adminList;
  }

  function getAdminRemover(address removedAdmin) view public returns (address) {
    return adminRemover[removedAdmin];
  }
}

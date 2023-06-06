// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./Account.sol";
import "./User.sol";
import "./Score.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Transcript {
  struct GradeReport {
    string studentID;
    string ipfsCID;
    string key;
    address student;
  }

  mapping(string => mapping(string => GradeReport)) public gradeReports;

  Account private account;
  User private user;
  Score private score;
  address private inspector;

  constructor(address _accountAddress, address _userAddress, address _scoreAddress, address _inspector) {
    account = Account(_accountAddress);
    user = User(_userAddress);
    score = Score(_scoreAddress);
    inspector = _inspector;
  }

  function addGradeReport(string memory studentID, string memory semester, string memory ipfs, string memory privateKey, address studentAddress) public {
    require(msg.sender == inspector, "Only inspector can add grade report");
    
    (address _address, , , ) = user.getAccountInfoById(studentID);
    require(_address == studentAddress, "Invalid student address");
    
    gradeReports[studentID][semester] = GradeReport(studentID, ipfs, privateKey, studentAddress);
  }

  function getGradeReportPrivate(string memory studentID, string memory semester) public view returns (address, string memory, string memory) {
    (, string memory role, , ) = user.getAccountInfoByAddress(msg.sender);
    bool isTeacher = keccak256(bytes(role)) == keccak256(bytes('teacher'));
    require(account.isAdminInList(msg.sender) || isTeacher || 
            gradeReports[studentID][semester].student == msg.sender, 
            "Only admins, teachers and students themselves can get score details");
    require(gradeReports[studentID][semester].student != address(0), "Invalid student address");
    return (gradeReports[studentID][semester].student, gradeReports[studentID][semester].ipfsCID, gradeReports[studentID][semester].key);
  }

  function getGradeReportPublic(string memory studentID, string memory semester, string memory privateKey) public view returns (string memory) {
    require(keccak256(bytes(gradeReports[studentID][semester].key)) == keccak256(bytes(privateKey)), "Invalid private key");
    return gradeReports[studentID][semester].ipfsCID;
  }
}

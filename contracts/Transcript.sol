// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Transcript {
  struct GradeReport {
    string studentID;
    string ipfsCID;
    address signer;
  }

  struct Application {
    string studentID;
    string ipfsCID;
    string state;
  }

  Application[] public penddingApplications;

  mapping(string => Application[]) public applications;
  mapping(string => GradeReport[]) public gradeReports;
  mapping(uint256 => bool) public isReviewed;

  function Apply(string memory studentID, string memory ipfsCID) public {
    applications[studentID].push(Application({
      studentID: studentID,
      ipfsCID: ipfsCID,
      state: 'pendding'
    }));

    penddingApplications.push(Application({
      studentID: studentID,
      ipfsCID: ipfsCID,
      state: 'pendding'
    }));

    isReviewed[penddingApplications.length - 1] = false;
  }

  function getPenddingApplications() public view returns (Application[] memory) {
    Application[] memory returnApplications = new Application[](penddingApplications.length);
    uint256 count = 0;
    for (uint256 i = 0; i < penddingApplications.length; i++) {
      if (isReviewed[i] == false) {
        returnApplications[count] = penddingApplications[i];
        count++;
      }
    }
    
    assembly { mstore(returnApplications, count) }
    return returnApplications;
  }

  function Approve(uint penddingID, string memory ipfsCID) public {
    penddingApplications[penddingID].state = 'approved';
    isReviewed[penddingID] = true;
    gradeReports[penddingApplications[penddingID].studentID].push(GradeReport({
      studentID: penddingApplications[penddingID].studentID,
      ipfsCID: ipfsCID,
      signer: msg.sender
    }));
  }

  function Reject(uint penddingID) public {
    penddingApplications[penddingID].state = 'rejected';
    isReviewed[penddingID] = true;
  }
}

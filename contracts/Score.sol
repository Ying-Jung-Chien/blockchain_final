// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Score {
  struct SubjectScore {
    string subject;
    string ipfsCID;
    address signer;
  }

  struct SignedScore {
    string subject;
    string studentId;
    string ipfsCID;
  }

  mapping(string => SubjectScore[]) public scores;
  mapping(address => SignedScore[]) public signedScores;

  function Store(string memory studentID, string memory subject, string memory ipfsCID) public {
    scores[studentID].push(SubjectScore({
      subject: subject,
      ipfsCID: ipfsCID,
      signer: msg.sender
    }));

    signedScores[msg.sender].push(SignedScore({
      subject: subject,
      studentId: studentID,
      ipfsCID: ipfsCID
    }));
  }

  function getScoreDetails(string memory studentID) public view returns (SubjectScore[] memory) {
    return scores[studentID];
  }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./Account.sol";
import "./User.sol";
import "./Transcript.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Score {
  struct SubjectScore {
    string _id;
    string subject;
    string semester;
    string ipfsCID;
    string score;
    string key;
    address student;
    address teacher;
  }

  // struct SignedScore {
  //   string subject;
  //   string studentId;
  //   string ipfsCID;
  // }

  mapping(string => SubjectScore[]) public scores;
  // mapping(address => SignedScore[]) public signedScores;

  Account private account;
  User private user;
  Transcript private transcript;

  constructor(address _accountAddress, address _userAddress) {
    account = Account(_accountAddress);
    user = User(_userAddress);
  }

  function setTranscriptContract(address _transcriptAddress) public {
    require(transcript == Transcript(address(0)), "Transcript contract has been set");
    transcript = Transcript(_transcriptAddress);
  }

  function Store(string memory _id,
                 string memory subject,
                 string memory ipfsCID,
                 string memory semester,
                 string memory score,
                 string memory key,
                 address student) 
  public {

    (, string memory role, , ) = user.getAccountInfoByAddress(msg.sender);
    bool isTeacher = keccak256(bytes(role)) == keccak256(bytes('teacher'));
    require(account.isAdminInList(msg.sender) || isTeacher, "Only admins and teachers can add score");
    
    scores[_id].push(SubjectScore({
      _id: _id,
      subject: subject,
      ipfsCID: ipfsCID,
      semester: semester,
      score: score,
      key: key,
      student: student,
      teacher: msg.sender
    }));
  }

  function getScoreDetails(string memory _id) public view returns (SubjectScore[] memory) {
    require(scores[_id].length > 0, "Invalid student ID or no score has been added");
    (, string memory role, , ) = user.getAccountInfoByAddress(msg.sender);
    bool isTeacher = keccak256(bytes(role)) == keccak256(bytes('teacher'));
    require(account.isAdminInList(msg.sender) || isTeacher || 
            scores[_id][0].student == msg.sender || address(transcript) == msg.sender, 
            "Only admins, teachers, transcript contract and students themselves can get score details");

    return (scores[_id]);
  }

  function getScoreId(string memory _id,
                            string memory _subject,
                            string memory _semester,
                            string memory _key) public view returns (uint256) {
    for (uint256 i = 0; i < scores[_id].length; i++) {
      if (keccak256(bytes(scores[_id][i].subject)) == keccak256(bytes(_subject)) &&
          keccak256(bytes(scores[_id][i].semester)) == keccak256(bytes(_semester)) &&
          keccak256(bytes(scores[_id][i].key)) == keccak256(bytes(_key))) {
        return i;
      }
    }
    return scores[_id].length;
  }

  function getScore(string memory _id,
                    string memory _subject,
                    string memory _semester,
                    string memory _key) public view returns (string memory) {
    uint256 scoreId = getScoreId(_id, _subject, _semester, _key);
    require(scoreId < scores[_id].length, "Invalid score info");
    return scores[_id][scoreId].score;
  }
}

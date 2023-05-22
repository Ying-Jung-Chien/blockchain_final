import React, { useState, useEffect } from 'react';
import ScoreArtifact from './abi/contracts/Score.sol/Score.json';
import scoreContractAddress from './abi/contracts/Score.sol/contract-address.json';
import TranscriptArtifact from './abi/contracts/Transcript.sol/Transcript.json';
import transcriptContractAddress from './abi/contracts/Transcript.sol/contract-address.json';
import Web3 from 'web3';
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";

function ScoreTable() {
  const [studentId, setStudentId] = useState('');
  const [scores, setScores] = useState('');
  const [applyData, setapplyData] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const scoreContract = new web3.eth.Contract(ScoreArtifact, scoreContractAddress.Score);
        const id = localStorage.getItem("ID");
        setStudentId(id);
        // console.log(id);
        const score = await scoreContract.methods.getScoreDetails(id).call();
        // console.log(score);

        var data = {};
        var apply = [];
        for (var i = 0; i < score.length; i++) {
          const response = await fetch(`https://ipfs.io/ipfs/${score[i]['ipfsCID']}`);
          const result = await response.json();
        //   console.log('result', result);
        //   console.log('origin', result['origin']);

          apply.push({
            origin: result['origin'],
            signCid: result['signCid'],
            signer: score[i]['signer'],
          });
          
          data[result['origin']['subject']] = {
            score: result['origin']['score'],
            signer: score[i]['signer'],
          }
        }
        // console.log('all', data);
        // console.log('apply', apply);
        
        setScores(data);
        setapplyData(apply);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchData();
  });

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  const addApplyData = async () => {
    try {
      const projectId = process.env.REACT_APP_PROJECT_ID;
      const projectSecretKey = process.env.REACT_APP_PROJECT_SECRET;
      const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');
    //   console.log(projectId, projectSecretKey);

      const ipfs = ipfsHttpClient({
        url: "https://ipfs.infura.io:5001/api/v0",
        headers: {
          authorization,
        },
      });

      const cid = await ipfs.add(JSON.stringify(applyData));
      console.log(cid.path);

      ethEnabled();
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const transcriptContract = new web3.eth.Contract(TranscriptArtifact, transcriptContractAddress.Transcript);
      await transcriptContract.methods.Apply(studentId, cid.path).send({from: accounts[0]})
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleApplyTranscript = (e) => {
    e.preventDefault();
    console.log('handleApplyTranscript');
    addApplyData();
  };


  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Score</th>
            <th>Teacher</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(scores).map(([subject, { score, signer }]) => (
            <tr key={subject}>
              <td>{subject}</td>
              <td>{score}</td>
              <td>{signer}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleApplyTranscript}>
        <button type="submit">Apply Transcript</button>
      </form>
    </div>
  );
}

export default ScoreTable;
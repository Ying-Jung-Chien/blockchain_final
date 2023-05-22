import React, { useState } from 'react';
import { create as ipfsHttpClient } from "ipfs-http-client";
import ScoreArtifact from './abi/contracts/Score.sol/Score.json';
import contractAddress from './abi/contracts/Score.sol/contract-address.json';
import Web3 from 'web3';
import { Buffer } from "buffer";
import { useNavigate  } from 'react-router-dom';


const SendScore = () => {
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

  const [signer, setSigner] = useState('');
  const [signature, setSignature] = useState('');
  const [subject, setSubject] = useState('');
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('');


  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }

  const getSignerAddress = async () => {
    try {
      ethEnabled();
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.getAccounts();
    //   console.log(accounts);
      setSigner(accounts[0]);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  getSignerAddress();

  const signMessage = async (message, signer) => {
    try {
      console.log(message, signer)
      const web3 = new Web3(window.ethereum);
      const signMessage = await web3.eth.personal.sign(JSON.stringify(message), signer);
      setSignature(signMessage);

      const signCid = await ipfs.add(signMessage);

      const data = JSON.stringify({
        origin: message,
        signCid: signCid.path
      });

      const cid = await ipfs.add(data);
      console.log(cid.path);

      const scoreContract = new web3.eth.Contract(ScoreArtifact, contractAddress.Score);
      await scoreContract.methods.Store(studentId, subject, cid.path).send({from: signer})
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
//   const verifySignature = async (message, signature, signerAddress) => {
//     try {
//       const web3 = new Web3(window.ethereum);
//       const recoveredAddress = await web3.eth.personal.ecRecover(
//         message,
//         signature
//       );
//       const result =  recoveredAddress.toLowerCase() === signerAddress.toLowerCase();
//       console.log(result);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Subject:', subject);
    console.log('Student ID:', studentId);
    console.log('Score:', score);
    
    const data = {
        subject: subject,
        studentId: studentId,
        score: score,
    };
    signMessage(data, signer);
  };

//   const recoverSignature = async (signature, signerAddress) => {
//     try {
//       const web3 = new Web3(window.ethereum);
//       const recoveredAddress = await web3.eth.accounts.recover(signedData, signature);
//       console.log("Recovered Address:", recoveredAddress);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const fetchUserData = (cid, address) => {
//     fetch(`https://ipfs.io/ipfs/${cid}`)
//       .then(response => {
//         return response.json()
//       })
//       .then(data => {
//         recoverSignature(data, address);
//       })
//   }

  const getData = async (studentId, subject) => {
    try {
      const web3 = new Web3(window.ethereum);
      const scoreContract = new web3.eth.Contract(ScoreArtifact, contractAddress.Score);
      const result = await scoreContract.methods.getScoreDetails(studentId, subject).call();
      console.log(result[0]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGetData = (e) => {
    e.preventDefault();
    
    console.log('handleGetData');
    
    getData(studentId, subject);
  };

  
  

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Course Title:
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <br />
        <label>
          Student ID:
          <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        </label>
        <br />
        <label>
          Score:
          <input type="text" value={score} onChange={(e) => setScore(e.target.value)} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>

      {/* <form onSubmit={handleGetData}>
        <button type="submit">Get Data</button>
      </form> */}
    </div>
  );
};

export default SendScore;
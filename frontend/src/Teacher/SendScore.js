import React, { useState } from 'react';
import { create as ipfsHttpClient } from "ipfs-http-client";
import ScoreArtifact from '../abi/contracts/Score.sol/Score.json';
import scoreContractAddress from '../abi/contracts/Score.sol/contract-address.json';
import UserArtifact from '../abi/contracts/User.sol/User.json';
import userContractAddress from '../abi/contracts/User.sol/contract-address.json';
import Web3 from 'web3';
import { Buffer } from "buffer";
import { useNavigate  } from 'react-router-dom';
import { useEffect } from "react";

const SendScore = () => {
  const projectId = process.env.REACT_APP_PROJECT_ID;
  const projectSecretKey = process.env.REACT_APP_PROJECT_SECRET;
  const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');
  // console.log(projectId, projectSecretKey);

  const ipfs = ipfsHttpClient({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });

  
  const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  const scoreContract = new web3.eth.Contract(ScoreArtifact, scoreContractAddress.Score);
  const userContract = new web3.eth.Contract(UserArtifact, userContractAddress.User);
  
  const [subject, setSubject] = useState('');
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('');
  const [semester, setSemester] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkAccount();
    if (semester == '') getSemester();
  });

  const checkAccount = async () => {
    const userNow = (await web3.eth.getAccounts())[0];
    const userLogin = localStorage.getItem("user");
    
    if (userNow.toUpperCase() !== userLogin.toUpperCase()) return false;
    return true;
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
  
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
  
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };
  
  const getStudentAddress = async () => {
    return new Promise((resolve, reject) => {
      userContract.methods.getAccountInfoById(studentId).call((error, result) => {
        if (error) {
          console.error('Error:', error);
          reject(error);
        } else if (!result[3]) {
          showErrorMessage('Account has been removed.');
          reject('Account has been removed.');
        } else {
          resolve(result[0]);
        }
      });
    });
  };
  
  const getSemester = async () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    console.log('currentYear:', currentYear);
    console.log('currentMonth:', currentMonth);
    const rocYear = currentYear - 1911;

    let semester;
    if (currentMonth >= 3 && currentMonth < 9) {
      semester = (rocYear - 1).toString() + '02';
    } else {
      semester = rocYear.toString() + '01';
    }
    console.log('semester:', semester);
    setSemester(semester);
  };

  const getEncryptdata = async (score) => {
    const { privateKey, publicKey } = web3.eth.accounts.create();
    // console.log('Private Key:', privateKey);

    const encryptedData = web3.eth.accounts.encrypt(score, privateKey);
    console.log('Encrypted Data:', JSON.stringify(encryptedData));

    return [JSON.stringify(encryptedData), privateKey];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // console.log('Subject:', subject);
    // console.log('Student ID:', studentId);
    // console.log('Score:', score);
    
    const result = await checkAccount();
    if (!result) {
      showErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      const studentAddress = await getStudentAddress();

      const [encryptedData, privateKey] = await getEncryptdata(score);

      scoreContract.methods.Store(studentId, subject, "", semester, encryptedData, privateKey, studentAddress).send({ from: user })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        showSuccessMessage('Store score successfully');
      })
      .on('confirmation', function(confirmationNumber, receipt) {
        console.log('Confirmation number:', confirmationNumber);
        console.log('Receipt:', receipt);
      })
      .on('error', function(error) {
        const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
        showErrorMessage(reason);
        console.log('Error reason:', reason);
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {successMessage && <div className="success" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>{successMessage}</div>}
        {errorMessage && <div className="error" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>Error: {errorMessage}</div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px' }}>
          <h2>Send Student Score</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ textAlign: 'left' }}>
              Subject:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
            </label>
            <br />
            <label style={{ textAlign: 'left' }}>
              Semester:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input type="text" value={semester} onChange={(e) => setSemester(e.target.value)} />
              </div>
            </label>
            <br />
            <label style={{ textAlign: 'left' }}>
              Student ID:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              </div>
            </label>
            <br />
            <label style={{ textAlign: 'left' }}>
              Score:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input type="text" value={score} onChange={(e) => setScore(e.target.value)} />
              </div>
            </label>
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendScore;
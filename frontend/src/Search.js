import React, { useState } from 'react';
import { create as ipfsHttpClient } from "ipfs-http-client";
import UserArtifact from './abi/contracts/User.sol/User.json';
import userContractAddress from './abi/contracts/User.sol/contract-address.json';
import ScoreArtifact from './abi/contracts/Score.sol/Score.json';
import scoreContractAddress from './abi/contracts/Score.sol/contract-address.json';
import Web3 from 'web3';
import { Buffer } from "buffer";
import { useNavigate  } from 'react-router-dom';
import { useEffect } from "react";


const Search = () => {
  const projectId = process.env.REACT_APP_PROJECT_ID;
  const projectSecretKey = process.env.REACT_APP_PROJECT_SECRET;
  const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');
  console.log(projectId, projectSecretKey);

  const ipfs = ipfsHttpClient({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });

  const web3 = new Web3("ws://localhost:8545")
  const userContract = new web3.eth.Contract(UserArtifact, userContractAddress.User);
  const scoreContract = new web3.eth.Contract(ScoreArtifact, scoreContractAddress.Score);

  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [semester, setSemester] = useState('');
  const [displayData, setDisplayData] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const getDecryptdata = async (data, key) => {
    const decryptedData = web3.eth.accounts.decrypt(JSON.parse(JSON.stringify(data)), key);
    // console.log('Decrypted Data:', decryptedData.privateKey.slice(2));

    return decryptedData.privateKey.slice(2);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
  
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  const setScoreValues = async (subject, encryptedData, key) => {
    var data = [];
    for(let i = 0; i < encryptedData.length; i++) {
      const decryptedData = await getDecryptdata(encryptedData[i], key[i]);
      // console.log('Decrypted Data:', decryptedData);
      data.push({subject: subject[i], score: decryptedData});
    }
    setDisplayData(data);
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // console.log('ID:', studentId);
    // console.log('Semester:', semester);
    // console.log('Access Key:', accessKey);

    setDisplayData('');
    try {
      await scoreContract.methods.getScoreByAccessKey(studentId, semester, accessKey).call((error, result) => {
        if (error) {
          const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
          showErrorMessage(reason);
          console.error('Error:', reason);
        } else {
          // console.log('Scores:', result);
          setScoreValues(result[0], result[1], result[2]);
        }
      });
    } catch(error) {
      console.error('Error:', error);
    }
  };


  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5%', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid black', padding: '20px', margin: '10px' }}>
        {errorMessage && <div className="error" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>Error: {errorMessage}</div>}
        <h2>Search</h2>
        <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onSubmit={handleSearch}>
          <label style={{ textAlign: 'left' }}>
            Student ID:
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
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
            Access Key:
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <input type="text" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} />
            </div>
          </label>
          <br />
          <button
            style={{
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '10px',
              marginRight: '10px',
            }}
            type="submit">Search</button>
        </form>
      </div>


      {displayData.length > 0 ? (
        <table style={{ borderCollapse: 'collapse', width: '60%', marginTop: '40px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Subject</th>
              <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((data, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{data.subject}</td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{data.score}</td>
              </tr>
            ))}
          </tbody>
      </table>
      ) : (<div></div>) }
    </div>
  );
};

export default Search;
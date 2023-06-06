import React, { useState, useEffect } from 'react';
import UserArtifact from '../abi/contracts/User.sol/User.json';
import userContractAddress from '../abi/contracts/User.sol/contract-address.json';
import ScoreArtifact from '../abi/contracts/Score.sol/Score.json';
import scoreContractAddress from '../abi/contracts/Score.sol/contract-address.json';
import Web3 from 'web3';
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";
// import CryptoJS from 'crypto-js';

function ScoreTable() {
  const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  const userContract = new web3.eth.Contract(UserArtifact, userContractAddress.User);
  const scoreContract = new web3.eth.Contract(ScoreArtifact, scoreContractAddress.Score);

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

  const [scores, setScores] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stopReload, setStopReload] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await checkAccount();
        if (!result) return;

        let score;
        const callerAddress = localStorage.getItem("user");

        const id = localStorage.getItem("ID");

        await userContract.methods.getAccessKey(id).call({ from: callerAddress }, (error, result) => {
          if (error) {
            const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
            var message = '';
            if (errorMessage !== '') message = errorMessage + '\n' + reason;
            else message = reason;
            setErrorMessage(message);
            console.error('Error:', reason);
          } else {
            console.log('AccessKey:', result);
            setAccessKey(result);
          }
        });

        await scoreContract.methods.getScoreDetails(id).call({ from: callerAddress }, (error, result) => {
          if (error) {
            const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
            var message = '';
            if (errorMessage !== '') message = errorMessage + '\n' + reason;
            else message = reason;
            setErrorMessage(message);
            console.error('Error:', reason);
          } else {
            score = result;
          }
        });
        console.log(score);

        var data = [];
        for (var i = 0; i < score.length; i++) {
          const decryptScore = await getDecryptdata(score[i]['score'], score[i]['key']);
          data.push({
            subject: score[i]['subject'],
            semester: score[i]['semester'],
            score: decryptScore,
            teacher: score[i]['teacher'],
            key: score[i]['key']
          })
        }
        setScores(data);
      } catch (error) {
        console.error('Error:', error);
        setStopReload(true);
        return;
      }
    }
    
    if (scores == '' && !stopReload) fetchData();
    if (scores != '') {
      scores.sort((a, b) => {
        const semesterA = parseInt(a.semester);
        const semesterB = parseInt(b.semester);
      
        if (semesterA < semesterB) {
          return -1;
        }
        if (semesterA > semesterB) {
          return 1;
        }
        return 0;
      });
    }
  });

  const checkAccount = async () => {
    const userNow = (await web3.eth.getAccounts())[0];
    const userLogin = localStorage.getItem("user");
    
    if (userNow.toUpperCase() !== userLogin.toUpperCase()) return false;
    return true;
  };

  const getDecryptdata = async (data, key) => {
    const decryptedData = web3.eth.accounts.decrypt(JSON.parse(JSON.stringify(data)), key);
    // console.log('Decrypted Data:', decryptedData.privateKey.slice(2));

    return decryptedData.privateKey.slice(2);
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

  // const getEncryptScores = async () => {
  //   const { privateKey, publicKey } = web3.eth.accounts.create();
  //   console.log('Private Key:', privateKey);

  //   const user = localStorage.getItem("user");
  //   const filteredScores = scores.filter((score) => score.semester === applySemester);
  //   if (filteredScores.length === 0) {
  //     showErrorMessage('No scores in this semester');
  //     return;
  //   }

  //   const data = { studentId: studentId, studentAddress: user, scores: filteredScores };

  //   const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), privateKey).toString();
  //   const cid = (await ipfs.add(JSON.stringify(encryptedData))).path;
  //   console.log('Encrypted Data:', encryptedData);
  //   console.log('CID:', cid);


  //   const decryptedData = CryptoJS.AES.decrypt(encryptedData, privateKey).toString(CryptoJS.enc.Utf8);
  //   console.log('Decrypted Data:', decryptedData);

  //   return [cid, privateKey];
  // };

  const handleChangeAccessKey = (e) => {
    e.preventDefault();
    console.log('handleChangeAccessKey');

    const { privateKey, publicKey } = web3.eth.accounts.create();
    // console.log('Private key:', privateKey);

    const userAddress = localStorage.getItem("user");

    userContract.methods.updateAccessKey(privateKey).send({ from: userAddress })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        setAccessKey(privateKey);
        showSuccessMessage('Change access key successfully');
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
  };


  return (
    <div>
      {scores.length >0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <table style={{ borderCollapse: 'collapse', width: '80%', marginTop: '40px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Subject</th>
                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Semester</th>
                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Score</th>
                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Teacher</th>
                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Private Key</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{score.subject}</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{score.semester}</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{score.score}</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{score.teacher}</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{score.key}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {successMessage && <div className="success" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>{successMessage}</div>}
            {errorMessage && <h1 className="error" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>Error: {errorMessage}</h1>}
          </div>
          <table style={{ borderCollapse: 'collapse', width: '80%', marginTop: '40px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Access Key</td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{accessKey}</td>
                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                  <button type="submit"
                    style={{
                      backgroundColor: 'blue',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '10px',
                      margin: '10px'
                    }}
                    onClick={handleChangeAccessKey}>
                    Change Access Key</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {(errorMessage && <h1 className="error" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>Error: {errorMessage}</h1>) || (<h1>Loading...</h1>)}
          </div>
        ) }
    </div>
  );
}

export default ScoreTable;
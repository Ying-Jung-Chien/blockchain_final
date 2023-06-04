import React, { useState, useEffect } from 'react';
import ScoreArtifact from '../abi/contracts/Score.sol/Score.json';
import scoreContractAddress from '../abi/contracts/Score.sol/contract-address.json';
import TranscriptArtifact from '../abi/contracts/Transcript.sol/Transcript.json';
import transcriptContractAddress from '../abi/contracts/Transcript.sol/contract-address.json';
import Web3 from 'web3';
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";
import CryptoJS from 'crypto-js';

function ScoreTable() {
  const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  const scoreContract = new web3.eth.Contract(ScoreArtifact, scoreContractAddress.Score);
  const transcriptContract = new web3.eth.Contract(TranscriptArtifact, transcriptContractAddress.Transcript);

  const projectId = process.env.REACT_APP_PROJECT_ID;
  const projectSecretKey = process.env.REACT_APP_PROJECT_SECRET;
  const inspector = 'df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'; //process.env.INSPECTOR_ADDRESS;
  const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');
  // console.log(projectId, projectSecretKey, inspector);

  const ipfs = ipfsHttpClient({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });

  const [studentId, setStudentId] = useState('');
  const [scores, setScores] = useState('');
  const [applySemester, setApplySemester] = useState('');
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
        await scoreContract.methods.getScoreDetails(id).call({ from: callerAddress }, (error, result) => {
          if (error) {
            const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
            setErrorMessage(reason);
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

    const id = localStorage.getItem("ID");
    setStudentId(id);
    
    if (scores == '' && !stopReload) fetchData();
  });

  const getDecryptdata = async (data, key) => {
    const decryptedData = web3.eth.accounts.decrypt(JSON.parse(JSON.stringify(data)), key);
    console.log('Decrypted Data:', decryptedData.privateKey.slice(2));

    return decryptedData.privateKey.slice(2);
  };

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

  const getEncryptScores = async () => {
    const { privateKey, publicKey } = web3.eth.accounts.create();
    console.log('Private Key:', privateKey);

    const user = localStorage.getItem("user");
    const filteredScores = scores.filter((score) => score.semester === applySemester);
    if (filteredScores.length === 0) {
      showErrorMessage('No scores in this semester');
      return;
    }

    const data = { studentId: studentId, studentAddress: user, scores: filteredScores };

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), privateKey).toString();
    const cid = (await ipfs.add(JSON.stringify(encryptedData))).path;
    console.log('Encrypted Data:', encryptedData);
    console.log('CID:', cid);


    const decryptedData = CryptoJS.AES.decrypt(encryptedData, privateKey).toString(CryptoJS.enc.Utf8);
    console.log('Decrypted Data:', decryptedData);

    return [cid, privateKey];
  };

  // const sendApply = async (transactionObject) => {
  //   // const account = web3.eth.accounts.wallet.add(inspector);
  //   // console.log('Inspector Wallet:', account, account.address);
  //   const account = web3.eth.accounts.privateKeyToAccount(inspector.toUpperCase());
  //   web3.eth.accounts.wallet.add(account);
  //   web3.utils.toChecksumAddress(account.address.toUpperCase());
  //   console.log('Account:', account.address);
  //   console.log('Account privateKey:', account.privateKey);
    
  //   const gasLimit = await transactionObject.estimateGas({ from: account.address });
  //   const transaction = {
  //     from: account.address,
  //     to: transcriptContractAddress,
  //     gas: gasLimit,
  //     // data: transactionObject.encodeABI()
  //   };

  //   const signedTransaction = await web3.eth.accounts.signTransaction(transaction, account.privateKey);
  //   // web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
  //   // .on('transactionHash', function(hash) {
  //   //   console.log('Transaction hash:', hash);
  //   //   showSuccessMessage('Apply transcript successfully');
  //   // })
  //   // .on('receipt', function(receipt) {
  //   //   console.log('Receipt:', receipt);
  //   // })
  //   // .on('error', function(error) {
  //   //   const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
  //   //   console.log('Error reason:', reason);
  //   //   showErrorMessage(reason);
  //   // });
  // };

  // const applyTranscript = async () => {
  //   if (applySemester === '') {
  //     showErrorMessage('Please enter semester');
  //     return;
  //   }
    
  //   try {
  //     const [ipfs, privateKey] = await getEncryptScores();
  //     const studentAddress = localStorage.getItem("user");
  //     const transactionObject = transcriptContract.methods.addGradeReport(studentId, applySemester, ipfs, privateKey, studentAddress);
  //     await sendApply(transactionObject);

  //     // transcriptContract.methods.addGradeReport(studentId, applySemester, ipfs, privateKey, studentAddress).send({ from: inspector, gas: 20000 })
  //     //   .on('transactionHash', function(hash) {
  //     //     console.log('Transaction hash:', hash);
  //     //     showSuccessMessage('Apply transcript successfully');
  //     //   })
  //     //   .on('confirmation', function(confirmationNumber, receipt) {
  //     //     console.log('Confirmation number:', confirmationNumber);
  //     //     console.log('Receipt:', receipt);
  //     //   })
  //     //   .on('error', function(error) {
  //     //     const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
  //     //     showErrorMessage(reason);
  //     //     console.log('Error reason:', reason);
  //     //   });
  //   } catch (error) {
  //     console.error(error);
  //   }

    
  // };

  // const handleApplyTranscript = (e) => {
  //   e.preventDefault();
  //   console.log('handleApplyTranscript');
  //   applyTranscript();
  // };


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
          {/* <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {successMessage && <div className="success">{successMessage}</div>}
              {errorMessage && <div className="error">Error: {errorMessage}</div>}
            </div>
            <form onSubmit={handleApplyTranscript} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ textAlign: 'left' }}>
                Semester:
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <input type="text" value={applySemester} onChange={(e) => setApplySemester(e.target.value)} />
                </div>
              </label>
              <br />
              <button type="submit"
                      style={{
                        backgroundColor: 'blue',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px',
                        margin: '10px'
                      }}>
                Apply Transcript</button>
            </form>
          </div> */}
        </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {(errorMessage && <h1 className="error">Error: {errorMessage}</h1>) || (<h1>Loading...</h1>)}
          </div>
        ) }
    </div>
  );
}

export default ScoreTable;
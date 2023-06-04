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
  // const projectId = process.env.REACT_APP_PROJECT_ID;
  // const projectSecretKey = process.env.REACT_APP_PROJECT_SECRET;
  // const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');
//   console.log(projectId, projectSecretKey);

  // const ipfs = ipfsHttpClient({
  //   url: "https://ipfs.infura.io:5001/api/v0",
  //   headers: {
  //     authorization,
  //   },
  // });

  
  const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  const scoreContract = new web3.eth.Contract(ScoreArtifact, scoreContractAddress.Score);
  const userContract = new web3.eth.Contract(UserArtifact, userContractAddress.User);
  // const [signer, setSigner] = useState('');
  // const [signature, setSignature] = useState('');
  const [subject, setSubject] = useState('');
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('');
  // const [studentAddress, setStudentAddress] = useState('');
  // const [semester, setSemester] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkAccount();
  });

  const checkAccount = async () => {
    const userNow = (await web3.eth.getAccounts())[0];
    const userLogin = localStorage.getItem("user");
    
    console.log('userNow:', userNow);
    console.log('userLogin:', userLogin);
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

  // const getStudentAddress = async () => {
  //   userContract.methods.getAccountInfoById(studentId).call((error, result) => {
  //     if (error) {
  //       console.error('Error:', error);
  //     } else if (!result[3]) {
  //       console.log('Account has been removed.');
  //       showErrorMessage('Account has been removed.');
  //     } else {
  //       // setStudentAddress(result[0]);
  //       console.log('Address:', result[0]);
  //       return result[0];
  //     }
  //   });
  //   return;
  // };
  
  const getStudentAddress = async () => {
    return new Promise((resolve, reject) => {
      userContract.methods.getAccountInfoById(studentId).call((error, result) => {
        if (error) {
          console.error('Error:', error);
          reject(error);
        } else if (!result[3]) {
          console.log('Account has been removed.');
          showErrorMessage('Account has been removed.');
          reject('Account has been removed.');
        } else {
          console.log('Address:', result[0]);
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

    // 判断所在的学期
    let semester;
    if (currentMonth >= 3 && currentMonth < 9) {
      semester = (rocYear - 1).toString() + '02';
    } else {
      semester = rocYear.toString() + '01';
    }
    console.log('semester:', semester);
    // setSemester(semester);
    return semester;
  };

  const getEncrydata = async (score) => {
    const { privateKey, publicKey } = web3.eth.accounts.create();
    console.log('Private Key:', privateKey);

    const encryptedData = web3.eth.accounts.encrypt(score, privateKey);

    console.log('Encrypted Data:', encryptedData);

    // const decryptedData = web3.eth.accounts.decrypt(encryptedData, privateKey);
    // console.log('Decrypted Data:', decryptedData.privateKey);

    return [privateKey, encryptedData];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Subject:', subject);
    console.log('Student ID:', studentId);
    console.log('Score:', score);
    
    const result = await checkAccount();
    if (!result) {
      showErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      const studentAddress = await getStudentAddress();
      // console.log('User:', typeof(user));
      console.log('Student Address:', studentAddress);

      const semester = await getSemester();
      console.log('Semester:', semester);

      const [encryptedData, privateKey] = await getEncrydata(score);
      console.log('Encrypted Data:', encryptedData, privateKey);

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
      

      // accountContract.methods.addNewAccount(username, password, role).send({ from: user })
      // .on('transactionHash', function(hash) {
      //   console.log('Transaction hash:', hash);
      //   showSuccessMessage('Add user successfully');
      // })
      // .on('confirmation', function(confirmationNumber, receipt) {
      //   console.log('Confirmation number:', confirmationNumber);
      //   console.log('Receipt:', receipt);
      // })
      // .on('error', function(error) {
      //   const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
      //   showErrorMessage(reason);
      //   console.log('Error reason:', reason);
      // });
    }
  };

  // const ethEnabled = () => {
  //   if (window.ethereum) {
  //     window.web3 = new Web3(window.ethereum);
  //     window.ethereum.enable();
  //     return true;
  //   }
  //   return false;
  // }

  // const getSignerAddress = async () => {
  //   try {
  //     ethEnabled();
  //     const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  //     const accounts = await web3.eth.getAccounts();
  //   //   console.log(accounts);
  //     setSigner(accounts[0]);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };
  
  // getSignerAddress();

  // const signMessage = async (message, signer) => {
  //   try {
  //     console.log(message, signer)
  //     const web3 = new Web3(window.ethereum);
  //     const signMessage = await web3.eth.personal.sign(JSON.stringify(message), signer);
  //     setSignature(signMessage);

  //     const signCid = await ipfs.add(signMessage);

  //     const data = JSON.stringify({
  //       origin: message,
  //       signCid: signCid.path
  //     });

  //     const cid = await ipfs.add(data);
  //     console.log(cid.path);

  //     const scoreContract = new web3.eth.Contract(ScoreArtifact, contractAddress.Score);
  //     await scoreContract.methods.Store(studentId, subject, cid.path).send({from: signer});
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };
  
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

  // const handleSubmit = (e) => {
  //   e.preventDefault();
    
  //   console.log('Subject:', subject);
  //   console.log('Student ID:', studentId);
  //   console.log('Score:', score);
    
  //   const data = {
  //       subject: subject,
  //       studentId: studentId,
  //       score: score,
  //   };
  //   signMessage(data, signer);
  // };

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

  // const getData = async (studentId, subject) => {
  //   try {
  //     const web3 = new Web3(window.ethereum);
  //     const scoreContract = new web3.eth.Contract(ScoreArtifact, contractAddress.Score);
  //     const result = await scoreContract.methods.getScoreDetails(studentId, subject).call();
  //     console.log(result[0]);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  // const handleGetData = (e) => {
  //   e.preventDefault();
    
  //   console.log('handleGetData');
    
  //   getData(studentId, subject);
  // };

  
  

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {successMessage && <div className="success">{successMessage}</div>}
        {errorMessage && <div className="error">Error: {errorMessage}</div>}
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
      

      {/* <form onSubmit={handleGetData}>
        <button type="submit">Get Data</button>
      </form> */}
    </div>
  );
};

export default SendScore;
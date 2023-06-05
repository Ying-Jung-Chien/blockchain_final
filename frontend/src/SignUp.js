import React, { useState } from 'react';
import { create as ipfsHttpClient } from "ipfs-http-client";
import UserArtifact from './abi/contracts/User.sol/User.json';
import contractAddress from './abi/contracts/User.sol/contract-address.json';
import Web3 from 'web3';
import { Buffer } from "buffer";
import { useNavigate  } from 'react-router-dom';
import { useEffect } from "react";


const SignUp = () => {
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

  const web3 = new Web3("ws://localhost:8545")
  const userContract = new web3.eth.Contract(UserArtifact, contractAddress.User);

  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [ID, setId] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem("authenticated");
    console.log('Logged in user:', loggedInUser);
    if (loggedInUser === 'false') navigate('/');
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // console.log('Name:', name);
    // console.log('ID:', ID);
    // console.log('Email:', email);

    const data = JSON.stringify({Name: name, Email: email});
    const cid = (await ipfs.add(data)).path;

    // console.log('CID:', cid);

    const userAddress = localStorage.getItem("user");
    
    if(localStorage.getItem("role") === "student") {
      const { privateKey, publicKey } = web3.eth.accounts.create();

      userContract.methods.updateAccessKey(privateKey).send({ from: userAddress })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
      })
      .on('confirmation', function(confirmationNumber, receipt) {
        console.log('Confirmation number:', confirmationNumber);
        console.log('Receipt:', receipt);
      })
      .on('error', function(error) {
        console.error('Error:', error);
      });
    }
    
    localStorage.setItem('ID', ID);
    userContract.methods.updateAccountInfo(ID, cid).send({ from: userAddress })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        navigate('/home');
      })
      .on('confirmation', function(confirmationNumber, receipt) {
        console.log('Confirmation number:', confirmationNumber);
        console.log('Receipt:', receipt);
      })
      .on('error', function(error) {
        console.error('Error:', error);
      });
  };

  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '200px' }}>
      <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px' }}>
        <h2>Sign Up</h2>
        <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onSubmit={handleSignUp}>
          <label style={{ textAlign: 'left' }}>
            Name:
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </label>
          <br />
          <label style={{ textAlign: 'left' }}>
            Id:
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <input type="text" value={ID} onChange={(e) => setId(e.target.value)} />
            </div>
          </label>
          <br />
          <label style={{ textAlign: 'left' }}>
            Email:
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
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
            }} type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
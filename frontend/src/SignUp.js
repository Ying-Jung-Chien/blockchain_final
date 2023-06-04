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
  console.log(projectId, projectSecretKey);

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
  // const [ipfsCid, setIpfsCid] = useState('');


  const handleSignUp = async (e) => {
    e.preventDefault();
    
    console.log('Name:', name);
    console.log('ID:', ID);
    console.log('Email:', email);

    const data = JSON.stringify({Name: name, Email: email});
    const cid = (await ipfs.add(data)).path;

    console.log('CID:', cid);

    const userAddress = localStorage.getItem("user");
    
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
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSignUp}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <br />
        <label>
          Id:
          <input type="text" value={ID} onChange={(e) => setId(e.target.value)} />
        </label>
        <br />
        <label>
          Email:
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <br />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
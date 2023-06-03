import React, { useState } from 'react';
// import { create as ipfsHttpClient } from "ipfs-http-client";
import UserArtifact from './abi/contracts/User.sol/User.json';
import contractAddress from './abi/contracts/User.sol/contract-address.json';
// import { ethers } from 'ethers';
import Web3 from 'web3';
// import { Buffer } from "buffer";
import { useNavigate  } from 'react-router-dom';
import { useEffect } from "react";


const Logout = () => {
  const web3 = new Web3("ws://localhost:8545")
  const userContract = new web3.eth.Contract(UserArtifact, contractAddress.User);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    navigate('/')
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button type="submit" onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Logout;
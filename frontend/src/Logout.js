import React, { useState } from 'react';
import Web3 from 'web3';
import { useNavigate  } from 'react-router-dom';
import { useEffect } from "react";


const Logout = () => {
  const web3 = new Web3("ws://localhost:8545");

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  });

  const handleLogin = (e) => {
    e.preventDefault();
    
    navigate('/')
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button
        style={{
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '20px',
          margin: '80px',
        }}
        type="submit" onClick={handleLogin}>Redirect to Login</button>
    </div>
  );
};

export default Logout;
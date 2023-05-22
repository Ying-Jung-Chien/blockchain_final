import React, { useState } from 'react';
// import { create as ipfsHttpClient } from "ipfs-http-client";
import AccountArtifact from './abi/contracts/Account.sol/Account.json';
import contractAddress from './abi/contracts/Account.sol/contract-address.json';
// import { ethers } from 'ethers';
import Web3 from 'web3';
// import { Buffer } from "buffer";
import { useNavigate  } from 'react-router-dom';


const Login = () => {
//   const projectId = process.env.REACT_APP_PROJECT_ID;
//   const projectSecretKey = process.env.REACT_APP_PROJECT_SECRET;
//   const authorization = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');
//   console.log(projectId, projectSecretKey);

//   const ipfs = ipfsHttpClient({
//     url: "https://ipfs.infura.io:5001/api/v0",
//     headers: {
//       authorization,
//     },
//   });

  const web3 = new Web3("ws://localhost:8545")
  const _account = new web3.eth.Contract(AccountArtifact, contractAddress.Account);

  const history = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  const handleLogin = (e) => {
    e.preventDefault();
    
    console.log('Username:', username);
    console.log('Password:', password);
    // setUsername(username);
    // setPassword(password);
    
    getLoginInfoFromIPFS();
  };

  const fetchUserData = (cid) => {
    fetch(`https://ipfs.io/ipfs/${cid}`)
      .then(response => {
        return response.json()
      })
      .then(data => {
        verifyLoginInfo(data);
      })
  }

  const getLoginInfoFromIPFS = async () => {
    try {
      const cid = (await _account.methods.get().call()).toString();
      console.log('cid:', cid);
      fetchUserData(cid);
    } catch (error) {
        console.error('Error:', error);
    }
  };

  const verifyLoginInfo = (data) => {
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      console.log(data[i]);
      if (data[i].username === username && data[i].password === password) {
        console.log('Login info is correct');
        localStorage.setItem("authenticated", true);
        localStorage.setItem("ID", data[i].id);
        localStorage.setItem("role", data[i].role);
        history('/home');
        break;
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
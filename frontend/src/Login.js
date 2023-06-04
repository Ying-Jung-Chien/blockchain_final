import React, { useState } from 'react';
// import { create as ipfsHttpClient } from "ipfs-http-client";
import UserArtifact from './abi/contracts/User.sol/User.json';
import contractAddress from './abi/contracts/User.sol/contract-address.json';
// import { ethers } from 'ethers';
import Web3 from 'web3';
// import { Buffer } from "buffer";
import { useNavigate  } from 'react-router-dom';
import { useEffect } from "react";


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
  const userContract = new web3.eth.Contract(UserArtifact, contractAddress.User);

  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [userAddress, setUserAddress] = useState('');
  const [firstLogin, setFirstLogin] = useState(false);

  // const ethEnabled = () => {
  //   if (window.ethereum) {
  //     window.web3 = new Web3(window.ethereum);
  //     window.ethereum.enable();
  //     return true;
  //   }
  //   return false;
  // }
  
  // const getUserAddress = async () => {
  //   try {
  //     ethEnabled();
  //     const users = await web3.eth.getAccounts();
  //     const user = (await web3.eth.getAccounts())[0];
  //     const result = await userContract.methods.isBound(user).call();
  //     console.log('users:', users);
  //     console.log('user:', user);
  //     console.log('result:', result);

  //     setUserAddress(user);
  //     localStorage.setItem("user", user);
  //     localStorage.setItem("role", role);
  //     setfirstLogin(!result);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  const ethEnabled = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.web3 = new Web3(window.ethereum);
      return true;
    }
    return false;
  };
  
  const getUserAddress = async () => {
    try {
      const isEthEnabled = await ethEnabled();
      if (!isEthEnabled) {
        console.error('Ethereum not enabled');
        return;
      }
  
      const userAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      const userAddress = userAccounts[0];
      const isBound = await userContract.methods.isBound(userAddress).call();
  
      console.log('User accounts:', userAccounts);
      console.log('User address:', userAddress);
      console.log('Is bound:', isBound);

      if (isBound) {
        userContract.methods.getAccountInfoByAddress(userAddress).call((error, result) => {
          if (error) {
            console.error('Error:', error);
          } else if (!result[3]) {
            console.log('Account has been removed.');
            localStorage.setItem('error', 'Account has been removed.');
            setFirstLogin(isBound);
          } else {
            localStorage.setItem('ID', result[0]);
            localStorage.setItem('role', result[1]);
            console.log('ID:', result[0]);
            console.log('Role:', result[1]);
          }
        });
      }
  
      setUserAddress(userAddress);
      localStorage.setItem('user', userAddress);
      setFirstLogin(!isBound);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    getUserAddress();
  };

  useEffect(() => {
    getUserAddress();
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Role:', role);
    
    userContract.methods.blindAccount(username, password, role).send({ from: userAddress })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        localStorage.setItem("authenticated", true);
        localStorage.setItem('role', role);
        navigate('/sign_up');
      })
      .on('confirmation', function(confirmationNumber, receipt) {
        console.log('Confirmation number:', confirmationNumber);
        console.log('Receipt:', receipt);
      })
      .on('error', function(error) {
        console.error('Error:', error);
      });
  };

  // const handleLogin = (e) => {
  //   e.preventDefault();
    
  //   console.log('Username:', username);
  //   console.log('Password:', password);
  //   // setUsername(username);
  //   // setPassword(password);
    
  //   getLoginInfoFromIPFS();
  // };

  // const fetchUserData = (cid) => {
  //   fetch(`https://ipfs.io/ipfs/${cid}`)
  //     .then(response => {
  //       return response.json()
  //     })
  //     .then(data => {
  //       verifyLoginInfo(data);
  //     })
  // }

  // const getLoginInfoFromIPFS = async () => {
  //   try {
  //     const cid = (await _account.methods.get().call()).toString();
  //     console.log('cid:', cid);
  //     fetchUserData(cid);
  //   } catch (error) {
  //       console.error('Error:', error);
  //   }
  // };

  // const verifyLoginInfo = (data) => {
  //   console.log(data);
  //   for (let i = 0; i < data.length; i++) {
  //     console.log(data[i]);
  //     if (data[i].username === username && data[i].password === password) {
  //       console.log('Login info is correct');
  //       localStorage.setItem("authenticated", true);
  //       localStorage.setItem("ID", data[i].id);
  //       localStorage.setItem("role", data[i].role);
  //       history('/home');
  //       break;
  //     }
  //   }
  // };

  if (firstLogin == true) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '200px' }}>
        <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px' }}>
          <h2>Login</h2>
          <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onSubmit={handleLogin}>
            <label style={{ textAlign: 'left' }}>
              Username:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            </label>
            <br />
            <label style={{ textAlign: 'left' }}>
              Password:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </label>
            <br />
            <label style={{ textAlign: 'left' }}>
              Role:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <select style={{ width: '150px' }} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="teacher">teacher</option>
                  <option value="student">student</option>
                </select>
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
              type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  } else {
    localStorage.setItem("authenticated", true);
    navigate('/home');
  }
};

export default Login;
import React, { useState } from 'react';
import UserArtifact from './abi/contracts/User.sol/User.json';
import contractAddress from './abi/contracts/User.sol/contract-address.json';
import Web3 from 'web3';
import { useNavigate  } from 'react-router-dom';
import { useEffect } from "react";


const Login = () => {
  const web3 = new Web3("ws://localhost:8545")
  const userContract = new web3.eth.Contract(UserArtifact, contractAddress.User);

  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [userAddress, setUserAddress] = useState('');
  const [firstLogin, setFirstLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    getUserAddress();
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

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
  
      // console.log('User accounts:', userAccounts);
      // console.log('User address:', userAddress);
      // console.log('Is bound:', isBound);

      if (isBound) {
        userContract.methods.getAccountInfoByAddress(userAddress).call((error, result) => {
          if (error) {
            console.error('Error:', error);
          } else if (!result[3]) {
            showErrorMessage('Account has been removed.');
            setFirstLogin(isBound);
          } else {
            localStorage.setItem('ID', result[0]);
            localStorage.setItem('role', result[1]);
          }
        });
      } else {
        setFirstLogin(!isBound);
      }
      setUserAddress(userAddress);
      localStorage.setItem('user', userAddress);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
  
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  const handleAccountsChanged = (accounts) => {
    getUserAddress();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // console.log('Username:', username);
    // console.log('Password:', password);
    // console.log('Role:', role);
    
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
        const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
        showErrorMessage(reason);
        console.log('Error reason:', reason);
      });
  };

  if (firstLogin == true) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '200px' }}>
        <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px' }}>
          {errorMessage && <div className="error" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>Error: {errorMessage}</div>}
          <h2>User Login</h2>
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
  } else if (firstLogin == false){
    localStorage.setItem("authenticated", true);
    navigate('/home');
  } else {
    return (
      <h1 style={{ display: 'flex', justifyContent: 'center' }}>
        Loading...
      </h1>
    );
  }
};

export default Login;
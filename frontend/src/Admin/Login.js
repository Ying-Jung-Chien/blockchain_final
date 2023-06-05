import React, { useState } from 'react';
import AccountArtifact from '../abi/contracts/Account.sol/Account.json';
import contractAddress from '../abi/contracts/Account.sol/contract-address.json';
import Web3 from 'web3';
import { useNavigate  } from 'react-router-dom';
import { useEffect } from "react";


const Login = () => {

  const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545")
  const accountContract = new web3.eth.Contract(AccountArtifact, contractAddress.Account);

  const navigate = useNavigate();
  const [admin, setAdmin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstLogin, setfirstLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    getAdminAddress();
  }, []);

  const ethEnabled = () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  }
  
  const getAdminAddress = async () => {
    try {
      ethEnabled();
      const user = (await web3.eth.getAccounts())[0];
      const result = await accountContract.methods.isAdminInList(user).call();

      setAdmin(user);
      localStorage.setItem("admin", user);
      setfirstLogin(!result);
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

  const handleLogin = async (e) => {
    e.preventDefault();

    accountContract.methods.addFirstAdmin(username, password).send({ from: admin })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        localStorage.setItem("authenticated", true);
        navigate('/admin/home');
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
    navigate('/admin/home');
  }
};

export default Login;
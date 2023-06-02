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

  useEffect(() => {
    getAdminAddress();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('Username:', username);
    console.log('Password:', password);

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
        console.error('Error:', error);
      });
  };

  if (firstLogin == true) {
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
  } else {
    localStorage.setItem("authenticated", true);
    navigate('/admin/home');
  }
};

export default Login;
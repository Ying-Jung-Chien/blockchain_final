import React, { useState } from 'react';
// import ReactDOM from 'react-dom/client';
import '../index.css';
import { useEffect } from "react";
import { useNavigate  } from 'react-router-dom';
import Web3 from 'web3';
import AccountArtifact from '../abi/contracts/Account.sol/Account.json';
import contractAddress from '../abi/contracts/Account.sol/contract-address.json';


// const root = ReactDOM.createRoot(document.getElementById('root'));

const Home = () => {
  const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545")
  const accountContract = new web3.eth.Contract(AccountArtifact, contractAddress.Account);

  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(async () => {
    checkAccount();

    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === 'false') navigate('/admin');
  }, []);

  const checkAccount = async () => {
    const user = (await web3.eth.getAccounts())[0];
    const admin = localStorage.getItem("admin");
    
    if (user != admin) return false;
    return true;
  };

  const handleLogout = () => {
    console.log('Logout');
    localStorage.setItem("authenticated", false);
    navigate('/admin');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    console.log('add user');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Role:', role);
    
    const result = await checkAccount();
    if (!result) {
      setErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      accountContract.methods.addNewAccount(username, password, role).send({ from: user })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        setErrorMessage('');
      })
      .on('confirmation', function(confirmationNumber, receipt) {
        console.log('Confirmation number:', confirmationNumber);
        console.log('Receipt:', receipt);
      })
      .on('error', function(error) {
        const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
        setErrorMessage(reason);
        console.log('Error reason:', reason);
      });
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    console.log('Address:', address);

    const result = await checkAccount();
    if (!result) {
      setErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      accountContract.methods.addAdmin(address).send({ from: user })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        setErrorMessage('');
      })
      .on('confirmation', function(confirmationNumber, receipt) {
        console.log('Confirmation number:', confirmationNumber);
        console.log('Receipt:', receipt);
      })
      .on('error', function(error) {
        const reason = (error.message.match(/reverted with reason string '(.*?)'/) || error.message.split(': '))[1];
        setErrorMessage(reason);
        console.log('Error reason:', reason);
      });
    }
  };

  return (
    <div>
      <h1>Admin Home</h1>

      <div>
        <h2>Add New User</h2>
        <form onSubmit={handleAddUser}>
          {errorMessage && <div className="error">Error: {errorMessage}</div>}
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
          <label>
            Role:
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="teacher">teacher</option>
              <option value="student">student</option>
            </select>
          </label>
          <br />
          <button type="submit">Add User</button>
        </form>
      </div>

      <div>
        <h2>Add New Admin</h2>
        <form onSubmit={handleAddAdmin}>
          {errorMessage && <div className="error">Error: {errorMessage}</div>}
          <label>
            Address:
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <br />
          <button type="submit">Add Admin</button>
        </form>
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;
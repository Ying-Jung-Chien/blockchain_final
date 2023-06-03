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
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkoutLogin();
  });

  const checkoutLogin = async () => {
    checkAccount();
    const loggedInUser = localStorage.getItem("authenticated");
    if (loggedInUser === 'false') navigate('/admin');
  };

  const checkAccount = async () => {
    const user = (await web3.eth.getAccounts())[0];
    const admin = localStorage.getItem("admin");
    
    if (user !== admin) return false;
    return true;
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
  
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
  
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  const handleLogout = () => {
    console.log('Logout');
    localStorage.setItem("authenticated", false);
    navigate('/');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    console.log('add user');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Role:', role);
    
    const result = await checkAccount();
    if (!result) {
      showErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      accountContract.methods.addNewAccount(username, password, role).send({ from: user })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        showSuccessMessage('Add user successfully');
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
    }
  };

  const handleRemoveUser = async (e) => {
    e.preventDefault();

    console.log('remove user');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Role:', role);
    
    const result = await checkAccount();
    if (!result) {
      showErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      accountContract.methods.removeUsedAccount(username, password, role).send({ from: user })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        showSuccessMessage('Remove user successfully');
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
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    console.log('Address:', address);

    const result = await checkAccount();
    if (!result) {
      showErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      accountContract.methods.addAdmin(address).send({ from: user })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        showSuccessMessage('Add admin successfully');
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
    }
  };

  const handleRemoveAdmin = async (e) => {
    e.preventDefault();

    console.log('Address:', address);

    const result = await checkAccount();
    if (!result) {
      showErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      accountContract.methods.removeAdmin(address).send({ from: user })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        showSuccessMessage('Remove admin successfully');
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
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px',
            margin: '10px'
          }}
          onClick={handleLogout}>
            Logout
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {successMessage && <div className="success">{successMessage}</div>}
        {errorMessage && <div className="error">Error: {errorMessage}</div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px' }}>
          <h2>Add New User</h2>
          <form>
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
            <button type="submit" onClick={handleAddUser}>Add User</button>
            <button type="submit" onClick={handleRemoveUser}>Remove User</button>
          </form>
        </div>

        <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px' }}>
          <h2>Add New Admin</h2>
          <form>
            <label>
              Address:
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <br />
            <button type="submit" onClick={handleAddAdmin}>Add Admin</button>
            <button type="submit" onClick={handleRemoveAdmin}>Remove Admin</button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Home;
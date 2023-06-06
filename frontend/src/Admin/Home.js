import React, { useState } from 'react';
import '../index.css';
import { useEffect } from "react";
import { useNavigate  } from 'react-router-dom';
import Web3 from 'web3';
import AccountArtifact from '../abi/contracts/Account.sol/Account.json';
import accountContractAddress from '../abi/contracts/Account.sol/contract-address.json';
import UserArtifact from '../abi/contracts/User.sol/User.json';
import userContractAddress from '../abi/contracts/User.sol/contract-address.json';
import NavBar from '../NavBar';


const Home = () => {
  const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  const accountContract = new web3.eth.Contract(AccountArtifact, accountContractAddress.Account);
  const userContract = new web3.eth.Contract(UserArtifact, userContractAddress.User);

  const navigate = useNavigate();

  const [adminAddress, setAdminAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [address, setAddress] = useState('');
  const [removeAddress, setRemoveAddress] = useState('');
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
    setAdminAddress(admin);
    
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
    localStorage.clear();
    navigate('/');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    console.log('handleAddUser');
    // console.log('Username:', username);
    // console.log('Password:', password);
    // console.log('Role:', role);
    
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

  const handleRemoveUnusedUser = async (e) => {
    e.preventDefault();
    console.log('handleRemoveUnusedUser');

    const result = await checkAccount();
    if (!result) {
      showErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      console.log('user:', user);
      accountContract.methods.removeUsedAccount(username, password, role).send({ from: user })
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

  const handleRemoveUser = async (e) => {
    e.preventDefault();

    console.log('handleRemoveUser');
    // console.log('Username:', username);
    // console.log('Password:', password);
    // console.log('Role:', role);
    
    const result = await checkAccount();
    if (!result) {
      showErrorMessage('Please use the same address as login');
      return;
    } else {
      const user = (await web3.eth.getAccounts())[0];
      userContract.methods.removeAccount(removeAddress).send({ from: user })
      .on('transactionHash', function(hash) {
        console.log('Transaction hash:', hash);
        showSuccessMessage('Remove account successfully');
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
      <NavBar handleLogout={handleLogout} id={adminAddress} role={'Admin'} />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {successMessage && <div className="success" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>{successMessage}</div>}
        {errorMessage && <div className="error" style={{color: 'red', fontWeight: 'bold', fontSize: '16px'}}>Error: {errorMessage}</div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ alignSelf: 'center' }}>Add New User</h2>
          <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                <select style={{ width: '180px' }} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="teacher">teacher</option>
                  <option value="student">student</option>
                </select>
              </div>
            </label>
            <br />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  backgroundColor: 'blue',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px',
                  marginRight: '10px',
                }}
                type="submit" onClick={handleAddUser}>Add User</button>
              <button
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px',
                  marginLeft: '10px',
                }}
                type="submit" onClick={handleRemoveUnusedUser}>Remove Unused User</button>
            </div>
          </form>
        </div>

        <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px' }}>
          <h2>Add New Admin</h2>
          <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ textAlign: 'left' }}>
              Address:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </label>
            <br />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  backgroundColor: 'blue',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px',
                  marginRight: '10px',
                }}
                type="submit" onClick={handleAddAdmin}>Add Admin</button>
              <button
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px',
                  marginLeft: '10px',
                }}
                type="submit" onClick={handleRemoveAdmin}>Remove Admin</button>
            </div>
          </form>
        </div>

        <div style={{ marginRight: '20px', border: '1px solid black', padding: '20px', margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ alignSelf: 'center' }}>Remove Account</h2>
          <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ textAlign: 'left' }}>
              Account Address:
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input type="text" value={removeAddress} onChange={(e) => setRemoveAddress(e.target.value)} />
              </div>
            </label>
            <br />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px',
                  marginLeft: '10px',
                }}
                type="submit" onClick={handleRemoveUser}>Remove User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require('fs');
require('dotenv').config();


async function main() {
  const inspector = process.env.INSPECTOR_ADDRESS;
  console.log('inspector:', inspector);

  const username = "admin";
  const password = "root12345";

  const Account = await hre.ethers.getContractFactory("Account");
  const account = await Account.deploy(username, password);
  await account.deployed();
  console.log('account address:', account.address);

  var data = {
    Account: account.address,
  };

  fs.writeFileSync('./frontend/src/abi/contracts/Account.sol/contract-address.json', JSON.stringify(data, null, 2));

  const User = await hre.ethers.getContractFactory("User");
  const user = await User.deploy(account.address);
  await user.deployed();
  console.log('user address:', user.address);

  data = {
    User: user.address,
  };

  fs.writeFileSync('./frontend/src/abi/contracts/User.sol/contract-address.json', JSON.stringify(data, null, 2));

  await account.setUserContract(user.address);

  const Score = await hre.ethers.getContractFactory("Score");
  const score = await Score.deploy(account.address, user.address);
  await score.deployed();
  console.log('score address:', score.address);

  data = {
    Score: score.address,
  };

  fs.writeFileSync('./frontend/src/abi/contracts/Score.sol/contract-address.json', JSON.stringify(data, null, 2));

  const Transcript = await hre.ethers.getContractFactory("Transcript");
  const transcript = await Transcript.deploy(account.address, user.address, score.address, inspector);
  await transcript.deployed();
  console.log('transcript address:', transcript.address);

  await score.setTranscriptContract(transcript.address);

  data = {
    Transcript: transcript.address,
  };

  fs.writeFileSync('./frontend/src/abi/contracts/Transcript.sol/contract-address.json', JSON.stringify(data, null, 2));

  // const isbound = process.env.PREPARE_BINDING;
  // console.log('isbound:', isbound);
  // if (isbound === 'true') {
  //   const admin = process.env.ADMIN_ADDRESS;
  //   const teacher = process.env.TEACHER_ADDRESS;
  //   const student = process.env.STUDENT_ADDRESS;
    
  //   await account.connect(admin).addFirstAdmin(username, password);
  //   await account.connect(admin).addNewAccount('user1', 'password1', 'teacher');
  //   await account.connect(admin).addNewAccount('user2', 'password2', 'student');

  //   await user.connect(teacher).blindAccount('user1', 'password1', 'teacher');
  //   await user.connect(teacher).updateAccountInfo('11406123', 'test');
  //   await user.connect(student).blindAccount('user2', 'password1', 'student');
  //   await user.connect(student).updateAccountInfo('108101234', 'test');
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
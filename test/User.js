const { expect } = require("chai");
const { ethers } = require("hardhat");
const IPFS = require('ipfs-http-client');
require('dotenv').config();

describe("User", function() {
  let ipfs;
  let cid;
  let accounts;
  let owner;
  let Account;
  let account;
  let User;
  let user;
  let username;
  let password;
  
  beforeEach(async () => {
    const projectId = process.env.REACT_APP_PROJECT_ID;
    const projectSecretKey = process.env.REACT_APP_PROJECT_SECRET;
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');

    ipfs = IPFS.create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
      authorization: auth,
      }
    });

    const data = 'test';
    cid = await ipfs.add(JSON.stringify(data));

    accounts = await ethers.getSigners();
    owner = accounts[0];

    username = "admin";
    password = "root12345";
    
    Account = await hre.ethers.getContractFactory("Account");
    account = await Account.deploy(username, password);

    User = await hre.ethers.getContractFactory("User");
    user = await User.deploy(account.address);
  });

  it("should store score", async function() {
    await account.connect(owner).setOwner(username, password);
    await account.connect(owner).updateAccountsIPFS(cid.path);
    console.log(cid.path);

    user.on("LogResult", (result) => {
      // 處理事件
      console.log("Received LogResult:", result);
    });
    const eventPromise = new Promise((resolve, reject) => {
      user.on('LogResult', (result) => {
        console.log("Received LogResult:", result);
      });

      // 如果事件在指定时间内未触发，拒绝 Promise
      setTimeout(() => {
        reject(new Error('Timeout waiting for event'));
      }, 5000);
    });

    await user.addAccountInfo(username, password);
    const emittedValue = await eventPromise;
  });
});
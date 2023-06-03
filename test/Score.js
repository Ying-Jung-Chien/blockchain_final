const { expect } = require("chai");
const { ethers } = require("hardhat");
const IPFS = require('ipfs-http-client');
require('dotenv').config();

describe("Score", function() {
  let inspector;
  let accounts;
  let owner;
  let username = "admin";;
  let password = "root12345";;
  let account;
  let user;
  let score;
  let transcript;
  let privateKey = ethers.utils.randomBytes(32).toString('hex');
  
  beforeEach(async () => {
    // const inspectorAddress = process.env.INSPECTOR_ADDRESS;
    // const inspectorPrivate = process.env.INSPECTOR_PRIVATE;
    // const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    // inspector = new ethers.Wallet(inspectorPrivate, provider);

    accounts = await ethers.getSigners();
    owner = accounts[0];
    inspector = accounts[1];

    const Account = await hre.ethers.getContractFactory("Account");
    account = await Account.deploy(username, password);

    const User = await hre.ethers.getContractFactory("User");
    user = await User.deploy(account.address);
    await account.setUserContract(user.address);

    const Score = await hre.ethers.getContractFactory("Score");
    score = await Score.deploy(account.address, user.address);

    const Transcript = await hre.ethers.getContractFactory("Transcript");
    transcript = await Transcript.deploy(account.address, user.address, score.address, inspector.address);
    await score.setTranscriptContract(transcript.address);
  });

  it("should store score successfully", async function() {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    await user.connect(accounts[2]).blindAccount('user1', 'password1', 'student');
    await user.connect(accounts[2]).updateAccountInfo('108101234', 'ipfs');
    
    await account.connect(owner).addNewAccount('user2', 'password2', 'teacher');
    await user.connect(accounts[3]).blindAccount('user2', 'password2', 'teacher');
    await user.connect(accounts[3]).updateAccountInfo('abc1234', 'ipfs');
    await score.connect(accounts[3]).Store("abc1234", "math", "ipfs", "11102", "80", privateKey, accounts[1].address);

    const result = await score.connect(accounts[3]).getScoreDetails("abc1234");
    expect(result[0]['subject']).to.equal("math");
  });

  it("should apply transcript successfully", async function() {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    await user.connect(accounts[2]).blindAccount('user1', 'password1', 'student');
    await user.connect(accounts[2]).updateAccountInfo('108101234', 'ipfs');
    
    await account.connect(owner).addNewAccount('user2', 'password2', 'teacher');
    await user.connect(accounts[3]).blindAccount('user2', 'password2', 'teacher');
    await user.connect(accounts[3]).updateAccountInfo('abc1234', 'ipfs');

    await transcript.connect(inspector).addGradeReport("108101234", "11102", "ipfs", privateKey, accounts[2].address);
    const result = await transcript.connect(accounts[2]).getGradeReportPrivate("108101234", "11102");
    expect(result[1]).to.equal("ipfs");
  });
});
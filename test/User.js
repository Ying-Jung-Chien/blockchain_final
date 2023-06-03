const { expect } = require("chai");
const { ethers } = require("hardhat");
const IPFS = require('ipfs-http-client');
const { expectRevert } = require('@openzeppelin/test-helpers');
require('dotenv').config();

describe("User", function() {
  // let ipfs;
  // let cid;
  let users;
  let owner;
  let Account;
  let account;
  let User;
  let user;
  let username;
  let password;
  
  beforeEach(async () => {
    users = await ethers.getSigners();
    owner = users[0];

    username = "admin";
    password = "root12345";
    
    Account = await hre.ethers.getContractFactory("Account");
    account = await Account.deploy(username, password);

    User = await hre.ethers.getContractFactory("User");
    user = await User.deploy(account.address);

    await account.setUserContract(user.address);
  });

  it("should blind the address by logging in with the correct username and password successfully", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    await user.connect(users[1]).blindAccount('user1', 'password1', 'student');
    const result = await user.isBound(users[1].address);
    expect(result).to.equal(true);
  });

  it("should blind the address failed because of duplicate", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    await user.connect(users[1]).blindAccount('user1', 'password1', 'student');
    const result = await user.isBound(users[1].address);
    expect(result).to.equal(true);

    await expectRevert(
      user.connect(users[1]).blindAccount('user1', 'password1', 'student'),
      'The account has been bound to the wallet'
    );
  });

  it("should blind the address failed due to invalid credentials", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');

    await expectRevert(
      user.connect(users[1]).blindAccount('user1', 'password2', 'student'),
      'Invalid credentials'
    );
  });

  it("should update account info successfully", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    await user.connect(users[1]).blindAccount('user1', 'password1', 'student');
    await user.connect(users[1]).updateAccountInfo('12345', 'test');
    
    var result = await user.getAccountInfoByAddress(users[1].address);
    expect(result[0]).to.equal('12345');

    result = await user.getAccountInfoById('12345');
    expect(result[1]).to.equal('student');
  });

  it("should update account info failed because account doesn't exist", async function () {
    await expectRevert(
      user.connect(users[1]).updateAccountInfo('12345', 'test'),
      'The account has not been bound to the wallet'
    );
  });
});
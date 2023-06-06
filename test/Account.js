const { expect } = require("chai");
const { ethers } = require("hardhat");
const IPFS = require('ipfs-http-client');
const { expectRevert } = require('@openzeppelin/test-helpers');
// const SHA256 = require("crypto-js/sha256");
require('dotenv').config();

describe("Account", function () {
  let Account;
  let account;
  let owner;
  let users;
  let username;
  let password;
  let User;
  let user;

  beforeEach(async () => {
    users = await ethers.getSigners();
    owner = users[0];

    username = "admin";
    password = "root12345";

    // const hashUsername = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(username));
    // const hashPassword = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(password));

    // bytes32Name = ethers.utils.hexZeroPad(hashUsername, 32);
    // bytes32Password = ethers.utils.hexZeroPad(hashPassword, 32);

    Account = await hre.ethers.getContractFactory("Account");
    account = await Account.deploy(username, password);

    User = await hre.ethers.getContractFactory("User");
    user = await User.deploy(account.address);

    await account.setUserContract(user.address);
  });

  it("should set first admin", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    const result = await account.isAdminInList(owner.address);
    expect(result).to.equal(true);
  });

  it("should add another admin successfully", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addAdmin(users[1].address);
    const result = await account.isAdminInList(users[1].address);
    expect(result).to.equal(true);
  });

  it("should add another admin failed because not an admin", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await expectRevert(
      account.connect(users[2]).addAdmin(users[1].address),
      'Only admin can add new admin'
    );
    const result = await account.isAdminInList(users[1].address);
    expect(result).to.equal(false);
  });

  it("should add another admin failed because already exists", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addAdmin(users[1].address);
    
    await expectRevert(
      account.connect(owner).addAdmin(users[1].address),
      'Admin already exists'
    );
  });

  it("should remove admin successfully", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addAdmin(users[1].address);
    var result = await account.isAdminInList(users[1].address);
    expect(result).to.equal(true);

    await account.connect(owner).removeAdmin(users[1].address);
    result = await account.isAdminInList(users[1].address);
    expect(result).to.equal(false);
  });

  it("should remove admin failed because an admin must exist", async function () {
    await account.connect(owner).addFirstAdmin(username, password);

    await expectRevert(
      account.connect(owner).removeAdmin(owner.address),
      'At least one admin must exist'
    );
  });

  it("should remove admin failed because not an admin", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addAdmin(users[1].address);

    await expectRevert(
      account.connect(users[2]).removeAdmin(users[1].address),
      'Only admin can remove admin'
    );
  });

  it("should add new account successfully", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    const result = await account.isAccountCorrect('user1', 'password1', 'student');
    expect(result).to.equal(true);
  });

  it("should add new account failed because not an admin", async function () {
    await account.connect(owner).addFirstAdmin(username, password);

    await expectRevert(
      account.connect(users[1]).addNewAccount('user1', 'password1', 'student'),
      'Only admin can add new account'
    );
  });

  it("should remove used account successfully by admin", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    var result = await account.isAccountCorrect('user1', 'password1', 'student');
    expect(result).to.equal(true);

    await account.connect(owner).removeUsedAccount('user1', 'password1', 'student');
    result = await account.isAccountCorrect('user1', 'password1', 'student');
    expect(result).to.equal(false);
  });

  it("should remove used account successfully by user contract", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    var result = await account.isAccountCorrect('user1', 'password1', 'student');
    expect(result).to.equal(true);

    await user.connect(users[1]).blindAccount('user1', 'password1', 'student');
    result = await account.isAccountCorrect('user1', 'password1', 'student');
    expect(result).to.equal(false);
  });

  it("should remove used account failed because not an admin or User contract", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).addNewAccount('user1', 'password1', 'student');
    var result = await account.isAccountCorrect('user1', 'password1', 'student');
    expect(result).to.equal(true);

    await expectRevert(
      account.connect(users[1]).removeUsedAccount('user1', 'password1', 'student'),
      'Only admin or User contract can remove account'
    );
  });



  // it("should update accounts ipfs", async function () {
  //   await account.connect(owner).addFirstAdmin(username, password);
  //   await account.connect(owner).updateAccountsIPFS('test');
  //   let ipfs = await account.getAccountsIPFS();
  //   expect(ipfs).to.equal('test');
  // });

  // it('should revert if owner is set', async () => {
  //   await account.connect(owner).addFirstAdmin(username, password);
  //   await expectRevert(
  //     account.connect(owner).addFirstAdmin(username, password),
  //     'Owner already set'
  //   );
  // });

  // it('should revert if the caller is not the owner when updating accounts ipfs', async () => {
  //   await account.connect(owner).setOwner(username, password);
  //   await expectRevert(
  //     account.connect(users[1]).updateAccountsIPFS('test'),
  //     'Only owner can update Accounts IPFS'
  //   );
  // });
});
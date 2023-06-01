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
  });

  it("should set owner", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    const ownerAddress = await account.getOwner();
    expect(ownerAddress).to.equal(owner.address);
  });

  it("should update accounts ipfs", async function () {
    await account.connect(owner).addFirstAdmin(username, password);
    await account.connect(owner).updateAccountsIPFS('test');
    let ipfs = await account.getAccountsIPFS();
    expect(ipfs).to.equal('test');
  });

  it('should revert if owner is set', async () => {
    await account.connect(owner).addFirstAdmin(username, password);
    await expectRevert(
      account.connect(owner).addFirstAdmin(username, password),
      'Owner already set'
    );
  });

  it('should revert if the caller is not the owner when updating accounts ipfs', async () => {
    await account.connect(owner).setOwner(username, password);
    await expectRevert(
      account.connect(users[1]).updateAccountsIPFS('test'),
      'Only owner can update Accounts IPFS'
    );
  });
});
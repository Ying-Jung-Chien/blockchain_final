const { expect } = require("chai");
const IPFS = require('ipfs-http-client');
require('dotenv').config();

describe("Account", function () {
  let Account;
  let account;
  let path;

  beforeEach(async () => {
    const accounts = [
        { username: "user1", password: "password1" },
        { username: "user2", password: "password2" },
        { username: "user3", password: "password3" },
    ];

    const projectId = process.env.REACT_APP_PROJECT_ID;
    const projectSecretKey = process.env.REACT_APP_PROJECT_SECRET;
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecretKey).toString('base64');
    
    const ipfs = IPFS.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
        authorization: auth,
        }
    });
    const cid = await ipfs.add(JSON.stringify(accounts));
    path = cid.path;

    Account = await hre.ethers.getContractFactory("Account");
    account = await Account.deploy(cid.path);
  });

  it("should create a new token", async function () {
    const cid = (await account.ipfsCID()).toString();
    expect(cid).to.equal(path);
  });

});
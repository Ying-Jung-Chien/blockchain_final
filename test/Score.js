const { expect } = require("chai");
const { ethers } = require("hardhat");
const IPFS = require('ipfs-http-client');
require('dotenv').config();

describe("Score", function() {
    let ipfs;
    let cid;
    let accounts;
    let owner;
    let score;
  
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

      const data = { subject: "math", studentID: "108097654", score: 80 };
      cid = await ipfs.add(JSON.stringify(data));

      accounts = await ethers.getSigners();
      owner = accounts[0];
      const Score = await ethers.getContractFactory("Score");
      score = await Score.deploy();
      await score.deployed();
    });
  
    it("should store score", async function() {
      console.log(cid.path);
      await score.connect(owner).signAndStore("108097654", "math", cid.path);
      const result = await score.getScoreDetails("108097654", "math");
      console.log(result);
    //   expect(optionLength.toNumber()).to.equal(2);
    });
});
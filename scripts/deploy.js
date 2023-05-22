// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const IPFS = require('ipfs-http-client');
require('dotenv').config();

// async function main() {
//   const currentTimestampInSeconds = Math.round(Date.now() / 1000);
//   const unlockTime = currentTimestampInSeconds + 60;

//   const lockedAmount = hre.ethers.utils.parseEther("0.001");

//   const Lock = await hre.ethers.getContractFactory("Lock");
//   const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

//   await lock.deployed();

//   console.log(
//     `Lock with ${ethers.utils.formatEther(
//       lockedAmount
//     )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
//   );
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

async function main() {
  const accounts = [
    { username: "user1", password: "password1", role: "admin", id: "012345" },
    { username: "user2", password: "password2", role: "teacher", id: "123456" },
    { username: "user3", password: "password3", role: "student", id: "234567" },
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
  // console.log(typeof(cid.path));

  const Account = await hre.ethers.getContractFactory("Account");
  const account = await Account.deploy(cid.path);
  await account.deployed();
  console.log(account.address);

  const Score = await hre.ethers.getContractFactory("Score");
  const score = await Score.deploy();
  await score.deployed();
  console.log(score.address);

  const Transcript = await hre.ethers.getContractFactory("Transcript");
  const transcript = await Transcript.deploy();
  await transcript.deployed();
  console.log(transcript.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
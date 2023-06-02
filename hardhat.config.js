require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers")
// require("hardhat-deploy-ethers");
require("@nomicfoundation/hardhat-chai-matchers")
require('hardhat-abi-exporter');
// import "@chainlink/hardhat-chainlink";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  abiExporter: {
    path: './frontend/src/abi'
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
  }
};


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
    // rinkeby: {
    //   url: "https://mainnet.infura.io/v3/23cf0d54648e4b0b905434ac5533f816", //Infura url with projectId
    //   accounts: [""] // add the account that will deploy the contract (private key)
    //  },
  }
};


require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const { API_URL_HEDERA, PRIVATE_KEY, API_URL_BSC_TESTNET } = process.env;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0"
      },
      {
        version: "0.8.20"
      },
      {
        version: "0.8.25"
      }
    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    hedera: {
      url: API_URL_HEDERA,
      accounts: [`0x${PRIVATE_KEY}`],
      gas: 6000000,
    },
    bsctestnet: {
      url: API_URL_BSC_TESTNET,
      chainId: 97, // BSC Testnet chain ID
      accounts: [`0x${PRIVATE_KEY}`],
      gas: 6000000,
    }
  }
};

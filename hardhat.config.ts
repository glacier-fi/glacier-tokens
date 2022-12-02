import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


dotenv.config();


const MNEMONIC = process.env.MNEMONIC || ""

const SKIP_TASKS = process.env.SKIP_TASKS === "true"

const ONFINALITY_KEY = process.env.ONFINALITY_KEY || '';

const DEFAULT_MOOMBASE_BLOCK_GAS_LIMIT=15000000
const DEFAULT_MOOMBASE_GAS_LIMIT=12995000
const DEFAULT_MOOMBASE_CHAIN_ID=1287

const GWEI = 1000 * 1000 * 1000;

if (!SKIP_TASKS) {
  require("./tasks/deploy.ts")
}

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: true,
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
    },
    localhost: {
      url: 'http://127.0.0.1:8545/'
    },
    moonbaseAlpha: {
      url: ONFINALITY_KEY
      ? `https://moonbeam-alpha.api.onfinality.io/rpc?apikey=${ONFINALITY_KEY}`
      : `https://moonbeam-alpha.api.onfinality.io/public`,
      blockGasLimit: DEFAULT_MOOMBASE_BLOCK_GAS_LIMIT,
      gas: DEFAULT_MOOMBASE_GAS_LIMIT,
      gasPrice: GWEI,
      gasMultiplier: 1,
      chainId: DEFAULT_MOOMBASE_CHAIN_ID,
      accounts: {
        mnemonic: MNEMONIC,
        initialIndex: 0,
        count: 20,
      },
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  etherscan: {
    apiKey: {
      moonbaseAlpha: process.env.ETHERSCAN_API_KEY
    }
  }
};

export default config;

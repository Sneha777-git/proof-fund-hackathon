import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";

export default defineConfig({
  plugins: [
    hardhatEthers,
    hardhatMocha,
  ],

  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  paths: {
    sources: "./contracts",
    tests: {
      mocha: "./test",
      solidity: "./test",
    },
    cache: "./cache",
    artifacts: "./artifacts",
  },

  test: {
    mocha: {
      timeout: 20_000,
    },
  },
});
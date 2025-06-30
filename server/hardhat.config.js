require("@nomicfoundation/hardhat-toolbox-viem");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337,
      // Don't add CORS headers from Hardhat since nginx handles them
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    }
  },
  defaultNetwork: "hardhat"
};

/**
 * Utility for generating mock blockchain, wallet, and transaction data for testing.
 *
 * @file TestUtils.ts
 */

export class MockDataGenerator {
  /**
   * Generates mock blockchain data.
   * @returns An object with blockNumber, gasPrice, networkName, and timestamp.
   */
  static generateBlockchainData() {
    return {
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      gasPrice: Math.floor(Math.random() * 100) + 20,
      networkName: "Ethereum Mainnet",
      timestamp: Date.now(),
    };
  }

  /**
   * Generates mock price data for Bitcoin and Ethereum.
   * @returns An object with bitcoin, ethereum, and timestamp.
   */
  static generatePriceData() {
    return {
      bitcoin: Math.floor(Math.random() * 20000) + 30000,
      ethereum: Math.floor(Math.random() * 1000) + 2000,
      timestamp: Date.now(),
    };
  }

  /**
   * Generates mock wallet data.
   * @returns An object with address, balance, chainId, and isConnected.
   */
  static generateWalletData() {
    return {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: (Math.random() * 10).toFixed(6),
      chainId: 1,
      isConnected: true,
    };
  }

  /**
   * Generates mock transaction data.
   * @returns An object with hash, from, to, value, gasPrice, gasUsed, and status.
   */
  static generateTransactionData() {
    return {
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: (Math.random() * 5).toFixed(6),
      gasPrice: Math.floor(Math.random() * 50) + 20,
      gasUsed: Math.floor(Math.random() * 21000) + 21000,
      status: "success",
    };
  }
}

// Dependency-free test utilities for development and manual testing only.
// All test-runner-dependent code has been removed to ensure error-free builds.

/**
 * Mock data generators
 */
export class MockDataGenerator {
  /** Generate mock blockchain data */
  static generateBlockchainData() {
    return {
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      gasPrice: Math.floor(Math.random() * 100) + 20,
      networkName: 'Ethereum Mainnet',
      timestamp: Date.now()
    };
  }

  /** Generate mock price data */
  static generatePriceData() {
    return {
      bitcoin: Math.floor(Math.random() * 20000) + 30000,
      ethereum: Math.floor(Math.random() * 1000) + 2000,
      timestamp: Date.now()
    };
  }

  /** Generate mock wallet data */
  static generateWalletData() {
    return {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      balance: (Math.random() * 10).toFixed(6),
      chainId: 1,
      isConnected: true
    };
  }

  /** Generate mock transaction data */
  static generateTransactionData() {
    return {
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: (Math.random() * 5).toFixed(6),
      gasPrice: Math.floor(Math.random() * 50) + 20,
      gasUsed: Math.floor(Math.random() * 21000) + 21000,
      status: 'success'
    };
  }
}

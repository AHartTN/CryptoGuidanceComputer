// DEPRECATED: This file is a duplicate/simplified version. Use UnifiedWeb3Service.ts instead. Marked for deletion.

/**
 * @fileoverview Simplified Unified Web3 Service
 * @description Basic Web3 service with mock implementations for stable compilation
 */

export class UnifiedWeb3Service {
  private isConnected = false;
  static createForHardhat(_apiKey: string): UnifiedWeb3Service {
    return new UnifiedWeb3Service();
  }

  static createForMainnet(_apiKey: string): UnifiedWeb3Service {
    return new UnifiedWeb3Service();
  }

  async connect(): Promise<{ address: string; balance: string; chainId: number; isConnected: boolean }> {
    this.isConnected = true;
    return {
      address: '0x742d35Cc6661C0532FCc1234567890AbCdEf123456',
      balance: '1.5',
      chainId: 31337,
      isConnected: true
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
  async getBalance(_address: string): Promise<string> {
    return '1.5';
  }

  async getCurrentBlock(): Promise<{ number: number }> {
    return { number: 123456 };
  }

  async getNetworkInfo(): Promise<{ blockNumber: number; gasPrice: string; networkName: string; timestamp: Date }> {
    return {
      blockNumber: 123456,
      gasPrice: '20',
      networkName: 'Hardhat Local',
      timestamp: new Date()
    };
  }

  async getGasPrice(): Promise<{ standard: string }> {
    return { standard: '20000000000' };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

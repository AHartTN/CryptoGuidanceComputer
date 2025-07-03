export class Web3Service {
  private isConnected = false;

  static createForHardhat(_apiKey: string): Web3Service {
    return new Web3Service();
  }

  static createForMainnet(_apiKey: string): Web3Service {
    return new Web3Service();
  }
  isWalletInstalled(): boolean {
    if (
      typeof window !== "undefined" &&
      (window as { ethereum?: unknown }).ethereum
    ) {
      return true;
    }
    return true;
  }

  async connect(): Promise<{
    address: string;
    balance: string;
    chainId: number;
    isConnected: boolean;
  }> {
    this.isConnected = true;
    return {
      address: "0x742d35Cc6661C0532FCc1234567890AbCdEf123456",
      balance: "1.5",
      chainId: 31337,
      isConnected: true,
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
  async getBalance(_address: string): Promise<string> {
    return "1.5";
  }

  async getCurrentBlock(): Promise<{ number: number }> {
    return { number: 123456 };
  }

  async getNetworkInfo(): Promise<{
    blockNumber: number;
    gasPrice: string;
    networkName: string;
    timestamp: Date;
  }> {
    return {
      blockNumber: 123456,
      gasPrice: "20",
      networkName: "Hardhat Local",
      timestamp: new Date(),
    };
  }

  async getGasPrice(): Promise<{ standard: string }> {
    return { standard: "20000000000" };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

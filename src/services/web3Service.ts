import Web3 from 'web3';

export class Web3Service {
  private web3: Web3 | null = null;
  private account: string | null = null;

  constructor() {
    this.initializeWeb3();
  }

  private async initializeWeb3() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        this.web3 = new Web3((window as any).ethereum);
        // Request account access if needed
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
      } catch (error) {
        console.error('Web3 initialization failed:', error);
        // Fallback to HTTP provider
        this.web3 = new Web3('https://cloudflare-eth.com');
      }
    } else {
      // Fallback to HTTP provider if no MetaMask
      this.web3 = new Web3('https://cloudflare-eth.com');
    }
  }

  async getETHBalance(): Promise<string> {
    if (!this.web3 || !this.account) {
      throw new Error('Web3 not initialized or no account connected');
    }

    try {
      const balance = await this.web3.eth.getBalance(this.account);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      throw error;
    }
  }

  async getNetworkInfo() {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      const networkId = await this.web3.eth.net.getId();
      const blockNumber = await this.web3.eth.getBlockNumber();
      
      return {
        networkId: Number(networkId),
        blockNumber: Number(blockNumber),
        isConnected: true
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        networkId: 0,
        blockNumber: 0,
        isConnected: false
      };
    }
  }

  async connectWallet(): Promise<string | null> {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (this.web3) {
          const accounts = await this.web3.eth.getAccounts();
          this.account = accounts[0];
          return this.account;
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
    return null;
  }

  getAccount(): string | null {
    return this.account;
  }

  isConnected(): boolean {
    return this.web3 !== null && this.account !== null;
  }
}

export default Web3Service;

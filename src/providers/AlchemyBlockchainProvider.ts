// Apollo DSKY - Alchemy Blockchain Provider Implementation
// Enterprise-grade Alchemy integration following SOLID principles

import { Alchemy, Network } from 'alchemy-sdk';
import { BaseBlockchainProvider } from '../abstracts/BaseBlockchainProvider';
import {
  IBlockchainProviderConfig,
  IBlockchainNetworkConfig,
  IBlockInfo,
  IGasPrice,
  BlockchainErrorType
} from '../interfaces/IBlockchainProvider';
import { ITransactionRequest, ITokenBalance } from '../interfaces/IWeb3Operations';

export class AlchemyBlockchainProvider extends BaseBlockchainProvider {
  private alchemy: Alchemy;  private readonly networkMap: { [key: number]: Network } = {
    1: Network.ETH_MAINNET,
    5: Network.ETH_GOERLI,
    11155111: Network.ETH_SEPOLIA,
    137: Network.MATIC_MAINNET,
    80001: Network.MATIC_MUMBAI,
    43114: Network.ARB_MAINNET,
    421614: Network.ARB_SEPOLIA,
    10: Network.OPT_MAINNET,
    11155420: Network.OPT_SEPOLIA
  };

  constructor(config: IBlockchainProviderConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw this.createError(BlockchainErrorType.ProviderNotAvailable, 'Alchemy API key required');
    }

    const network = this.networkMap[config.network.chainId];
    if (!network) {
      throw this.createError(
        BlockchainErrorType.NetworkError, 
        `Unsupported network: ${config.network.chainId}`
      );
    }

    this.alchemy = new Alchemy({
      apiKey: config.apiKey,
      network
    });
  }

  async connect(): Promise<void> {
    try {
      // Test connection by getting latest block
      await this.getCurrentBlock();
      this._isConnected = true;
    } catch (error) {
      this._isConnected = false;
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to connect to Alchemy: ${(error as Error).message}`
      );
    }
  }

  async disconnect(): Promise<void> {
    this._isConnected = false;
    // Alchemy doesn't require explicit disconnection
  }

  async getAccounts(): Promise<string[]> {
    // Alchemy is a provider, not a wallet, so it doesn't manage accounts
    return [];
  }

  async getBalance(address: string): Promise<string> {
    this.validateAddress(address);
    
    try {
      const balance = await this.alchemy.core.getBalance(address, 'latest');
      // Convert from wei to ether
      return (Number(balance) / Math.pow(10, 18)).toString();
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get balance: ${(error as Error).message}`
      );
    }
  }

  async getTokenBalance(address: string, tokenContract: string): Promise<ITokenBalance> {
    this.validateAddress(address);
    this.validateAddress(tokenContract);

    try {
      const balances = await this.alchemy.core.getTokenBalances(address, [tokenContract]);
      const tokenBalance = balances.tokenBalances[0];
      
      if (!tokenBalance) {
        throw this.createError(BlockchainErrorType.NetworkError, 'Token not found');
      }

      // Get token metadata
      const metadata = await this.alchemy.core.getTokenMetadata(tokenContract);
      
      return {
        contractAddress: tokenContract,
        symbol: metadata.symbol || 'UNKNOWN',
        name: metadata.name || 'Unknown Token',
        balance: tokenBalance.tokenBalance || '0',
        decimals: metadata.decimals || 18
      };
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get token balance: ${(error as Error).message}`
      );
    }
  }

  async getCurrentBlock(): Promise<IBlockInfo> {
    try {
      const block = await this.alchemy.core.getBlock('latest');
      
      return {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        transactions: block.transactions
      };
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get current block: ${(error as Error).message}`
      );
    }
  }

  async getBlock(blockNumber: number): Promise<IBlockInfo> {
    this.validateBlockNumber(blockNumber);
    
    try {
      const block = await this.alchemy.core.getBlock(blockNumber);
      
      return {
        number: block.number,
        hash: block.hash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        transactions: block.transactions
      };
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get block ${blockNumber}: ${(error as Error).message}`
      );
    }
  }

  async getGasPrice(): Promise<IGasPrice> {
    try {
      const gasPrice = await this.alchemy.core.getGasPrice();
      const basePriceGwei = Number(gasPrice) / Math.pow(10, 9);
      
      // Estimate different priority levels
      return {
        slow: (basePriceGwei * 0.8).toFixed(2),
        standard: basePriceGwei.toFixed(2),
        fast: (basePriceGwei * 1.2).toFixed(2),
        instant: (basePriceGwei * 1.5).toFixed(2)
      };
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get gas price: ${(error as Error).message}`
      );
    }
  }

  async sendTransaction(request: ITransactionRequest): Promise<string> {
    // Alchemy is a provider, not a wallet, so it can't send transactions directly
    throw this.createError(
      BlockchainErrorType.ProviderNotAvailable,
      'Alchemy cannot send transactions directly. Use a wallet provider.'
    );
  }

  async getTransaction(hash: string): Promise<any> {
    this.validateTransactionHash(hash);
    
    try {
      return await this.alchemy.core.getTransaction(hash);
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get transaction: ${(error as Error).message}`
      );
    }
  }

  async estimateGas(request: ITransactionRequest): Promise<string> {
    try {
      // Convert request to Alchemy format
      const estimateRequest = {
        to: request.to,
        value: request.value,
        data: request.data
      };
      
      const gasEstimate = await this.alchemy.core.estimateGas(estimateRequest);
      return gasEstimate.toString();
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to estimate gas: ${(error as Error).message}`
      );
    }
  }

  // Event handling for Alchemy (limited compared to wallet providers)
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    // Alchemy doesn't manage accounts, so this is a no-op
  }

  onChainChanged(callback: (chainId: string) => void): void {
    // Alchemy doesn't emit chain change events, so this is a no-op
  }

  onConnect(callback: (connectInfo: any) => void): void {
    // Alchemy doesn't emit connect events, so this is a no-op
  }

  onDisconnect(callback: (error: any) => void): void {
    // Alchemy doesn't emit disconnect events, so this is a no-op
  }

  // Additional Alchemy-specific methods
  async getTokensForOwner(address: string): Promise<ITokenBalance[]> {
    this.validateAddress(address);
    
    try {
      const balances = await this.alchemy.core.getTokenBalances(address);
      const tokenBalances: ITokenBalance[] = [];
      
      for (const tokenBalance of balances.tokenBalances) {
        if (tokenBalance.tokenBalance && tokenBalance.tokenBalance !== '0') {
          try {
            const metadata = await this.alchemy.core.getTokenMetadata(tokenBalance.contractAddress);
            
            tokenBalances.push({
              contractAddress: tokenBalance.contractAddress,
              symbol: metadata.symbol || 'UNKNOWN',
              name: metadata.name || 'Unknown Token',
              balance: tokenBalance.tokenBalance,
              decimals: metadata.decimals || 18
            });
          } catch (error) {
            // Skip tokens that fail metadata lookup
            console.warn(`Failed to get metadata for token ${tokenBalance.contractAddress}`);
          }
        }
      }
      
      return tokenBalances;
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get tokens for owner: ${(error as Error).message}`
      );
    }
  }

  async getNFTsForOwner(address: string): Promise<any[]> {
    this.validateAddress(address);
    
    try {
      const nfts = await this.alchemy.nft.getNftsForOwner(address);
      return nfts.ownedNfts;
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get NFTs for owner: ${(error as Error).message}`
      );
    }
  }

  // Static factory method
  static create(config: IBlockchainProviderConfig): AlchemyBlockchainProvider {
    return new AlchemyBlockchainProvider(config);
  }

  // Static helper to create default Hardhat config
  static createHardhatConfig(apiKey: string): IBlockchainProviderConfig {
    const hardhatNetwork: IBlockchainNetworkConfig = {
      chainId: 31337,
      name: 'Hardhat Local',
      rpcUrls: [
        'https://hardhat.hartonomous.com',
        'http://hardhat.hartonomous.com:8545',
        'http://localhost:8545'
      ],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    };

    return {
      apiKey,
      network: hardhatNetwork,
      retryAttempts: 3,
      timeoutMs: 10000,
      rateLimitMs: 1000
    };
  }

  // Static helper to create default mainnet config
  static createMainnetConfig(apiKey: string): IBlockchainProviderConfig {
    const mainnetNetwork: IBlockchainNetworkConfig = {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrls: ['https://eth-mainnet.alchemyapi.io/v2/' + apiKey],
      blockExplorerUrls: ['https://etherscan.io'],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    };

    return {
      apiKey,
      network: mainnetNetwork,
      retryAttempts: 3,
      timeoutMs: 10000,
      rateLimitMs: 1000
    };
  }
}
/**
 * @fileoverview Alchemy Blockchain Provider Implementation
 * @description Enterprise-grade Alchemy integration following SOLID principles
 */

import { Alchemy, Network } from 'alchemy-sdk';
import { BaseBlockchainProvider } from '../abstracts/BaseBlockchainProvider';
import type { IBlockchainProviderConfig } from '../interfaces/IBlockchainProviderConfig';
import type { IBlockchainNetworkConfig } from '../interfaces/IBlockchainNetworkConfig';
import type { IBlockInfo } from '../interfaces/IBlockInfo';
import type { ITokenBalance } from '../interfaces/ITokenBalance';
import { BlockchainErrorType } from '../enums/BlockchainErrorType';
import type { INFT } from '../interfaces/INFT';
import type { IGasPrice } from '../interfaces/IGasPrice';
import type { ITransactionRequest } from '../interfaces/ITransactionRequest';
import type { IWalletConnection } from '../interfaces/IWalletConnection';
import type { IBlockchainError } from '../interfaces/IBlockchainError';

// Utility function outside the class
function hasRawMetadata(nft: unknown): nft is { rawMetadata: Record<string, unknown> } {
  return typeof nft === 'object' && nft !== null && 'rawMetadata' in nft;
}

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
    try {      const block = await this.alchemy.core.getBlock('latest');
      
      return {
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner,
        difficulty: block.difficulty.toString(),
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
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner,
        difficulty: block.difficulty.toString(),
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
        instant: (basePriceGwei * 1.5).toFixed(2),
        timestamp: Date.now()
      };
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get gas price: ${(error as Error).message}`
      );
    }
  }

  async sendTransaction(_request: ITransactionRequest): Promise<string> {
    // Implementation or throw if not supported
    throw new Error('Not implemented');
  }

  async getTransaction(hash: string): Promise<Record<string, unknown>> {
    const tx = await this.alchemy.core.getTransaction(hash);
    if (!tx) throw new Error('Transaction not found');
    return { ...tx };
  }

  async getNFTsForOwner(address: string): Promise<INFT[]> {
    const nfts = await this.alchemy.nft.getNftsForOwner(address);
    return nfts.ownedNfts.map((nft: { contract: { address: string }, tokenId: string, rawMetadata?: Record<string, unknown> }) => ({
      contractAddress: nft.contract.address,
      tokenId: nft.tokenId,
      owner: address,
      metadata: hasRawMetadata(nft) ? nft.rawMetadata : {},
    }));
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

  // Implement estimateGas as a stub
  async estimateGas(): Promise<string> {
    // Implementation or throw if not supported
    throw new Error('Not implemented');
  }

  onConnect(_callback: (connectInfo: IWalletConnection) => void): void {
    // Not implemented
  }

  onDisconnect(_callback: (error: IBlockchainError | null) => void): void {
    // Not implemented
  }
}
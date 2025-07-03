import { ethers } from "ethers";
import { BaseBlockchainProvider } from "../abstracts/BaseBlockchainProvider";
import type { IBlockchainProviderConfig } from "../interfaces/IBlockchainProviderConfig";
import type { IBlockchainNetworkConfig } from "../interfaces/IBlockchainNetworkConfig";
import type { IBlockInfo } from "../interfaces/IBlockInfo";
import type { IGasPrice } from "../interfaces/IGasPrice";
import type { ITransactionRequest } from "../interfaces/ITransactionRequest";
import type { ITokenBalance } from "../interfaces/ITokenBalance";
import type { IWalletConnection } from "../interfaces/IWeb3Operations";
import type { IBlockchainError } from "../interfaces/IBlockchainError";
import { BlockchainErrorType } from "../enums/BlockchainErrorType";

export class EthersBlockchainProvider extends BaseBlockchainProvider {
  private provider: ethers.JsonRpcProvider;

  constructor(config: IBlockchainProviderConfig) {
    super(config);
    const rpcUrl = config.network.rpcUrls[0];
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  get networkName(): string {
    return this.config.network.name;
  }

  async connect(): Promise<void> {
    try {
      await this.getCurrentBlock();
      this._isConnected = true;
    } catch (error) {
      this._isConnected = false;
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to connect to Ethers provider: ${(error as Error).message}`,
      );
    }
  }

  async disconnect(): Promise<void> {
    this._isConnected = false;
  }

  async switchNetwork(networkConfig: IBlockchainNetworkConfig): Promise<void> {
    this.validateNetworkConfig(networkConfig);
    const rpcUrl = networkConfig.rpcUrls[0];
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async getAccounts(): Promise<string[]> {
    return [];
  }

  async getBalance(address: string): Promise<string> {
    this.validateAddress(address);
    try {
      const balance = await this.provider.getBalance(address);
      return (Number(balance) / Math.pow(10, 18)).toString();
    } catch (error) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        `Failed to get balance: ${(error as Error).message}`,
      );
    }
  }

  async getTokenBalance(_address: string, _tokenContract: string): Promise<ITokenBalance> {
    throw new Error("Not implemented");
  }

  async getTokenBalances(_address: string, _tokenContracts: string[]): Promise<ITokenBalance[]> {
    throw new Error("Not implemented");
  }

  async getNetworkInfo(): Promise<{ blockNumber: number; gasPrice: string; networkName: string; timestamp: Date }> {
    const currentBlock = await this.getCurrentBlock();
    const gasPrice = await this.getGasPrice();
    return {
      blockNumber: currentBlock.number,
      gasPrice: gasPrice.standard,
      networkName: this.networkName,
      timestamp: new Date(),
    };
  }

  async getCurrentBlock(): Promise<IBlockInfo> {
    const block = await this.provider.getBlock("latest");
    if (!block) throw new Error("Block not found");
    return {
      number: block.number,
      hash: block.hash ?? "",
      parentHash: block.parentHash ?? "",
      timestamp: block.timestamp,
      gasLimit: block.gasLimit?.toString?.() ?? "0",
      gasUsed: block.gasUsed?.toString?.() ?? "0",
      miner: block.miner ?? "",
      difficulty: block.difficulty?.toString?.() ?? "0",
      transactions: Array.isArray(block.transactions) ? [...block.transactions] : [],
    };
  }

  async getBlock(blockNumber: number): Promise<IBlockInfo> {
    this.validateBlockNumber(blockNumber);
    const block = await this.provider.getBlock(blockNumber);
    if (!block) throw new Error("Block not found");
    return {
      number: block.number,
      hash: block.hash ?? "",
      parentHash: block.parentHash ?? "",
      timestamp: block.timestamp,
      gasLimit: block.gasLimit?.toString?.() ?? "0",
      gasUsed: block.gasUsed?.toString?.() ?? "0",
      miner: block.miner ?? "",
      difficulty: block.difficulty?.toString?.() ?? "0",
      transactions: Array.isArray(block.transactions) ? [...block.transactions] : [],
    };
  }

  async getGasPrice(): Promise<IGasPrice> {
    // ethers v6: use fetchFeeData for gas price
    const feeData = await this.provider.getFeeData();
    const basePriceGwei = feeData.gasPrice ? Number(feeData.gasPrice) / Math.pow(10, 9) : 0;
    return {
      slow: (basePriceGwei * 0.8).toFixed(2),
      standard: basePriceGwei.toFixed(2),
      fast: (basePriceGwei * 1.2).toFixed(2),
      instant: (basePriceGwei * 1.5).toFixed(2),
      timestamp: Date.now(),
    };
  }

  async sendTransaction(_request: ITransactionRequest): Promise<string> {
    throw new Error("Not implemented");
  }

  async getTransaction(hash: string): Promise<Record<string, unknown>> {
    const tx = await this.provider.getTransaction(hash);
    if (!tx) throw new Error("Transaction not found");
    return { ...tx };
  }

  async waitForTransaction(hash: string): Promise<Record<string, unknown>> {
    const receipt = await this.provider.waitForTransaction(hash);
    return { ...receipt };
  }

  async estimateGas(_request: ITransactionRequest): Promise<string> {
    throw new Error("Not implemented");
  }

  onAccountsChanged(_callback: (accounts: string[]) => void): void {}
  onChainChanged(_callback: (chainId: string) => void): void {}
  onConnect(_callback: (connectInfo: IWalletConnection) => void): void {}
  onDisconnect(_callback: (error: IBlockchainError | null) => void): void {}
  async healthCheck(): Promise<boolean> {
    const now = Date.now();
    if (now - this._lastHealthCheck < this._healthCheckInterval) {
      return this._isConnected;
    }
    try {
      await this.getCurrentBlock();
      this._isConnected = true;
      this._lastHealthCheck = now;
      return this._isConnected;
    } catch (_error) {
      this._isConnected = false;
      this._lastHealthCheck = now;
      return false;
    }
  }
  async getProviderStatus(): Promise<{ connected: boolean; chainId: number; blockNumber: number; latency: number }> {
    const startTime = performance.now();
    try {
      const currentBlock = await this.getCurrentBlock();
      const latency = performance.now() - startTime;
      return {
        connected: true,
        chainId: this.config.network.chainId,
        blockNumber: currentBlock.number,
        latency,
      };
    } catch (_error) {
      return {
        connected: false,
        chainId: 0,
        blockNumber: 0,
        latency: performance.now() - startTime,
      };
    }
  }
}
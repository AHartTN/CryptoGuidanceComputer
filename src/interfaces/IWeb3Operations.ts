/**
 * @file IWeb3Operations.ts
 * @description Interfaces for Web3 wallet connection, blockchain data, transaction requests, and token balances.
 */

import type { IMetaMaskEthereumProvider } from "./IMetaMaskEthereumProvider";

export interface IWalletConnection {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
  provider?: IMetaMaskEthereumProvider | undefined;
}

export interface IBlockchainData {
  blockNumber: number;
  gasPrice: string;
  networkName: string;
  timestamp: Date;
}

export interface ITransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface ITokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
}

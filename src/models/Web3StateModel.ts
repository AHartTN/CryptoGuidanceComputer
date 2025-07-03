/**
 * @fileoverview Web3 State Models
 * @description Data models for Web3 state management
 */

import type { IWalletConnectionState } from '../interfaces/IWeb3';
import type { IMetaMaskEthereumProvider } from '../interfaces/IMetaMaskEthereumProvider';

/**
 * Default Web3 state configuration
 */
export const DEFAULT_WEB3_STATE: IWalletConnectionState = {
  isConnected: false,
  address: null,
  balance: null,
  chainId: null,
  provider: undefined
};

/**
 * Web3 State Model class with validation and utilities
 */
export class Web3StateModel {
  constructor(private state: IWalletConnectionState = { ...DEFAULT_WEB3_STATE }) {}

  /**
   * Get current state
   */
  getState(): IWalletConnectionState {
    return { ...this.state };
  }

  /**
   * Update connection state
   */
  setConnected(address: string, chainId: number, provider: IMetaMaskEthereumProvider | undefined): void {
    this.state = {
      ...this.state,
      isConnected: true,
      address,
      chainId,
      provider
    };
  }

  /**
   * Set balance
   */
  setBalance(balance: string): void {
    this.state = { ...this.state, balance };
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    this.state = { ...DEFAULT_WEB3_STATE };
  }

  /**
   * Update network
   */
  updateNetwork(chainId: number): void {
    this.state = { ...this.state, chainId };
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): boolean {
    return this.state.isConnected && !!this.state.address;
  }

  /**
   * Get formatted address
   */
  getFormattedAddress(): string {
    if (!this.state.address) return 'Not Connected';
    return `${this.state.address.slice(0, 6)}...${this.state.address.slice(-4)}`;
  }

  /**
   * Get formatted balance
   */
  getFormattedBalance(): string {
    if (!this.state.balance) return 'N/A';
    return `${parseFloat(this.state.balance).toFixed(4)} ETH`;
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Validate chain ID
   */
  isValidChainId(chainId: number): boolean {
    return Number.isInteger(chainId) && chainId > 0;
  }
}

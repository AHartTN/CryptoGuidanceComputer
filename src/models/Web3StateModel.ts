/**
 * @file Web3StateModel.ts
 * @description Model for managing Web3 wallet connection state and related operations.
 */

import type { IWalletConnectionState } from "../interfaces/IWeb3";
import type { IMetaMaskEthereumProvider } from "../interfaces/IMetaMaskEthereumProvider";

export const DEFAULT_WEB3_STATE: IWalletConnectionState = {
  isConnected: false,
  address: null,
  balance: null,
  chainId: null,
  provider: undefined,
};

export class Web3StateModel {
  /**
   * Create a new Web3StateModel instance.
   * @param state - Initial wallet connection state
   */
  constructor(
    private state: IWalletConnectionState = { ...DEFAULT_WEB3_STATE }
  ) {}

  /**
   * Get a copy of the current wallet connection state.
   */
  getState(): IWalletConnectionState {
    return { ...this.state };
  }

  /**
   * Set the wallet as connected with address, chain, and provider.
   */
  setConnected(
    address: string,
    chainId: number,
    provider: IMetaMaskEthereumProvider | undefined
  ): void {
    this.state = {
      ...this.state,
      isConnected: true,
      address,
      chainId,
      provider,
    };
  }

  /**
   * Update the wallet balance.
   */
  setBalance(balance: string): void {
    this.state = { ...this.state, balance };
  }

  /**
   * Disconnect the wallet and reset state.
   */
  disconnect(): void {
    this.state = { ...DEFAULT_WEB3_STATE };
  }

  /**
   * Update the connected network chain ID.
   */
  updateNetwork(chainId: number): void {
    this.state = { ...this.state, chainId };
  }

  /**
   * Returns true if the wallet is connected and has an address.
   */
  isWalletConnected(): boolean {
    return this.state.isConnected && !!this.state.address;
  }

  /**
   * Get the formatted wallet address, showing only the first 6 and last 4 characters.
   */
  getFormattedAddress(): string {
    if (!this.state.address) return "Not Connected";
    return `${this.state.address.slice(0, 6)}...${this.state.address.slice(-4)}`;
  }

  /**
   * Get the formatted wallet balance in ETH, or "N/A" if not available.
   */
  getFormattedBalance(): string {
    if (!this.state.balance) return "N/A";
    return `${parseFloat(this.state.balance).toFixed(4)} ETH`;
  }

  /**
   * Validate if the given address is a correct Ethereum address.
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check if the given chain ID is a positive integer.
   */
  isValidChainId(chainId: number): boolean {
    return Number.isInteger(chainId) && chainId > 0;
  }
}

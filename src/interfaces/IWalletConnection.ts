/**
 * @file IWalletConnection.ts
 * @description Interface for wallet connection state and provider reference.
 */

export interface IWalletConnection {
  /** Wallet address */
  address: string;
  /** Wallet balance as a string */
  balance: string;
  /** Chain ID of the connected network */
  chainId: number;
  /** Whether the wallet is connected */
  isConnected: boolean;
  /** Optional provider instance (e.g., MetaMask) */
  provider?:
    | import("./IMetaMaskEthereumProvider").IMetaMaskEthereumProvider
    | undefined;
}

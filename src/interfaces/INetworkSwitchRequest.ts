/**
 * @file INetworkSwitchRequest.ts
 * @description Interface for network switch requests (used for switching blockchain networks in wallet providers).
 */

export interface INetworkSwitchRequest {
  /** Target chain ID */
  chainId: number;
  /** Optional chain name */
  chainName?: string;
  /** Optional RPC URLs */
  rpcUrls?: string[];
  /** Optional block explorer URLs */
  blockExplorerUrls?: string[];
  /** Optional native currency details */
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

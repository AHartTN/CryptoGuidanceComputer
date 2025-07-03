export interface INetworkSwitchRequest {
  chainId: number;
  chainName?: string;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

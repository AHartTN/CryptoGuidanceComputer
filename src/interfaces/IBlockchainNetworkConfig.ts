export interface IBlockchainNetworkConfig {
  name: string;
  chainId: number;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

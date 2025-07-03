export interface IWalletConnection {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
  provider?: import('./IMetaMaskEthereumProvider').IMetaMaskEthereumProvider | undefined;
}

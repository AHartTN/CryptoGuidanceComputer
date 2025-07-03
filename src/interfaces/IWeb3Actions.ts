export interface IWeb3Actions {
  updateConnection: (account: string, network?: string) => void;
  updateBalance: (balance: string) => void;
  updateNetwork: (network: string) => void;
  disconnect: () => void;
  reset: () => void;
}

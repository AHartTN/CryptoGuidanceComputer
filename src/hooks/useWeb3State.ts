// Custom hook for Web3 state management following SOLID principles

import { useState, useCallback } from 'react';

export interface IWeb3State {
  isConnected: boolean;
  account: string | null;
  network: string | null;
  balance: string | null;
}

const INITIAL_WEB3_STATE: IWeb3State = {
  isConnected: false,
  account: null,
  network: null,
  balance: null
};

export const useWeb3State = () => {
  const [state, setState] = useState<IWeb3State>(INITIAL_WEB3_STATE);

  const updateConnection = useCallback((account: string, network?: string) => {
    setState(prev => ({
      ...prev,
      isConnected: true,
      account,
      network: network || prev.network
    }));
  }, []);

  const updateBalance = useCallback((balance: string) => {
    setState(prev => ({ ...prev, balance }));
  }, []);

  const updateNetwork = useCallback((network: string) => {
    setState(prev => ({ ...prev, network }));
  }, []);

  const disconnect = useCallback(() => {
    setState(INITIAL_WEB3_STATE);
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_WEB3_STATE);
  }, []);

  return {
    state,
    updateConnection,
    updateBalance,
    updateNetwork,
    disconnect,
    reset
  };
};

/**
 * @fileoverview Web3 state management hook
 * @description Optimized Web3 state management following SOLID principles
 */

import { useState, useCallback } from 'react';
import type { IWeb3State, IWeb3Actions, IWeb3StateManager } from '../types';
import { INITIAL_WEB3_STATE } from '../constants';

/**
 * Custom hook for Web3 state management
 * @returns Combined state and actions interface
 */
export const useWeb3State = (): IWeb3StateManager => {
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

  const actions: IWeb3Actions = {
    updateConnection,
    updateBalance,
    updateNetwork,
    disconnect,
    reset
  };

  return { state, actions };
};

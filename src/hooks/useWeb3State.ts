/**
 * @fileoverview Web3 state management hook
 * @description Optimized Web3 state management following SOLID principles
 */

import { useState, useCallback } from "react";
import type { IWeb3State } from "../interfaces/IWeb3State";
import type { IWeb3Actions } from "../interfaces/IWeb3Actions";
import type { IWeb3StateManager } from "../interfaces/IWeb3StateManager";
import { INITIAL_WEB3_STATE } from "../constants/INITIAL_WEB3_STATE.ts";

/**
 * Custom hook for Web3 state management
 * @returns Combined state and actions interface
 */
export const useWeb3State = (): IWeb3StateManager => {
  const [state, setState] = useState<IWeb3State>(INITIAL_WEB3_STATE);

  const updateConnection = useCallback((account: string, network?: string) => {
    setState((prev: IWeb3State) => ({
      ...prev,
      isConnected: true,
      account,
      network: network || prev.network,
    }));
  }, []);

  const updateBalance = useCallback((balance: string) => {
    setState((prev: IWeb3State) => ({ ...prev, balance }));
  }, []);

  const updateNetwork = useCallback((network: string) => {
    setState((prev: IWeb3State) => ({ ...prev, network }));
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
    reset,
  };

  return { state, actions };
};

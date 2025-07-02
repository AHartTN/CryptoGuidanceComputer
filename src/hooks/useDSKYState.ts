/**
 * @fileoverview DSKY state management hook
 * @description Optimized state management following SOLID principles
 */

import { useState, useCallback } from 'react';
import type { IDSKYState, IDSKYActions, IDSKYStateManager, StatusLightKey } from '../types';
import { INITIAL_DSKY_STATE, INPUT_CONSTRAINTS } from '../constants';

/**
 * Custom hook for DSKY state management
 * @returns Combined state and actions interface
 */
export const useDSKYState = (): IDSKYStateManager => {
  const [state, setState] = useState<IDSKYState>(INITIAL_DSKY_STATE);

  const updateField = useCallback((field: keyof IDSKYState, value: string | boolean) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMultipleFields = useCallback((updates: Partial<IDSKYState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(INITIAL_DSKY_STATE);
  }, []);

  const setStatusLight = useCallback((light: StatusLightKey, active: boolean) => {
    setState(prev => ({ ...prev, [light]: active }));
  }, []);

  const setRegister = useCallback((register: 'reg1' | 'reg2' | 'reg3', value: string) => {
    const paddedValue = value
      .slice(0, INPUT_CONSTRAINTS.REGISTER_LENGTH)
      .padEnd(INPUT_CONSTRAINTS.REGISTER_LENGTH, INPUT_CONSTRAINTS.REGISTER_PADDING);
    
    setState(prev => ({ ...prev, [register]: paddedValue }));
  }, []);

  const actions: IDSKYActions = {
    updateField,
    updateMultipleFields,
    resetState,
    setStatusLight,
    setRegister
  };

  return { state, actions };
};

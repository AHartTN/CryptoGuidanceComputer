// Custom hook for DSKY state management following SOLID principles

import { useState, useCallback } from 'react';

export interface IDSKYState {
  verb: string;
  noun: string;
  prog: string;
  reg1: string;
  reg2: string;
  reg3: string;
  compActy: boolean;
  uplinkActy: boolean;
  noAtt: boolean;
  stby: boolean;
  keyRel: boolean;
  oprErr: boolean;
  temp: boolean;
  gimbalLock: boolean;
  restart: boolean;
  tracker: boolean;
  alt: boolean;
  vel: boolean;
  progStatus: boolean;
  prio: boolean;
}

const INITIAL_DSKY_STATE: IDSKYState = {
  verb: '00',
  noun: '00',
  prog: '00',
  reg1: '00000',
  reg2: '00000',
  reg3: '00000',
  compActy: false,
  uplinkActy: false,
  noAtt: false,
  stby: false,
  keyRel: false,
  oprErr: false,
  temp: false,
  gimbalLock: false,
  restart: false,
  tracker: false,
  alt: false,
  vel: false,
  progStatus: false,
  prio: false
};

export const useDSKYState = () => {
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

  const setStatusLight = useCallback((light: keyof IDSKYState, active: boolean) => {
    setState(prev => ({ ...prev, [light]: active }));
  }, []);

  const setRegister = useCallback((register: 'reg1' | 'reg2' | 'reg3', value: string) => {
    setState(prev => ({ ...prev, [register]: value.slice(0, 5).padEnd(5, '0') }));
  }, []);

  return {
    state,
    updateField,
    updateMultipleFields,
    resetState,
    setStatusLight,
    setRegister
  };
};

// Interface for DSKY actions, extracted from features/dsky/types/IDSKYState.ts
import type { IDSKYState } from './IDSKYState';
import type { IDSKYStateUpdate } from './IDSKYStateUpdate';
import type { StatusLightKey } from './IDSKYState';

export interface IDSKYActions {
  updateField: (field: keyof IDSKYState, value: string | boolean) => void;
  updateMultipleFields: (updates: IDSKYStateUpdate) => void;
  resetState: () => void;
  setStatusLight: (light: StatusLightKey, active: boolean) => void;
  setRegister: (register: 'reg1' | 'reg2' | 'reg3', value: string) => void;
}

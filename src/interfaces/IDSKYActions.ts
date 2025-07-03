/**
 * @file IDSKYActions.ts
 * @description Interface for DSKY UI actions (field updates, resets, status lights, registers).
 */

// Interface for DSKY actions, extracted from features/dsky/types/IDSKYState.ts
import type { IDSKYState } from "./IDSKYState";
import type { IDSKYStateUpdate } from "./IDSKYStateUpdate";
import type { StatusLightKey } from "./IDSKYState";

export interface IDSKYActions {
  /** Update a single DSKY field */
  updateField: (field: keyof IDSKYState, value: string | boolean) => void;
  /** Update multiple DSKY fields at once */
  updateMultipleFields: (updates: IDSKYStateUpdate) => void;
  /** Reset the DSKY state to initial values */
  resetState: () => void;
  /** Set a status light on or off */
  setStatusLight: (light: StatusLightKey, active: boolean) => void;
  /** Set a register value (reg1, reg2, reg3) */
  setRegister: (register: "reg1" | "reg2" | "reg3", value: string) => void;
}

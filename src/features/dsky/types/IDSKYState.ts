/**
 * @fileoverview DSKY State Interface Definitions
 * @description Core DSKY display and input state interfaces
 */

/** Input modes for the DSKY interface */
export type InputMode = 'verb' | 'noun' | 'prog' | 'data' | null;

/** Status light identifiers */
export type StatusLightKey = 
  | 'compActy' | 'uplinkActy' | 'noAtt' | 'stby' | 'keyRel' | 'oprErr' 
  | 'temp' | 'gimbalLock' | 'restart' | 'tracker' | 'alt' | 'vel' 
  | 'progStatus' | 'prio';

/**
 * Complete DSKY display state interface
 * Represents all visual elements of the Apollo DSKY display
 */
export interface IDSKYState {
  /** Program register */
  prog: string;
  /** Verb register */
  verb: string;
  /** Noun register */
  noun: string;
  /** Data register 1 */
  reg1: string;
  /** Data register 2 */
  reg2: string;
  /** Data register 3 */
  reg3: string;
  /** Computer activity indicator */
  compActy: boolean;
  /** Uplink activity indicator */
  uplinkActy: boolean;
  /** No attitude indicator */
  noAtt: boolean;
  /** Standby indicator */
  stby: boolean;
  /** Key release indicator */
  keyRel: boolean;
  /** Operator error indicator */
  oprErr: boolean;
  /** Temperature warning indicator */
  temp: boolean;
  /** Gimbal lock indicator */
  gimbalLock: boolean;
  /** Restart indicator */
  restart: boolean;
  /** Tracker indicator */
  tracker: boolean;
  /** Altitude indicator */
  alt: boolean;
  /** Velocity indicator */
  vel: boolean;
  /** Program status indicator */
  progStatus: boolean;
  /** Priority indicator */
  prio: boolean;
}

/**
 * DSKY actions interface for state management
 */
export interface IDSKYActions {
  updateField: (field: keyof IDSKYState, value: string | boolean) => void;
  updateMultipleFields: (updates: import('../../../interfaces/IDSKYStateUpdate').IDSKYStateUpdate) => void;
  resetState: () => void;
  setStatusLight: (light: StatusLightKey, active: boolean) => void;
  setRegister: (register: 'reg1' | 'reg2' | 'reg3', value: string) => void;
}

/**
 * Combined DSKY state and actions
 */
export interface IDSKYStateManager {
  state: IDSKYState;
  actions: IDSKYActions;
}

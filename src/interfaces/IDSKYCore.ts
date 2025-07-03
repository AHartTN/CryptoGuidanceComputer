/**
 * @file IDSKYCore.ts
 * @description Core DSKY interfaces for display and warning lights.
 */

export interface IDSKYDisplay {
  /** Program number display */
  prog: string;
  /** Verb code display */
  verb: string;
  /** Noun code display */
  noun: string;
}

export interface IDSKYWarningLights {
  /** Computer activity */
  compActy: boolean;
  /** Uplink activity */
  uplinkActy: boolean;
  /** No attitude reference */
  noAtt: boolean;
  /** Standby mode */
  stby: boolean;
  /** Keyboard release */
  keyRel: boolean;
  /** Operator error */
  oprErr: boolean;
  /** Temperature warning */
  temp: boolean;
  /** Gimbal lock warning */
  gimbalLock: boolean;
  /** Restart indicator */
  restart: boolean;
}

import type { IDSKYWarningLights } from "./IDSKYCore";

// DSKY State interface for cross-module imports
export interface IDSKYState {
  prog: string;
  verb: string;
  noun: string;
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
  warningLights: IDSKYWarningLights;
}

export type StatusLightKey = keyof Omit<
  IDSKYState,
  "prog" | "verb" | "noun" | "reg1" | "reg2" | "reg3"
>;

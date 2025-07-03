// DSKY Core interfaces for display and warning lights
export interface IDSKYDisplay {
  prog: string;
  verb: string;
  noun: string;
}

export interface IDSKYWarningLights {
  compActy: boolean;
  uplinkActy: boolean;
  noAtt: boolean;
  stby: boolean;
  keyRel: boolean;
  oprErr: boolean;
  temp: boolean;
  gimbalLock: boolean;
  restart: boolean;
}

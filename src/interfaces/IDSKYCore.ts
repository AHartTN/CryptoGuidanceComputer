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
}

export interface IDSKYCommand {
  verb: string;
  noun: string;
  execute(): Promise<void>;
}

export interface IDSKYKeyPress {
  key: string;
  timestamp: number;
}

export interface IDSKYDisplay {
  prog: string;
  verb: string;
  noun: string;
  reg1: string;
  reg2: string;
  reg3: string;
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

export type DSKYInputMode = 'verb' | 'noun' | 'data' | null;
export type DSKYKeyType = 'VERB' | 'NOUN' | 'ENTR' | 'CLR' | 'RSET' | string;

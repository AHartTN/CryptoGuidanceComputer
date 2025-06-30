import { IDSKYState, IDSKYDisplay, IDSKYWarningLights, DSKYInputMode } from '../interfaces/IDSKYCore';

export class DSKYState implements IDSKYState {
  verb: string = '00';
  noun: string = '00';
  prog: string = '11';
  reg1: string = '00000';
  reg2: string = '00000';
  reg3: string = '00000';
  compActy: boolean = false;
  uplinkActy: boolean = false;
  noAtt: boolean = false;
  stby: boolean = false;
  keyRel: boolean = false;
  oprErr: boolean = false;
  temp: boolean = false;
  gimbalLock: boolean = false;
  restart: boolean = false;

  constructor(initialState?: Partial<IDSKYState>) {
    if (initialState) {
      Object.assign(this, initialState);
    }
  }

  static createDefault(): DSKYState {
    return new DSKYState();
  }

  reset(): void {
    this.verb = '00';
    this.noun = '00';
    this.reg1 = '00000';
    this.reg2 = '00000';
    this.reg3 = '00000';
    this.compActy = false;
    this.uplinkActy = false;
    this.noAtt = false;
    this.stby = false;
    this.keyRel = false;
    this.oprErr = false;
    this.temp = false;
    this.gimbalLock = false;
    this.restart = false;
  }
}

export class DSKYInputState {
  mode: DSKYInputMode = null;
  currentInput: string = '';
  
  constructor(mode: DSKYInputMode = null, input: string = '') {
    this.mode = mode;
    this.currentInput = input;
  }

  clear(): void {
    this.mode = null;
    this.currentInput = '';
  }

  isInputComplete(): boolean {
    return this.currentInput.length === 2;
  }
}

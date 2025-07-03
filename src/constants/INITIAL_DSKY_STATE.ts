// Default initial DSKY state for use in hooks and reducers
import type { IDSKYState } from '../interfaces/IDSKYState';

export const INITIAL_DSKY_STATE: IDSKYState = {
  prog: '',
  verb: '',
  noun: '',
  reg1: '',
  reg2: '',
  reg3: '',
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

import type { IWeb3State } from "../interfaces/IWeb3State";

export const INITIAL_WEB3_STATE: IWeb3State = {
  isConnected: false,
  account: null,
  network: null,
  balance: null,
};

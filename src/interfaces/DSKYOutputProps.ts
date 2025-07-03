// Props for the DSKYOutput component
import type { IWeb3State } from './IWeb3State';
import type { IRealTimeDataState } from '../hooks/useRealTimeData';
export interface DSKYOutputProps {
  web3State: IWeb3State;
  statusMessages: string[];
  realTimeData: IRealTimeDataState;
}

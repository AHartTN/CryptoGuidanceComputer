// Props for the DSKYOutput component
import type { IWeb3State } from './IWeb3State';
export interface DSKYOutputProps {
  web3State: IWeb3State;
  statusMessages: string[];
  showRealTimeData?: boolean;
}

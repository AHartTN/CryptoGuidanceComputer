import type { IPriceData } from './IPriceData';

export interface IPriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change_percent';
  threshold: number;
  enabled: boolean;
  callback: (data: IPriceData) => void;
  message?: string;
  type?: string;
  timestamp?: number;
}

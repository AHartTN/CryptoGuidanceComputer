// Discriminated union for all real-time data payloads
import type { IPriceData } from '../services/realtime/RealTimePriceFeedService';
import type { IPriceAlert } from './IPriceAlert';
import type { IBlockEvent, ITransactionEvent, IGasPriceEvent, INetworkStatsEvent } from '../services/realtime/RealTimeBlockchainService';

export type IRealTimeDataPayload =
  | IPriceData
  | IPriceAlert
  | IBlockEvent
  | ITransactionEvent
  | IGasPriceEvent
  | INetworkStatsEvent
  | string
  | number
  | boolean
  | Record<string, unknown>
  | unknown;

/**
 * @file IRealTimeDataPayload.ts
 * @description Discriminated union type for all real-time data payloads (alerts, blocks, transactions, etc.).
 */

// Discriminated union for all real-time data payloads
import type { IPriceAlert } from "./IPriceAlert";
import type {
  IBlockEvent,
  ITransactionEvent,
  IGasPriceEvent,
  INetworkStatsEvent,
} from "../services/realtime/RealTimeBlockchainService";

export type IRealTimeDataPayload =
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

import type { BlockchainErrorType } from '../enums/BlockchainErrorType';

export interface IBlockchainError {
  type: BlockchainErrorType;
  message: string;
  code?: number;
  data?: unknown;
  timestamp: Date;
}

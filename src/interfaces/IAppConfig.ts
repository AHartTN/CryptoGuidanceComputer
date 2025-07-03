/**
 * @file IAppConfig.ts
 * @description Application-wide configuration interface for DSKY Crypto Guidance Computer.
 */

import type { IProviderConfig } from "./IProviderConfig";
import type { ICryptoPriceConfig } from "./ICryptoPriceConfig";

export interface IAppConfig {
  /** Web3 provider configuration */
  web3: IProviderConfig;
  /** Cryptocurrency price service configuration */
  crypto: ICryptoPriceConfig;
  /** UI configuration options */
  ui: {
    /** Theme name (e.g., 'dark', 'tron', etc.) */
    theme: string;
    /** Animation speed in ms */
    animationSpeed: number;
  };
}

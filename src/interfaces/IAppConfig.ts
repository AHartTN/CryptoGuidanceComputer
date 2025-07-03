import type { IProviderConfig } from './IProviderConfig';
import type { ICryptoPriceConfig } from './ICryptoPriceConfig';

export interface IAppConfig {
  web3: IProviderConfig;
  crypto: ICryptoPriceConfig;
  ui: {
    theme: string;
    animationSpeed: number;
  };
}

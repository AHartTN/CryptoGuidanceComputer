export interface CryptoPriceData {
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface DSKYCommand {
  verb: string;
  noun: string;
  description: string;
  action: (noun: string) => Promise<void>;
}

export interface Web3Config {
  rpcUrl?: string;
  chainId?: number;
  networkName?: string;
}

export interface CryptoApiResponse {
  [coinId: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
  };
}

export type DSKYMode = 'STANDBY' | 'VERB_ENTRY' | 'NOUN_ENTRY' | 'EXECUTING' | 'ERROR';

export interface DSKYState {
  verb: string;
  noun: string;
  display: string;
  mode: DSKYMode;
  error: string | null;
}

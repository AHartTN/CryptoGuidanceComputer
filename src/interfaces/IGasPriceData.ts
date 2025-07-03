// Gas price data interface for DSKY
export interface IGasPriceData {
  standard: string;
  [key: string]: string | number | undefined;
}

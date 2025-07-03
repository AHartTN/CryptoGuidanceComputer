/**
 * @file ITokenBalance.ts
 * @description Interface for ERC-20 token balance and metadata.
 */

export interface ITokenBalance {
  /** Token contract address */
  contractAddress: string;
  /** Token symbol (e.g., USDT, DAI) */
  symbol: string;
  /** Token name (e.g., Tether USD) */
  name: string;
  /** Token balance as a string */
  balance: string;
  /** Number of decimals for the token */
  decimals: number;
}

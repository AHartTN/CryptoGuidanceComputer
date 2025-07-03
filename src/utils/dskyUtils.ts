/**
 * Utility functions for formatting and validating DSKY display and blockchain data.
 *
 * @file dskyUtils.ts
 */

import { IGasPriceData } from "../interfaces/IGasPriceData";

/**
 * Formats an Ethereum account address for display (shortened).
 * @param account - The account address.
 * @returns Shortened display string.
 */
export function formatAccountForDisplay(account: string | null): string {
  if (!account) return "NONE";
  return `${account.slice(0, 6)}...${account.slice(-4)}`;
}

/**
 * Formats a balance string for display (ETH, 4 decimals).
 * @param balance - The balance string.
 * @returns Formatted balance string.
 */
export function formatBalanceForDisplay(balance: string | null): string {
  if (!balance) return "N/A";
  return `${parseFloat(balance).toFixed(4)} ETH`;
}

/**
 * Splits an address into register segments for DSKY display.
 * @param address - The address string.
 * @returns Object with reg1, reg2, reg3.
 */
export function formatAddressForRegisters(address: string): {
  reg1: string;
  reg2: string;
  reg3: string;
} {
  return {
    reg1: address.slice(2, 7),
    reg2: address.slice(7, 12),
    reg3: address.slice(-5),
  };
}

/**
 * Formats a price for DSKY register display.
 * @param price - The price value.
 * @returns Formatted price string.
 */
export function formatPriceForRegister(price: number): string {
  return price > 1000
    ? Math.round(price).toString().slice(0, 5)
    : price.toFixed(2).slice(0, 5);
}

/**
 * Formats a price change for DSKY register display.
 * @param change - The change value.
 * @returns Formatted change string.
 */
export function formatChangeForRegister(change: number): string {
  return change.toFixed(2).slice(0, 5);
}

/**
 * Formats a number for DSKY register display, padded to length.
 * @param num - The number.
 * @param length - Desired string length (default 5).
 * @returns Padded string.
 */
export function formatNumberForRegister(
  num: number,
  length: number = 5,
): string {
  return num.toString().padStart(length, "0");
}

/**
 * Converts gas price data to Gwei.
 * @param gasData - Gas price data object.
 * @returns Gas price in Gwei.
 */
export function formatGasPriceToGwei(gasData: IGasPriceData): number {
  return typeof gasData === "object" && gasData && "standard" in gasData
    ? parseFloat(gasData.standard as string) / 1e9
    : 0;
}

/**
 * Truncates a string for DSKY register display.
 * @param text - The string to truncate.
 * @param maxLength - Maximum length (default 5).
 * @returns Truncated string.
 */
export function truncateForRegister(
  text: string,
  maxLength: number = 5,
): string {
  return text.slice(0, maxLength);
}

/**
 * Validates an Ethereum address.
 * @param address - The address string.
 * @returns True if valid, false otherwise.
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates an Ethereum transaction hash.
 * @param hash - The transaction hash string.
 * @returns True if valid, false otherwise.
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Creates an error message for a failed operation.
 * @param operation - The name of the operation.
 * @param error - The error object or message.
 * @returns Formatted error message.
 */
export function createErrorMessage(operation: string, error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return `${operation} failed: ${errorMessage}`;
}

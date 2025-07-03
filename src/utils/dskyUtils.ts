/**
 * @fileoverview DSKY Display Utilities
 * @description Utility functions for DSKY display formatting and validation
 */
import { IGasPriceData } from '../interfaces/IGasPriceData';

/**
 * Format address for DSKY display (first 6 + last 4 characters)
 */
export function formatAccountForDisplay(account: string | null): string {
  if (!account) return 'NONE';
  return `${account.slice(0, 6)}...${account.slice(-4)}`;
}

/**
 * Format balance for DSKY display
 */
export function formatBalanceForDisplay(balance: string | null): string {
  if (!balance) return 'N/A';
  return `${parseFloat(balance).toFixed(4)} ETH`;
}

/**
 * Format address for DSKY registers (split into chunks)
 */
export function formatAddressForRegisters(address: string): {
  reg1: string;
  reg2: string;
  reg3: string;
} {
  return {
    reg1: address.slice(2, 7),
    reg2: address.slice(7, 12),
    reg3: address.slice(-5)
  };
}

/**
 * Format price for DSKY register display
 */
export function formatPriceForRegister(price: number): string {
  return price > 1000 
    ? Math.round(price).toString().slice(0, 5)
    : price.toFixed(2).slice(0, 5);
}

/**
 * Format percentage change for DSKY register
 */
export function formatChangeForRegister(change: number): string {
  return change.toFixed(2).slice(0, 5);
}

/**
 * Format number with padding for DSKY registers
 */
export function formatNumberForRegister(num: number, length: number = 5): string {
  return num.toString().padStart(length, '0');
}

/**
 * Format gas price from wei to gwei
 */
export function formatGasPriceToGwei(gasData: IGasPriceData): number {
  return typeof gasData === 'object' && gasData && 'standard' in gasData 
    ? parseFloat(gasData.standard as string) / 1e9
    : 0;
}

/**
 * Truncate string to fit DSKY register
 */
export function truncateForRegister(text: string, maxLength: number = 5): string {
  return text.slice(0, maxLength);
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash format
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Create error message with context
 */
export function createErrorMessage(operation: string, error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return `${operation} failed: ${errorMessage}`;
}

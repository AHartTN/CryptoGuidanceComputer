/**
 * @fileoverview Input Validation Utilities
 * @description Common validation functions for user input and data
 */

/**
 * Validate numeric input for DSKY
 */
export function isValidDSKYNumericInput(input: string): boolean {
  return /^\d{1,2}$/.test(input);
}

/**
 * Validate verb number range
 */
export function isValidVerbNumber(verb: number): boolean {
  return Number.isInteger(verb) && verb >= 0 && verb <= 99;
}

/**
 * Validate noun number range
 */
export function isValidNounNumber(noun: number): boolean {
  return Number.isInteger(noun) && noun >= 0 && noun <= 999;
}

/**
 * Validate program number range
 */
export function isValidProgramNumber(program: number): boolean {
  return Number.isInteger(program) && program >= 0 && program <= 99;
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Validate block number
 */
export function isValidBlockNumber(blockNumber: number): boolean {
  return Number.isInteger(blockNumber) && blockNumber >= 0;
}

/**
 * Validate cryptocurrency symbol
 */
export function isValidCryptoSymbol(symbol: string): boolean {
  return /^[A-Z]{2,10}$/.test(symbol);
}

/**
 * Validate price value
 */
export function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}

/**
 * Validate percentage change
 */
export function isValidPercentageChange(change: number): boolean {
  return Number.isFinite(change);
}

/**
 * Sanitize user input for display
 */
export function sanitizeDisplayInput(input: string): string {
  return input.replace(/[\w\s\-.]/g, '').slice(0, 50);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.length >= 10 && apiKey.length <= 128;
}

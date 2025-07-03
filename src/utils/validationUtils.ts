/**
 * Utility functions for validating DSKY and crypto-related inputs.
 *
 * @file validationUtils.ts
 */

/**
 * Checks if the input is a valid DSKY numeric string (1-2 digits).
 * @param input - The input string to validate.
 * @returns True if valid, false otherwise.
 */
export function isValidDSKYNumericInput(input: string): boolean {
  return /^\d{1,2}$/.test(input);
}

/**
 * Checks if the verb number is valid (0-99).
 * @param verb - The verb number.
 * @returns True if valid, false otherwise.
 */
export function isValidVerbNumber(verb: number): boolean {
  return Number.isInteger(verb) && verb >= 0 && verb <= 99;
}

/**
 * Checks if the noun number is valid (0-999).
 * @param noun - The noun number.
 * @returns True if valid, false otherwise.
 */
export function isValidNounNumber(noun: number): boolean {
  return Number.isInteger(noun) && noun >= 0 && noun <= 999;
}

/**
 * Checks if the program number is valid (0-99).
 * @param program - The program number.
 * @returns True if valid, false otherwise.
 */
export function isValidProgramNumber(program: number): boolean {
  return Number.isInteger(program) && program >= 0 && program <= 99;
}

/**
 * Checks if the chain ID is valid (positive integer).
 * @param chainId - The chain ID.
 * @returns True if valid, false otherwise.
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Checks if the block number is valid (non-negative integer).
 * @param blockNumber - The block number.
 * @returns True if valid, false otherwise.
 */
export function isValidBlockNumber(blockNumber: number): boolean {
  return Number.isInteger(blockNumber) && blockNumber >= 0;
}

/**
 * Checks if the crypto symbol is valid (2-10 uppercase letters).
 * @param symbol - The crypto symbol.
 * @returns True if valid, false otherwise.
 */
export function isValidCryptoSymbol(symbol: string): boolean {
  return /^[A-Z]{2,10}$/.test(symbol);
}

/**
 * Checks if the price is valid (finite, non-negative).
 * @param price - The price value.
 * @returns True if valid, false otherwise.
 */
export function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}

/**
 * Checks if the percentage change is valid (finite number).
 * @param change - The percentage change.
 * @returns True if valid, false otherwise.
 */
export function isValidPercentageChange(change: number): boolean {
  return Number.isFinite(change);
}

/**
 * Sanitizes display input by removing unwanted characters and limiting length.
 * @param input - The input string.
 * @returns The sanitized string.
 */
export function sanitizeDisplayInput(input: string): string {
  return input.replace(/[\w\s\-.]/g, "").slice(0, 50);
}

/**
 * Checks if a string is a valid URL.
 * @param url - The URL string.
 * @returns True if valid, false otherwise.
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
 * Checks if an API key is valid (string, 10-128 chars).
 * @param apiKey - The API key string.
 * @returns True if valid, false otherwise.
 */
export function isValidApiKey(apiKey: string): boolean {
  return (
    typeof apiKey === "string" && apiKey.length >= 10 && apiKey.length <= 128
  );
}

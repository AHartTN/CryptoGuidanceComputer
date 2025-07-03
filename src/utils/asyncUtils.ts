/**
 * Async utility functions for delays, retries, rate limiting, debouncing, throttling, and batching.
 *
 * @file asyncUtils.ts
 */

/**
 * Delays execution for a given number of milliseconds.
 * @param ms - Milliseconds to delay.
 * @returns Promise that resolves after the delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async operation with exponential backoff.
 * @param operation - The async operation to retry.
 * @param maxRetries - Maximum number of retries (default 3).
 * @param baseDelay - Initial delay in ms (default 1000).
 * @returns Promise resolving to the operation result.
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delayMs = baseDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }

  throw lastError!;
}

/**
 * Wraps a promise with a timeout.
 * @param promise - The promise to wrap.
 * @param timeoutMs - Timeout in ms.
 * @param timeoutMessage - Message for timeout error.
 * @returns Promise resolving to the result or rejecting on timeout.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = "Operation timed out",
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs),
    ),
  ]);
}

/**
 * Rate limiter for controlling async operation throughput.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly maxTokens: number,
    private readonly refillRate: number,
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire(count: number = 1): Promise<void> {
    this.refillTokens();

    if (this.tokens >= count) {
      this.tokens -= count;
      return;
    }

    const waitTime = ((count - this.tokens) / this.refillRate) * 1000;
    await delay(waitTime);
    await this.acquire(count);
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

/**
 * Debounces a function, ensuring it only runs after a wait period.
 * @param func - The function to debounce.
 * @param wait - Wait time in ms.
 * @returns Debounced function.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttles a function, ensuring it only runs once per limit period.
 * @param func - The function to throttle.
 * @param limit - Limit time in ms.
 * @returns Throttled function.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Processes items in async batches with optional delay between batches.
 * @param items - Array of items to process.
 * @param operation - Async operation for each item.
 * @param batchSize - Number of items per batch (default 10).
 * @param delayBetweenBatches - Delay between batches in ms (default 100).
 * @returns Promise resolving to array of results.
 */
export async function batchAsync<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayBetweenBatches: number = 100,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(operation);
    const batchResults = await Promise.all(batchPromises);

    results.push(...batchResults);

    if (i + batchSize < items.length && delayBetweenBatches > 0) {
      await delay(delayBetweenBatches);
    }
  }

  return results;
}

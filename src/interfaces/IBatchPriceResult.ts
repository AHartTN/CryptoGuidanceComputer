/**
 * @file IBatchPriceResult.ts
 * @description Type alias for batch crypto price results, used for clarity in batch operations.
 */

import type { ICryptoPriceData } from "./ICryptoPriceData";

// If IBatchPriceResult is now redundant, re-export ICryptoPriceData for batch results
export type IBatchPriceResult = ICryptoPriceData;

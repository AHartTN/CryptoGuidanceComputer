/**
 * @file OptimizedStatusIndicatorsProps.ts
 * @description Props interface for OptimizedStatusIndicators component.
 */

import type { IDSKYState } from "./IDSKYState";

// Props for OptimizedStatusIndicators component
export interface OptimizedStatusIndicatorsProps {
  /** Current DSKY state */
  dskyState: IDSKYState;
}

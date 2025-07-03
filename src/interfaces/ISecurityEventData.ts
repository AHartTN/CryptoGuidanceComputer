/**
 * @file ISecurityEventData.ts
 * @description Type for security event data payloads (used in security event logging and validation).
 */

// Security event data payload type
export type ISecurityEventData =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | unknown;

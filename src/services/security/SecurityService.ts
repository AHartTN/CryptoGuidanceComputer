// Apollo DSKY - Security Service
// Enterprise-grade security, validation, and protection service

import { CacheService, CacheStrategy } from "../cache/CacheService";
import { ErrorHandlingService } from "../error/ErrorHandlingService";
import type { ISecurityEventData } from "../../interfaces/ISecurityEventData";

/** Security Event Types */
export enum SecurityEventType {
  INVALID_INPUT = "INVALID_INPUT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  INJECTION_ATTEMPT = "INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  WALLET_VALIDATION_FAILED = "WALLET_VALIDATION_FAILED",
  API_ABUSE = "API_ABUSE",
}

/** Security Event */
export interface ISecurityEvent {
  type: SecurityEventType;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  source: string;
  data: ISecurityEventData;
  timestamp: number;
  blocked: boolean;
}

/** Rate Limit Configuration */
export interface IRateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
  skipSuccessfulRequests: boolean;
}

/** Input Validation Rules */
export interface IValidationRule {
  field: string;
  type: "string" | "number" | "address" | "hash" | "email" | "url" | "json";
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: unknown) => boolean;
  sanitizer?: (value: unknown) => unknown;
}

/** Security Configuration */
export interface ISecurityConfig {
  enableRateLimit: boolean;
  enableInputValidation: boolean;
  enableXSSProtection: boolean;
  enableInjectionProtection: boolean;
  enableWalletValidation: boolean;
  rateLimitConfig: IRateLimitConfig;
  maxEventHistory: number;
  logSecurityEvents: boolean;
}

/** Move InputObject type to top-level */
export type InputObject = Record<string, unknown>;

/** Define return types as interfaces */
export interface IValidateInputResult {
  isValid: boolean;
  sanitizedInput: InputObject;
  errors: string[];
  securityEvents: ISecurityEvent[];
}
export interface ICheckRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
}
export interface IValidateAddressResult {
  isValid: boolean;
  type: "EOA" | "CONTRACT" | "INVALID";
  checksum: boolean;
  errors: string[];
}
export interface IValidateTransactionHashResult {
  isValid: boolean;
  errors: string[];
}

/** Security Service */
export class SecurityService {
  private cache: CacheService;
  private errorService: ErrorHandlingService;
  private securityEvents: ISecurityEvent[] = [];
  private rateLimitStore: Map<
    string,
    { count: number; resetTime: number; blocked: boolean }
  > = new Map();

  // Event callbacks
  private onSecurityEvent?: (event: ISecurityEvent) => void;
  private onRateLimitExceeded?: (source: string, attempts: number) => void;
  private onSuspiciousActivity?: (
    source: string,
    events: ISecurityEvent[],
  ) => void;

  constructor(private config: ISecurityConfig) {
    this.cache = new CacheService({
      strategy: CacheStrategy.LRU,
      maxSize: 10000,
      defaultTTL: 3600000, // 1 hour TTL
      enableMetrics: true,
    });

    this.errorService = new ErrorHandlingService();
    this.startCleanupTimer();
  }

  /** Validate input against security rules */
  validateInput(
    input: unknown,
    rules: IValidationRule[],
  ): IValidateInputResult {
    if (typeof input !== "object" || input === null) {
      return {
        isValid: false,
        sanitizedInput: {},
        errors: ["Input must be an object"],
        securityEvents: [],
      };
    }
    const sanitizedInput: InputObject = {};
    const errors: string[] = [];
    const securityEvents: ISecurityEvent[] = [];
    let isValid = true;

    if (!this.config.enableInputValidation) {
      return {
        isValid: true,
        sanitizedInput: input as Record<string, unknown>,
        errors: [],
        securityEvents: [],
      };
    }

    for (const rule of rules) {
      // Use (input as InputObject)[rule.field] for property access
      const value = (input as InputObject)[rule.field];

      try {
        // Check required fields
        if (
          rule.required &&
          (value === undefined || value === null || value === "")
        ) {
          errors.push(`${rule.field} is required`);
          isValid = false;
          continue;
        }

        // Skip validation for optional empty fields
        if (
          !rule.required &&
          (value === undefined || value === null || value === "")
        ) {
          sanitizedInput[rule.field] = value;
          continue;
        }

        // Type validation
        const typeValidation = this.validateType(value, rule);
        if (!typeValidation.isValid) {
          errors.push(...typeValidation.errors);
          securityEvents.push(...typeValidation.securityEvents);
          isValid = false;
          continue;
        }

        // Length validation
        if (typeof value === "string") {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(
              `${rule.field} must be at least ${rule.minLength} characters`,
            );
            isValid = false;
            continue;
          }

          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(
              `${rule.field} must not exceed ${rule.maxLength} characters`,
            );
            isValid = false;
            continue;
          }
        }

        // Numeric range validation
        if (typeof value === "number") {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`${rule.field} must be at least ${rule.min}`);
            isValid = false;
            continue;
          }

          if (rule.max !== undefined && value > rule.max) {
            errors.push(`${rule.field} must not exceed ${rule.max}`);
            isValid = false;
            continue;
          }
        }

        // Pattern validation
        if (
          rule.pattern &&
          typeof value === "string" &&
          !rule.pattern.test(value)
        ) {
          errors.push(`${rule.field} format is invalid`);
          securityEvents.push(
            this.createSecurityEvent(
              SecurityEventType.INVALID_INPUT,
              "MEDIUM",
              `Invalid pattern for ${rule.field}`,
              "INPUT_VALIDATION",
              { field: rule.field, value, pattern: rule.pattern.source },
            ),
          );
          isValid = false;
          continue;
        }

        // Custom validation
        if (rule.customValidator && !rule.customValidator(value)) {
          errors.push(`${rule.field} failed custom validation`);
          isValid = false;
          continue;
        }

        // Sanitization
        let sanitizedValue = value;
        if (rule.sanitizer) {
          sanitizedValue = rule.sanitizer(value);
        } else {
          sanitizedValue = this.sanitizeValue(value, rule.type);
        }

        // Security checks
        const securityCheck = this.performSecurityChecks(
          sanitizedValue,
          rule.field,
        );
        securityEvents.push(...securityCheck.events);

        if (securityCheck.blocked) {
          errors.push(`${rule.field} contains potentially malicious content`);
          isValid = false;
          continue;
        }

        sanitizedInput[rule.field] = sanitizedValue;
      } catch (error) {
        errors.push(
          `Validation error for ${rule.field}: ${(error as Error).message}`,
        );
        isValid = false;
      }
    }

    // Log security events
    securityEvents.forEach((event) => this.logSecurityEvent(event));

    return { isValid, sanitizedInput, errors, securityEvents };
  }

  /** Check rate limits for a source */
  checkRateLimit(
    source: string,
    customConfig?: Partial<IRateLimitConfig>,
  ): ICheckRateLimitResult {
    if (!this.config.enableRateLimit) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: 0,
        blocked: false,
      };
    }

    const config = { ...this.config.rateLimitConfig, ...customConfig };
    const now = Date.now();
    const key = `rate_limit:${source}`;

    let limitData = this.rateLimitStore.get(key);

    // Initialize or reset if window expired
    if (!limitData || now >= limitData.resetTime) {
      limitData = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    // Check if currently blocked
    if (limitData.blocked && now < limitData.resetTime) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: limitData.resetTime,
        blocked: true,
      };
    }

    // Increment count
    limitData.count++;

    // Check if limit exceeded
    if (limitData.count > config.maxRequests) {
      limitData.blocked = true;
      limitData.resetTime = now + config.blockDurationMs;

      // Log security event
      const event = this.createSecurityEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        "HIGH",
        `Rate limit exceeded for ${source}`,
        source,
        { attempts: limitData.count, config },
      );
      this.logSecurityEvent(event);

      if (this.onRateLimitExceeded) {
        this.onRateLimitExceeded(source, limitData.count);
      }

      this.rateLimitStore.set(key, limitData);
      return {
        allowed: false,
        remaining: 0,
        resetTime: limitData.resetTime,
        blocked: true,
      };
    }

    this.rateLimitStore.set(key, limitData);

    return {
      allowed: true,
      remaining: config.maxRequests - limitData.count,
      resetTime: limitData.resetTime,
      blocked: false,
    };
  }

  /** Validate Ethereum address */
  validateAddress(address: string): IValidateAddressResult {
    const errors: string[] = [];

    // Basic format check
    if (!address || typeof address !== "string") {
      errors.push("Address must be a string");
      return { isValid: false, type: "INVALID", checksum: false, errors };
    }

    // Remove 0x prefix if present
    const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

    // Length check
    if (cleanAddress.length !== 40) {
      errors.push("Address must be 40 characters long (excluding 0x prefix)");
      return { isValid: false, type: "INVALID", checksum: false, errors };
    }

    // Hex character check
    if (!/^[0-9a-fA-F]+$/.test(cleanAddress)) {
      errors.push("Address must contain only hexadecimal characters");
      return { isValid: false, type: "INVALID", checksum: false, errors };
    }

    // Checksum validation
    const checksum = this.validateAddressChecksum(address);

    return {
      isValid: true,
      type: "EOA", // Default to EOA, would need blockchain call to determine contract
      checksum,
      errors: [],
    };
  }

  /** Validate transaction hash */
  validateTransactionHash(hash: string): IValidateTransactionHashResult {
    const errors: string[] = [];

    if (!hash || typeof hash !== "string") {
      errors.push("Transaction hash must be a string");
      return { isValid: false, errors };
    }

    // Remove 0x prefix if present
    const cleanHash = hash.startsWith("0x") ? hash.slice(2) : hash;

    // Length check (32 bytes = 64 hex characters)
    if (cleanHash.length !== 64) {
      errors.push(
        "Transaction hash must be 64 characters long (excluding 0x prefix)",
      );
      return { isValid: false, errors };
    }

    // Hex character check
    if (!/^[0-9a-fA-F]+$/.test(cleanHash)) {
      errors.push("Transaction hash must contain only hexadecimal characters");
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }

  /** Get security events */
  getSecurityEvents(limit?: number): ISecurityEvent[] {
    return limit ? this.securityEvents.slice(-limit) : [...this.securityEvents];
  }

  /** Get security statistics */
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: { [key in SecurityEventType]?: number };
    eventsBySeverity: { [key: string]: number };
    blockedRequests: number;
    rateLimitViolations: number;
  } {
    const eventsByType: { [key in SecurityEventType]?: number } = {};
    const eventsBySeverity: { [key: string]: number } = {};
    let blockedRequests = 0;
    let rateLimitViolations = 0;

    this.securityEvents.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] =
        (eventsBySeverity[event.severity] || 0) + 1;

      if (event.blocked) blockedRequests++;
      if (event.type === SecurityEventType.RATE_LIMIT_EXCEEDED)
        rateLimitViolations++;
    });

    return {
      totalEvents: this.securityEvents.length,
      eventsByType,
      eventsBySeverity,
      blockedRequests,
      rateLimitViolations,
    };
  }

  /** Set event callbacks */
  setEventCallbacks(callbacks: {
    onSecurityEvent?: (event: ISecurityEvent) => void;
    onRateLimitExceeded?: (source: string, attempts: number) => void;
    onSuspiciousActivity?: (source: string, events: ISecurityEvent[]) => void;
  }): void {
    this.onSecurityEvent = callbacks.onSecurityEvent;
    this.onRateLimitExceeded = callbacks.onRateLimitExceeded;
    this.onSuspiciousActivity = callbacks.onSuspiciousActivity;
  }

  /** Validate type */
  private validateType(
    value: unknown,
    rule: IValidationRule,
  ): {
    isValid: boolean;
    errors: string[];
    securityEvents: ISecurityEvent[];
  } {
    const errors: string[] = [];
    const securityEvents: ISecurityEvent[] = [];

    switch (rule.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push(`${rule.field} must be a string`);
        }
        break;
      case "number":
        if (typeof value !== "number" || isNaN(value)) {
          errors.push(`${rule.field} must be a number`);
        }
        break;
      case "address": {
        const addressValidation = this.validateAddress(value as string);
        if (!addressValidation.isValid) {
          errors.push(...addressValidation.errors);
          securityEvents.push(
            this.createSecurityEvent(
              SecurityEventType.INVALID_INPUT,
              "MEDIUM",
              `Invalid address for ${rule.field}`,
              "INPUT_VALIDATION",
              { field: rule.field, value },
            ),
          );
        }
        break;
      }
      case "hash": {
        const hashValidation = this.validateTransactionHash(value as string);
        if (!hashValidation.isValid) {
          errors.push(...hashValidation.errors);
          securityEvents.push(
            this.createSecurityEvent(
              SecurityEventType.INVALID_INPUT,
              "MEDIUM",
              `Invalid hash for ${rule.field}`,
              "INPUT_VALIDATION",
              { field: rule.field, value },
            ),
          );
        }
        break;
      }

      case "email":
        if (
          typeof value !== "string" ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)
        ) {
          errors.push(`${rule.field} must be a valid email address`);
        }
        break;

      case "url":
        try {
          new URL(value as string);
        } catch {
          errors.push(`${rule.field} must be a valid URL`);
        }
        break;

      case "json":
        if (typeof value === "string") {
          try {
            JSON.parse(value);
          } catch {
            errors.push(`${rule.field} must be valid JSON`);
          }
        } else if (typeof value !== "object") {
          errors.push(`${rule.field} must be a valid JSON object`);
        }
        break;
    }
    return { isValid: errors.length === 0, errors, securityEvents };
  }

  /** Sanitize value based on type */
  private sanitizeValue(value: unknown, type: string): unknown {
    if (typeof value !== "string") return value;

    switch (type) {
      case "string":
        return this.sanitizeString(value);
      case "address":
        return value.toLowerCase().startsWith("0x") ? value : `0x${value}`;
      case "hash":
        return value.toLowerCase().startsWith("0x") ? value : `0x${value}`;
      default:
        return value;
    }
  }

  /** Sanitize string input */
  private sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove angle brackets
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim();
  }

  /** Perform security checks */
  private performSecurityChecks(
    value: unknown,
    field: string,
  ): {
    events: ISecurityEvent[];
    blocked: boolean;
  } {
    const events: ISecurityEvent[] = [];
    let blocked = false;

    if (typeof value !== "string") {
      return { events, blocked };
    }

    // XSS detection
    if (this.config.enableXSSProtection && this.detectXSS(value)) {
      events.push(
        this.createSecurityEvent(
          SecurityEventType.XSS_ATTEMPT,
          "HIGH",
          `XSS attempt detected in ${field}`,
          "XSS_PROTECTION",
          { field, value },
        ),
      );
      blocked = true;
    }

    // SQL injection detection
    if (
      this.config.enableInjectionProtection &&
      this.detectSQLInjection(value)
    ) {
      events.push(
        this.createSecurityEvent(
          SecurityEventType.INJECTION_ATTEMPT,
          "HIGH",
          `SQL injection attempt detected in ${field}`,
          "INJECTION_PROTECTION",
          { field, value },
        ),
      );
      blocked = true;
    }

    return { events, blocked };
  }

  /** Detect XSS attempts */
  private detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  }

  /** Detect SQL injection attempts */
  private detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)|(\bSELECT\b.*\bFROM\b)|(\bINSERT\b.*\bINTO\b)|(\bDELETE\b.*\bFROM\b)|(\bUPDATE\b.*\bSET\b)/gi,
      /(\bDROP\b.*\bTABLE\b)|(\bCREATE\b.*\bTABLE\b)|(\bALTER\b.*\bTABLE\b)/gi,
      /(\bEXEC\b.*\bSP_\b)|(\bEXECUTE\b.*\bSP_\b)/gi,
      /('.*'.*OR.*'.*')|(".*".*OR.*".*")/gi,
      /(;.*--)|(--.*)|(\/\*.*\*\/)/gi,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  /** Validate address checksum */
  private validateAddressChecksum(address: string): boolean {
    // Basic checksum validation (simplified)
    // In a full implementation, this would use proper EIP-55 checksum validation
    const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

    // If all lowercase or all uppercase, checksum is not used
    if (
      cleanAddress === cleanAddress.toLowerCase() ||
      cleanAddress === cleanAddress.toUpperCase()
    ) {
      return true;
    }

    // For mixed case, we would need to validate against the proper checksum
    // This is a simplified version
    return true;
  }

  /** Create security event */
  private createSecurityEvent(
    type: SecurityEventType,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    message: string,
    source: string,
    data: ISecurityEventData,
    blocked: boolean = false,
  ): ISecurityEvent {
    return {
      type,
      severity,
      message,
      source,
      data,
      timestamp: Date.now(),
      blocked,
    };
  }

  /** Log security event */
  private logSecurityEvent(event: ISecurityEvent): void {
    // Add to events array
    this.securityEvents.push(event);

    // Limit array size
    if (this.securityEvents.length > this.config.maxEventHistory) {
      this.securityEvents.shift();
    }

    // Cache the event
    this.cache.set(`security_event:${event.timestamp}`, event);

    // Log to console if enabled
    if (this.config.logSecurityEvents) {
      console.warn("[Security]", event.severity, event.message, event.data);
    }

    // Notify listeners
    if (this.onSecurityEvent) {
      this.onSecurityEvent(event);
    }

    // Check for suspicious activity patterns
    this.checkSuspiciousActivity(event.source);
  }

  /** Check for suspicious activity patterns */
  private checkSuspiciousActivity(source: string): void {
    const recentEvents = this.securityEvents.filter(
      (event) =>
        event.source === source &&
        event.timestamp > Date.now() - 300000 && // Last 5 minutes
        event.severity === "HIGH",
    );

    if (recentEvents.length >= 3 && this.onSuspiciousActivity) {
      this.onSuspiciousActivity(source, recentEvents);
    }
  }

  /** Start cleanup timer */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredData();
    }, 600000); // Clean up every 10 minutes
  }

  /** Clean up expired data */
  private cleanupExpiredData(): void {
    const now = Date.now();

    // Clean up rate limit store
    this.rateLimitStore.forEach((data, key) => {
      if (now >= data.resetTime && !data.blocked) {
        this.rateLimitStore.delete(key);
      }
    });

    // Clean up old security events
    const cutoffTime = now - 24 * 60 * 60 * 1000; // 24 hours
    this.securityEvents = this.securityEvents.filter(
      (event) => event.timestamp > cutoffTime,
    );
  }

  /** Dispose of the service */
  dispose(): void {
    this.cache.clear();
    this.securityEvents = [];
    this.rateLimitStore.clear();

    console.log("[Security] Disposed successfully");
  }

  /** Static factory method for DSKY configuration */
  static createForDSKY(): SecurityService {
    return new SecurityService({
      enableRateLimit: true,
      enableInputValidation: true,
      enableXSSProtection: true,
      enableInjectionProtection: true,
      enableWalletValidation: true,
      rateLimitConfig: {
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        blockDurationMs: 300000, // 5 minutes
        skipSuccessfulRequests: false,
      },
      maxEventHistory: 1000,
      logSecurityEvents: true,
    });
  }

  /** Create DSKY validation rules */
  static createDSKYValidationRules(): IValidationRule[] {
    return [
      {
        field: "verb",
        type: "string",
        required: true,
        pattern: /^[0-9]{1,2}$/,
        minLength: 1,
        maxLength: 2,
      },
      {
        field: "noun",
        type: "string",
        required: true,
        pattern: /^[0-9]{1,2}$/,
        minLength: 1,
        maxLength: 2,
      },
      {
        field: "address",
        type: "address",
        required: false,
      },
      {
        field: "amount",
        type: "number",
        required: false,
        min: 0,
      },
      {
        field: "symbol",
        type: "string",
        required: false,
        pattern: /^[A-Z]{2,10}$/,
        maxLength: 10,
      },
    ];
  }
}

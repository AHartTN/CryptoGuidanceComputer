/**
 * @fileoverview Enhanced Error Handling System
 * @description Comprehensive error management, logging, and recovery
 */

import { CacheService, CacheManager } from "../cache/CacheService";
import type { IErrorContext } from "../../interfaces/IErrorContext";

export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum ErrorCategory {
  NETWORK = "NETWORK",
  WALLET = "WALLET",
  BLOCKCHAIN = "BLOCKCHAIN",
  USER_INPUT = "USER_INPUT",
  SYSTEM = "SYSTEM",
  API = "API",
  CACHE = "CACHE",
}

export interface IErrorDetails {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  stack?: string;
  context?: IErrorContext;
  source?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  retryCount?: number;
  recovered?: boolean;
}

export interface IErrorRecoveryStrategy {
  category: ErrorCategory;
  severity: ErrorSeverity;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  recoveryActions: Array<() => Promise<boolean>>;
  userMessage: string;
  escalationThreshold: number;
}

export interface IErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recentErrors: IErrorDetails[];
  recoveryRate: number;
  averageResolutionTime: number;
}

/**
 * Enhanced error handling service with automatic recovery
 */
export class ErrorHandlingService {
  private errorLog: IErrorDetails[] = [];
  private recoveryStrategies = new Map<string, IErrorRecoveryStrategy>();
  private cache: CacheService;
  private errorListeners: Array<(error: IErrorDetails) => void> = [];

  private readonly maxLogSize = 1000;
  private sessionId: string;

  constructor() {
    this.cache = CacheManager.getCache("error-handling", {
      maxSize: 500,
      defaultTTL: 3600000, // 1 hour
    });

    this.sessionId = this.generateSessionId();
    this.initializeRecoveryStrategies();
    this.setupGlobalErrorHandling();
  }

  /**
   * Report an error with automatic categorization and recovery
   */
  async reportError(
    error: Error | string,
    context?: IErrorContext,
    source?: string,
  ): Promise<IErrorDetails> {
    const errorDetails: IErrorDetails = {
      id: this.generateErrorId(),
      message: error instanceof Error ? error.message : error,
      category: this.categorizeError(error, context),
      severity: this.assessSeverity(error, context),
      timestamp: Date.now(),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      source,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      sessionId: this.sessionId,
      retryCount: 0,
      recovered: false,
    };

    // Add to log
    this.addToLog(errorDetails);

    // Cache for quick access
    this.cache.set(`error_${errorDetails.id}`, errorDetails, {
      ttl: 3600000, // 1 hour
      tags: ["errors", errorDetails.category, errorDetails.severity],
    });

    // Notify listeners
    this.notifyListeners(errorDetails);

    // Attempt recovery
    if (errorDetails.severity !== ErrorSeverity.LOW) {
      await this.attemptRecovery(errorDetails);
    }

    return errorDetails;
  }

  /**
   * Attempt automatic error recovery
   */
  private async attemptRecovery(errorDetails: IErrorDetails): Promise<boolean> {
    const strategyKey = `${errorDetails.category}_${errorDetails.severity}`;
    const strategy = this.recoveryStrategies.get(strategyKey);

    if (!strategy) {
      console.warn(`No recovery strategy for ${strategyKey}`);
      return false;
    }

    let recovered = false;
    let attempts = 0;
    let delay = strategy.retryDelay;

    while (attempts < strategy.maxRetries && !recovered) {
      try {
        // Wait before retry
        if (attempts > 0) {
          await this.delay(delay);
          delay *= strategy.backoffMultiplier;
        }

        // Execute recovery actions
        for (const action of strategy.recoveryActions) {
          try {
            const actionResult = await action();
            if (actionResult) {
              recovered = true;
              break;
            }
          } catch (actionError) {
            console.error("Recovery action failed:", actionError);
          }
        }

        attempts++;
        errorDetails.retryCount = attempts;
      } catch (recoveryError) {
        console.error("Recovery attempt failed:", recoveryError);
        attempts++;
      }
    }

    errorDetails.recovered = recovered;

    // Update cached error
    this.cache.set(`error_${errorDetails.id}`, errorDetails);

    // Escalate if recovery failed
    if (!recovered && attempts >= strategy.escalationThreshold) {
      await this.escalateError(errorDetails, strategy);
    }

    return recovered;
  }

  /**
   * Escalate unrecoverable errors
   */
  private async escalateError(
    errorDetails: IErrorDetails,
    strategy: IErrorRecoveryStrategy,
  ): Promise<void> {
    console.error("Error escalated:", errorDetails);

    // Update severity to critical
    errorDetails.severity = ErrorSeverity.CRITICAL;

    // Notify user with appropriate message
    if (typeof window !== "undefined") {
      this.showUserNotification(strategy.userMessage, "error");
    }

    // In a real application, this would:
    // - Send to error monitoring service (Sentry, Rollbar, etc.)
    // - Alert development team
    // - Log to external system
    // - Trigger fallback procedures
  }

  /**
   * Get error metrics and statistics
   */
  getMetrics(): IErrorMetrics {
    const totalErrors = this.errorLog.length;
    const errorsByCategory = {} as Record<ErrorCategory, number>;
    const errorsBySeverity = {} as Record<ErrorSeverity, number>;

    // Initialize counters
    Object.values(ErrorCategory).forEach((cat) => (errorsByCategory[cat] = 0));
    Object.values(ErrorSeverity).forEach((sev) => (errorsBySeverity[sev] = 0));

    // Count errors
    this.errorLog.forEach((error) => {
      errorsByCategory[error.category]++;
      errorsBySeverity[error.severity]++;
    });

    // Calculate recovery rate
    const recoveredErrors = this.errorLog.filter((e) => e.recovered).length;
    const recoveryRate = totalErrors > 0 ? recoveredErrors / totalErrors : 0;

    // Recent errors (last 10)
    const recentErrors = this.errorLog.slice(-10);

    // Average resolution time (for recovered errors)
    const recoveredWithTime = this.errorLog.filter(
      (e) => e.recovered && e.retryCount,
    );
    const averageResolutionTime =
      recoveredWithTime.length > 0
        ? recoveredWithTime.reduce((sum, e) => sum + (e.retryCount || 0), 0) /
          recoveredWithTime.length
        : 0;

    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      recentErrors,
      recoveryRate,
      averageResolutionTime,
    };
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog = [];
    this.cache.invalidateByTag("errors");
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: (error: IErrorDetails) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  removeErrorListener(listener: (error: IErrorDetails) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): IErrorDetails[] {
    return this.errorLog.filter((e) => e.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): IErrorDetails[] {
    return this.errorLog.filter((e) => e.severity === severity);
  }

  // Private methods

  private initializeRecoveryStrategies(): void {
    // Network error recovery
    this.recoveryStrategies.set(
      `${ErrorCategory.NETWORK}_${ErrorSeverity.MEDIUM}`,
      {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
        recoveryActions: [
          () => this.checkNetworkConnection(),
          () => this.retryNetworkRequest(),
          () => this.useAlternativeEndpoint(),
        ],
        userMessage: "Network connection issue. Attempting to reconnect...",
        escalationThreshold: 3,
      },
    );

    // Wallet error recovery
    this.recoveryStrategies.set(
      `${ErrorCategory.WALLET}_${ErrorSeverity.HIGH}`,
      {
        category: ErrorCategory.WALLET,
        severity: ErrorSeverity.HIGH,
        maxRetries: 2,
        retryDelay: 2000,
        backoffMultiplier: 1.5,
        recoveryActions: [
          () => this.refreshWalletConnection(),
          () => this.requestWalletReconnection(),
        ],
        userMessage: "Wallet connection lost. Please check MetaMask...",
        escalationThreshold: 2,
      },
    );

    // Blockchain error recovery
    this.recoveryStrategies.set(
      `${ErrorCategory.BLOCKCHAIN}_${ErrorSeverity.MEDIUM}`,
      {
        category: ErrorCategory.BLOCKCHAIN,
        severity: ErrorSeverity.MEDIUM,
        maxRetries: 5,
        retryDelay: 3000,
        backoffMultiplier: 1.2,
        recoveryActions: [
          () => this.retryBlockchainOperation(),
          () => this.adjustGasPrice(),
          () => this.useAlternativeRPC(),
        ],
        userMessage:
          "Blockchain operation failed. Retrying with adjusted parameters...",
        escalationThreshold: 3,
      },
    );

    // API error recovery
    this.recoveryStrategies.set(
      `${ErrorCategory.API}_${ErrorSeverity.MEDIUM}`,
      {
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        maxRetries: 4,
        retryDelay: 1500,
        backoffMultiplier: 1.3,
        recoveryActions: [
          () => this.retryAPICall(),
          () => this.useBackupAPI(),
          () => this.useCachedData(),
        ],
        userMessage:
          "API service temporarily unavailable. Using cached data...",
        escalationThreshold: 3,
      },
    );
  }

  private categorizeError(
    error: Error | string,
    _context?: IErrorContext,
  ): ErrorCategory {
    const message = error instanceof Error ? error.message : error;
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("network") ||
      lowerMessage.includes("fetch") ||
      lowerMessage.includes("timeout")
    ) {
      return ErrorCategory.NETWORK;
    }
    if (
      lowerMessage.includes("wallet") ||
      lowerMessage.includes("metamask") ||
      lowerMessage.includes("account")
    ) {
      return ErrorCategory.WALLET;
    }
    if (
      lowerMessage.includes("gas") ||
      lowerMessage.includes("transaction") ||
      lowerMessage.includes("blockchain")
    ) {
      return ErrorCategory.BLOCKCHAIN;
    }
    if (
      lowerMessage.includes("api") ||
      lowerMessage.includes("endpoint") ||
      lowerMessage.includes("service")
    ) {
      return ErrorCategory.API;
    }
    if (
      lowerMessage.includes("input") ||
      lowerMessage.includes("validation") ||
      lowerMessage.includes("invalid")
    ) {
      return ErrorCategory.USER_INPUT;
    }
    if (lowerMessage.includes("cache")) {
      return ErrorCategory.CACHE;
    }

    return ErrorCategory.SYSTEM;
  }

  private assessSeverity(
    error: Error | string,
    _context?: IErrorContext,
  ): ErrorSeverity {
    const message = error instanceof Error ? error.message : error;
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("critical") ||
      lowerMessage.includes("fatal") ||
      lowerMessage.includes("crash")
    ) {
      return ErrorSeverity.CRITICAL;
    }
    if (
      lowerMessage.includes("connection") ||
      lowerMessage.includes("authorization") ||
      lowerMessage.includes("authentication")
    ) {
      return ErrorSeverity.HIGH;
    }
    if (
      lowerMessage.includes("timeout") ||
      lowerMessage.includes("retry") ||
      lowerMessage.includes("temporary")
    ) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  private addToLog(errorDetails: IErrorDetails): void {
    this.errorLog.push(errorDetails);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  private notifyListeners(errorDetails: IErrorDetails): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(errorDetails);
      } catch (listenerError) {
        console.error("Error listener failed:", listenerError);
      }
    });
  }

  private setupGlobalErrorHandling(): void {
    if (typeof window !== "undefined") {
      // Catch unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.reportError(
          event.reason,
          { type: "unhandledrejection" },
          "global",
        );
      });

      // Catch JavaScript errors
      window.addEventListener("error", (event) => {
        this.reportError(
          event.error || event.message,
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
          "global",
        );
      });
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private showUserNotification(
    message: string,
    type: "error" | "warning" | "info",
  ): void {
    // In a real application, this would show a toast or modal
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  // Recovery action implementations
  private async checkNetworkConnection(): Promise<boolean> {
    try {
      const response = await fetch("/api/health", { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async retryNetworkRequest(): Promise<boolean> {
    // Implementation would retry the last failed network request
    return Math.random() > 0.5; // Simulate success/failure
  }

  private async useAlternativeEndpoint(): Promise<boolean> {
    // Implementation would switch to backup endpoint
    return Math.random() > 0.3; // Simulate success
  }

  private async refreshWalletConnection(): Promise<boolean> {
    // Implementation would refresh wallet connection
    return Math.random() > 0.4; // Simulate success
  }

  private async requestWalletReconnection(): Promise<boolean> {
    // Implementation would prompt user to reconnect wallet
    return Math.random() > 0.6; // Simulate success
  }

  private async retryBlockchainOperation(): Promise<boolean> {
    // Implementation would retry blockchain operation
    return Math.random() > 0.5; // Simulate success
  }

  private async adjustGasPrice(): Promise<boolean> {
    // Implementation would adjust gas price and retry
    return Math.random() > 0.3; // Simulate success
  }

  private async useAlternativeRPC(): Promise<boolean> {
    // Implementation would switch to backup RPC
    return Math.random() > 0.4; // Simulate success
  }

  private async retryAPICall(): Promise<boolean> {
    // Implementation would retry API call
    return Math.random() > 0.5; // Simulate success
  }

  private async useBackupAPI(): Promise<boolean> {
    // Implementation would use backup API
    return Math.random() > 0.3; // Simulate success
  }

  private async useCachedData(): Promise<boolean> {
    // Implementation would use cached data as fallback
    return true; // Cache is usually available
  }
}

// Global error handling service instance
export const globalErrorHandler = new ErrorHandlingService();

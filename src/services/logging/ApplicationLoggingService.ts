// Apollo DSKY - Application Logging Service
// Comprehensive logging system with multiple levels and output targets

import { CacheService, CacheStrategy } from "../cache/CacheService";
import type { ILogMetadata } from "../../interfaces/ILogMetadata";
import { addLogToDb } from "../../utils/logDb";

/** Log Levels */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

/** Log Categories */
export enum LogCategory {
  SYSTEM = "SYSTEM",
  WEB3 = "WEB3",
  DSKY = "DSKY",
  REALTIME = "REALTIME",
  SECURITY = "SECURITY",
  PERFORMANCE = "PERFORMANCE",
  UI = "UI",
  API = "API",
  CACHE = "CACHE",
  BLOCKCHAIN = "BLOCKCHAIN",
}

/** Log Entry */
export interface ILogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  component?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  metadata?: ILogMetadata;
  stack?: string;
  correlationId?: string;
}

/** Log Output Target */
export interface ILogTarget {
  name: string;
  minLevel: LogLevel;
  categories: LogCategory[];
  format: (entry: ILogEntry) => string;
  output: (formatted: string, entry: ILogEntry) => void;
}

/** Logging Configuration */
export interface ILoggingConfig {
  minLevel: LogLevel;
  enabledCategories: LogCategory[];
  enableConsoleOutput: boolean;
  enableFileOutput: boolean;
  enableRemoteLogging: boolean;
  maxLogEntries: number;
  bufferSize: number;
  flushInterval: number;
  logFilePath?: string;
  remoteEndpoint?: string;
  correlationIdEnabled: boolean;
  stackTraceEnabled: boolean;
}

/** Log Statistics */
export interface ILogStats {
  totalEntries: number;
  entriesByLevel: { [key in LogLevel]?: number };
  entriesByCategory: { [key in LogCategory]?: number };
  recentErrors: ILogEntry[];
  avgLogsPerMinute: number;
  bufferStatus: {
    current: number;
    max: number;
    percentage: number;
  };
}

/** Application Logging Service */
export class ApplicationLoggingService {
  private cache: CacheService;
  private logBuffer: ILogEntry[] = [];
  private logTargets: Map<string, ILogTarget> = new Map();
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;
  private config: ILoggingConfig;

  // Event callbacks
  private onLogEntry?: (entry: ILogEntry) => void;
  private onError?: (entry: ILogEntry) => void;
  private onCritical?: (entry: ILogEntry) => void;
  constructor(config?: Partial<ILoggingConfig>) {
    this.cache = new CacheService({
      defaultTTL: 3600000, // 1 hour
      maxSize: 10000,
      strategy: CacheStrategy.LRU,
      enableMetrics: true,
    });

    this.config = {
      minLevel: LogLevel.INFO,
      enabledCategories: Object.values(LogCategory),
      enableConsoleOutput: true,
      enableFileOutput: false,
      enableRemoteLogging: false,
      maxLogEntries: 10000,
      bufferSize: 1000,
      flushInterval: 60000, // 1 minute
      correlationIdEnabled: true,
      stackTraceEnabled: true,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  /** Initialize logging service */
  private initialize(): void {
    console.log("[ApplicationLogging] Initializing service...");

    this.setupDefaultTargets();
    this.startFlushTimer();
    this.setupErrorHandling();
  }

  /** Log debug message */
  debug(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    metadata?: ILogMetadata,
  ): void {
    this.log(LogLevel.DEBUG, category, message, metadata);
  }

  /** Log info message */
  info(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    metadata?: ILogMetadata,
  ): void {
    this.log(LogLevel.INFO, category, message, metadata);
  }

  /** Log warning message */
  warn(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    metadata?: ILogMetadata,
  ): void {
    this.log(LogLevel.WARN, category, message, metadata);
  }

  /** Log error message */
  error(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    error?: Error,
    metadata?: ILogMetadata,
  ): void {
    const logMetadata = { ...metadata };

    if (error) {
      logMetadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.log(LogLevel.ERROR, category, message, logMetadata, error?.stack);
  }

  /** Log critical message */
  critical(
    message: string,
    category: LogCategory = LogCategory.SYSTEM,
    error?: Error,
    metadata?: ILogMetadata,
  ): void {
    const logMetadata = { ...metadata };

    if (error) {
      logMetadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.log(LogLevel.CRITICAL, category, message, logMetadata, error?.stack);
  }

  /** Log with specific component and operation */
  logOperation(
    level: LogLevel,
    category: LogCategory,
    message: string,
    component: string,
    operation: string,
    metadata?: ILogMetadata,
  ): void {
    this.log(level, category, message, { ...metadata, component, operation });
  }

  /** Log performance metric */
  logPerformance(
    operation: string,
    duration: number,
    component?: string,
    metadata?: ILogMetadata,
  ): void {
    this.log(
      LogLevel.INFO,
      LogCategory.PERFORMANCE,
      `Operation '${operation}' completed in ${duration}ms`,
      { ...metadata, operation, duration, component },
    );
  }

  /** Log security event */
  logSecurity(
    message: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    metadata?: ILogMetadata,
  ): void {
    const level =
      severity === "CRITICAL"
        ? LogLevel.CRITICAL
        : severity === "HIGH"
          ? LogLevel.ERROR
          : severity === "MEDIUM"
            ? LogLevel.WARN
            : LogLevel.INFO;

    this.log(level, LogCategory.SECURITY, message, { ...metadata, severity });
  }

  /** Log Web3 transaction */
  logTransaction(
    txHash: string,
    status: "PENDING" | "CONFIRMED" | "FAILED",
    metadata?: ILogMetadata,
  ): void {
    const level = status === "FAILED" ? LogLevel.ERROR : LogLevel.INFO;

    this.log(level, LogCategory.WEB3, `Transaction ${txHash} - ${status}`, {
      ...metadata,
      txHash,
      status,
    });
  }

  /** Log DSKY command */
  logDSKYCommand(
    verb: string,
    noun: string,
    success: boolean,
    result?: unknown,
    error?: string,
  ): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const message = `DSKY Command V${verb}N${noun} - ${success ? "SUCCESS" : "FAILED"}`;

    this.log(level, LogCategory.DSKY, message, {
      verb,
      noun,
      success,
      result,
      error,
    });
  }

  /** Add custom log target */
  addLogTarget(target: ILogTarget): void {
    this.logTargets.set(target.name, target);
    console.log(`[ApplicationLogging] Added log target: ${target.name}`);
  }

  /** Remove log target */
  removeLogTarget(name: string): void {
    if (this.logTargets.delete(name)) {
      console.log(`[ApplicationLogging] Removed log target: ${name}`);
    }
  }

  /** Get log entries */
  getLogs(
    level?: LogLevel,
    category?: LogCategory,
    limit?: number,
    timeRange?: number,
  ): ILogEntry[] {
    let logs = [...this.logBuffer];

    // Filter by level
    if (level !== undefined) {
      logs = logs.filter((log) => log.level >= level);
    }

    // Filter by category
    if (category !== undefined) {
      logs = logs.filter((log) => log.category === category);
    }

    // Filter by time range
    if (timeRange !== undefined) {
      const cutoff = Date.now() - timeRange;
      logs = logs.filter((log) => log.timestamp >= cutoff);
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => b.timestamp - a.timestamp);

    // Limit results
    if (limit !== undefined) {
      logs = logs.slice(0, limit);
    }

    return logs;
  }

  /** Get log statistics */
  getStats(): ILogStats {
    const entriesByLevel: { [key in LogLevel]?: number } = {};
    const entriesByCategory: { [key in LogCategory]?: number } = {};

    this.logBuffer.forEach((entry) => {
      entriesByLevel[entry.level] = (entriesByLevel[entry.level] || 0) + 1;
      entriesByCategory[entry.category] =
        (entriesByCategory[entry.category] || 0) + 1;
    });

    const recentErrors = this.logBuffer
      .filter((entry) => entry.level >= LogLevel.ERROR)
      .slice(-10)
      .reverse();

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentLogs = this.logBuffer.filter(
      (entry) => entry.timestamp >= oneMinuteAgo,
    );
    const avgLogsPerMinute = recentLogs.length;

    return {
      totalEntries: this.logBuffer.length,
      entriesByLevel,
      entriesByCategory,
      recentErrors,
      avgLogsPerMinute,
      bufferStatus: {
        current: this.logBuffer.length,
        max: this.config.maxLogEntries,
        percentage: (this.logBuffer.length / this.config.maxLogEntries) * 100,
      },
    };
  }

  /** Export logs */
  exportLogs(format: "JSON" | "CSV" | "TEXT" = "JSON"): string {
    switch (format) {
      case "JSON":
        return JSON.stringify(this.logBuffer, null, 2);
      case "CSV":
        return this.logsToCSV();
      case "TEXT":
        return this.logsToText();
      default:
        return JSON.stringify(this.logBuffer, null, 2);
    }
  }

  /** Clear logs */
  clearLogs(): void {
    this.logBuffer = [];
    this.cache.clear();
    console.log("[ApplicationLogging] Cleared all logs");
  }

  /** Set event callbacks */
  setEventCallbacks(callbacks: {
    onLogEntry?: (entry: ILogEntry) => void;
    onError?: (entry: ILogEntry) => void;
    onCritical?: (entry: ILogEntry) => void;
  }): void {
    this.onLogEntry = callbacks.onLogEntry;
    this.onError = callbacks.onError;
    this.onCritical = callbacks.onCritical;
  }

  /** Flush logs to targets */
  flush(): void {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];

    for (const target of this.logTargets.values()) {
      const relevantLogs = logsToFlush.filter(
        (log) =>
          log.level >= target.minLevel &&
          target.categories.includes(log.category),
      );

      for (const log of relevantLogs) {
        try {
          const formatted = target.format(log);
          target.output(formatted, log);
        } catch (error) {
          console.error(
            `[ApplicationLogging] Error in target ${target.name}:`,
            error,
          );
        }
      }
    }

    // Trim buffer if needed
    if (this.logBuffer.length > this.config.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogEntries);
    }
  }

  /** Dispose of the service */
  dispose(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flush();
    this.logBuffer = [];
    this.logTargets.clear();
    this.cache.clear();

    console.log("[ApplicationLogging] Disposed successfully");
  }

  /** Core logging method */
  private async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: ILogMetadata,
    stack?: string,
  ): Promise<void> {
    // Check if logging is enabled for this level and category
    if (
      level < this.config.minLevel ||
      !this.config.enabledCategories.includes(category)
    ) {
      return;
    }

    const entry: ILogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      category,
      message,
      sessionId: this.sessionId,
      metadata,
      stack,
      correlationId: this.config.correlationIdEnabled
        ? this.generateCorrelationId()
        : undefined,
    };

    // Add to buffer
    this.logBuffer.push(entry);

    // Cache recent entry
    this.cache.set(`log:${entry.id}`, entry);

    // Write to IndexedDB for client-side log viewer
    addLogToDb(entry).catch(() => {});

    // Trigger callbacks
    if (this.onLogEntry) {
      this.onLogEntry(entry);
    }

    if (level >= LogLevel.ERROR && this.onError) {
      this.onError(entry);
    }

    if (level === LogLevel.CRITICAL && this.onCritical) {
      this.onCritical(entry);
    }

    // Immediate flush for critical messages
    if (level === LogLevel.CRITICAL) {
      this.flush();
    }
  }

  /** Setup default log targets */
  private setupDefaultTargets(): void {
    // Console target
    if (this.config.enableConsoleOutput) {
      this.addLogTarget({
        name: "console",
        minLevel: LogLevel.WARN, // Only show warnings and errors in the console
        categories: Object.values(LogCategory),
        format: this.consoleFormat,
        output: (formatted, entry) => {
          const method =
            entry.level >= LogLevel.ERROR
              ? "error"
              : entry.level >= LogLevel.WARN
                ? "warn"
                : "log";
          console[method](formatted);
        },
      });
    }

    // File target (if enabled)
    if (this.config.enableFileOutput && this.config.logFilePath) {
      this.addLogTarget({
        name: "file",
        minLevel: LogLevel.INFO,
        categories: Object.values(LogCategory),
        format: this.jsonFormat,
        output: (formatted) => {
          // In a real implementation, this would write to a file
          console.log(`[FILE] ${formatted}`);
        },
      });
    }

    // Remote target (if enabled)
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.addLogTarget({
        name: "remote",
        minLevel: LogLevel.WARN,
        categories: Object.values(LogCategory),
        format: this.jsonFormat,
        output: (formatted) => {
          // In a real implementation, this would send to a remote endpoint
          console.log(`[REMOTE] ${formatted}`);
        },
      });
    }
  }

  /** Start flush timer */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /** Setup global error handling */
  private setupErrorHandling(): void {
    // Catch unhandled errors
    window.addEventListener("error", (event) => {
      this.error(
        `Unhandled error: ${event.message}`,
        LogCategory.SYSTEM,
        event.error,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      );
    });

    // Catch unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.error(
        `Unhandled promise rejection: ${event.reason}`,
        LogCategory.SYSTEM,
        event.reason instanceof Error ? event.reason : undefined,
        { reason: event.reason },
      );
    });
  }

  /** Console log format */
  private consoleFormat = (entry: ILogEntry): string => {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = LogLevel[entry.level];
    const prefix = `[${timestamp}] ${level} [${entry.category}]`;

    if (entry.metadata || entry.stack) {
      return `${prefix} ${entry.message}\n${JSON.stringify(entry.metadata || {}, null, 2)}`;
    }

    return `${prefix} ${entry.message}`;
  };

  /** JSON log format */
  private jsonFormat = (entry: ILogEntry): string => {
    return JSON.stringify(entry);
  };

  /** Convert logs to CSV */
  private logsToCSV(): string {
    const headers = [
      "timestamp",
      "level",
      "category",
      "message",
      "component",
      "operation",
    ];
    const rows = [headers.join(",")];

    this.logBuffer.forEach((entry) => {
      const row = [
        new Date(entry.timestamp).toISOString(),
        LogLevel[entry.level],
        entry.category,
        `"${entry.message.replace(/"/g, '""')}"`,
        entry.component || "",
        entry.operation || "",
      ];
      rows.push(row.join(","));
    });

    return rows.join("\n");
  }

  /** Convert logs to text */
  private logsToText(): string {
    return this.logBuffer.map((entry) => this.consoleFormat(entry)).join("\n");
  }

  /** Generate session ID */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /** Generate log ID */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /** Generate correlation ID */
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /** Create service instance for DSKY */
  static createForDSKY(): ApplicationLoggingService {
    return new ApplicationLoggingService({
      minLevel: LogLevel.INFO,
      enabledCategories: [
        LogCategory.SYSTEM,
        LogCategory.DSKY,
        LogCategory.WEB3,
        LogCategory.SECURITY,
        LogCategory.PERFORMANCE,
        LogCategory.REALTIME,
      ],
      maxLogEntries: 5000,
      bufferSize: 500,
      enableConsoleOutput: true,
      enableFileOutput: false,
      correlationIdEnabled: true,
    });
  }
}

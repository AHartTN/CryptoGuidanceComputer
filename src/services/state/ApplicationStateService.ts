import { CacheService, CacheStrategy } from "../cache/CacheService";
import type { IStateValue } from "../../interfaces/IStateValue";

/** State Change Event */
export interface IStateChangeEvent {
  key: string;
  oldValue: IStateValue;
  newValue: IStateValue;
  timestamp: number;
  source: string;
}

/** State Subscription */
export interface IStateSubscription {
  id: string;
  key: string;
  callback: (value: IStateValue, event: IStateChangeEvent) => void;
  options: {
    immediate?: boolean;
    deep?: boolean;
    filter?: (value: IStateValue) => boolean;
  };
}

/** State Persistence Options */
export interface IPersistenceOptions {
  enabled: boolean;
  storage: "localStorage" | "sessionStorage" | "indexedDB" | "memory";
  key: string;
  version: number;
  migrate?: (oldVersion: number, data: IStateValue) => IStateValue;
}

/** State Validation Rule */
export interface IValidationRule {
  key: string;
  validator: (value: IStateValue) => boolean | string;
  message?: string;
}

/** State Configuration */
export interface IStateConfig {
  persistence: IPersistenceOptions;
  validation: IValidationRule[];
  enableHistory: boolean;
  historyLimit: number;
  enableSync: boolean;
  syncInterval: number;
  namespace: string;
}

/** State History Entry */
export interface IStateHistoryEntry {
  timestamp: number;
  key: string;
  value: IStateValue;
  operation: "SET" | "DELETE" | "CLEAR";
  source: string;
}

export class ApplicationStateService {
  private cache: CacheService;
  private state: Map<string, IStateValue> = new Map();
  private subscriptions: Map<string, IStateSubscription> = new Map();
  private history: IStateHistoryEntry[] = [];
  private syncTimer?: NodeJS.Timeout;
  private config: IStateConfig;

  private onStateChange?: (event: IStateChangeEvent) => void;
  private onError?: (error: Error, operation: string) => void;
  private onSync?: (syncData: Record<string, IStateValue>) => void;
  constructor(config?: Partial<IStateConfig>) {
    this.cache = new CacheService({
      defaultTTL: 3600000,
      maxSize: 10000,
      strategy: CacheStrategy.LRU,
      enableMetrics: true,
    });

    this.config = {
      persistence: {
        enabled: true,
        storage: "localStorage",
        key: "dsky_app_state",
        version: 1,
      },
      validation: [],
      enableHistory: true,
      historyLimit: 1000,
      enableSync: false,
      syncInterval: 30000,
      namespace: "dsky",
      ...config,
    };

    this.initialize();
  }

  private initialize(): void {
    console.log("[ApplicationState] Initializing service...");

    this.loadPersistedState();

    if (this.config.enableSync) {
      this.startSync();
    }

    this.setupCleanup();
  }

  set(key: string, value: IStateValue, source: string = "USER"): void {
    const validationResult = this.validateValue(key, value);
    if (validationResult !== true) {
      const error = new Error(
        `State validation failed for key '${key}': ${validationResult}`,
      );
      this.handleError(error, "SET");
      return;
    }

    const oldValue = this.state.get(key);

    this.state.set(key, value);

    this.cache.set(`state:${key}`, value);

    if (this.config.enableHistory) {
      this.addToHistory(key, value, "SET", source);
    }

    const event: IStateChangeEvent = {
      key,
      oldValue,
      newValue: value,
      timestamp: Date.now(),
      source,
    };

    this.notifySubscribers(key, value, event);

    if (this.onStateChange) {
      this.onStateChange(event);
    }

    this.persistState();

    console.log(`[ApplicationState] Set ${key}:`, value);
  }
  get<T = IStateValue>(key: string, defaultValue?: T): T {
    const value = this.state.get(key);
    if (value !== undefined && value !== null) {
      return value as T;
    }
    return defaultValue as T;
  }

  has(key: string): boolean {
    return this.state.has(key);
  }

  delete(key: string, source: string = "USER"): boolean {
    if (!this.state.has(key)) return false;

    const oldValue = this.state.get(key);
    this.state.delete(key);

    this.cache.delete(`state:${key}`);

    if (this.config.enableHistory) {
      this.addToHistory(key, null, "DELETE", source);
    }

    const event: IStateChangeEvent = {
      key,
      oldValue,
      newValue: undefined,
      timestamp: Date.now(),
      source,
    };

    this.notifySubscribers(key, undefined, event);

    if (this.onStateChange) {
      this.onStateChange(event);
    }

    this.persistState();

    console.log(`[ApplicationState] Deleted ${key}`);
    return true;
  }

  clear(source: string = "USER"): void {
    const keys = Array.from(this.state.keys());

    this.state.clear();
    this.cache.clear();

    if (this.config.enableHistory) {
      this.addToHistory("*", null, "CLEAR", source);
    }

    keys.forEach((key) => {
      const event: IStateChangeEvent = {
        key,
        oldValue: undefined,
        newValue: undefined,
        timestamp: Date.now(),
        source,
      };

      this.notifySubscribers(key, undefined, event);
    });

    this.persistState();

    console.log("[ApplicationState] Cleared all state");
  }

  getAll(): { [key: string]: IStateValue } {
    const result: { [key: string]: IStateValue } = {};

    this.state.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  }

  setMultiple(
    values: { [key: string]: IStateValue },
    source: string = "USER",
  ): void {
    Object.entries(values).forEach(([key, value]) => {
      this.set(key, value, source);
    });
  }

  subscribe(
    key: string,
    callback: (value: IStateValue, event: IStateChangeEvent) => void,
    options: {
      immediate?: boolean;
      deep?: boolean;
      filter?: (value: IStateValue) => boolean;
    } = {},
  ): string {
    const subscription: IStateSubscription = {
      id: this.generateSubscriptionId(),
      key,
      callback,
      options,
    };

    this.subscriptions.set(subscription.id, subscription);

    if (options.immediate && this.state.has(key)) {
      const value = this.state.get(key);
      if (!options.filter || options.filter(value)) {
        callback(value, {
          key,
          oldValue: undefined,
          newValue: value,
          timestamp: Date.now(),
          source: "SUBSCRIPTION",
        });
      }
    }

    console.log(
      `[ApplicationState] Added subscription ${subscription.id} for key: ${key}`,
    );
    return subscription.id;
  }

  unsubscribe(subscriptionId: string): boolean {
    const removed = this.subscriptions.delete(subscriptionId);
    if (removed) {
      console.log(`[ApplicationState] Removed subscription: ${subscriptionId}`);
    }
    return removed;
  }

  getHistory(key?: string, limit?: number): IStateHistoryEntry[] {
    let history = this.history;

    if (key) {
      history = history.filter(
        (entry) => entry.key === key || entry.key === "*",
      );
    }

    if (limit) {
      history = history.slice(-limit);
    }

    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  clearHistory(): void {
    this.history = [];
    console.log("[ApplicationState] Cleared state history");
  }

  validateValue(key: string, value: IStateValue): boolean | string {
    const rule = this.config.validation.find((r) => r.key === key);
    if (!rule) return true;

    const result = rule.validator(value);
    if (result === true) return true;

    return typeof result === "string"
      ? result
      : rule.message || "Validation failed";
  }

  addValidationRule(rule: IValidationRule): void {
    this.config.validation = this.config.validation.filter(
      (r) => r.key !== rule.key,
    );
    this.config.validation.push(rule);

    console.log(
      `[ApplicationState] Added validation rule for key: ${rule.key}`,
    );
  }

  removeValidationRule(key: string): boolean {
    const initialLength = this.config.validation.length;
    this.config.validation = this.config.validation.filter(
      (r) => r.key !== key,
    );

    const removed = this.config.validation.length < initialLength;
    if (removed) {
      console.log(`[ApplicationState] Removed validation rule for key: ${key}`);
    }

    return removed;
  }

  import(
    data: { [key: string]: IStateValue },
    source: string = "IMPORT",
  ): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, source);
    });

    console.log("[ApplicationState] Imported state data");
  }

  export(): { [key: string]: IStateValue } {
    return this.getAll();
  }

  reset(
    defaults: { [key: string]: IStateValue } = {},
    source: string = "RESET",
  ): void {
    this.clear(source);
    this.import(defaults, source);

    console.log("[ApplicationState] Reset state to defaults");
  }

  getStats(): {
    totalKeys: number;
    totalSubscriptions: number;
    historyEntries: number;
    memoryUsage: number;
    lastChange: number;
    syncStatus: "ENABLED" | "DISABLED" | "SYNCING";
  } {
    const lastHistoryEntry = this.history[this.history.length - 1];

    return {
      totalKeys: this.state.size,
      totalSubscriptions: this.subscriptions.size,
      historyEntries: this.history.length,
      memoryUsage: this.calculateMemoryUsage(),
      lastChange: lastHistoryEntry ? lastHistoryEntry.timestamp : 0,
      syncStatus: this.config.enableSync ? "ENABLED" : "DISABLED",
    };
  }

  setEventCallbacks(callbacks: {
    onStateChange?: (event: IStateChangeEvent) => void;
    onError?: (error: Error, operation: string) => void;
    onSync?: (syncData: Record<string, IStateValue>) => void;
  }): void {
    this.onStateChange = callbacks.onStateChange;
    this.onError = callbacks.onError;
    this.onSync = callbacks.onSync;
  }

  dispose(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.persistState();
    this.subscriptions.clear();
    this.state.clear();
    this.history = [];
    this.cache.clear();

    console.log("[ApplicationState] Disposed successfully");
  }

  private notifySubscribers(
    key: string,
    value: IStateValue,
    event: IStateChangeEvent,
  ): void {
    const relevantSubscriptions = Array.from(
      this.subscriptions.values(),
    ).filter((sub) => sub.key === key || sub.key === "*");

    relevantSubscriptions.forEach((subscription) => {
      try {
        if (
          subscription.options.filter &&
          !subscription.options.filter(value)
        ) {
          return;
        }

        subscription.callback(value, event);
      } catch (error) {
        console.error(
          `[ApplicationState] Error in subscription ${subscription.id}:`,
          error,
        );
        this.handleError(
          error instanceof Error ? error : new Error(String(error)),
          "SUBSCRIPTION",
        );
      }
    });
  }

  private addToHistory(
    key: string,
    value: IStateValue,
    operation: "SET" | "DELETE" | "CLEAR",
    source: string,
  ): void {
    const entry: IStateHistoryEntry = {
      timestamp: Date.now(),
      key,
      value,
      operation,
      source,
    };

    this.history.push(entry);

    if (this.history.length > this.config.historyLimit) {
      this.history = this.history.slice(-this.config.historyLimit);
    }
  }

  private persistState(): void {
    if (!this.config.persistence.enabled) return;

    try {
      const stateData = {
        version: this.config.persistence.version,
        data: this.getAll(),
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(stateData);

      switch (this.config.persistence.storage) {
        case "localStorage":
          localStorage.setItem(this.config.persistence.key, serialized);
          break;
        case "sessionStorage":
          sessionStorage.setItem(this.config.persistence.key, serialized);
          break;
        case "memory":
          this.cache.set("persisted_state", stateData);
          break;
      }
    } catch (error) {
      console.error("[ApplicationState] Failed to persist state:", error);
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
        "PERSIST",
      );
    }
  }

  private loadPersistedState(): void {
    if (!this.config.persistence.enabled) return;

    try {
      let serialized: string | null = null;

      switch (this.config.persistence.storage) {
        case "localStorage":
          serialized = localStorage.getItem(this.config.persistence.key);
          break;
        case "sessionStorage":
          serialized = sessionStorage.getItem(this.config.persistence.key);
          break;
        case "memory": {
          const cached = this.cache.get("persisted_state");
          serialized = cached ? JSON.stringify(cached) : null;
          break;
        }
      }

      if (!serialized) return;

      const stateData = JSON.parse(serialized);

      if (stateData.version !== this.config.persistence.version) {
        if (this.config.persistence.migrate) {
          stateData.data = this.config.persistence.migrate(
            stateData.version,
            stateData.data,
          );
        } else {
          console.warn(
            "[ApplicationState] State version mismatch, skipping load",
          );
          return;
        }
      }

      Object.entries(stateData.data).forEach(([key, value]) => {
        this.state.set(key, value);
        this.cache.set(`state:${key}`, value);
      });

      console.log("[ApplicationState] Loaded persisted state");
    } catch (error) {
      console.error(
        "[ApplicationState] Failed to load persisted state:",
        error,
      );
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
        "LOAD",
      );
    }
  }

  private startSync(): void {
    this.syncTimer = setInterval(() => {
      this.syncState();
    }, this.config.syncInterval);
  }

  private syncState(): void {
    const syncData = {
      namespace: this.config.namespace,
      state: this.getAll(),
      timestamp: Date.now(),
    };

    if (this.onSync) {
      this.onSync(syncData);
    }

    console.log("[ApplicationState] Synced state");
  }

  private setupCleanup(): void {
    setInterval(() => {
      if (this.history.length > this.config.historyLimit) {
        this.history = this.history.slice(-this.config.historyLimit);
      }
    }, 300000);
  }

  private calculateMemoryUsage(): number {
    const stateSize = JSON.stringify(this.getAll()).length;
    const historySize = JSON.stringify(this.history).length;
    return stateSize + historySize;
  }

  private handleError(error: Error, operation: string): void {
    console.error(`[ApplicationState] Error in ${operation}:`, error);

    if (this.onError) {
      this.onError(error, operation);
    }
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createForDSKY(): ApplicationStateService {
    return new ApplicationStateService({
      persistence: {
        enabled: true,
        storage: "localStorage",
        key: "dsky_app_state",
        version: 1,
      },
      validation: [
        {
          key: "web3.account",
          validator: (value: unknown) =>
            typeof value === "string" &&
            (!value || /^0x[a-fA-F0-9]{40}$/.test(value)),
          message: "Invalid Ethereum address format",
        },
        {
          key: "dsky.verb",
          validator: (value: unknown) =>
            typeof value === "string" && (!value || /^\d{2}$/.test(value)),
          message: "DSKY verb must be 2 digits",
        },
        {
          key: "dsky.noun",
          validator: (value: unknown) =>
            typeof value === "string" && (!value || /^\d{2}$/.test(value)),
          message: "DSKY noun must be 2 digits",
        },
      ],
      enableHistory: true,
      historyLimit: 500,
      namespace: "dsky",
    });
  }
}

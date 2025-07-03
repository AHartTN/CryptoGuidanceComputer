// Apollo DSKY - Real-time Integration Service
// Enterprise-grade service integrating all real-time data streams

import { RealTimePriceFeedService } from "./RealTimePriceFeedService";
import {
  RealTimeBlockchainService,
  IBlockEvent,
  ITransactionEvent,
  IGasPriceEvent,
  INetworkStatsEvent,
} from "./RealTimeBlockchainService";
import { CacheService, CacheStrategy } from "../cache/CacheService";
import { ErrorHandlingService } from "../error/ErrorHandlingService";
import type { IRealTimeDataPayload } from "../../interfaces/IRealTimeDataPayload";
import type { ICryptoPriceData } from "../../interfaces/ICryptoPriceData";
import type { IPriceAlert } from "../../interfaces/IPriceAlert";

/** Real-time Data Types */
export enum RealTimeDataType {
  PRICE_UPDATE = "PRICE_UPDATE",
  BLOCK_UPDATE = "BLOCK_UPDATE",
  TRANSACTION_UPDATE = "TRANSACTION_UPDATE",
  GAS_UPDATE = "GAS_UPDATE",
  NETWORK_UPDATE = "NETWORK_UPDATE",
  ALERT_TRIGGERED = "ALERT_TRIGGERED",
}

/** Real-time Event Interface */
export interface IRealTimeEvent {
  type: RealTimeDataType;
  data: IRealTimeDataPayload;
  timestamp: number;
  source: "PRICE_FEED" | "BLOCKCHAIN";
}

/** DSKY Update Interface */
export interface IDSKYUpdate {
  field: string;
  value: string;
  displayFormat?: "NUMERIC" | "TEXT" | "HEX" | "ADDRESS";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

/** Integration Service Configuration */
export interface IRealTimeIntegrationConfig {
  enablePriceFeeds: boolean;
  enableBlockchainEvents: boolean;
  watchedAddresses: string[];
  priceSymbols: string[];
  updateInterval: number;
  maxEventBuffer: number;
  enableDSKYIntegration: boolean;
}

/** Real-time Integration Service */
export class RealTimeIntegrationService {
  private priceFeedService?: RealTimePriceFeedService;
  private blockchainService?: RealTimeBlockchainService;
  private cache: CacheService;
  private errorService: ErrorHandlingService;
  private eventBuffer: IRealTimeEvent[] = [];
  private updateTimer: NodeJS.Timeout | null = null;

  // Event callbacks
  private onDataUpdate?: (event: IRealTimeEvent) => void;
  private onDSKYUpdate?: (updates: IDSKYUpdate[]) => void;
  private onAlert?: (alert: IPriceAlert, data: ICryptoPriceData) => void;
  private onConnectionChange?: (service: string, connected: boolean) => void;

  constructor(private config: IRealTimeIntegrationConfig) {
    this.cache = new CacheService({
      strategy: CacheStrategy.LRU,
      maxSize: 5000,
      defaultTTL: 300000, // 5 minutes TTL
      enableMetrics: true,
    });

    this.errorService = new ErrorHandlingService();
    this.initializeServices();
  }

  /** Initialize real-time services */
  async initialize(): Promise<void> {
    try {
      const initPromises: Promise<void>[] = [];

      // Initialize price feed service
      if (this.config.enablePriceFeeds && this.priceFeedService) {
        initPromises.push(this.priceFeedService.initialize());
      }

      // Initialize blockchain service
      if (this.config.enableBlockchainEvents && this.blockchainService) {
        initPromises.push(this.blockchainService.initialize());
      }

      await Promise.all(initPromises);

      // Start update timer
      this.startUpdateTimer();

      console.log("[RealTimeIntegration] Initialized successfully");
    } catch (error) {
      this.errorService.reportError(error as Error, {
        source: "SYSTEM",
        service: "RealTimeIntegration",
      });
      throw error;
    }
  }

  /** Subscribe to price updates for symbols */
  async subscribeToPrices(symbols: string[]): Promise<void> {
    if (!this.priceFeedService) {
      throw new Error("Price feed service not enabled");
    }

    for (const symbol of symbols) {
      await this.priceFeedService.subscribeToSymbol(symbol);
    }

    console.log(
      "[RealTimeIntegration] Subscribed to prices for",
      symbols.length,
      "symbols",
    );
  }

  /** Watch blockchain addresses */
  async watchAddresses(addresses: string[]): Promise<void> {
    if (!this.blockchainService) {
      throw new Error("Blockchain service not enabled");
    }

    for (const address of addresses) {
      await this.blockchainService.watchAddress(address);
    }

    console.log(
      "[RealTimeIntegration] Watching",
      addresses.length,
      "addresses",
    );
  }

  /** Add price alert */
  addPriceAlert(alert: IPriceAlert): void {
    if (!this.priceFeedService) {
      throw new Error("Price feed service not enabled");
    }

    this.priceFeedService.addAlert(alert);
    console.log("[RealTimeIntegration] Added price alert for", alert.symbol);
  }

  /** Remove price alert */
  removePriceAlert(alertId: string): void {
    if (!this.priceFeedService) {
      throw new Error("Price feed service not enabled");
    }

    this.priceFeedService.removeAlert(alertId);
    console.log("[RealTimeIntegration] Removed price alert", alertId);
  }

  /** Get current price data */
  getCurrentPrice(symbol: string): ICryptoPriceData | null {
    if (!this.priceFeedService) return null;
    return this.priceFeedService.getCurrentPrice(symbol);
  }

  /** Get latest block data */
  getLatestBlock(): IBlockEvent | null {
    if (!this.blockchainService) return null;
    return this.blockchainService.getLatestBlock();
  }

  /** Get latest gas prices */
  getLatestGasPrices(): IGasPriceEvent | null {
    if (!this.blockchainService) return null;
    return this.blockchainService.getLatestGasPrices();
  }

  /** Get connection status */
  getConnectionStatus(): {
    priceFeeds: boolean;
    blockchain: boolean;
    overall: boolean;
  } {
    const priceFeeds = this.priceFeedService?.isConnected() || false;
    const blockchain = this.blockchainService?.isConnected() || false;

    return {
      priceFeeds,
      blockchain,
      overall: priceFeeds && blockchain,
    };
  }

  /** Get service statistics */
  getStats() {
    return {
      priceFeeds: this.priceFeedService?.getStats(),
      blockchain: this.blockchainService?.getStats(),
      eventBuffer: this.eventBuffer.length,
      cache: this.cache.getStats(),
    };
  }

  /** Get recent events */
  getRecentEvents(limit: number = 50): IRealTimeEvent[] {
    return this.eventBuffer.slice(-limit);
  }

  /** Set event callbacks */
  setEventCallbacks(callbacks: {
    onDataUpdate?: (event: IRealTimeEvent) => void;
    onDSKYUpdate?: (updates: IDSKYUpdate[]) => void;
    onAlert?: (alert: IPriceAlert, data: ICryptoPriceData) => void;
    onConnectionChange?: (service: string, connected: boolean) => void;
  }): void {
    this.onDataUpdate = callbacks.onDataUpdate;
    this.onDSKYUpdate = callbacks.onDSKYUpdate;
    this.onAlert = callbacks.onAlert;
    this.onConnectionChange = callbacks.onConnectionChange;
  }

  /** Initialize real-time services */
  private initializeServices(): void {
    // Initialize price feed service
    if (this.config.enablePriceFeeds) {
      this.priceFeedService = RealTimePriceFeedService.createForDSKY();
      this.setupPriceFeedCallbacks();
    }

    // Initialize blockchain service
    if (this.config.enableBlockchainEvents) {
      this.blockchainService = RealTimeBlockchainService.createForDSKY(
        this.config.watchedAddresses,
      );
      this.setupBlockchainCallbacks();
    }
  }

  /** Setup price feed event callbacks */
  private setupPriceFeedCallbacks(): void {
    if (!this.priceFeedService) return;

    this.priceFeedService.setEventCallbacks({
      onPriceUpdate: (data) => this.handlePriceUpdate(data),
      onAlert: (alert, data) => this.handlePriceAlert(alert, data),
      onConnectionChange: (connected) =>
        this.handleConnectionChange("PRICE_FEED", connected),
    });
  }

  /** Setup blockchain event callbacks */
  private setupBlockchainCallbacks(): void {
    if (!this.blockchainService) return;

    this.blockchainService.setEventCallbacks({
      onBlockEvent: (event) => this.handleBlockEvent(event),
      onTransactionEvent: (event) => this.handleTransactionEvent(event),
      onGasPriceEvent: (event) => this.handleGasPriceEvent(event),
      onNetworkStatsEvent: (event) => this.handleNetworkStatsEvent(event),
      onConnectionChange: (connected) =>
        this.handleConnectionChange("BLOCKCHAIN", connected),
    });
  }

  /** Handle price update events */
  private handlePriceUpdate(data: ICryptoPriceData): void {
    const event: IRealTimeEvent = {
      type: RealTimeDataType.PRICE_UPDATE,
      data,
      timestamp: Date.now(),
      source: "PRICE_FEED",
    };

    this.processEvent(event);

    // Generate DSKY updates if enabled
    if (this.config.enableDSKYIntegration) {
      const dskyUpdates = this.generatePriceDSKYUpdates(data);
      if (this.onDSKYUpdate) {
        this.onDSKYUpdate(dskyUpdates);
      }
    }
  }

  /** Handle block events */
  private handleBlockEvent(data: IBlockEvent): void {
    const event: IRealTimeEvent = {
      type: RealTimeDataType.BLOCK_UPDATE,
      data,
      timestamp: Date.now(),
      source: "BLOCKCHAIN",
    };

    this.processEvent(event);

    // Generate DSKY updates if enabled
    if (this.config.enableDSKYIntegration) {
      const dskyUpdates = this.generateBlockDSKYUpdates(data);
      if (this.onDSKYUpdate) {
        this.onDSKYUpdate(dskyUpdates);
      }
    }
  }

  /** Handle transaction events */
  private handleTransactionEvent(data: ITransactionEvent): void {
    const event: IRealTimeEvent = {
      type: RealTimeDataType.TRANSACTION_UPDATE,
      data,
      timestamp: Date.now(),
      source: "BLOCKCHAIN",
    };

    this.processEvent(event);

    // Generate DSKY updates if enabled
    if (this.config.enableDSKYIntegration) {
      const dskyUpdates = this.generateTransactionDSKYUpdates(data);
      if (this.onDSKYUpdate) {
        this.onDSKYUpdate(dskyUpdates);
      }
    }
  }

  /** Handle gas price events */
  private handleGasPriceEvent(data: IGasPriceEvent): void {
    const event: IRealTimeEvent = {
      type: RealTimeDataType.GAS_UPDATE,
      data,
      timestamp: Date.now(),
      source: "BLOCKCHAIN",
    };

    this.processEvent(event);

    // Generate DSKY updates if enabled
    if (this.config.enableDSKYIntegration) {
      const dskyUpdates = this.generateGasDSKYUpdates(data);
      if (this.onDSKYUpdate) {
        this.onDSKYUpdate(dskyUpdates);
      }
    }
  }

  /** Handle network stats events */
  private handleNetworkStatsEvent(data: INetworkStatsEvent): void {
    const event: IRealTimeEvent = {
      type: RealTimeDataType.NETWORK_UPDATE,
      data,
      timestamp: Date.now(),
      source: "BLOCKCHAIN",
    };

    this.processEvent(event);

    // Generate DSKY updates if enabled
    if (this.config.enableDSKYIntegration) {
      const dskyUpdates = this.generateNetworkDSKYUpdates(data);
      if (this.onDSKYUpdate) {
        this.onDSKYUpdate(dskyUpdates);
      }
    }
  }

  /** Handle price alerts */
  private handlePriceAlert(alert: IPriceAlert, data: ICryptoPriceData): void {
    const event: IRealTimeEvent = {
      type: RealTimeDataType.ALERT_TRIGGERED,
      data: { alert, priceData: data },
      timestamp: Date.now(),
      source: "PRICE_FEED",
    };

    this.processEvent(event);

    if (this.onAlert) {
      this.onAlert(alert, data);
    }
  }

  /** Handle connection changes */
  private handleConnectionChange(service: string, connected: boolean): void {
    console.log(
      `[RealTimeIntegration] ${service} connection:`,
      connected ? "CONNECTED" : "DISCONNECTED",
    );

    if (this.onConnectionChange) {
      this.onConnectionChange(service, connected);
    }
  }

  /** Process real-time events */
  private processEvent(event: IRealTimeEvent): void {
    // Add to event buffer
    this.eventBuffer.push(event);

    // Limit buffer size
    if (this.eventBuffer.length > this.config.maxEventBuffer) {
      this.eventBuffer.shift();
    }

    // Cache the event
    this.cache.set(`event:${event.timestamp}`, event);

    // Notify listeners
    if (this.onDataUpdate) {
      this.onDataUpdate(event);
    }
  }

  /** Generate DSKY updates for price data */
  private generatePriceDSKYUpdates(data: ICryptoPriceData): IDSKYUpdate[] {
    return [
      {
        field: "noun",
        value: this.getSymbolNounCode(data.symbol),
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
      {
        field: "verb",
        value: "31", // VERB_CRYPTO_PRICES
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
      {
        field: "reg1",
        value: (data.price ?? 0).toFixed(2),
        displayFormat: "NUMERIC",
        priority: "HIGH",
      },
      {
        field: "reg2",
        value: (data.changePercent24h ?? 0).toFixed(2),
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
    ];
  }

  /** Generate DSKY updates for block data */
  private generateBlockDSKYUpdates(data: IBlockEvent): IDSKYUpdate[] {
    return [
      {
        field: "noun",
        value: "21", // NOUN_CURRENT_BLOCK
        displayFormat: "NUMERIC",
        priority: "HIGH",
      },
      {
        field: "verb",
        value: "16", // VERB_MONITOR
        displayFormat: "NUMERIC",
        priority: "HIGH",
      },
      {
        field: "reg1",
        value: data.number.toString(),
        displayFormat: "NUMERIC",
        priority: "HIGH",
      },
      {
        field: "reg2",
        value: data.transactionCount.toString(),
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
    ];
  }

  /** Generate DSKY updates for transaction data */
  private generateTransactionDSKYUpdates(
    data: ITransactionEvent,
  ): IDSKYUpdate[] {
    return [
      {
        field: "noun",
        value: "52", // NOUN_TX_RECENT
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
      {
        field: "verb",
        value: "16", // VERB_MONITOR
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
      {
        field: "reg1",
        value: data.hash.slice(0, 8),
        displayFormat: "HEX",
        priority: "LOW",
      },
    ];
  }

  /** Generate DSKY updates for gas data */
  private generateGasDSKYUpdates(data: IGasPriceEvent): IDSKYUpdate[] {
    return [
      {
        field: "noun",
        value: "23", // NOUN_GAS_PRICE
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
      {
        field: "verb",
        value: "16", // VERB_MONITOR
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
      {
        field: "reg1",
        value: parseFloat(data.standard).toFixed(1),
        displayFormat: "NUMERIC",
        priority: "MEDIUM",
      },
    ];
  }

  /** Generate DSKY updates for network data */
  private generateNetworkDSKYUpdates(data: INetworkStatsEvent): IDSKYUpdate[] {
    return [
      {
        field: "noun",
        value: "25", // NOUN_NETWORK_STATUS
        displayFormat: "NUMERIC",
        priority: "LOW",
      },
      {
        field: "verb",
        value: "16", // VERB_MONITOR
        displayFormat: "NUMERIC",
        priority: "LOW",
      },
      {
        field: "reg1",
        value: data.blockNumber.toString(),
        displayFormat: "NUMERIC",
        priority: "LOW",
      },
    ];
  }

  /** Get DSKY noun code for crypto symbol */
  private getSymbolNounCode(symbol: string): string {
    const symbolMap: { [key: string]: string } = {
      BTC: "41", // NOUN_CRYPTO_01
      ETH: "42", // NOUN_CRYPTO_02
      ADA: "43", // NOUN_CRYPTO_03
      DOT: "44", // NOUN_CRYPTO_04
      MATIC: "45", // NOUN_CRYPTO_05
      LINK: "46",
      UNI: "47",
      AAVE: "48",
      MKR: "49",
      COMP: "50",
    };

    return symbolMap[symbol.toUpperCase()] || "31"; // Default to generic crypto
  }

  /** Start update timer */
  private startUpdateTimer(): void {
    this.updateTimer = setInterval(() => {
      this.performPeriodicUpdates();
    }, this.config.updateInterval);
  }

  /** Stop update timer */
  private stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /** Perform periodic updates */
  private performPeriodicUpdates(): void {
    // Clean up old events from buffer
    const cutoffTime = Date.now() - 5 * 60 * 1000; // 5 minutes
    this.eventBuffer = this.eventBuffer.filter(
      (event) => event.timestamp > cutoffTime,
    );

    // Update cache statistics
    const stats = this.getStats();
    this.cache.set("integration:stats", stats);
  }

  /** Disconnect and cleanup */
  async dispose(): Promise<void> {
    this.stopUpdateTimer();

    const disposePromises: Promise<void>[] = [];

    if (this.priceFeedService) {
      disposePromises.push(this.priceFeedService.dispose());
    }

    if (this.blockchainService) {
      disposePromises.push(this.blockchainService.dispose());
    }

    await Promise.all(disposePromises);

    this.cache.clear();
    this.eventBuffer = [];

    console.log("[RealTimeIntegration] Disposed successfully");
  }

  /** Static factory method for DSKY configuration */
  static createForDSKY(
    watchedAddresses: string[] = [],
  ): RealTimeIntegrationService {
    return new RealTimeIntegrationService({
      enablePriceFeeds: true,
      enableBlockchainEvents: true,
      watchedAddresses,
      priceSymbols: [
        "BTC",
        "ETH",
        "ADA",
        "DOT",
        "MATIC",
        "LINK",
        "UNI",
        "AAVE",
        "MKR",
        "COMP",
      ],
      updateInterval: 5000, // 5 seconds
      maxEventBuffer: 1000,
      enableDSKYIntegration: true,
    });
  }
}

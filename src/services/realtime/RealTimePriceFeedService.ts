// Apollo DSKY - Real-time Price Feed Service
// Enterprise-grade real-time cryptocurrency price monitoring

import { WebSocketService, SubscriptionType, WebSocketState } from './WebSocketService';
import { CacheService, CacheStrategy } from '../cache/CacheService';

/** Price Data Interface */
export interface IPriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: number;
}

/** Price Alert Configuration */
export interface IPriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change_percent';
  threshold: number;
  enabled: boolean;
  callback: (data: IPriceData) => void;
}

/** Price Feed Configuration */
export interface IPriceFeedConfig {
  symbols: string[];
  updateInterval: number;
  enableAlerts: boolean;
  enableHistory: boolean;
  maxHistoryPoints: number;
}

/** Price History Point */
export interface IPriceHistoryPoint {
  timestamp: number;
  price: number;
  volume: number;
}

/** Real-time Price Feed Service */
export class RealTimePriceFeedService {
  private wsService: WebSocketService;
  private cache: CacheService;
  private alerts: Map<string, IPriceAlert> = new Map();
  private subscriptions: Set<string> = new Set();
  private priceHistory: Map<string, IPriceHistoryPoint[]> = new Map();
  
  // Event callbacks
  private onPriceUpdate?: (data: IPriceData) => void;
  private onAlert?: (alert: IPriceAlert, data: IPriceData) => void;
  private onConnectionChange?: (connected: boolean) => void;

  constructor(private config: IPriceFeedConfig) {
    this.wsService = new WebSocketService({
      url: 'wss://api.coinbase.com/ws',
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000,
      maxMessageQueue: 100,
      enableCompression: true
    });
    this.cache = new CacheService({
      strategy: CacheStrategy.LRU,
      maxSize: 1000,
      defaultTTL: 300000, // 5 minutes TTL
      enableMetrics: true
    });

    this.setupEventListeners();
  }

  /** Initialize price feed service */
  async initialize(): Promise<void> {
    try {
      await this.wsService.connect();
      
      // Subscribe to price feeds for configured symbols
      for (const symbol of this.config.symbols) {
        await this.subscribeToSymbol(symbol);
      }
      
      console.log('[PriceFeed] Initialized for', this.config.symbols.length, 'symbols');
    } catch (error) {
      console.error('[PriceFeed] Initialization failed:', error);
      throw error;
    }
  }

  /** Subscribe to price updates for a symbol */
  async subscribeToSymbol(symbol: string): Promise<string> {
    if (this.subscriptions.has(symbol)) {
      return symbol;
    }

    const subscriptionId = this.wsService.subscribe({
      type: SubscriptionType.CRYPTO_PRICES,
      params: { symbol: symbol.toUpperCase() },
      callback: (data) => this.handlePriceUpdate(data),
      errorCallback: (error) => console.error(`[PriceFeed] Error for ${symbol}:`, error)
    });

    this.subscriptions.add(symbol);
    
    // Initialize price history if enabled
    if (this.config.enableHistory) {
      this.priceHistory.set(symbol, []);
    }

    console.log('[PriceFeed] Subscribed to', symbol);
    return subscriptionId;
  }

  /** Unsubscribe from price updates for a symbol */
  unsubscribeFromSymbol(symbol: string): void {
    if (!this.subscriptions.has(symbol)) {
      return;
    }

    this.subscriptions.delete(symbol);
    this.priceHistory.delete(symbol);
    
    console.log('[PriceFeed] Unsubscribed from', symbol);
  }

  /** Get current price for a symbol */
  getCurrentPrice(symbol: string): IPriceData | null {
    return this.cache.get(`price:${symbol.toUpperCase()}`) as IPriceData | null;
  }

  /** Get price history for a symbol */
  getPriceHistory(symbol: string, limit?: number): IPriceHistoryPoint[] {
    const history = this.priceHistory.get(symbol.toUpperCase()) || [];
    return limit ? history.slice(-limit) : history;
  }

  /** Add price alert */
  addAlert(alert: IPriceAlert): void {
    this.alerts.set(alert.id, alert);
    console.log('[PriceFeed] Added alert for', alert.symbol, alert.condition, alert.threshold);
  }

  /** Remove price alert */
  removeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      this.alerts.delete(alertId);
      console.log('[PriceFeed] Removed alert', alertId);
    }
  }

  /** Enable/disable alert */
  toggleAlert(alertId: string, enabled: boolean): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.enabled = enabled;
      console.log('[PriceFeed] Alert', alertId, enabled ? 'enabled' : 'disabled');
    }
  }

  /** Get all alerts */
  getAlerts(): IPriceAlert[] {
    return Array.from(this.alerts.values());
  }

  /** Get connection status */
  isConnected(): boolean {
    return this.wsService.getState() === WebSocketState.CONNECTED;
  }

  /** Get service statistics */
  getStats() {
    return {
      websocket: this.wsService.getStats(),
      subscriptions: this.subscriptions.size,
      alerts: this.alerts.size,
      historyPoints: Array.from(this.priceHistory.values()).reduce((sum, history) => sum + history.length, 0)
    };
  }

  /** Set event callbacks */
  setEventCallbacks(callbacks: {
    onPriceUpdate?: (data: IPriceData) => void;
    onAlert?: (alert: IPriceAlert, data: IPriceData) => void;
    onConnectionChange?: (connected: boolean) => void;
  }): void {
    this.onPriceUpdate = callbacks.onPriceUpdate;
    this.onAlert = callbacks.onAlert;
    this.onConnectionChange = callbacks.onConnectionChange;
  }

  /** Setup WebSocket event listeners */
  private setupEventListeners(): void {
    this.wsService.setEventCallbacks({
      onStateChange: (state) => {
        const connected = state === WebSocketState.CONNECTED;
        if (this.onConnectionChange) {
          this.onConnectionChange(connected);
        }
      },
      onError: (error) => {
        console.error('[PriceFeed] WebSocket error:', error);
      },
      onReconnect: () => {
        console.log('[PriceFeed] Reconnected, resubscribing to symbols');
        // Resubscribe to all symbols
        this.config.symbols.forEach(symbol => {
          this.subscribeToSymbol(symbol);
        });
      }
    });
  }

  /** Handle incoming price updates */
  private handlePriceUpdate(data: unknown): void {
    if (typeof data !== 'object' || data === null) return;
    const d = data as { symbol?: string; product_id?: string; price?: string; last_trade_price?: string; change_24h?: string; change_percent_24h?: string; volume_24h?: string; market_cap?: string };
    const symbol = d.symbol || (typeof d.product_id === 'string' ? d.product_id.replace('-USD', '') : undefined);
    const price = parseFloat((d.price ?? d.last_trade_price ?? '0') as string);
    const change24h = parseFloat((d.change_24h ?? '0') as string);
    const changePercent24h = parseFloat((d.change_percent_24h ?? '0') as string);
    const volume24h = parseFloat((d.volume_24h ?? '0') as string);
    const marketCap = parseFloat((d.market_cap ?? '0') as string);

    try {
      const priceData: IPriceData = {
        symbol: symbol!,
        price,
        change24h,
        changePercent24h,
        volume24h,
        marketCap,
        timestamp: Date.now()
      };

      // Cache the price data
      this.cache.set(`price:${priceData.symbol}`, priceData);

      // Update price history if enabled
      if (this.config.enableHistory && this.priceHistory.has(priceData.symbol)) {
        const history = this.priceHistory.get(priceData.symbol)!;
        history.push({
          timestamp: priceData.timestamp,
          price: priceData.price,
          volume: priceData.volume24h
        });

        // Limit history size
        if (history.length > this.config.maxHistoryPoints) {
          history.shift();
        }
      }

      // Check for alerts
      if (this.config.enableAlerts) {
        this.checkAlerts(priceData);
      }

      // Notify listeners
      if (this.onPriceUpdate) {
        this.onPriceUpdate(priceData);
      }

    } catch (error) {
      console.error('[PriceFeed] Failed to process price update:', error);
    }
  }

  /** Check if any alerts should be triggered */
  private checkAlerts(data: IPriceData): void {
    this.alerts.forEach((alert) => {
      if (!alert.enabled || alert.symbol.toUpperCase() !== data.symbol.toUpperCase()) {
        return;
      }

      let triggered = false;

      switch (alert.condition) {
        case 'above':
          triggered = data.price > alert.threshold;
          break;
        case 'below':
          triggered = data.price < alert.threshold;
          break;
        case 'change_percent':
          triggered = Math.abs(data.changePercent24h) > alert.threshold;
          break;
      }

      if (triggered && this.onAlert) {
        this.onAlert(alert, data);
        
        // Disable alert after triggering to prevent spam
        alert.enabled = false;
      }
    });
  }

  /** Disconnect and cleanup */
  async dispose(): Promise<void> {
    await this.wsService.disconnect();
    this.cache.clear();
    this.alerts.clear();
    this.subscriptions.clear();
    this.priceHistory.clear();
  }

  /** Static factory method for DSKY configuration */
  static createForDSKY(): RealTimePriceFeedService {
    return new RealTimePriceFeedService({
      symbols: ['BTC', 'ETH', 'ADA', 'DOT', 'MATIC', 'LINK', 'UNI', 'AAVE', 'MKR', 'COMP'],
      updateInterval: 1000, // 1 second
      enableAlerts: true,
      enableHistory: true,
      maxHistoryPoints: 100
    });
  }

  /** Static method to create alert */
  static createAlert(
    symbol: string,
    condition: 'above' | 'below' | 'change_percent',
    threshold: number,
    callback: (data: IPriceData) => void
  ): IPriceAlert {
    return {
      id: `${symbol}_${condition}_${threshold}_${Date.now()}`,
      symbol: symbol.toUpperCase(),
      condition,
      threshold,
      enabled: true,
      callback
    };
  }
}

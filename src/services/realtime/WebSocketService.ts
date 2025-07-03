// Apollo DSKY - WebSocket Service for Real-time Data
// Enterprise-grade WebSocket management following SOLID principles

import { CacheService, CacheStrategy } from "../cache/CacheService";
import type { IRealTimeDataPayload } from "../../interfaces/IRealTimeDataPayload";

/** WebSocket Connection States */
export enum WebSocketState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  ERROR = "ERROR",
}

/** WebSocket Message Types */
export enum MessageType {
  PRICE_UPDATE = "PRICE_UPDATE",
  BLOCK_UPDATE = "BLOCK_UPDATE",
  TRANSACTION_UPDATE = "TRANSACTION_UPDATE",
  GAS_UPDATE = "GAS_UPDATE",
  NETWORK_STATUS = "NETWORK_STATUS",
  WALLET_UPDATE = "WALLET_UPDATE",
  HEARTBEAT = "HEARTBEAT",
  SUBSCRIBE = "SUBSCRIBE",
  UNSUBSCRIBE = "UNSUBSCRIBE",
}

/** Subscription Types */
export enum SubscriptionType {
  CRYPTO_PRICES = "CRYPTO_PRICES",
  BLOCK_HEADERS = "BLOCK_HEADERS",
  PENDING_TRANSACTIONS = "PENDING_TRANSACTIONS",
  GAS_PRICES = "GAS_PRICES",
  WALLET_TRANSACTIONS = "WALLET_TRANSACTIONS",
  NETWORK_STATS = "NETWORK_STATS",
}

/** WebSocket Message Interface */
export interface IWebSocketMessage {
  type: MessageType;
  data: IRealTimeDataPayload;
  timestamp: number;
  id?: string;
}

/** Subscription Configuration */
export interface ISubscription {
  type: SubscriptionType;
  params?: Record<string, unknown>;
  callback: (data: IRealTimeDataPayload) => void;
  errorCallback?: (error: Error) => void;
}

/** WebSocket Configuration */
export interface IWebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  maxMessageQueue: number;
  enableCompression: boolean;
  protocols?: string[];
}

/** Connection Statistics */
export interface IConnectionStats {
  state: WebSocketState;
  connectTime: number | null;
  disconnectTime: number | null;
  reconnectAttempts: number;
  messagesReceived: number;
  messagesSent: number;
  bytesReceived: number;
  bytesSent: number;
  lastHeartbeat: number | null;
  latency: number | null;
}

/** Real-time Data Service for WebSocket management */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private subscriptions: Map<string, ISubscription> = new Map();
  private messageQueue: IWebSocketMessage[] = [];
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private stats: IConnectionStats;
  private cache: CacheService;

  // Event callbacks
  private onStateChange?: (state: WebSocketState) => void;
  private onError?: (error: Error) => void;
  private onReconnect?: () => void;

  constructor(private config: IWebSocketConfig) {
    this.stats = this.initializeStats();
    this.cache = new CacheService({
      strategy: CacheStrategy.LRU,
      maxSize: 1000,
      defaultTTL: 60000, // 1 minute TTL for real-time data
      enableMetrics: true,
    });
  }

  /** Initialize connection statistics */
  private initializeStats(): IConnectionStats {
    return {
      state: WebSocketState.DISCONNECTED,
      connectTime: null,
      disconnectTime: null,
      reconnectAttempts: 0,
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      lastHeartbeat: null,
      latency: null,
    };
  }

  /** Connect to WebSocket server */
  async connect(): Promise<void> {
    if (
      this.state === WebSocketState.CONNECTING ||
      this.state === WebSocketState.CONNECTED
    ) {
      return;
    }

    this.setState(WebSocketState.CONNECTING);

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventListeners();

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        if (!this.ws) {
          reject(new Error("WebSocket not initialized"));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.ws.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Connection failed"));
        };
      });

      this.setState(WebSocketState.CONNECTED);
      this.stats.connectTime = Date.now();
      this.stats.reconnectAttempts = 0;

      // Start heartbeat
      this.startHeartbeat();

      // Process queued messages
      this.processMessageQueue();

      // Resubscribe to all subscriptions
      this.resubscribeAll();
    } catch (error) {
      this.setState(WebSocketState.ERROR);
      this.handleError(error as Error);
      throw error;
    }
  }

  /** Disconnect from WebSocket server */
  async disconnect(): Promise<void> {
    this.setState(WebSocketState.DISCONNECTED);
    this.stats.disconnectTime = Date.now();

    this.stopHeartbeat();
    this.stopReconnect();

    if (this.ws) {
      this.ws.close(1000, "Normal closure");
      this.ws = null;
    }

    this.subscriptions.clear();
    this.messageQueue = [];
  }

  /** Subscribe to real-time data */
  subscribe(subscription: ISubscription): string {
    const id = this.generateSubscriptionId(subscription.type);
    this.subscriptions.set(id, subscription);

    // Send subscription message if connected
    if (this.state === WebSocketState.CONNECTED) {
      this.sendMessage({
        type: MessageType.SUBSCRIBE,
        data: {
          id,
          type: subscription.type,
          params: subscription.params,
        },
        timestamp: Date.now(),
      });
    }

    return id;
  }

  /** Unsubscribe from real-time data */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    this.subscriptions.delete(subscriptionId);

    // Send unsubscribe message if connected
    if (this.state === WebSocketState.CONNECTED) {
      this.sendMessage({
        type: MessageType.UNSUBSCRIBE,
        data: { id: subscriptionId },
        timestamp: Date.now(),
      });
    }
  }

  /** Get current connection state */
  getState(): WebSocketState {
    return this.state;
  }

  /** Get connection statistics */
  getStats(): IConnectionStats {
    return { ...this.stats, state: this.state };
  }

  /** Get cached data */
  getCachedData(key: string): IRealTimeDataPayload {
    return this.cache.get(key);
  }

  /** Set event callbacks */
  setEventCallbacks(callbacks: {
    onStateChange?: (state: WebSocketState) => void;
    onError?: (error: Error) => void;
    onReconnect?: () => void;
  }): void {
    this.onStateChange = callbacks.onStateChange;
    this.onError = callbacks.onError;
    this.onReconnect = callbacks.onReconnect;
  }

  /** Send message to server */
  private sendMessage(message: IWebSocketMessage): void {
    if (this.state !== WebSocketState.CONNECTED || !this.ws) {
      // Queue message for later
      if (this.messageQueue.length < this.config.maxMessageQueue) {
        this.messageQueue.push(message);
      }
      return;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.ws.send(messageStr);

      this.stats.messagesSent++;
      this.stats.bytesSent += messageStr.length;
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /** Setup WebSocket event listeners */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("[WS] Connected to", this.config.url);
    };

    this.ws.onclose = (event) => {
      console.log("[WS] Disconnected:", event.code, event.reason);
      this.handleDisconnect();
    };

    this.ws.onerror = (error) => {
      console.error("[WS] Error:", error);
      this.handleError(new Error("WebSocket error"));
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };
  }

  /** Handle incoming WebSocket messages */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: IWebSocketMessage = JSON.parse(event.data);

      this.stats.messagesReceived++;
      this.stats.bytesReceived += event.data.length;

      // Handle different message types
      switch (message.type) {
        case MessageType.HEARTBEAT:
          this.handleHeartbeat(message);
          break;

        case MessageType.PRICE_UPDATE:
          this.handlePriceUpdate(message);
          break;

        case MessageType.BLOCK_UPDATE:
          this.handleBlockUpdate(message);
          break;

        case MessageType.TRANSACTION_UPDATE:
          this.handleTransactionUpdate(message);
          break;

        case MessageType.GAS_UPDATE:
          this.handleGasUpdate(message);
          break;

        case MessageType.NETWORK_STATUS:
          this.handleNetworkStatus(message);
          break;

        case MessageType.WALLET_UPDATE:
          this.handleWalletUpdate(message);
          break;

        default:
          console.warn("[WS] Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("[WS] Failed to parse message:", error);
    }
  }

  /** Handle heartbeat messages */
  private handleHeartbeat(message: IWebSocketMessage): void {
    const now = Date.now();
    this.stats.lastHeartbeat = now;

    // Calculate latency if timestamp is provided
    if (message.timestamp) {
      this.stats.latency = now - message.timestamp;
    }

    // Send heartbeat response
    this.sendMessage({
      type: MessageType.HEARTBEAT,
      data: { pong: true },
      timestamp: now,
    });
  }

  /** Handle price update messages */
  private handlePriceUpdate(message: IWebSocketMessage): void {
    // Type guard for price data
    if (
      typeof message.data === "object" &&
      message.data !== null &&
      "symbol" in message.data &&
      "price" in message.data &&
      "change" in message.data &&
      "volume" in message.data
    ) {
      const { symbol, price, change, volume } = message.data as {
        symbol: string;
        price: number;
        change: number;
        volume: number;
      };
      // Cache the price data
      this.cache.set(`price:${symbol}`, {
        price,
        change,
        volume,
        timestamp: message.timestamp,
      });
      // Notify subscribers
      this.notifySubscribers(SubscriptionType.CRYPTO_PRICES, message.data);
    }
  }

  /** Handle block update messages */
  private handleBlockUpdate(message: IWebSocketMessage): void {
    const blockData = message.data;
    if (
      typeof blockData === "object" &&
      blockData !== null &&
      "number" in blockData
    ) {
      this.cache.set(
        `block:${(blockData as { number: number }).number}`,
        blockData,
      );
      this.cache.set("block:latest", blockData);
      this.notifySubscribers(SubscriptionType.BLOCK_HEADERS, blockData);
    }
  }

  /** Handle transaction update messages */
  private handleTransactionUpdate(message: IWebSocketMessage): void {
    const txData = message.data;
    if (typeof txData === "object" && txData !== null && "hash" in txData) {
      this.cache.set(`tx:${(txData as { hash: string }).hash}`, txData);
      if (
        "status" in txData &&
        (txData as { status: string }).status === "pending"
      ) {
        this.notifySubscribers(SubscriptionType.PENDING_TRANSACTIONS, txData);
      } else {
        this.notifySubscribers(SubscriptionType.WALLET_TRANSACTIONS, txData);
      }
    }
  }

  /** Handle gas update messages */
  private handleGasUpdate(message: IWebSocketMessage): void {
    const gasData = message.data;
    if (typeof gasData === "object" && gasData !== null) {
      this.cache.set("gas:current", gasData);
      this.notifySubscribers(SubscriptionType.GAS_PRICES, gasData);
    }
  }

  /** Handle network status messages */
  private handleNetworkStatus(message: IWebSocketMessage): void {
    const statusData = message.data;
    if (typeof statusData === "object" && statusData !== null) {
      this.notifySubscribers(SubscriptionType.NETWORK_STATS, statusData);
    }
  }

  /** Handle wallet update messages */
  private handleWalletUpdate(message: IWebSocketMessage): void {
    const walletData = message.data;
    if (
      typeof walletData === "object" &&
      walletData !== null &&
      "address" in walletData
    ) {
      this.cache.set(
        `wallet:${(walletData as { address: string }).address}`,
        walletData,
      );
      this.notifySubscribers(SubscriptionType.WALLET_TRANSACTIONS, walletData);
    }
  }

  /** Notify subscribers of updates */
  private notifySubscribers(
    type: SubscriptionType,
    data: IRealTimeDataPayload,
  ): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription.type === type) {
        try {
          subscription.callback(data);
        } catch (error) {
          if (subscription.errorCallback) {
            subscription.errorCallback(error as Error);
          } else {
            console.error("[WS] Subscription callback error:", error);
          }
        }
      }
    });
  }

  /** Handle WebSocket disconnection */
  private handleDisconnect(): void {
    this.setState(WebSocketState.DISCONNECTED);
    this.stats.disconnectTime = Date.now();
    this.stopHeartbeat();

    // Attempt reconnection if enabled
    if (this.reconnectAttempts < this.config.reconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /** Handle WebSocket errors */
  private handleError(error: Error): void {
    console.error("[WS] Error:", error);

    if (this.onError) {
      this.onError(error);
    }
  }

  /** Schedule reconnection attempt */
  private scheduleReconnect(): void {
    this.setState(WebSocketState.RECONNECTING);
    this.reconnectAttempts++;
    this.stats.reconnectAttempts = this.reconnectAttempts;

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000, // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(() => {
      console.log(`[WS] Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect()
        .then(() => {
          if (this.onReconnect) {
            this.onReconnect();
          }
        })
        .catch(() => {
          // Will be handled by handleDisconnect
        });
    }, delay);
  }

  /** Stop reconnection timer */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  /** Start heartbeat timer */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({
        type: MessageType.HEARTBEAT,
        data: { ping: true },
        timestamp: Date.now(),
      });
    }, this.config.heartbeatInterval);
  }

  /** Stop heartbeat timer */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /** Process queued messages */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /** Resubscribe to all active subscriptions */
  private resubscribeAll(): void {
    this.subscriptions.forEach((subscription, id) => {
      this.sendMessage({
        type: MessageType.SUBSCRIBE,
        data: {
          id,
          type: subscription.type,
          params: subscription.params,
        },
        timestamp: Date.now(),
      });
    });
  }

  /** Set connection state */
  private setState(state: WebSocketState): void {
    if (this.state !== state) {
      this.state = state;
      // TODO: Add any additional logic needed here or remove this block if not needed
    }
  }

  /** Generate unique subscription ID */
  private generateSubscriptionId(type: SubscriptionType): string {
    return `${type}:${Date.now()}:${Math.random()}`;
  }
}

// Apollo DSKY - Real-time Blockchain Event Service
// Enterprise-grade blockchain event monitoring and processing

import { WebSocketService, SubscriptionType, WebSocketState } from './WebSocketService';
import { CacheService, CacheStrategy } from '../cache/CacheService';

/** Block Event Data */
export interface IBlockEvent {
  number: number;
  hash: string;
  timestamp: number;
  gasLimit: string;
  gasUsed: string;
  transactionCount: number;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
}

/** Transaction Event Data */
export interface ITransactionEvent {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gasLimit: string;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  blockHash?: string;
  timestamp: number;
}

/** Gas Price Event Data */
export interface IGasPriceEvent {
  slow: string;
  standard: string;
  fast: string;
  instant: string;
  baseFee?: string;
  timestamp: number;
}

/** Network Stats Event Data */
export interface INetworkStatsEvent {
  chainId: number;
  networkName: string;
  blockNumber: number;
  hashRate: string;
  difficulty: string;
  pendingTransactions: number;
  activeNodes: number;
  timestamp: number;
}

/** Event Filter Configuration */
export interface IEventFilter {
  addresses?: string[];
  topics?: string[];
  fromBlock?: number;
  toBlock?: number;
}

/** Blockchain Event Service Configuration */
export interface IBlockchainEventConfig {
  monitorBlocks: boolean;
  monitorTransactions: boolean;
  monitorGasPrices: boolean;
  monitorNetworkStats: boolean;
  watchedAddresses: string[];
  eventFilters: IEventFilter[];
  maxEventHistory: number;
}

/** Real-time Blockchain Event Service */
export class RealTimeBlockchainService {
  private wsService: WebSocketService;
  private cache: CacheService;
  private subscriptions: Map<string, string> = new Map();
  private eventHistory: Map<string, IBlockEvent[] | ITransactionEvent[] | IGasPriceEvent[] | INetworkStatsEvent[]> = new Map();
  
  // Event callbacks
  private onBlockEvent?: (event: IBlockEvent) => void;
  private onTransactionEvent?: (event: ITransactionEvent) => void;
  private onGasPriceEvent?: (event: IGasPriceEvent) => void;
  private onNetworkStatsEvent?: (event: INetworkStatsEvent) => void;
  private onConnectionChange?: (connected: boolean) => void;

  constructor(private config: IBlockchainEventConfig) {
    this.wsService = new WebSocketService({
      url: 'wss://eth-mainnet.alchemyapi.io/v2/demo/ws',
      reconnectAttempts: 3,
      reconnectInterval: 2000,
      heartbeatInterval: 60000,
      maxMessageQueue: 50,
      enableCompression: false
    });
    this.cache = new CacheService({
      strategy: CacheStrategy.LRU,
      maxSize: 2000,
      defaultTTL: 600000, // 10 minutes TTL
      enableMetrics: true
    });

    this.setupEventListeners();
    this.initializeEventHistory();
  }

  /** Initialize blockchain event service */
  async initialize(): Promise<void> {
    try {
      await this.wsService.connect();
      
      // Subscribe to configured event types
      if (this.config.monitorBlocks) {
        await this.subscribeToBlocks();
      }
      
      if (this.config.monitorTransactions) {
        await this.subscribeToTransactions();
      }
      
      if (this.config.monitorGasPrices) {
        await this.subscribeToGasPrices();
      }
      
      if (this.config.monitorNetworkStats) {
        await this.subscribeToNetworkStats();
      }

      // Subscribe to specific addresses
      for (const address of this.config.watchedAddresses) {
        await this.watchAddress(address);
      }
      
      console.log('[BlockchainEvents] Initialized with', this.subscriptions.size, 'subscriptions');
    } catch (error) {
      console.error('[BlockchainEvents] Initialization failed:', error);
      throw error;
    }
  }

  /** Subscribe to new block events */
  async subscribeToBlocks(): Promise<void> {
    const subscriptionId = this.wsService.subscribe({
      type: SubscriptionType.BLOCK_HEADERS,
      callback: (data) => this.handleBlockEvent(data),
      errorCallback: (error) => console.error('[BlockchainEvents] Block subscription error:', error)
    });

    this.subscriptions.set('blocks', subscriptionId);
    console.log('[BlockchainEvents] Subscribed to block events');
  }

  /** Subscribe to pending transaction events */
  async subscribeToTransactions(): Promise<void> {
    const subscriptionId = this.wsService.subscribe({
      type: SubscriptionType.PENDING_TRANSACTIONS,
      callback: (data) => this.handleTransactionEvent(data),
      errorCallback: (error) => console.error('[BlockchainEvents] Transaction subscription error:', error)
    });

    this.subscriptions.set('transactions', subscriptionId);
    console.log('[BlockchainEvents] Subscribed to transaction events');
  }

  /** Subscribe to gas price updates */
  async subscribeToGasPrices(): Promise<void> {
    const subscriptionId = this.wsService.subscribe({
      type: SubscriptionType.GAS_PRICES,
      callback: (data) => this.handleGasPriceEvent(data),
      errorCallback: (error) => console.error('[BlockchainEvents] Gas price subscription error:', error)
    });

    this.subscriptions.set('gasPrice', subscriptionId);
    console.log('[BlockchainEvents] Subscribed to gas price events');
  }

  /** Subscribe to network statistics */
  async subscribeToNetworkStats(): Promise<void> {
    const subscriptionId = this.wsService.subscribe({
      type: SubscriptionType.NETWORK_STATS,
      callback: (data: unknown) => {
        if (typeof data === 'object' && data !== null && 'chainId' in data && 'networkName' in data) {
          this.handleNetworkStatsEvent(data as INetworkStatsEvent);
        } else {
          console.error('[BlockchainEvents] Invalid network stats event data:', data);
        }
      },
      errorCallback: (error) => console.error('[BlockchainEvents] Network stats subscription error:', error)
    });

    this.subscriptions.set('networkStats', subscriptionId);
    console.log('[BlockchainEvents] Subscribed to network stats events');
  }

  /** Watch specific address for transactions */
  async watchAddress(address: string): Promise<void> {
    const subscriptionId = this.wsService.subscribe({
      type: SubscriptionType.WALLET_TRANSACTIONS,
      params: { address: address.toLowerCase() },
      callback: (data: unknown) => {
        if (typeof data === 'object' && data !== null && 'hash' in data && 'from' in data) {
          this.handleAddressEvent(address, data as ITransactionEvent);
        } else {
          console.error(`[BlockchainEvents] Invalid address event data for ${address}:`, data);
        }
      },
      errorCallback: (error) => console.error(`[BlockchainEvents] Address ${address} subscription error:`, error)
    });

    this.subscriptions.set(`address:${address}`, subscriptionId);
    console.log('[BlockchainEvents] Watching address', address);
  }

  /** Stop watching specific address */
  unwatchAddress(address: string): void {
    const subscriptionKey = `address:${address}`;
    const subscriptionId = this.subscriptions.get(subscriptionKey);
    
    if (subscriptionId) {
      this.wsService.unsubscribe(subscriptionId);
      this.subscriptions.delete(subscriptionKey);
      console.log('[BlockchainEvents] Stopped watching address', address);
    }
  }

  /** Get latest block data */
  getLatestBlock(): IBlockEvent | null {
    return this.cache.get('block:latest') as IBlockEvent | null;
  }

  /** Get latest gas prices */
  getLatestGasPrices(): IGasPriceEvent | null {
    return this.cache.get('gas:latest') as IGasPriceEvent | null;
  }

  /** Get latest network stats */
  getLatestNetworkStats(): INetworkStatsEvent | null {
    return this.cache.get('network:latest') as INetworkStatsEvent | null;
  }

  /** Get event history by type */
  getEventHistory(eventType: string, limit?: number): (IBlockEvent | ITransactionEvent | IGasPriceEvent | INetworkStatsEvent)[] {
    const history = this.eventHistory.get(eventType) || [];
    return limit ? history.slice(-limit) : history;
  }

  /** Get transactions for a specific address */
  getAddressTransactions(address: string, limit?: number): ITransactionEvent[] {
    const transactions = this.eventHistory.get(`address:${address}`) as ITransactionEvent[] || [];
    return limit ? transactions.slice(-limit) : transactions;
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
      watchedAddresses: this.config.watchedAddresses.length,
      eventHistorySize: Array.from(this.eventHistory.values()).reduce((sum, history) => sum + history.length, 0)
    };
  }

  /** Set event callbacks */
  setEventCallbacks(callbacks: {
    onBlockEvent?: (event: IBlockEvent) => void;
    onTransactionEvent?: (event: ITransactionEvent) => void;
    onGasPriceEvent?: (event: IGasPriceEvent) => void;
    onNetworkStatsEvent?: (event: INetworkStatsEvent) => void;
    onConnectionChange?: (connected: boolean) => void;
  }): void {
    this.onBlockEvent = callbacks.onBlockEvent;
    this.onTransactionEvent = callbacks.onTransactionEvent;
    this.onGasPriceEvent = callbacks.onGasPriceEvent;
    this.onNetworkStatsEvent = callbacks.onNetworkStatsEvent;
    this.onConnectionChange = callbacks.onConnectionChange;
  }

  /** Initialize event history storage */
  private initializeEventHistory(): void {
    this.eventHistory.set('blocks', []);
    this.eventHistory.set('transactions', []);
    this.eventHistory.set('gasPrices', []);
    this.eventHistory.set('networkStats', []);
    
    // Initialize history for watched addresses
    this.config.watchedAddresses.forEach(address => {
      this.eventHistory.set(`address:${address}`, []);
    });
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
        console.error('[BlockchainEvents] WebSocket error:', error);
      },
      onReconnect: () => {
        console.log('[BlockchainEvents] Reconnected, resubscribing to events');
        this.initialize();
      }
    });
  }

  /** Handle new block events */
  private handleBlockEvent(data: unknown): void {
    try {
      const d = data as { [key: string]: unknown };
      const blockEvent: IBlockEvent = {
        number: typeof d.number === 'string' ? parseInt(d.number, 16) : (d.number as number),
        hash: d.hash as string,
        timestamp: typeof d.timestamp === 'string' ? parseInt(d.timestamp, 16) * 1000 : (d.timestamp as number),
        gasLimit: d.gasLimit as string,
        gasUsed: d.gasUsed as string,
        transactionCount: Array.isArray(d.transactions) ? d.transactions.length : (typeof d.transactionCount === 'number' ? d.transactionCount : 0),
        miner: d.miner as string,
        difficulty: d.difficulty as string,
        totalDifficulty: d.totalDifficulty as string
      };

      // Cache the block
      this.cache.set(`block:${blockEvent.number}`, blockEvent);
      this.cache.set('block:latest', blockEvent);

      // Add to history
      this.addToHistory('blocks', blockEvent);

      // Notify listeners
      if (this.onBlockEvent) {
        this.onBlockEvent(blockEvent);
      }

    } catch (error) {
      console.error('[BlockchainEvents] Failed to process block event:', error);
    }
  }

  /** Handle transaction events */
  private handleTransactionEvent(data: unknown): void {
    try {
      const d = data as { [key: string]: unknown };
      const validStatus = (val: unknown): val is 'pending' | 'confirmed' | 'failed' =>
        val === 'pending' || val === 'confirmed' || val === 'failed';
      const txEvent: ITransactionEvent = {
        hash: d.hash as string,
        from: d.from as string,
        to: d.to as string,
        value: d.value as string,
        gasPrice: d.gasPrice as string,
        gasLimit: (d.gas as string) ?? (d.gasLimit as string),
        gasUsed: d.gasUsed as string,
        status: validStatus(d.status) ? (d.status as 'pending' | 'confirmed' | 'failed') : 'pending',
        blockNumber: d.blockNumber ? (typeof d.blockNumber === 'string' ? parseInt(d.blockNumber, 16) : (d.blockNumber as number)) : undefined,
        blockHash: d.blockHash as string,
        timestamp: Date.now()
      };

      // Cache the transaction
      this.cache.set(`tx:${txEvent.hash}`, txEvent);

      // Add to history
      this.addToHistory('transactions', txEvent);

      // Check if this affects any watched addresses
      this.config.watchedAddresses.forEach(address => {
        if (txEvent.from.toLowerCase() === address.toLowerCase() || 
            txEvent.to?.toLowerCase() === address.toLowerCase()) {
          this.addToHistory(`address:${address}`, txEvent);
        }
      });

      // Notify listeners
      if (this.onTransactionEvent) {
        this.onTransactionEvent(txEvent);
      }

    } catch (error) {
      console.error('[BlockchainEvents] Failed to process transaction event:', error);
    }
  }

  /** Handle gas price events */
  private handleGasPriceEvent(data: unknown): void {
    try {
      const d = data as { [key: string]: unknown };
      const gasPriceEvent: IGasPriceEvent = {
        slow: (d.slow as string) ?? '',
        standard: (d.standard as string) ?? '',
        fast: (d.fast as string) ?? '',
        instant: (d.instant as string) ?? '',
        baseFee: d.baseFee as string,
        timestamp: Date.now()
      };

      // Cache the gas prices
      this.cache.set('gas:latest', gasPriceEvent);

      // Add to history
      this.addToHistory('gasPrices', gasPriceEvent);

      // Notify listeners
      if (this.onGasPriceEvent) {
        this.onGasPriceEvent(gasPriceEvent);
      }

    } catch (error) {
      console.error('[BlockchainEvents] Failed to process gas price event:', error);
    }
  }

  /** Handle network stats events */
  private handleNetworkStatsEvent(data: INetworkStatsEvent): void {
    try {
      const networkStatsEvent: INetworkStatsEvent = {
        chainId: data.chainId as number,
        networkName: data.networkName as string,
        blockNumber: data.blockNumber as number,
        hashRate: data.hashRate as string,
        difficulty: data.difficulty as string,
        pendingTransactions: data.pendingTransactions as number,
        activeNodes: data.activeNodes as number,
        timestamp: Date.now()
      };

      // Cache the network stats
      this.cache.set('network:latest', networkStatsEvent);

      // Add to history
      this.addToHistory('networkStats', networkStatsEvent);

      // Notify listeners
      if (this.onNetworkStatsEvent) {
        this.onNetworkStatsEvent(networkStatsEvent);
      }

    } catch (error) {
      console.error('[BlockchainEvents] Failed to process network stats event:', error);
    }
  }

  /** Handle address-specific events */
  private handleAddressEvent(address: string, data: ITransactionEvent): void {
    // This is handled in handleTransactionEvent
    console.log(`[BlockchainEvents] Address ${address} event:`, data);
  }

  /** Add event to history with size limit */
  private addToHistory(eventType: string, event: IBlockEvent | ITransactionEvent | IGasPriceEvent | INetworkStatsEvent): void {
    let history = this.eventHistory.get(eventType);
    if (!history) {
      if (eventType === 'blocks') {
        history = [] as IBlockEvent[];
      } else if (eventType === 'transactions' || eventType.startsWith('address:')) {
        history = [] as ITransactionEvent[];
      } else if (eventType === 'gasPrices') {
        history = [] as IGasPriceEvent[];
      } else if (eventType === 'networkStats') {
        history = [] as INetworkStatsEvent[];
      } else {
        history = [];
      }
    }
    (history as typeof event[]).push(event);
    // Limit history size
    if (history.length > this.config.maxEventHistory) {
      history.shift();
    }
    this.eventHistory.set(eventType, history);
  }

  /** Disconnect and cleanup */
  async dispose(): Promise<void> {
    await this.wsService.disconnect();
    this.cache.clear();
    this.subscriptions.clear();
    this.eventHistory.clear();
  }

  /** Static factory method for DSKY configuration */
  static createForDSKY(watchedAddresses: string[]): RealTimeBlockchainService {
    const config: IBlockchainEventConfig = {
      monitorBlocks: true,
      monitorTransactions: true,
      monitorGasPrices: true,
      monitorNetworkStats: true,
      watchedAddresses,
      eventFilters: [],
      maxEventHistory: 1000
    };
    return new RealTimeBlockchainService(config);
  }
}
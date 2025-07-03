/**
 * @fileoverview Advanced Caching Service
 * @description Enterprise-grade in-memory caching system with Redis-like features
 */

export enum CacheStrategy {
  LRU = 'LRU',
  FIFO = 'FIFO',
  TTL = 'TTL'
}

export interface ICacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  accessCount: number;
  lastAccessed: number;
}

export interface ICacheConfig {
  maxSize: number;
  defaultTTL: number;
  strategy: CacheStrategy;
  enableMetrics: boolean;
}

export interface ICacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
  hitRate: number;
}

export interface ICacheOptions {
  ttl?: number;
  priority?: number;
  tags?: string[];
}

/**
 * Advanced caching service with LRU, TTL, and performance metrics
 */
export class CacheService<T = unknown> {
  private cache = new Map<string, ICacheEntry<T>>();
  private accessOrder: string[] = [];
  private metrics: ICacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0
  };
  
  private cleanupTimer: NodeJS.Timeout | null = null;
  private readonly tagIndex = new Map<string, Set<string>>();

  constructor(private config: ICacheConfig) {
    if (config.strategy === CacheStrategy.TTL) {
      this.startCleanupTimer();
    }
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Check TTL expiration
    if (this.isExpired(entry)) {
      this.delete(key);
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    // Update LRU order
    if (this.config.strategy === CacheStrategy.LRU) {
      this.updateAccessOrder(key);
    }

    this.metrics.hits++;
    this.updateHitRate();
    return entry.value;
  }

  /**
   * Set value in cache with options
   */
  set(key: string, value: T, options: ICacheOptions = {}): void {
    const ttl = options.ttl || this.config.defaultTTL;
    
    const entry: ICacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl > 0 ? ttl : undefined,
      accessCount: 1,
      lastAccessed: Date.now()
    };

    // Handle cache size limits
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    
    // Handle tags
    if (options.tags) {
      this.addTags(key, options.tags);
    }

    // Update access order for LRU
    if (this.config.strategy === CacheStrategy.LRU) {
      this.updateAccessOrder(key);
    }

    this.metrics.sets++;
    this.metrics.size = this.cache.size;
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    
    if (existed) {
      this.removeFromAccessOrder(key);
      this.removeFromTagIndex(key);
      this.metrics.deletes++;
      this.metrics.size = this.cache.size;
    }
    
    return existed;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Get or set with function
   */
  async getOrSet<U extends T>(
    key: string,
    factory: () => Promise<U>,
    options: ICacheOptions = {}
  ): Promise<U> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached as U;
    }

    const value = await factory();
    this.set(key, value, options);
    return value;
  }

  /**
   * Invalidate cache entries by tag
   */
  invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let count = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        count++;
      }
    }

    this.tagIndex.delete(tag);
    return count;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.tagIndex.clear();
    this.metrics.size = 0;
  }
  /**
   * Get cache metrics
   */
  getMetrics(): ICacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache statistics (alias for getMetrics for compatibility)
   */
  getStats(): ICacheMetrics & { size: number } {
    return { 
      ...this.metrics,
      size: this.cache.size
    };
  }

  /**
   * Get cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Dispose of cache service
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  // Private methods

  private isExpired(entry: ICacheEntry<T>): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private evictOldest(): void {
    let keyToEvict: string | null = null;

    switch (this.config.strategy) {
      case CacheStrategy.LRU: {
        keyToEvict = this.accessOrder[0] || null;
        break;
      }
      
      case CacheStrategy.FIFO: {
        keyToEvict = this.cache.keys().next().value || null;
        break;
      }
      
      case CacheStrategy.TTL: {
        // Find entry with shortest remaining TTL
        let shortestTTL = Infinity;
        
        for (const [key, entry] of this.cache.entries()) {
          if (entry.ttl) {
            const remaining = entry.ttl - (Date.now() - entry.timestamp);
            if (remaining < shortestTTL) {
              shortestTTL = remaining;
              keyToEvict = key;
            }
          }
        }
        break;
      }
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
      this.metrics.evictions++;
    }
  }

  private addTags(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  private removeFromTagIndex(key: string): void {
    for (const keys of this.tagIndex.values()) {
      keys.delete(key);
    }
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }
}

/**
 * Global cache instance factory
 */
export class CacheManager {
  private static caches = new Map<string, CacheService>();

  static getCache<T>(
    name: string,
    config: Partial<ICacheConfig> = {}
  ): CacheService<T> {
    if (!this.caches.has(name)) {
      const defaultConfig: ICacheConfig = {
        maxSize: 1000,
        defaultTTL: 300000, // 5 minutes
        strategy: CacheStrategy.LRU,
        enableMetrics: true,
        ...config
      };
      
      this.caches.set(name, new CacheService<T>(defaultConfig));
    }
    
    return this.caches.get(name)! as CacheService<T>;
  }

  static clearCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      return true;
    }
    return false;
  }

  static disposeCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.dispose();
      this.caches.delete(name);
      return true;
    }
    return false;
  }

  static getAllMetrics(): Record<string, ICacheMetrics> {
    const metrics: Record<string, ICacheMetrics> = {};
    for (const [name, cache] of this.caches.entries()) {
      metrics[name] = cache.getMetrics();
    }
    return metrics;
  }

  static disposeAll(): void {
    for (const cache of this.caches.values()) {
      cache.dispose();
    }
    this.caches.clear();
  }
}

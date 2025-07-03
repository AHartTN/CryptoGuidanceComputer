// Apollo DSKY - Production Configuration Service
// Environment-specific configuration management for production deployment

import { CacheService, CacheStrategy } from '../cache/CacheService';

/** Environment Types */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

/** Feature Flags */
export interface IFeatureFlags {
  enableRealTimeData: boolean;
  enablePerformanceMonitoring: boolean;
  enableAdvancedAnalytics: boolean;
  enableDebugMode: boolean;
  enableErrorReporting: boolean;
  enableMetrics: boolean;
  enableCaching: boolean;
  enableServiceWorker: boolean;
  enableOfflineMode: boolean;
  enableSecurityFeatures: boolean;
}

/** API Configuration */
export interface IApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  rateLimitPerMinute: number;
  enableCORS: boolean;
  enableCompression: boolean;
  apiKey?: string;
  endpoints: {
    alchemy: string;
    coinGecko: string;
    hardhat: string;
    websocket: string;
  };
}

/** Caching Configuration */
export interface ICacheConfig {
  enabled: boolean;
  defaultTTL: number;
  maxKeys: number;
  strategy?: string; // 'LRU' | 'FIFO' | 'TTL'
  enablePersistence: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

/** Performance Configuration */
export interface IPerformanceConfig {
  enableMonitoring: boolean;
  sampleRate: number;
  metricsEndpoint?: string;
  alertThresholds: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
  };
  enableResourceMonitoring: boolean;
}

/** Security Configuration */
export interface ISecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableClickjacking: boolean;
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  inputValidation: {
    enabled: boolean;
    sanitizeHtml: boolean;
    validateAddresses: boolean;
  };
}

/** Application Configuration */
export interface IAppConfig {
  environment: Environment;
  version: string;
  buildTimestamp: number;
  featureFlags: IFeatureFlags;
  api: IApiConfig;
  cache: ICacheConfig;
  performance: IPerformanceConfig;
  security: ISecurityConfig;
  logging: {
    level: string;
    enableRemoteLogging: boolean;
    remoteEndpoint?: string;
  };
  ui: {
    theme: 'apollo' | 'dark' | 'light';
    enableAnimations: boolean;
    enableSounds: boolean;
    enableAccessibility: boolean;
  };
  web3: {
    defaultNetwork: string;
    supportedNetworks: string[];
    walletConnectProjectId?: string;
    infuraApiKey?: string;
    alchemyApiKey?: string;
  };
}

/** Configuration Service */
export class ProductionConfigurationService {
  private cache: CacheService;
  private config: IAppConfig;
  private environment: Environment;
  private overrides: Map<string, unknown> = new Map();
  constructor() {
    this.cache = new CacheService({
      defaultTTL: 3600000, // 1 hour
      maxSize: 1000,
      strategy: CacheStrategy.LRU,
      enableMetrics: true
    });

    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
    
    console.log(`[ProductionConfig] Initialized for ${this.environment} environment`);
  }

  /** Get current environment */
  getEnvironment(): Environment {
    return this.environment;
  }

  /** Get full configuration */
  getConfig(): IAppConfig {
    return { ...this.config };
  }

  /** Get feature flag */
  getFeatureFlag(flag: keyof IFeatureFlags): boolean {
    const override = this.overrides.get(flag as string);
    if (typeof override === 'boolean') {
      return override;
    }
    return this.config.featureFlags[flag];
  }

  /** Get API configuration */
  getApiConfig(): IApiConfig {
    return { ...this.config.api };
  }

  /** Get API endpoint */
  getApiEndpoint(service: keyof IApiConfig['endpoints']): string {
    const override = this.overrides.get(service as string);
    if (typeof override === 'string') {
      return override;
    }
    return this.config.api.endpoints[service];
  }

  /** Get cache configuration */
  getCacheConfig(): ICacheConfig {
    return { ...this.config.cache };
  }

  /** Get performance configuration */
  getPerformanceConfig(): IPerformanceConfig {
    return { ...this.config.performance };
  }

  /** Get security configuration */
  getSecurityConfig(): ISecurityConfig {
    return { ...this.config.security };
  }

  /** Check if feature is enabled */
  isFeatureEnabled(feature: keyof IFeatureFlags): boolean {
    return this.getFeatureFlag(feature);
  }

  /** Check if development mode */
  isDevelopment(): boolean {
    return this.environment === Environment.DEVELOPMENT;
  }

  /** Check if production mode */
  isProduction(): boolean {
    return this.environment === Environment.PRODUCTION;
  }

  /** Set configuration override */
  setOverride(key: string, value: unknown): void {
    this.overrides.set(key, value);
    this.cache.set(`override:${key}`, value);
    console.log(`[ProductionConfig] Set override: ${key} = ${String(value)}`);
  }

  /** Remove configuration override */
  removeOverride(key: string): void {
    this.overrides.delete(key);
    this.cache.delete(`override:${key}`);
    console.log(`[ProductionConfig] Removed override: ${key}`);
  }

  /** Get build information */
  getBuildInfo(): {
    version: string;
    buildTimestamp: number;
    environment: Environment;
    buildDate: string;
  } {
    return {
      version: this.config.version,
      buildTimestamp: this.config.buildTimestamp,
      environment: this.environment,
      buildDate: new Date(this.config.buildTimestamp).toISOString()
    };
  }

  /** Validate configuration */
  validateConfig(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate API configuration
    if (!this.config.api.baseUrl) {
      errors.push('API base URL is required');
    }

    if (this.config.api.timeout < 1000) {
      warnings.push('API timeout is very low (< 1000ms)');
    }

    // Validate Web3 configuration
    if (!this.config.web3.defaultNetwork) {
      errors.push('Default Web3 network is required');
    }

    if (this.isProduction() && !this.config.web3.alchemyApiKey) {
      warnings.push('Alchemy API key not configured for production');
    }

    // Validate security configuration
    if (this.isProduction() && !this.config.security.enableCSP) {
      warnings.push('Content Security Policy not enabled for production');
    }

    // Validate performance configuration
    if (this.isProduction() && !this.config.performance.enableMonitoring) {
      warnings.push('Performance monitoring not enabled for production');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /** Get environment-specific configuration */
  getEnvironmentConfig(): Partial<IAppConfig> {
    switch (this.environment) {
      case Environment.DEVELOPMENT:
        return this.getDevelopmentConfig();
      case Environment.STAGING:
        return this.getStagingConfig();
      case Environment.PRODUCTION:
        return this.getProductionConfig();
      case Environment.TEST:
        return this.getTestConfig();
      default:
        return {};
    }
  }

  /** Load configuration from environment */
  private loadConfiguration(): IAppConfig {
    const baseConfig = this.getBaseConfiguration();
    const envConfig = this.getEnvironmentConfig();
    
    // Merge configurations
    const config = this.deepMerge(baseConfig, envConfig);
    
    // Apply environment variables
    this.applyEnvironmentVariables(config);
    
    return config;
  }

  /** Detect current environment */
  private detectEnvironment(): Environment {
    // Check environment variable
    const nodeEnv = import.meta.env.MODE;
    if (nodeEnv) {
      switch (nodeEnv.toLowerCase()) {
        case 'development':
          return Environment.DEVELOPMENT;
        case 'staging':
          return Environment.STAGING;
        case 'production':
          return Environment.PRODUCTION;
        case 'test':
          return Environment.TEST;
      }
    }

    // Check hostname
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return Environment.DEVELOPMENT;
    }
    
    if (hostname.includes('staging')) {
      return Environment.STAGING;
    }
    
    if (hostname.includes('test')) {
      return Environment.TEST;
    }

    // Default to production for unknown environments
    return Environment.PRODUCTION;
  }

  /** Get base configuration */
  private getBaseConfiguration(): IAppConfig {
    return {
      environment: this.environment,
      version: '1.0.0',
      buildTimestamp: Date.now(),
      featureFlags: {
        enableRealTimeData: true,
        enablePerformanceMonitoring: true,
        enableAdvancedAnalytics: true,
        enableDebugMode: false,
        enableErrorReporting: true,
        enableMetrics: true,
        enableCaching: true,
        enableServiceWorker: true,
        enableOfflineMode: false,
        enableSecurityFeatures: true
      },
      api: {
        baseUrl: '',
        timeout: 30000,
        retryAttempts: 3,
        rateLimitPerMinute: 60,
        enableCORS: true,
        enableCompression: true,
        endpoints: {
          alchemy: 'https://eth-mainnet.alchemyapi.io/v2',
          coinGecko: 'https://api.coingecko.com/api/v3',
          hardhat: 'http://192.168.1.2:8545',
          websocket: 'wss://eth-mainnet.alchemyapi.io/v2'
        }
      },
      cache: {
        enabled: true,
        defaultTTL: 300000, // 5 minutes
        maxKeys: 10000,
        enablePersistence: true,
        compressionEnabled: true,
        encryptionEnabled: false
      },
      performance: {
        enableMonitoring: true,
        sampleRate: 0.1,
        alertThresholds: {
          responseTime: 5000,
          memoryUsage: 80,
          errorRate: 5
        },
        enableResourceMonitoring: true
      },
      security: {
        enableCSP: true,
        enableHSTS: true,
        enableXSSProtection: true,
        enableClickjacking: true,
        rateLimiting: {
          enabled: true,
          windowMs: 60000,
          maxRequests: 100
        },
        inputValidation: {
          enabled: true,
          sanitizeHtml: true,
          validateAddresses: true
        }
      },
      logging: {
        level: 'info',
        enableRemoteLogging: false
      },
      ui: {
        theme: 'apollo',
        enableAnimations: true,
        enableSounds: false,
        enableAccessibility: true
      },
      web3: {
        defaultNetwork: 'hardhat',
        supportedNetworks: ['hardhat', 'ethereum', 'polygon']
      }
    };
  }

  /** Get development configuration */
  private getDevelopmentConfig(): Partial<IAppConfig> {
    return {
      featureFlags: {
        enableRealTimeData: true,
        enablePerformanceMonitoring: true,
        enableAdvancedAnalytics: true,
        enableDebugMode: true,
        enableErrorReporting: false,
        enableMetrics: true,
        enableCaching: true,
        enableServiceWorker: false,
        enableOfflineMode: false,
        enableSecurityFeatures: false
      },      api: {
        baseUrl: 'http://localhost:3001',
        timeout: 10000,
        retryAttempts: 1,
        rateLimitPerMinute: 1000,
        enableCORS: true,
        enableCompression: true,
        endpoints: {
          alchemy: 'http://192.168.1.2:8545',
          coinGecko: 'https://api.coingecko.com/api/v3',
          hardhat: 'http://192.168.1.2:8545',
          websocket: 'ws://192.168.1.2:8545'
        }
      },
      performance: {
        enableMonitoring: true,
        sampleRate: 1.0, // 100% sampling in development
        alertThresholds: {
          responseTime: 10000,
          memoryUsage: 90,
          errorRate: 10
        },
        enableResourceMonitoring: true
      },
      logging: {
        level: 'debug',
        enableRemoteLogging: false
      }
    };
  }

  /** Get staging configuration */
  private getStagingConfig(): Partial<IAppConfig> {
    return {
      featureFlags: {
        enableRealTimeData: true,
        enablePerformanceMonitoring: true,
        enableAdvancedAnalytics: true,
        enableDebugMode: false,
        enableErrorReporting: true,
        enableMetrics: true,
        enableCaching: true,
        enableServiceWorker: true,
        enableOfflineMode: false,
        enableSecurityFeatures: true
      },
      performance: {
        enableMonitoring: true,
        sampleRate: 0.5, // 50% sampling in staging
        alertThresholds: {
          responseTime: 7000,
          memoryUsage: 85,
          errorRate: 8
        },
        enableResourceMonitoring: true
      },
      logging: {
        level: 'info',
        enableRemoteLogging: true
      }
    };
  }

  /** Get production configuration */
  private getProductionConfig(): Partial<IAppConfig> {
    return {
      featureFlags: {
        enableRealTimeData: true,
        enablePerformanceMonitoring: true,
        enableAdvancedAnalytics: true,
        enableDebugMode: false,
        enableErrorReporting: true,
        enableMetrics: true,
        enableCaching: true,
        enableServiceWorker: true,
        enableOfflineMode: true,
        enableSecurityFeatures: true
      },
      performance: {
        enableMonitoring: true,
        sampleRate: 0.1, // 10% sampling in production
        alertThresholds: {
          responseTime: 5000,
          memoryUsage: 80,
          errorRate: 5
        },
        enableResourceMonitoring: true
      },
      security: {
        enableCSP: true,
        enableHSTS: true,
        enableXSSProtection: true,
        enableClickjacking: true,
        rateLimiting: {
          enabled: true,
          windowMs: 60000,
          maxRequests: 60
        },
        inputValidation: {
          enabled: true,
          sanitizeHtml: true,
          validateAddresses: true
        }
      },
      logging: {
        level: 'warn',
        enableRemoteLogging: true
      }
    };
  }

  /** Get test configuration */
  private getTestConfig(): Partial<IAppConfig> {
    return {
      featureFlags: {
        enableRealTimeData: false,
        enablePerformanceMonitoring: false,
        enableAdvancedAnalytics: false,
        enableDebugMode: true,
        enableErrorReporting: false,
        enableMetrics: false,
        enableCaching: false,
        enableServiceWorker: false,
        enableOfflineMode: false,
        enableSecurityFeatures: false
      },      api: {
        baseUrl: 'https://api.production.com',
        timeout: 5000,
        retryAttempts: 0,
        rateLimitPerMinute: 10000,
        enableCORS: false,
        enableCompression: true,
        endpoints: {
          alchemy: 'https://eth-mainnet.alchemyapi.io/v2',
          coinGecko: 'https://api.coingecko.com/api/v3',
          hardhat: 'https://mainnet.infura.io/v3',
          websocket: 'wss://eth-mainnet.alchemyapi.io/v2'
        }
      },
      logging: {
        level: 'error',
        enableRemoteLogging: false
      }
    };
  }

  /** Apply environment variables */
  private applyEnvironmentVariables(config: IAppConfig): void {
    // API Keys
    if (import.meta.env.VITE_ALCHEMY_API_KEY) {
      config.web3.alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
    }

    if (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
      config.web3.walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    }

    // API Configuration
    if (import.meta.env.VITE_API_BASE_URL) {
      config.api.baseUrl = import.meta.env.VITE_API_BASE_URL;
    }

    // Feature Flags
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      config.featureFlags.enableDebugMode = true;
    }

    // Performance Configuration
    if (import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE) {
      config.performance.sampleRate = parseFloat(import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE);
    }
  }

  /** Deep merge objects */
  private deepMerge(target: IAppConfig, source: Partial<IAppConfig>): IAppConfig {
    const result: IAppConfig = { ...target };
    (Object.keys(source) as (keyof IAppConfig)[]).forEach(key => {
      const sourceValue = source[key];
      if (sourceValue === undefined) return;
      if (typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        if (key === 'featureFlags') {
          result.featureFlags = { ...target.featureFlags, ...source.featureFlags };
        } else if (key === 'api') {
          result.api = { ...target.api, ...source.api };
          if (source.api && source.api.endpoints) {
            result.api.endpoints = { ...target.api.endpoints, ...source.api.endpoints };
          }
        } else if (key === 'cache') {
          result.cache = { ...target.cache, ...source.cache };
        } else if (key === 'performance') {
          result.performance = { ...target.performance, ...source.performance };
        } else if (key === 'security') {
          result.security = { ...target.security, ...source.security };
        } else if (key === 'logging') {
          result.logging = { ...target.logging, ...source.logging };
        } else if (key === 'ui') {
          result.ui = { ...target.ui, ...source.ui };
        } else if (key === 'web3') {
          result.web3 = { ...target.web3, ...source.web3 };
        }
      } else {
        if (key === 'environment' && typeof sourceValue === 'string') {
          result.environment = sourceValue as Environment;
        } else if (key === 'version' && typeof sourceValue === 'string') {
          result.version = sourceValue;
        } else if (key === 'buildTimestamp' && typeof sourceValue === 'number') {
          result.buildTimestamp = sourceValue;
        }
        // Do not assign for any other keys (strict type safety)
      }
    });
    return result;
  }

  /** Create singleton instance */
  private static instance?: ProductionConfigurationService;
  
  static getInstance(): ProductionConfigurationService {
    if (!ProductionConfigurationService.instance) {
      ProductionConfigurationService.instance = new ProductionConfigurationService();
    }
    return ProductionConfigurationService.instance;
  }
}

// Export singleton instance
export const ProductionConfig = ProductionConfigurationService.getInstance();

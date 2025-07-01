import { IDSKYCommand, IDSKYState } from '../interfaces/IDSKYCore';
import { CryptoPrice } from '../models/CryptoModels';

// Enhanced error handling types
interface DSKYCommandError {
  code: string;
  message: string;
  retryable: boolean;
  timestamp: number;
}

interface DSKYCommandMetrics {
  executionTime: number;
  retryCount: number;
  success: boolean;
  errorCode?: string;
}

export abstract class BaseDSKYCommand implements IDSKYCommand {
  private startTime: number = 0;
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor(
    public verb: string,
    public noun: string,
    protected dskyState: IDSKYState,
    protected updateState: (updater: (prev: IDSKYState) => IDSKYState) => void
  ) {}

  abstract executeCommand(): Promise<void>;

  // Public execute method with retry logic and metrics
  async execute(): Promise<void> {
    this.startTime = performance.now();
    this.retryCount = 0;

    console.log(`🚀 Executing command V${this.verb}N${this.noun}`);
    this.setCompActy(true);

    try {
      await this.executeWithRetry();
      this.logMetrics(true);
    } catch (error) {
      const dskyError = this.handleError(error);
      this.logMetrics(false, dskyError.code);
      this.setError(true);
      console.error(`💥 Command V${this.verb}N${this.noun} failed:`, dskyError);
    }
  }

  private async executeWithRetry(): Promise<void> {
    while (this.retryCount <= this.maxRetries) {
      try {
        await this.executeCommand();
        return;
      } catch (error) {
        const dskyError = this.handleError(error);
        
        if (!dskyError.retryable || this.retryCount >= this.maxRetries) {
          throw error;
        }

        this.retryCount++;
        console.warn(`⚠️ Command V${this.verb}N${this.noun} failed, retry ${this.retryCount}/${this.maxRetries}:`, dskyError.message);
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
        await this.sleep(delay);
      }
    }
  }

  private handleError(error: unknown): DSKYCommandError {
    if (error instanceof Error) {
      // Categorize errors for better handling
      switch (true) {
        case error.message.includes('network'):
        case error.message.includes('timeout'):
        case error.message.includes('fetch'):
          return {
            code: 'NETWORK_ERROR',
            message: `Network error: ${error.message}`,
            retryable: true,
            timestamp: Date.now()
          };

        case error.message.includes('MetaMask'):
        case error.message.includes('wallet'):
          return {
            code: 'WALLET_ERROR',
            message: `Wallet error: ${error.message}`,
            retryable: false,
            timestamp: Date.now()
          };

        case error.message.includes('User rejected'):
        case error.message.includes('User denied'):
          return {
            code: 'USER_REJECTED',
            message: 'User rejected the operation',
            retryable: false,
            timestamp: Date.now()
          };

        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: `Unknown error: ${error.message}`,
            retryable: true,
            timestamp: Date.now()
          };
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error occurred',
      retryable: false,
      timestamp: Date.now()
    };
  }

  private logMetrics(success: boolean, errorCode?: string): void {
    const metrics: DSKYCommandMetrics = {
      executionTime: performance.now() - this.startTime,
      retryCount: this.retryCount,
      success,
      errorCode
    };

    console.log(`📊 Command V${this.verb}N${this.noun} metrics:`, metrics);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected setCompActy(active: boolean): void {
    this.updateState(prev => ({ ...prev, compActy: active }));
  }

  protected setError(hasError: boolean): void {
    this.updateState(prev => ({ ...prev, oprErr: hasError }));
    if (hasError) {
      setTimeout(() => this.updateState(prev => ({ ...prev, oprErr: false })), 2000);
    }
  }
  protected updateRegisters(reg1: string, reg2: string, reg3: string): void {
    this.updateState(prev => ({
      ...prev,
      reg1: reg1.padStart(5, '0'),
      reg2: reg2.padStart(5, '0'),
      reg3: reg3.padStart(5, '0'),
      compActy: false
    }));
  }
}

export class V12CryptoPriceCommand extends BaseDSKYCommand {
  constructor(
    verb: string,
    noun: string,
    dskyState: IDSKYState,
    updateState: (updater: (prev: IDSKYState) => IDSKYState) => void,
    private cryptoPrices: CryptoPrice[],
    private fetchPrices: () => Promise<void>
  ) {
    super(verb, noun, dskyState, updateState);
  }

  async executeCommand(): Promise<void> {
    this.setCompActy(true);
    
    try {
      await this.fetchPrices();
      const nounNum = parseInt(this.noun);
      
      switch (true) {
        case (nounNum >= 1 && nounNum <= 5 && this.cryptoPrices.length > 0): {
          const crypto = this.cryptoPrices[nounNum - 1];
            switch (!!crypto) {
            case true: {
              // Handle both CryptoPrice class instances and plain objects
              const priceStr = crypto.getFormattedPrice ? 
                crypto.getFormattedPrice() : 
                Math.floor(crypto.price).toString().padStart(5, '0');
              const changeStr = crypto.getFormattedChange ? 
                crypto.getFormattedChange() : 
                Math.abs(crypto.change24h * 100).toFixed(0).padStart(5, '0');
              const symbolCode = crypto.getSymbolCode ? 
                crypto.getSymbolCode() : 
                crypto.symbol.charCodeAt(0).toString().padStart(5, '0');
              
              this.updateRegisters(priceStr, changeStr, symbolCode);
              break;
            }
            default: {
              this.setError(true);
              break;
            }
          }
          break;
        }
        default: {
          this.setError(true);
          break;
        }
      }
    } catch (error) {
      console.error('V12 Command failed:', error);
      this.setError(true);
    }
  }
}

export class V21WalletCommand extends BaseDSKYCommand {
  constructor(
    verb: string,
    noun: string,
    dskyState: IDSKYState,
    updateState: (updater: (prev: IDSKYState) => IDSKYState) => void,
    private connected: boolean,
    private account: string,
    private balance: string,
    private connectWallet: () => Promise<void>
  ) {
    super(verb, noun, dskyState, updateState);
  }

  async executeCommand(): Promise<void> {
    this.setCompActy(true);
    
    try {
      switch (this.connected) {
        case true: {
          const shortAddr = this.account.slice(-5).toUpperCase();
          const balanceInt = Math.floor(parseFloat(this.balance) * 10000);
          const balanceStr = balanceInt.toString();
          
          this.updateRegisters(shortAddr, balanceStr, '00001');
          break;
        }
        default: {
          await this.connectWallet();
          break;
        }
      }
    } catch (error) {
      console.error('V21 Command failed:', error);
      this.setError(true);
    }
  }
}

export class V31SystemCommand extends BaseDSKYCommand {
  constructor(
    verb: string,
    noun: string,
    dskyState: IDSKYState,
    updateState: (updater: (prev: IDSKYState) => IDSKYState) => void,
    private connected: boolean,
    private cryptoCount: number
  ) {
    super(verb, noun, dskyState, updateState);
  }

  async executeCommand(): Promise<void> {
    this.setCompActy(true);
    
    try {
      switch (this.noun) {
        case '01': {
          // System status
          this.updateRegisters(
            this.connected ? '00001' : '00000',
            this.cryptoCount.toString(),
            Date.now().toString().slice(-5)
          );
          break;
        }        case '02': {
          // Reset system - just update state to default values
          this.updateState(() => ({
            verb: '00',
            noun: '00',
            prog: '11',
            reg1: '00000',
            reg2: '00000',
            reg3: '00000',
            compActy: false,
            uplinkActy: false,
            noAtt: false,
            stby: false,
            keyRel: false,
            oprErr: false,
            temp: false,
            gimbalLock: false,
            restart: false
          }));
          break;
        }
        default: {
          this.setError(true);
          break;
        }
      }
    } catch (error) {
      console.error('V31 Command failed:', error);
      this.setError(true);
    }
  }
}

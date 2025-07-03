/**
 * @fileoverview Advanced DSKY Program Service
 * @description Complex multi-step programs for blockchain operations
 */

import { DSKYVerb, DSKYNoun, DSKYProgram } from '../../enums/DSKYEnums';
import { UnifiedWeb3Service } from '../web3/UnifiedWeb3Service';
import { CacheService, CacheManager } from '../cache/CacheService';
import type { IWeb3State } from '../../interfaces/IWeb3State';
import { retryWithBackoff, withTimeout } from '../../utils/asyncUtils';

export interface IProgramStep {
  verb: number;
  noun: number;
  description: string;
  timeout?: number;
  retries?: number;
  dependencies?: string[];
  validation?: (result: unknown) => boolean;
}

export interface IProgramDefinition {
  id: number;
  name: string;
  description: string;
  steps: IProgramStep[];
  category: 'SYSTEM' | 'WALLET' | 'TRADING' | 'DEFI' | 'ANALYTICS' | 'SECURITY';
  estimatedDuration: number;
  requirements?: string[];
}

export interface IProgramExecutionContext {
  programId: number;
  currentStep: number;
  results: Map<string, unknown>;
  startTime: number;
  web3State: IWeb3State;
  cache: CacheService;
}

export interface IProgramExecutionResult {
  success: boolean;
  programId: number;
  stepResults: IProgramStepResult[];
  totalDuration: number;
  error?: string;
  partialResults?: boolean;
}

export interface IProgramStepResult {
  error?: string;
  [key: string]: unknown;
}

export interface IProgramStatistics {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  programStats: Map<number, {
    executions: number;
    successes: number;
    averageDuration: number;
    totalDuration: number;
  }>;
}

export class DSKYProgramService {
  private programs = new Map<number, IProgramDefinition>();
  private executionHistory: IProgramExecutionResult[] = [];
  private cache: CacheService;

  constructor(private web3Service: UnifiedWeb3Service) {
    this.cache = CacheManager.getCache('dsky-programs', {
      maxSize: 100,
      defaultTTL: 300000, // 5 minutes
    });
    
    this.initializePrograms();
  }

  private initializePrograms(): void {
    // System Programs
    this.registerProgram({
      id: DSKYProgram.PROG_STARTUP,
      name: 'System Startup',
      description: 'Complete system initialization sequence',
      category: 'SYSTEM',
      estimatedDuration: 15000,
      steps: [
        { verb: DSKYVerb.VERB_HEALTH_CHECK, noun: DSKYNoun.NOUN_SYSTEM_STATUS, description: 'System health check' },
        { verb: DSKYVerb.VERB_CONNECT_WALLET, noun: DSKYNoun.NOUN_WALLET_ADDRESS, description: 'Connect wallet' },
        { verb: DSKYVerb.VERB_NETWORK_STATUS, noun: DSKYNoun.NOUN_NETWORK_NAME, description: 'Verify network' },
        { verb: DSKYVerb.VERB_WALLET_BALANCE, noun: DSKYNoun.NOUN_WALLET_BALANCE, description: 'Load balance' }
      ]
    });

    this.registerProgram({
      id: DSKYProgram.PROG_HEALTH_CHECK,
      name: 'Complete Health Check',
      description: 'Comprehensive system and network diagnostics',
      category: 'SYSTEM',
      estimatedDuration: 10000,
      steps: [
        { verb: DSKYVerb.VERB_HEALTH_CHECK, noun: DSKYNoun.NOUN_SYSTEM_STATUS, description: 'Internal health' },
        { verb: DSKYVerb.VERB_NETWORK_STATUS, noun: DSKYNoun.NOUN_NETWORK_NAME, description: 'Network status' },
        { verb: DSKYVerb.VERB_BLOCK_CURRENT, noun: DSKYNoun.NOUN_CURRENT_BLOCK, description: 'Latest block' },
        { verb: DSKYVerb.VERB_GAS_PRICES, noun: DSKYNoun.NOUN_GAS_PRICE, description: 'Gas prices' }
      ]
    });

    // Wallet Programs
    this.registerProgram({
      id: DSKYProgram.PROG_WALLET_SETUP,
      name: 'Complete Wallet Setup',
      description: 'Full wallet connection and configuration',
      category: 'WALLET',
      estimatedDuration: 20000,
      requirements: ['MetaMask installed'],
      steps: [
        { verb: DSKYVerb.VERB_CONNECT_WALLET, noun: DSKYNoun.NOUN_WALLET_ADDRESS, description: 'Connect wallet' },
        { verb: DSKYVerb.VERB_WALLET_INFO, noun: DSKYNoun.NOUN_WALLET_ADDRESS, description: 'Get wallet info' },
        { verb: DSKYVerb.VERB_WALLET_BALANCE, noun: DSKYNoun.NOUN_WALLET_BALANCE, description: 'Load balance' },
        { verb: DSKYVerb.VERB_NETWORK_STATUS, noun: DSKYNoun.NOUN_NETWORK_NAME, description: 'Verify network' }
      ]
    });

    // Trading Programs
    this.registerProgram({
      id: DSKYProgram.PROG_PORTFOLIO_VIEW,
      name: 'Portfolio Overview',
      description: 'Complete portfolio analysis and monitoring',
      category: 'TRADING',
      estimatedDuration: 25000,
      requirements: ['Connected wallet'],
      steps: [
        { verb: DSKYVerb.VERB_WALLET_BALANCE, noun: DSKYNoun.NOUN_WALLET_BALANCE, description: 'ETH balance' },
        { verb: DSKYVerb.VERB_DISPLAY_CRYPTO, noun: DSKYNoun.NOUN_WALLET_BALANCE, description: 'Token balances' },
        { verb: DSKYVerb.VERB_CRYPTO_PRICES, noun: DSKYNoun.NOUN_CRYPTO_BITCOIN, description: 'BTC price' },
        { verb: DSKYVerb.VERB_CRYPTO_PRICES, noun: DSKYNoun.NOUN_CRYPTO_ETHEREUM, description: 'ETH price' },
        { verb: DSKYVerb.VERB_CRYPTO_PRICES, noun: DSKYNoun.NOUN_CRYPTO_TOP10, description: 'Top 10 prices' }
      ]
    });

    this.registerProgram({
      id: DSKYProgram.PROG_PRICE_MONITOR,
      name: 'Real-time Price Monitor',
      description: 'Continuous price monitoring with alerts',
      category: 'TRADING',
      estimatedDuration: 30000,
      steps: [
        { verb: DSKYVerb.VERB_CRYPTO_PRICES, noun: DSKYNoun.NOUN_CRYPTO_BITCOIN, description: 'Monitor BTC' },
        { verb: DSKYVerb.VERB_CRYPTO_PRICES, noun: DSKYNoun.NOUN_CRYPTO_ETHEREUM, description: 'Monitor ETH' },
        { verb: DSKYVerb.VERB_CRYPTO_HISTORY, noun: DSKYNoun.NOUN_CRYPTO_BITCOIN, description: 'BTC trends' },
        { verb: DSKYVerb.VERB_CRYPTO_HISTORY, noun: DSKYNoun.NOUN_CRYPTO_ETHEREUM, description: 'ETH trends' }
      ]
    });

    // DeFi Programs  
    this.registerProgram({
      id: DSKYProgram.PROG_DEFI_DASHBOARD,
      name: 'DeFi Dashboard',
      description: 'Complete DeFi protocol overview',
      category: 'DEFI',
      estimatedDuration: 35000,
      requirements: ['Connected wallet', 'DeFi tokens'],
      steps: [        { verb: DSKYVerb.VERB_DISPLAY_CRYPTO, noun: DSKYNoun.NOUN_WALLET_BALANCE, description: 'DeFi balances' },
        { verb: DSKYVerb.VERB_DEFI_OPERATIONS, noun: DSKYNoun.NOUN_WALLET_TOKENS, description: 'Pool info' },
        { verb: DSKYVerb.VERB_STAKING_INFO, noun: DSKYNoun.NOUN_WALLET_TOKENS, description: 'Yield rates' },
        { verb: DSKYVerb.VERB_STAKING_INFO, noun: DSKYNoun.NOUN_WALLET_TOKENS, description: 'Staking positions' }
      ]
    });

    // Analytics Programs
    this.registerProgram({
      id: DSKYProgram.PROG_FULL_ANALYTICS,
      name: 'Complete Analytics Suite',
      description: 'Comprehensive data analysis and reporting',
      category: 'ANALYTICS',
      estimatedDuration: 45000,
      requirements: ['Historical data access'],
      steps: [
        { verb: DSKYVerb.VERB_CRYPTO_HISTORY, noun: DSKYNoun.NOUN_CRYPTO_BITCOIN, description: 'BTC analysis' },
        { verb: DSKYVerb.VERB_CRYPTO_HISTORY, noun: DSKYNoun.NOUN_CRYPTO_ETHEREUM, description: 'ETH analysis' },
        { verb: DSKYVerb.VERB_BLOCK_INFO, noun: DSKYNoun.NOUN_CURRENT_BLOCK, description: 'Block analysis' },        { verb: DSKYVerb.VERB_TRANSACTION_INFO, noun: DSKYNoun.NOUN_GAS_PRICE, description: 'TX analysis' },
        { verb: DSKYVerb.VERB_TRANSACTION_INFO, noun: DSKYNoun.NOUN_GAS_PRICE, description: 'Gas analysis' }
      ]
    });

    // Security Programs
    this.registerProgram({
      id: DSKYProgram.PROG_SECURITY_AUDIT,
      name: 'Security Audit',
      description: 'Security assessment and vulnerability check',
      category: 'SECURITY',
      estimatedDuration: 20000,
      steps: [
        { verb: DSKYVerb.VERB_WALLET_INFO, noun: DSKYNoun.NOUN_WALLET_ADDRESS, description: 'Wallet security' },
        { verb: DSKYVerb.VERB_NETWORK_STATUS, noun: DSKYNoun.NOUN_NETWORK_NAME, description: 'Network security' },
        { verb: DSKYVerb.VERB_HEALTH_CHECK, noun: DSKYNoun.NOUN_SYSTEM_STATUS, description: 'System security' }
      ]
    });
  }

  /**
   * Register a new program
   */
  registerProgram(program: IProgramDefinition): void {
    this.programs.set(program.id, program);
  }

  /**
   * Get program definition
   */
  getProgram(programId: number): IProgramDefinition | null {
    return this.programs.get(programId) || null;
  }

  /**
   * Get all available programs
   */
  getAllPrograms(): IProgramDefinition[] {
    return Array.from(this.programs.values());
  }

  /**
   * Get programs by category
   */
  getProgramsByCategory(category: IProgramDefinition['category']): IProgramDefinition[] {
    return Array.from(this.programs.values()).filter(p => p.category === category);
  }

  /**
   * Execute a program
   */
  async executeProgram(
    programId: number,
    web3State: IWeb3State,
    progressCallback?: (step: number, total: number, description: string) => void
  ): Promise<IProgramExecutionResult> {
    const program = this.programs.get(programId);
    if (!program) {
      throw new Error(`Program ${programId} not found`);
    }

    const context: IProgramExecutionContext = {
      programId,
      currentStep: 0,
      results: new Map(),
      startTime: Date.now(),
      web3State,
      cache: this.cache
    };

    const result: IProgramExecutionResult = {
      success: false,
      programId,
      stepResults: [],
      totalDuration: 0,
      partialResults: false
    };

    try {
      // Check requirements
      if (program.requirements) {
        await this.checkRequirements(program.requirements, web3State);
      }

      // Execute steps
      for (let i = 0; i < program.steps.length; i++) {
        const step = program.steps[i];
        context.currentStep = i;

        progressCallback?.(i + 1, program.steps.length, step.description);

        try {
          const stepResult = await this.executeStep(step, context);
          result.stepResults.push(stepResult as IProgramStepResult);
          context.results.set(`step_${i}`, stepResult);        } catch (stepError) {
          console.error(`Program ${programId} step ${i} failed:`, stepError);
          const errorMessage = stepError instanceof Error ? stepError.message : String(stepError);
          result.stepResults.push({ error: errorMessage });
          result.partialResults = true;
          
          // Continue with non-critical steps
          if (!this.isCriticalStep(step)) {
            continue;
          } else {
            throw stepError;
          }
        }
      }

      result.success = true;    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.error = errorMessage;
      result.success = false;
    }

    result.totalDuration = Date.now() - context.startTime;
    this.executionHistory.push(result);

    // Cache successful results
    if (result.success) {
      this.cache.set(`program_${programId}_result`, result, {
        ttl: 300000, // 5 minutes
        tags: ['program_results', `program_${programId}`]
      });
    }

    return result;
  }

  /**
   * Execute a single program step
   */
  private async executeStep(step: IProgramStep, context: IProgramExecutionContext): Promise<unknown> {
    const cacheKey = `step_${step.verb}_${step.noun}_${context.web3State.account}`;
    
    // Check cache first
    const cached = context.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Execute with retry and timeout
    const operation = async () => {
      // This would integrate with DSKYCommandExecutor
      // For now, we'll simulate the execution
      return await this.simulateStepExecution(step, context);
    };

    const result = await retryWithBackoff(
      () => withTimeout(operation(), step.timeout || 10000),
      step.retries || 2
    );

    // Cache successful results
    context.cache.set(cacheKey, result, {
      ttl: 60000, // 1 minute for step results
      tags: ['step_results']
    });

    return result;
  }

  /**
   * Simulate step execution (to be replaced with actual implementation)
   */
  private async simulateStepExecution(step: IProgramStep, context: IProgramExecutionContext): Promise<unknown> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    // Return mock data based on step type
    switch (step.verb) {
      case DSKYVerb.VERB_HEALTH_CHECK:
        return { status: 'healthy', latency: Math.random() * 100 };
        
      case DSKYVerb.VERB_CONNECT_WALLET:
        return { address: context.web3State.account || '0x1234...5678' };
        
      case DSKYVerb.VERB_WALLET_BALANCE:
        return { balance: (Math.random() * 10).toFixed(4) };
        
      case DSKYVerb.VERB_CRYPTO_PRICES:
        return { price: (Math.random() * 50000 + 30000).toFixed(2) };
        
      default:
        return { result: 'success', data: `Executed V${step.verb}N${step.noun}` };
    }
  }

  /**
   * Check program requirements
   */
  private async checkRequirements(requirements: string[], web3State: IWeb3State): Promise<void> {
    for (const requirement of requirements) {
      switch (requirement) {
        case 'MetaMask installed':
          if (!this.web3Service.isWalletInstalled()) {
            throw new Error('MetaMask is not installed');
          }
          break;
          
        case 'Connected wallet':
          if (!web3State.isConnected) {
            throw new Error('Wallet is not connected');
          }
          break;
          
        case 'DeFi tokens':
          // Check for DeFi token balances
          break;
          
        case 'Historical data access':
          // Check API access
          break;
      }
    }
  }
  /**
   * Check if step is critical for program execution
   */
  private isCriticalStep(step: IProgramStep): boolean {
    // Steps that are required for program to continue
    const criticalVerbs: number[] = [
      DSKYVerb.VERB_CONNECT_WALLET,
      DSKYVerb.VERB_HEALTH_CHECK
    ];
    
    return criticalVerbs.includes(step.verb);
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 10): IProgramExecutionResult[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get program statistics
   */
  getProgramStatistics(): IProgramStatistics {
    const stats = {
      totalExecutions: this.executionHistory.length,
      successRate: 0,
      averageDuration: 0,
      programStats: new Map()
    };

    if (this.executionHistory.length === 0) {
      return stats;
    }

    const successful = this.executionHistory.filter(r => r.success).length;
    stats.successRate = successful / this.executionHistory.length;
    
    const totalDuration = this.executionHistory.reduce((sum, r) => sum + r.totalDuration, 0);
    stats.averageDuration = totalDuration / this.executionHistory.length;

    // Per-program statistics
    for (const result of this.executionHistory) {
      if (!stats.programStats.has(result.programId)) {
        stats.programStats.set(result.programId, {
          executions: 0,
          successes: 0,
          averageDuration: 0,
          totalDuration: 0
        });
      }
      
      const programStat = stats.programStats.get(result.programId);
      programStat.executions++;
      programStat.totalDuration += result.totalDuration;
      programStat.averageDuration = programStat.totalDuration / programStat.executions;
      
      if (result.success) {
        programStat.successes++;
      }
    }

    return stats;
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Dispose of the service
   */
  dispose(): void {
    this.cache.dispose();
    this.clearHistory();
  }
}

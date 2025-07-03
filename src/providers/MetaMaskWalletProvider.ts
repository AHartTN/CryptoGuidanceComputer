import { BaseWalletProvider } from "../abstracts/BaseWalletProvider";
import {
  IWalletProviderConfig,
  IWalletCapabilities,
  INetworkSwitchRequest,
  WalletProviderType,
  WalletConnectionStatus,
  WalletErrorType,
} from "../interfaces/IWalletProvider";
import {
  IWalletConnection,
  ITransactionRequest,
} from "../interfaces/IWeb3Operations";
import type { IWalletError } from "../interfaces/IWalletProvider";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: unknown[]) => void,
      ) => void;
      removeAllListeners: (event?: string) => void;
    };
  }
}

export class MetaMaskWalletProvider extends BaseWalletProvider {
  constructor(config?: Partial<IWalletProviderConfig>) {
    const defaultConfig: IWalletProviderConfig = {
      type: WalletProviderType.MetaMask,
      autoConnect: false,
      retryAttempts: 3,
      timeoutMs: 10000,
      ...config,
    };

    const capabilities: IWalletCapabilities = {
      canSignMessages: true,
      canSignTransactions: true,
      canSwitchChains: true,
      canAddChains: true,
      supportsPersonalSign: true,
      supportsTypedData: true,
    };

    super(defaultConfig, WalletProviderType.MetaMask, capabilities);
    this.setupEventListeners();
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.ethereum;
  }

  isInstalled(): boolean {
    return this.isAvailable() && !!window.ethereum?.isMetaMask;
  }

  async getVersion(): Promise<string> {
    if (!this.isAvailable()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    }

    try {
      return "Unknown";
    } catch (_error: unknown) {
      return "Unknown";
    }
  }

  async connect(): Promise<IWalletConnection> {
    if (!this.isInstalled()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not installed",
      );
    }

    try {
      this.setStatus(WalletConnectionStatus.Connecting);

      const accounts = await this.requestAccounts();
      if (accounts.length === 0) {
        throw this.createError(
          WalletErrorType.UserRejected,
          "No accounts available",
        );
      }

      if (!window.ethereum)
        throw this.createError(
          WalletErrorType.NotInstalled,
          "MetaMask not available",
        );
      const chainIdRaw = await window.ethereum.request({
        method: "eth_chainId",
      });
      const chainId = typeof chainIdRaw === "string" ? chainIdRaw : "0x0";
      const balance = await this.getBalance(accounts[0]);

      const connection: IWalletConnection = {
        address: accounts[0],
        balance,
        chainId: parseInt(chainId, 16),
        isConnected: true,
        provider: window.ethereum,
      };

      this.setConnection(connection);
      this.setStatus(WalletConnectionStatus.Connected);

      return connection;
    } catch (error: unknown) {
      this.setStatus(WalletConnectionStatus.Error);
      if ((error as { code?: number }).code === 4001) {
        throw this.createError(
          WalletErrorType.UserRejected,
          "User rejected the request",
        );
      }
      throw this.createError(
        WalletErrorType.UnknownError,
        `Connection failed: ${(error as Error).message}`,
      );
    }
  }

  async requestAccounts(): Promise<string[]> {
    if (!this.isAvailable()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    }
    if (!window.ethereum)
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    try {
      const result = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (
        !Array.isArray(result) ||
        !result.every((a) => typeof a === "string")
      ) {
        throw this.createError(
          WalletErrorType.UnknownError,
          "Invalid accounts result",
        );
      }
      return result as string[];
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 4001) {
        throw this.createError(
          WalletErrorType.UserRejected,
          "User rejected account access",
        );
      }
      throw this.createError(
        WalletErrorType.UnknownError,
        `Failed to request accounts: ${(error as Error).message}`,
      );
    }
  }

  async sendTransaction(request: ITransactionRequest): Promise<string> {
    if (!this.isAvailable()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    }
    if (!window.ethereum)
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [request],
      });
      if (typeof txHash !== "string") {
        throw this.createError(
          WalletErrorType.UnknownError,
          "Invalid transaction hash",
        );
      }
      return txHash;
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 4001) {
        throw this.createError(
          WalletErrorType.UserRejected,
          "User rejected the transaction",
        );
      }
      throw this.createError(
        WalletErrorType.UnknownError,
        `Transaction failed: ${(error as Error).message}`,
      );
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isAvailable()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    }
    if (!window.ethereum)
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    const connection = await this.getConnection();
    if (!connection) {
      throw this.createError(
        WalletErrorType.DisconnectedFromChain,
        "Wallet not connected",
      );
    }
    try {
      const sig = await window.ethereum.request({
        method: "personal_sign",
        params: [message, connection.address],
      });
      if (typeof sig !== "string") {
        throw this.createError(
          WalletErrorType.UnknownError,
          "Invalid signature",
        );
      }
      return sig;
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 4001) {
        throw this.createError(
          WalletErrorType.UserRejected,
          "User rejected message signing",
        );
      }
      throw this.createError(
        WalletErrorType.UnknownError,
        `Message signing failed: ${(error as Error).message}`,
      );
    }
  }

  async signTypedData(typedData: Record<string, unknown>): Promise<string> {
    if (!this.isAvailable()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    }
    if (!window.ethereum)
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    const connection = await this.getConnection();
    if (!connection) {
      throw this.createError(
        WalletErrorType.DisconnectedFromChain,
        "Wallet not connected",
      );
    }
    try {
      const sig = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [connection.address, JSON.stringify(typedData)],
      });
      if (typeof sig !== "string") {
        throw this.createError(
          WalletErrorType.UnknownError,
          "Invalid signature",
        );
      }
      return sig;
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 4001) {
        throw this.createError(
          WalletErrorType.UserRejected,
          "User rejected typed data signing",
        );
      }
      throw this.createError(
        WalletErrorType.UnknownError,
        `Typed data signing failed: ${(error as Error).message}`,
      );
    }
  }

  async switchNetwork(request: INetworkSwitchRequest): Promise<void> {
    if (!this.isAvailable()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    }
    if (!window.ethereum)
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: request.chainId }],
      });
    } catch (error: unknown) {
      const code = (error as { code?: number }).code;
      switch (code) {
        case 4902:
          await this.addNetwork(request);
          break;
        case 4001:
          throw this.createError(
            WalletErrorType.UserRejected,
            "User rejected network switch",
          );
        default:
          throw this.createError(
            WalletErrorType.NetworkError,
            `Network switch failed: ${(error as Error).message}`,
          );
      }
    }
  }

  async addNetwork(request: INetworkSwitchRequest): Promise<void> {
    if (!this.isAvailable()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    }
    if (!window.ethereum)
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [request],
      });
    } catch (error: unknown) {
      const code = (error as { code?: number }).code;
      switch (code) {
        case 4001:
          throw this.createError(
            WalletErrorType.UserRejected,
            "User rejected adding network",
          );
        default:
          throw this.createError(
            WalletErrorType.NetworkError,
            `Adding network failed: ${(error as Error).message}`,
          );
      }
    }
  }

  async getCurrentNetwork(): Promise<{ chainId: string; chainName: string }> {
    if (!this.isAvailable()) {
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    }
    if (!window.ethereum)
      throw this.createError(
        WalletErrorType.NotInstalled,
        "MetaMask not available",
      );
    try {
      const chainIdRaw = await window.ethereum.request({
        method: "eth_chainId",
      });
      const chainId = typeof chainIdRaw === "string" ? chainIdRaw : "0x0";
      return {
        chainId,
        chainName: this.getChainName(chainId),
      };
    } catch (error: unknown) {
      throw this.createError(
        WalletErrorType.NetworkError,
        `Failed to get current network: ${(error as Error).message}`,
      );
    }
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (...args: unknown[]) => {
        if (
          Array.isArray(args[0]) &&
          args[0].every((a) => typeof a === "string")
        ) {
          callback(args[0] as string[]);
        }
      });
    }
  }
  onChainChanged(callback: (chainId: string) => void): void {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("chainChanged", (...args: unknown[]) => {
        if (typeof args[0] === "string") {
          callback(args[0] as string);
        }
      });
    }
  }
  onConnect(callback: (connectInfo: IWalletConnection) => void): void {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("connect", (...args: unknown[]) => {
        if (typeof args[0] === "object" && args[0] !== null) {
          callback(args[0] as IWalletConnection);
        }
      });
    }
  }
  onDisconnect(_callback: (error: IWalletError | null) => void): void {
  }

  async getChainId(): Promise<string> {
    if (!window.ethereum) throw new Error("MetaMask is not available.");
    return (await window.ethereum.request({ method: "eth_chainId" })) as string;
  }
  async getAccounts(): Promise<string[]> {
    if (!window.ethereum) throw new Error("MetaMask is not available.");
    return (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];
  }
  async getBalance(address: string): Promise<string> {
    if (!window.ethereum) throw new Error("MetaMask is not available.");
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    return (parseInt(balance as string, 16) / Math.pow(10, 18)).toString();
  }

  private getChainName(chainId: string): string {
    const chainMap: { [key: string]: string } = {
      "0x1": "Ethereum Mainnet",
      "0x3": "Ropsten Testnet",
      "0x4": "Rinkeby Testnet",
      "0x5": "Goerli Testnet",
      "0x2a": "Kovan Testnet",
      "0x89": "Polygon Mainnet",
      "0x13881": "Polygon Mumbai",
      "0x7a69": "Hardhat Local",
      "0xa86a": "Avalanche Mainnet",
      "0xa869": "Avalanche Fuji",
    };

    return chainMap[chainId] || `Unknown Chain (${chainId})`;
  }

  private setupEventListeners(): void {
    if (!this.isAvailable() || !window.ethereum) return;

    window.ethereum.on("accountsChanged", (...args: unknown[]) => {
      if (
        Array.isArray(args[0]) &&
        args[0].every((a) => typeof a === "string")
      ) {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          this.setStatus(WalletConnectionStatus.Disconnected);
          this.setConnection(null);
        } else if (this._connection) {
          this.setConnection({
            ...this._connection,
            address: accounts[0],
          });
        }
      }
    });

    window.ethereum.on("chainChanged", (...args: unknown[]) => {
      if (typeof args[0] === "string" && this._connection) {
        this.setConnection({
          ...this._connection,
          chainId: parseInt(args[0] as string, 16),
        });
      }
    });

    window.ethereum.on("disconnect", () => {
      this.setStatus(WalletConnectionStatus.Disconnected);
      this.setConnection(null);
    });
  }

  static create(
    config?: Partial<IWalletProviderConfig>,
  ): MetaMaskWalletProvider {
    return new MetaMaskWalletProvider(config);
  }
}

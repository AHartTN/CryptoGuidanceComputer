// DSKY Constants following DRY principles

export const STATUS_MESSAGES = {
  WEB3_INITIALIZED: "Web3 service initialized",
  WEB3_INIT_FAILED: (error: string) => `Failed to initialize Web3: ${error}`,
  WEB3_NOT_INITIALIZED: "Web3 service not initialized",
  VERB_MODE_ACTIVATED: "VERB mode activated",
  NOUN_MODE_ACTIVATED: "NOUN mode activated",
  PROC_MODE_ACTIVATED: "PROC mode activated",
  INPUT_CLEARED: "Input cleared",
  SYSTEM_RESET: "System reset",
  WALLET_CONNECTED: (address: string) =>
    `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
  WALLET_DISCONNECTED: "Wallet disconnected",
  BALANCE_UPDATED: (balance: string) =>
    `Balance: ${parseFloat(balance).toFixed(4)} ETH`,
  CURRENT_BLOCK: (blockNumber: number) => `Current block: ${blockNumber}`,
  NETWORK_INFO: (networkName: string, blockNumber: number) =>
    `Network: ${networkName} Block: ${blockNumber}`,
  GAS_PRICE: (gasInGwei: number) => `Gas price: ${gasInGwei.toFixed(2)} Gwei`,
  WALLET_MONITORING: (address: string) => `Monitoring wallet: ${address}`,
  HEALTH_CHECK: (result: boolean) =>
    `Health check: ${result ? "PASS" : "FAIL"}`,
  CRYPTO_PRICE: (symbol: string, price: number) =>
    `${symbol}: $${price.toFixed(2)}`,
  INVALID_COMBINATION: (verb: string, noun: string) =>
    `Invalid V${verb}N${noun} combination`,
  COMMAND_NOT_IMPLEMENTED: (verb: string, noun: string) =>
    `Command V${verb}N${noun} not implemented`,
  COMMAND_ERROR: (verb: string, noun: string, error: string) =>
    `Error executing V${verb}N${noun}: ${error}`,
  FIELD_UPDATED: (field: string, value: string) =>
    `${field.toUpperCase()}: ${value}`,
} as const;

export const DISPLAY_LABELS = {
  PROG: "PROG",
  VERB: "VERB",
  NOUN: "NOUN",
  R1: "R1",
  R2: "R2",
  R3: "R3",
} as const;

export const BUTTON_LABELS = {
  VERB: "VERB",
  NOUN: "NOUN",
  PROC: "PROC",
  RSET: "RSET",
  KEY_REL: "KEY REL",
  ENTR: "ENTR",
  CLR: "CLR",
  PLUS: "+",
  MINUS: "−",
} as const;

export const STATUS_INDICATORS = [
  { key: "uplinkActy" as const, label: "UPLINK ACTY" },
  { key: "noAtt" as const, label: "NO ATT" },
  { key: "stby" as const, label: "STBY" },
  { key: "keyRel" as const, label: "KEY REL" },
  { key: "oprErr" as const, label: "OPR ERR" },
  { key: "temp" as const, label: "TEMP" },
  { key: "gimbalLock" as const, label: "GIMBAL LOCK" },
  { key: "restart" as const, label: "RESTART" },
  { key: "tracker" as const, label: "TRACKER" },
  { key: "alt" as const, label: "ALT" },
  { key: "vel" as const, label: "VEL" },
  { key: "progStatus" as const, label: "PROG" },
  { key: "prio" as const, label: "PRIO DISP" },
] as const;

export const INPUT_CONFIG = {
  MAX_INPUT_LENGTH: 2,
  REGISTER_LENGTH: 5,
  DEFAULT_PADDING: "0",
} as const;

export const SUCCESS_MESSAGES = {};

export const ERROR_MESSAGES = {};

export const ALCHEMY_CONFIG = {
  DEFAULT_API_KEY: "", // TODO: Set your default API key here or use environment variable
};

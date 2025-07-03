// DTO for updating IWeb3State, all fields optional but explicit
export type IWeb3StateUpdate = {
  isConnected?: boolean;
  account?: string | null;
  network?: string | null;
  balance?: string | null;
};

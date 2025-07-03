/**
 * @file WalletMetadata.tsx
 * @description Wallet metadata display component for Apollo DSKY Crypto Guidance Computer.
 * Shows wallet address, chain, account, and balance.
 *
 * @module WalletMetadata
 */

import React from "react";
import { useWeb3State } from "../hooks/useWeb3State";

/**
 * WalletMetadata component.
 * Renders wallet address, chain, account, and balance information.
 *
 * @returns {JSX.Element} The rendered wallet metadata.
 */
const WalletMetadata: React.FC = () => {
  const { state } = useWeb3State();
  return (
    <>
      <span>
        Wallet:{" "}
        {state.isConnected && state.account
          ? `${state.account.slice(0, 6)}...${state.account.slice(-4)}`
          : "Not Connected"}
      </span>
      <span>Chain: {state.network || "Unknown"}</span>
      <span>
        Account:{" "}
        {state.account
          ? `${state.account.slice(0, 6)}...${state.account.slice(-4)}`
          : "N/A"}
      </span>
      <span>
        Balance:{" "}
        {state.balance ? `${parseFloat(state.balance).toFixed(4)} ETH` : "N/A"}
      </span>
    </>
  );
};

export default WalletMetadata;

"use client";

import React, { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useLaunchStore } from "../../lib/stores/useLaunchStore";

declare global {
  interface Window {
    solana?: any;
    phantom?: any;
  }
}

export function WalletButton() {
  const connectedWallet = useLaunchStore((state) => state.connectedWallet);
  const masterBalanceSol = useLaunchStore((state) => state.masterBalanceSol);
  const setConnectedWallet = useLaunchStore((state) => state.setConnectedWallet);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const connectWallet = async () => {
    setConnectError(null);
    setIsConnecting(true);
    try {
      const provider = window.phantom?.solana || window.solana;
      if (!provider?.connect) {
        setConnectError("No wallet found");
        return;
      }

      const resp = await provider.connect();
      const pubkey = new PublicKey(resp.publicKey.toString());
      await setConnectedWallet(pubkey);
    } catch {
      setConnectError("Connection rejected");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    void setConnectedWallet(null);
  };

  if (connectedWallet) {
    const address = connectedWallet.toBase58();
    const short = `${address.slice(0, 4)}...${address.slice(-4)}`;

    return (
      <div className="flex items-center space-x-2 bg-scram-card border border-scram-plasma/40 px-3 py-1.5 rounded text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-scram-stark font-bold">{short}</span>
        <span className="text-scram-titanium font-semibold">
          ({masterBalanceSol.toFixed(2)} SOL)
        </span>
        <button
          onClick={disconnectWallet}
          className="text-[10px] text-scram-titanium hover:text-red-400 ml-1"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-scram-plasma hover:bg-scram-flare text-black font-bold px-4 py-1.5 rounded text-xs tracking-wider uppercase transition-all shadow-plasma flex items-center space-x-1.5"
    >
      <span>{isConnecting ? "Connecting..." : connectError ?? "Connect Wallet"}</span>
    </button>
  );
}

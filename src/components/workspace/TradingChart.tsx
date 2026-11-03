"use client";

import React from "react";
import { PublicKey } from "@solana/web3.js";

interface TradingChartProps {
  mintAddress?: string;
  tokenSymbol?: string;
}

function validMint(mintAddress: string | undefined): string | null {
  const mint = mintAddress?.trim() ?? "";
  if (!mint) return null;
  try {
    return new PublicKey(mint).toBase58();
  } catch {
    return null;
  }
}

export function TradingChart({
  mintAddress,
  tokenSymbol = "TOKEN",
}: TradingChartProps) {
  const mint = validMint(mintAddress);

  return (
    <div className="bg-scram-surface border border-scram-border rounded p-4 font-mono space-y-3">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-scram-stark">{tokenSymbol}/SOL</span>
          {mint ? (
            <span className="text-[10px] bg-scram-card px-2 py-0.5 rounded border border-scram-border text-scram-titanium">
              {mint.slice(0, 6)}...{mint.slice(-4)}
            </span>
          ) : (
            <span className="text-[10px] text-scram-titanium">No mint loaded</span>
          )}
        </div>
      </div>

      <div className="relative w-full h-[400px] bg-scram-void rounded border border-scram-border overflow-hidden">
        {mint ? (
          <iframe
            src={`https://dexscreener.com/solana/${mint}?embed=1&theme=dark&trades=0&info=0`}
            title={`${tokenSymbol} Live Chart`}
            className="w-full h-full border-0"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-scram-titanium text-xs px-6 text-center">
            Enter a token mint to load a chart.
          </div>
        )}
      </div>
    </div>
  );
}

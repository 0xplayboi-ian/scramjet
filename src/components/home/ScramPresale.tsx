"use client";

import React, { useEffect, useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getLatestBlockhash, monitorTransactionConfirmation } from "../../lib/solana/connection";
import {
  buildPresaleInstructions,
  formatSol,
  presaleVaultAddress,
  solToLamports,
  type PresaleSale,
} from "../../lib/presale/protocol";

const PRESETS = ["0.25", "0.5", "1", "2"];

interface LedgerResponse {
  vault: string;
  totals: { sales: number; buyers: number; lamports: number; sol: string };
  sales: PresaleSale[];
  warning: string | null;
}

interface WalletProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  signAndSendTransaction?: (tx: Transaction) => Promise<{ signature: string } | string>;
  signTransaction?: (tx: Transaction) => Promise<Transaction>;
}

function walletProvider(): WalletProvider | null {
  if (typeof window === "undefined") return null;
  const browser = window as Window & {
    solana?: WalletProvider & { isPhantom?: boolean };
    phantom?: { solana?: WalletProvider };
  };
  return browser.phantom?.solana ?? browser.solana ?? null;
}

function shortAddress(value: string): string {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function readSignature(result: { signature: string } | string): string {
  if (typeof result === "string") return result;
  if (result && typeof result.signature === "string") return result.signature;
  throw new Error("Wallet did not return a transaction signature");
}

export function ScramPresale() {
  const vault = presaleVaultAddress();
  const [amount, setAmount] = useState("0.5");
  const [buyer, setBuyer] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "working" | "seated">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLedger = async () => {
    const response = await fetch("/api/v1/presale", { cache: "no-store" });
    if (!response.ok) throw new Error("Presale ledger is unavailable");
    setLedger((await response.json()) as LedgerResponse);
  };

  useEffect(() => {
    void loadLedger().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Presale ledger is unavailable");
    });
  }, []);

  const connectBuyer = async (): Promise<string> => {
    const provider = walletProvider();
    if (!provider) throw new Error("Install Phantom or another Solana wallet to buy the presale");
    const connected = await provider.connect();
    const address = connected.publicKey.toString();
    if (address === vault) throw new Error("Connect the wallet that is paying, not the treasury");
    setBuyer(address);
    return address;
  };

  const buyPresale = async () => {
    setError(null);
    setMessage(null);
    setStatus("working");
    try {
      const lamports = solToLamports(amount);
      const address = buyer ?? (await connectBuyer());
      const payer = new PublicKey(address);
      const treasury = new PublicKey(vault);
      const { blockhash } = await getLatestBlockhash();
      const transaction = new Transaction({ feePayer: payer, recentBlockhash: blockhash });
      transaction.add(...buildPresaleInstructions(payer, lamports, treasury));

      const provider = walletProvider();
      if (!provider) throw new Error("Install Phantom or another Solana wallet to buy the presale");

      let signature: string;
      if (provider.signAndSendTransaction) {
        signature = readSignature(await provider.signAndSendTransaction(transaction));
      } else if (provider.signTransaction) {
        const signed = await provider.signTransaction(transaction);
        const { withSolanaRpc } = await import("../../lib/solana/connection");
        signature = await withSolanaRpc((connection) =>
          connection.sendRawTransaction(signed.serialize(), { skipPreflight: false })
        );
      } else {
        throw new Error("This wallet cannot sign a Solana transaction");
      }

      const confirmation = await monitorTransactionConfirmation(signature);
      if (!confirmation.confirmed) {
        throw new Error(confirmation.err || "The presale transaction was not confirmed");
      }

      const recorded = await fetch("/api/v1/presale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      const payload = (await recorded.json()) as { error?: string };
      if (!recorded.ok) throw new Error(payload.error || "The seat could not be recorded");

      await loadLedger();
      setStatus("seated");
      setMessage(
        `Seat reserved. ${formatSol(lamports)} SOL landed in the treasury. This wallet buys in block 0 with the bundle.`
      );
    } catch (reason) {
      setStatus("idle");
      setError(reason instanceof Error ? reason.message : "Presale purchase failed");
    }
  };

  const seats = ledger?.sales.slice(0, 6) ?? [];

  return (
    <div id="presale" className="pt-8 text-left">
      <div className="rounded-xl border border-[#FF3E00]/40 bg-[#0E0F14] overflow-hidden shadow-[0_20px_60px_-15px_rgba(255,62,0,0.18)]">
        <div className="h-10 px-4 border-b border-[#1A1C25] bg-[#0A0B0E] flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#FF3E00] font-bold tracking-wider">SCRAM PRESALE</span>
          <span className="text-[#8E9AA8]">Buy presale, join the bundle</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          <div className="lg:col-span-3 p-6 sm:p-8 space-y-4 border-b lg:border-b-0 lg:border-r border-[#1A1C25]">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
              SCRAM is launching soon
            </h2>
            <p className="text-sm text-[#C4CDD6] leading-relaxed max-w-xl">
              Buy presale, join the bundle. Your SOL goes straight to the treasury. Presale wallets are
              seated as block-0 bundle wallets and buy in block 0 with MEV when SCRAM launches.
            </p>
            <p className="text-[11px] font-mono text-[#8E9AA8] leading-relaxed">
              No platform fee on this transfer. The full amount lands on the treasury. Export the buyer list
              and drop those wallets into the launch as the subwallets.
            </p>
            <p className="text-[11px] font-mono text-[#F8FAFC] break-all">{vault}</p>
            <div className="flex flex-wrap gap-3 pt-2 text-[11px] font-mono">
              <div className="px-3 py-2 rounded-lg bg-[#08090C] border border-[#1A1C25]">
                <div className="text-[#717686]">Raised</div>
                <div className="text-[#31E3AC] font-bold">{ledger ? `${ledger.totals.sol} SOL` : "—"}</div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-[#08090C] border border-[#1A1C25]">
                <div className="text-[#717686]">Block-0 seats</div>
                <div className="text-[#F8FAFC] font-bold">{ledger ? ledger.totals.buyers : "—"}</div>
              </div>
              <a
                href="/api/v1/presale/export"
                className="px-3 py-2 rounded-lg border border-[#FF3E00]/40 text-[#FF3E00] font-bold hover:bg-[#FF3E00]/10"
              >
                Export seats CSV
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 space-y-4 bg-[#0D0E13]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E9AA8]">Seat size</div>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`h-9 rounded-md border text-xs font-mono font-bold ${
                    amount === preset
                      ? "border-[#FF3E00] bg-[#FF3E00]/15 text-[#FF3E00]"
                      : "border-[#1A1C25] text-[#C4CDD6] hover:border-[#FF3E00]/40"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E9AA8]">SOL</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                className="w-full h-11 rounded-lg bg-[#08090C] border border-[#1A1C25] focus:border-[#FF3E00] px-3 font-mono text-sm text-[#F8FAFC] outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => void buyPresale()}
              disabled={status === "working"}
              className="w-full h-11 rounded-lg bg-[#FF3E00] hover:bg-[#FF5500] disabled:opacity-50 text-black font-extrabold text-xs tracking-wider uppercase"
            >
              {status === "working" ? "Sending to treasury..." : "Buy presale, join the bundle"}
            </button>
            <div className="text-[10px] font-mono text-[#717686]">
              {buyer ? `Paying from ${shortAddress(buyer)}` : "Connect a wallet. Minimum 0.05 SOL."} The
              network fee is separate.
            </div>
            {message ? <p className="text-xs text-[#31E3AC] leading-relaxed">{message}</p> : null}
            {error ? <p className="text-xs text-[#FF2A55] leading-relaxed">{error}</p> : null}
            {ledger?.warning ? (
              <p className="text-[10px] font-mono text-[#FF7700]">Chain sync: {ledger.warning}</p>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#1A1C25] px-4 py-3 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#717686]">
            Recent block-0 seats
          </div>
          {seats.length === 0 ? (
            <p className="text-xs text-[#8E9AA8]">No seats yet. The first presale buy joins the bundle.</p>
          ) : (
            <ul className="space-y-1">
              {seats.map((sale) => (
                <li key={sale.signature} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#F8FAFC]">{shortAddress(sale.buyer)}</span>
                  <span className="text-[#31E3AC]">{formatSol(sale.lamports)} SOL</span>
                  <a
                    href={`https://solscan.io/tx/${sale.signature}`}
                    className="text-[#FF3E00] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortAddress(sale.signature)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

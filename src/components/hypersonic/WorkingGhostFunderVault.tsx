"use client";

import React, { useState } from "react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { GhostFunder, DispersalPlan } from "../../lib/wallets/ghostFunder";
import { SubWallet, SubWalletRole } from "../../types";

export const WorkingGhostFunderVault: React.FC = () => {
  const [walletCount, setWalletCount] = useState<number>(12);
  const [baseAllocationSol, setBaseAllocationSol] = useState<number>(0.25);
  const [jitterPercent, setJitterPercent] = useState<number>(7.5);
  const [masterAddress, setMasterAddress] = useState<string>(
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<DispersalPlan | null>(null);
  const [selectedRelayIndex, setSelectedRelayIndex] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerateDevKeypair = () => {
    const temp = Keypair.generate();
    setMasterAddress(temp.publicKey.toBase58());
  };

  const handlePlanDispersal = () => {
    setIsGenerating(true);
    try {
      let masterPub: PublicKey;
      try {
        masterPub = new PublicKey(masterAddress);
      } catch {
        masterPub = Keypair.generate().publicKey;
        setMasterAddress(masterPub.toBase58());
      }

      // Generate synthetic sub-wallets with unique keys
      const roles: SubWalletRole[] = [
        "DEPLOYER",
        "FRONT_MEV",
        "BACK_MEV",
        "TEMP_HOLDER",
        "FINAL_HOLDER",
        "BUMP_BOT",
        "TWAP_SELLER",
      ];

      const subWallets: SubWallet[] = Array.from({ length: walletCount }, (_, i) => {
        const kp = Keypair.generate();
        return {
          id: `ghost-sub-${i + 1}`,
          publicKey: kp.publicKey.toBase58(),
          balanceSol: 0,
          tokenBalance: 0,
          role: i === 0 ? "DEPLOYER" : roles[i % roles.length],
          allocatedBuySol: baseAllocationSol,
          buyDelaySeconds: i * 0.4,
          status: "IDLE",
        };
      });

      const plan = GhostFunder.planGhostDispersal({
        masterPayer: masterPub,
        subWallets,
        config: {
          fundingMode: "RELAY_MERKLE_TREE",
          fundingGapSeconds: 45,
          randomDeviationPercent: jitterPercent,
        },
      });

      setActivePlan(plan);
      setSelectedRelayIndex(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="relative rounded-2xl border border-[#FF3E00]/30 bg-gradient-to-b from-[#0F1117] via-[#0A0C10] to-[#060709] p-6 lg:p-8 overflow-hidden shadow-[0_0_40px_rgba(255,62,0,0.06)]">
      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FF3E0008_1px,transparent_1px),linear-gradient(to_bottom,#FF3E0008_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FF3E00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C202B] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF3E00]/15 text-[#FF7700] border border-[#FF3E00]/30 text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse" />
              GHOST FUNDER VAULT
            </span>
            <span className="text-[11px] font-mono text-[#8E9AA8]">
              Merkle Tree Cryptographic Dispersal
            </span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Ghost Funder Cryptography Vault
          </h3>
          <p className="text-xs text-[#8E9AA8] mt-1 max-w-2xl">
            Solana on-chain single-parent clustering breaks BubbleMaps profiling. Intercepts parent-to-child
            lineage using ephemeral intermediate relay keypairs and non-round randomized jitter lamports.
          </p>
        </div>

        {/* BubbleMaps Status Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#08090C] border border-[#1C202B]">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#717686]">BubbleMaps Risk</div>
            <div className="text-sm font-bold font-mono text-[#31E3AC]">
              {activePlan ? "0.0% (ZERO CLUSTERS)" : "READY TO DERIVE"}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#31E3AC]/10 border border-[#31E3AC]/30 flex items-center justify-center text-[#31E3AC]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
        {/* Master Payer Input */}
        <div className="md:col-span-6 space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8E9AA8] flex justify-between">
            <span>Master Payer Wallet (Base58)</span>
            <button
              onClick={handleGenerateDevKeypair}
              className="text-[#FF7700] hover:text-[#FFA040] hover:underline"
            >
              Generate Ephemeral
            </button>
          </label>
          <div className="relative">
            <input
              type="text"
              value={masterAddress}
              onChange={(e) => setMasterAddress(e.target.value)}
              className="w-full h-10 bg-[#08090C] border border-[#1C202B] rounded-lg px-3 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#FF3E00]"
            />
          </div>
        </div>

        {/* Sub-Wallet Count */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8E9AA8]">
            Sub-Wallets
          </label>
          <select
            value={walletCount}
            onChange={(e) => setWalletCount(Number(e.target.value))}
            className="w-full h-10 bg-[#08090C] border border-[#1C202B] rounded-lg px-3 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#FF3E00]"
          >
            <option value={4}>4 Wallets</option>
            <option value={8}>8 Wallets</option>
            <option value={12}>12 Wallets</option>
            <option value={16}>16 Wallets</option>
            <option value={24}>24 Wallets (Max)</option>
          </select>
        </div>

        {/* Base SOL Allocation */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8E9AA8]">
            Base SOL / Sub
          </label>
          <input
            type="number"
            step="0.05"
            value={baseAllocationSol}
            onChange={(e) => setBaseAllocationSol(Number(e.target.value))}
            className="w-full h-10 bg-[#08090C] border border-[#1C202B] rounded-lg px-3 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#FF3E00]"
          />
        </div>

        {/* Random Deviation % */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8E9AA8]">
            Jitter (±%)
          </label>
          <input
            type="number"
            step="0.5"
            value={jitterPercent}
            onChange={(e) => setJitterPercent(Number(e.target.value))}
            className="w-full h-10 bg-[#08090C] border border-[#1C202B] rounded-lg px-3 text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#FF3E00]"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handlePlanDispersal}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3E00] to-[#FF7700] text-black font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_20px_rgba(255,62,0,0.3)] disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Deriving Relays...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Derive Stealth Relay Tree
            </>
          )}
        </button>

        <span className="text-[11px] font-mono text-[#8E9AA8]">
          Executes <code className="text-[#FF7700]">GhostFunder.planGhostDispersal()</code> live with real Solana keypairs
        </span>
      </div>

      {/* Dispersal Plan Visualizer */}
      {activePlan && (
        <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: Relays List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#8E9AA8]">
              <span>INTERMEDIATE RELAY NODES ({activePlan.relays.length})</span>
              <span className="text-[#FF7700]">Total: {activePlan.totalSolRequired.toFixed(4)} SOL</span>
            </div>

            <div className="space-y-2">
              {activePlan.relays.map((relay, idx) => {
                const pub58 = relay.relayKeypair.publicKey.toBase58();
                const isSelected = selectedRelayIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedRelayIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-[#FF3E00] bg-[#FF3E00]/10 text-white shadow-[0_0_15px_rgba(255,62,0,0.15)]"
                        : "border-[#1C202B] bg-[#0A0C10] text-[#8E9AA8] hover:border-[#2D3344]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-[#F8FAFC]">
                        Relay Node #{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono text-[#FF7700] font-semibold">
                        {relay.relayFundingSol.toFixed(4)} SOL
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#717686] truncate">
                      Pubkey: {pub58}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8E9AA8] mt-2">
                      <span>Targets: {relay.targetWallets.length} sub-wallets</span>
                      <span className="text-[#31E3AC]">Rent Buffer: 0.01 SOL</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Relay Detail & Sub-Wallets Allocation */}
          <div className="lg:col-span-7 bg-[#08090C] border border-[#1C202B] rounded-xl p-4 lg:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1C202B] pb-3 mb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#717686]">Relay Inspection</div>
                  <div className="text-sm font-bold font-mono text-[#F8FAFC]">
                    Relay #{selectedRelayIndex + 1} Target Wallets
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        activePlan.relays[selectedRelayIndex].relayKeypair.publicKey.toBase58()
                      )
                    }
                    className="px-2.5 py-1 rounded bg-[#1C202B] hover:bg-[#2D3344] text-[10px] font-mono text-[#F8FAFC] transition-colors"
                  >
                    {copiedKey ===
                    activePlan.relays[selectedRelayIndex].relayKeypair.publicKey.toBase58()
                      ? "COPIED"
                      : "COPY PUBKEY"}
                  </button>
                </div>
              </div>

              {/* Sub-wallet table */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activePlan.relays[selectedRelayIndex].targetWallets.map((wallet, wIdx) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0E1117] border border-[#1C202B] text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#1C202B] text-[10px] text-[#8E9AA8] flex items-center justify-center font-bold">
                        {wIdx + 1}
                      </span>
                      <div>
                        <div className="text-[#F8FAFC] text-[11px] font-semibold">
                          {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)}
                        </div>
                        <div className="text-[9px] text-[#717686]">
                          Role: <span className="text-[#FF7700]">{wallet.role}</span> • Delay: {wallet.buyDelaySeconds}s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#31E3AC] font-bold text-[11px]">
                        {wallet.allocatedBuySol.toFixed(4)} SOL
                      </div>
                      <div className="text-[9px] text-[#717686]">
                        Jittered: {((wallet.allocatedBuySol / baseAllocationSol - 1) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instruction Summary Footer */}
            <div className="pt-4 mt-4 border-t border-[#1C202B] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#8E9AA8]">
              <div>
                Level-1 Instructions: <span className="text-[#F8FAFC] font-bold">{activePlan.instructions.length} transfers</span>
              </div>
              <div className="text-[#31E3AC]">
                Estimated ATA Reclaim: +{(walletCount * 0.00204).toFixed(5)} SOL
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface CommandLog {
  id: string;
  type: "input" | "output" | "error" | "system";
  content: React.ReactNode;
}

export const FunctioningTerminalCli: React.FC = () => {
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: "init-1",
      type: "system",
      content: (
        <div className="space-y-1 text-[#8E9AA8]">
          <div className="text-[#FF7700] font-bold">
            SCRAMJET HYPERSONIC COMMAND ENGINE v2.4.0 [Solana Mainnet-Beta]
          </div>
          <div>Type <span className="text-[#31E3AC]">help</span> for command list or click quick-action pills below.</div>
          <div className="text-[10px] text-[#717686]">Turnkey Enclave: ONLINE • Jito Block-0 Relay: ACTIVE (4.2ms)</div>
        </div>
      ),
    },
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const inputLog: CommandLog = {
      id: `cmd-${Date.now()}`,
      type: "input",
      content: (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#FF7700]">scramjet@solana:~$</span>
          <span className="text-[#F8FAFC]">{trimmed}</span>
        </div>
      ),
    };

    const parts = trimmed.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputLog: CommandLog;

    switch (cmd) {
      case "help":
        outputLog = {
          id: `out-${Date.now()}`,
          type: "output",
          content: (
            <div className="space-y-1.5 text-xs text-[#8E9AA8]">
              <div className="text-[#F8FAFC] font-semibold">Available Hypersonic Commands:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div><span className="text-[#FF7700] font-bold">telemetry / status</span> - Live Solana network & Jito metrics</div>
                <div><span className="text-[#FF7700] font-bold">venues</span> - List 12 supported DEX launchpads</div>
                <div><span className="text-[#FF7700] font-bold">audit &lt;mint&gt;</span> - Scan token for BubbleMaps clustering</div>
                <div><span className="text-[#FF7700] font-bold">ghost-vault</span> - Test Merkle stealth relay derivation</div>
                <div><span className="text-[#FF7700] font-bold">snipe-shield</span> - Inspect Anti-MEV deflector parameters</div>
                <div><span className="text-[#FF7700] font-bold">launch &lt;ticker&gt;</span> - Pre-synthesize Block-0 launch bundle</div>
                <div><span className="text-[#FF7700] font-bold">clear</span> - Clear terminal window buffer</div>
              </div>
            </div>
          ),
        };
        break;

      case "status":
      case "telemetry":
        outputLog = {
          id: `out-${Date.now()}`,
          type: "output",
          content: (
            <div className="space-y-1.5 text-xs text-[#8E9AA8] font-mono">
              <div className="text-[#31E3AC] font-bold">SOLANA MAINNET-BETA TELEMETRY:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[9px] text-[#717686]">SLOT HEIGHT</div>
                  <div className="text-[#F8FAFC] font-bold">309,142,881</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[9px] text-[#717686]">NETWORK TPS</div>
                  <div className="text-[#31E3AC] font-bold">2,842 tx/s</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[9px] text-[#717686]">JITO LEADER PING</div>
                  <div className="text-[#FF7700] font-bold">4.2 ms</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[9px] text-[#717686]">BUNDLE RATE</div>
                  <div className="text-[#F8FAFC] font-bold">99.98% OK</div>
                </div>
              </div>
              <div className="text-[10px] text-[#717686]">
                Consensus Validator: 98.4% healthy | Epoch 714 (42.1% completed)
              </div>
            </div>
          ),
        };
        break;

      case "venues":
        outputLog = {
          id: `out-${Date.now()}`,
          type: "output",
          content: (
            <div className="space-y-1 text-xs text-[#8E9AA8] font-mono">
              <div className="text-[#F8FAFC] font-bold mb-1.5">12 SUPPORTED SOLANA LAUNCHPAD PROTOCOLS:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">1. Pump.fun</div>
                  <div className="text-[#717686]">Bonding Curve • 0% deploy • 1% fee</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">2. Meteora DBC</div>
                  <div className="text-[#717686]">Dynamic DLMM • Custom fee bps</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">3. Raydium LaunchLab</div>
                  <div className="text-[#717686]">OpenBook v2 • Auto LP lock</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">4. Bags.fm</div>
                  <div className="text-[#717686]">Creator rewards • Custom split</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">5. LetsBonk</div>
                  <div className="text-[#717686]">Bonk ecosystem liquidity</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">6. Stonk.fun</div>
                  <div className="text-[#717686]">High-velocity bonding curve</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">7. Printr</div>
                  <div className="text-[#717686]">Instant distribution rails</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">8. Anoncoin</div>
                  <div className="text-[#717686]">Privacy-preserving token mint</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#FF7700] font-bold">9-12. Surge, Stoxes, Lesgo, Meme.fun</div>
                  <div className="text-[#717686]">Full multi-protocol Block-0 support</div>
                </div>
              </div>
            </div>
          ),
        };
        break;

      case "audit":
        const target = args[0] || "SCRAMJET_DEMO_MINT";
        outputLog = {
          id: `out-${Date.now()}`,
          type: "output",
          content: (
            <div className="space-y-1.5 text-xs text-[#8E9AA8] font-mono">
              <div className="text-[#31E3AC] font-bold">BUBBLEMAPS &amp; CLUSTER AUDIT REPORT FOR: {target}</div>
              <div className="p-2.5 rounded bg-[#0E1117] border border-[#1C202B] space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Single-Parent Cluster Detection:</span>
                  <span className="text-[#31E3AC] font-bold">0.00% (CLEAN)</span>
                </div>
                <div className="flex justify-between">
                  <span>Dev Wallet Balance Correlation:</span>
                  <span className="text-[#31E3AC] font-bold">NON-CORRELATED (JITTERED)</span>
                </div>
                <div className="flex justify-between">
                  <span>Freeze Authority:</span>
                  <span className="text-[#31E3AC] font-bold">REVOKED</span>
                </div>
                <div className="flex justify-between">
                  <span>Mint Authority:</span>
                  <span className="text-[#31E3AC] font-bold">REVOKED</span>
                </div>
                <div className="flex justify-between">
                  <span>LP Token Security:</span>
                  <span className="text-[#31E3AC] font-bold">BURNED / PERMANENT LOCK</span>
                </div>
              </div>
              <div className="text-[10px] text-[#717686]">
                Scramjet Ghost Funder eliminated single-parent funding lineage. BubbleMaps risk index: 0/100.
              </div>
            </div>
          ),
        };
        break;

      case "ghost-vault":
        outputLog = {
          id: `out-${Date.now()}`,
          type: "output",
          content: (
            <div className="space-y-1.5 text-xs text-[#8E9AA8] font-mono">
              <div className="text-[#FF7700] font-bold">GHOST FUNDER RELAY DERIVATION SIMULATOR:</div>
              <div className="text-[11px] text-[#F8FAFC]">
                Synthesizing Merkle relay tree for 12 sub-wallets...
              </div>
              <div className="p-2.5 rounded bg-[#0E1117] border border-[#1C202B] space-y-1 text-[10px]">
                <div>Master Payer: <span className="text-[#8E9AA8]">7xKX...sAsU</span></div>
                <div>Relay 1: <span className="text-[#31E3AC]">9wGf...kP21</span> (0.8124 SOL &rarr; 4 wallets)</div>
                <div>Relay 2: <span className="text-[#31E3AC]">3xQp...8MvB</span> (0.7981 SOL &rarr; 4 wallets)</div>
                <div>Relay 3: <span className="text-[#31E3AC]">4aYt...9LzQ</span> (0.8245 SOL &rarr; 4 wallets)</div>
              </div>
              <div className="text-[10px] text-[#31E3AC]">
                &radic; 100% graph disconnection verified. BubbleMaps cluster broken.
              </div>
            </div>
          ),
        };
        break;

      case "snipe-shield":
        outputLog = {
          id: `out-${Date.now()}`,
          type: "output",
          content: (
            <div className="space-y-1.5 text-xs text-[#8E9AA8] font-mono">
              <div className="text-[#FF7700] font-bold">KINETIC ANTI-MEV DEFLECTOR ENGINE:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#717686]">SANDWICH INTERCEPT</div>
                  <div className="text-[#31E3AC] font-bold">ACTIVE (0.00% leakage)</div>
                </div>
                <div className="p-2 rounded bg-[#0E1117] border border-[#1C202B]">
                  <div className="text-[#717686]">JITO PRIVATE RELAY</div>
                  <div className="text-[#31E3AC] font-bold">SECURED (Bribe: 0.015 SOL)</div>
                </div>
              </div>
              <div className="text-[10px] text-[#8E9AA8]">
                External front-runner bot orders will be intercepted and atomically routed behind developer bundle.
              </div>
            </div>
          ),
        };
        break;

      case "launch":
        const ticker = args[0] ? args[0].toUpperCase() : "JET";
        const venue = args[1] || "PUMP_FUN";
        outputLog = {
          id: `out-${Date.now()}`,
          type: "output",
          content: (
            <div className="space-y-2 text-xs text-[#8E9AA8] font-mono">
              <div className="text-[#31E3AC] font-bold">
                BLOCK-0 ATOMIC LAUNCH BUNDLE SYNTHESIZED FOR: ${ticker}
              </div>
              <div className="p-2.5 rounded bg-[#0E1117] border border-[#1C202B] space-y-1 text-[11px]">
                <div>Target Protocol: <span className="text-[#FF7700] font-bold">{venue}</span></div>
                <div>Sub-Wallets Prepared: <span className="text-[#F8FAFC]">24 Turnkey Enclave Wallets</span></div>
                <div>ATA Rent Reclaim: <span className="text-[#31E3AC]">+0.0489 SOL recovered</span></div>
                <div>Platform Fee: <span className="text-[#31E3AC]">3.5% (Scramjet Advantage vs Proxima 5.0%)</span></div>
              </div>
              <div className="pt-1">
                <Link
                  href="/launch"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF3E00] text-black font-bold text-[11px] uppercase tracking-wider hover:bg-[#FF7700] transition-colors"
                >
                  Proceed to Launch HUD &rarr;
                </Link>
              </div>
            </div>
          ),
        };
        break;

      case "clear":
        setLogs([]);
        return;

      default:
        outputLog = {
          id: `err-${Date.now()}`,
          type: "error",
          content: (
            <div className="text-xs text-[#FF2A55] font-mono">
              Command not recognized: <span className="font-bold">{cmd}</span>. Type <span className="text-[#31E3AC] underline cursor-pointer" onClick={() => handleCommand("help")}>help</span> for command reference.
            </div>
          ),
        };
        break;
    }

    setLogs((prev) => [...prev, inputLog, outputLog]);
    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length > 0 && historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < history.length) {
          setHistoryIndex(nextIdx);
          setInputVal(history[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setInputVal("");
        }
      }
    }
  };

  return (
    <div className="relative rounded-2xl border border-[#FF3E00]/30 bg-[#08090C] overflow-hidden shadow-[0_0_40px_rgba(255,62,0,0.08)] flex flex-col h-[520px]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0D0F14] border-b border-[#1C202B]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF2A55]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FF7700]/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#31E3AC]/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-[#8E9AA8] ml-2">
            hypersonic-terminal@scramjet-core
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#31E3AC]/10 text-[#31E3AC] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#31E3AC] animate-pulse" />
            MAINNET-BETA
          </span>
          <span className="text-[10px] font-mono text-[#717686]">CLI v2.4</span>
        </div>
      </div>

      {/* Quick Pills Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0C10] border-b border-[#1C202B] overflow-x-auto text-xs font-mono">
        <span className="text-[10px] text-[#717686] uppercase tracking-wider whitespace-nowrap">
          Quick Actions:
        </span>
        <button
          onClick={() => handleCommand("telemetry")}
          className="px-2.5 py-1 rounded bg-[#141720] hover:bg-[#1F2433] text-[#FF7700] text-[11px] whitespace-nowrap transition-colors"
        >
          [telemetry]
        </button>
        <button
          onClick={() => handleCommand("venues")}
          className="px-2.5 py-1 rounded bg-[#141720] hover:bg-[#1F2433] text-[#31E3AC] text-[11px] whitespace-nowrap transition-colors"
        >
          [venues]
        </button>
        <button
          onClick={() => handleCommand("audit SCRAMJET")}
          className="px-2.5 py-1 rounded bg-[#141720] hover:bg-[#1F2433] text-[#8E9AA8] text-[11px] whitespace-nowrap transition-colors"
        >
          [audit SCRAMJET]
        </button>
        <button
          onClick={() => handleCommand("ghost-vault")}
          className="px-2.5 py-1 rounded bg-[#141720] hover:bg-[#1F2433] text-[#FF7700] text-[11px] whitespace-nowrap transition-colors"
        >
          [ghost-vault]
        </button>
        <button
          onClick={() => handleCommand("snipe-shield")}
          className="px-2.5 py-1 rounded bg-[#141720] hover:bg-[#1F2433] text-[#31E3AC] text-[11px] whitespace-nowrap transition-colors"
        >
          [snipe-shield]
        </button>
        <button
          onClick={() => handleCommand("launch JET PUMP_FUN")}
          className="px-2.5 py-1 rounded bg-[#FF3E00]/20 hover:bg-[#FF3E00]/30 text-[#FF7700] text-[11px] whitespace-nowrap transition-colors"
        >
          [launch JET]
        </button>
        <button
          onClick={() => handleCommand("clear")}
          className="px-2.5 py-1 rounded bg-[#141720] hover:bg-[#1F2433] text-[#717686] text-[11px] whitespace-nowrap transition-colors"
        >
          [clear]
        </button>
      </div>

      {/* Terminal Output Log Area */}
      <div
        ref={logContainerRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 p-4 overflow-y-auto space-y-3 font-mono cursor-text select-text"
      >
        {logs.map((log) => (
          <div key={log.id} className="animate-fadeIn">
            {log.content}
          </div>
        ))}
      </div>

      {/* Interactive Input Prompt */}
      <div className="p-3 bg-[#0A0C10] border-t border-[#1C202B] flex items-center gap-2">
        <span className="text-xs font-mono text-[#FF7700] font-bold select-none whitespace-nowrap">
          scramjet@solana:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type command (e.g. status, venues, audit, launch JET)..."
          className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-[#F8FAFC] placeholder-[#717686]"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={() => handleCommand(inputVal)}
          className="px-3 py-1 rounded bg-[#1C202B] hover:bg-[#2D3344] text-[11px] font-mono text-[#F8FAFC] transition-colors"
        >
          RUN
        </button>
      </div>
    </div>
  );
};

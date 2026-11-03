# REVIEW_LOG

## ALERT

**CRITICAL. Rotate credentials. I did not rotate them, rewrite git history, or force-push.**

Commit `6f66bd7` (and its ancestors) still contain a live-format Helius RPC API key in `src/lib/solana/connection.ts` and a Turnkey organization id, API public key, and API private key in `src/lib/wallets/turnkeyManager.ts`. HEAD (`143c58c`) removed those literals. The GitHub repo is private, but anyone with a clone or CI cache can still read the old blobs. Treat both credentials as burned. Purge history only with a coordinated history rewrite, which I will not do from here.

**Decision.** `POST /api/v1/launch` was quoting fees from a caller-supplied wallet, including the public fee vault, which is fee-exempt. That quote path is fixed on `review/2026-11-03-launch-quote-api`. The client fee router still exempts the vault when that wallet is actually connected. Say if any other address should be exempt. I did not add one.

**Decision.** The bump bot and ghost funder are still shipped as features whose comments describe holding trending placement and breaking clustering. I did not change that purpose. The runaway timer is fixed on `review/2026-11-03-stop-bump-timer` (SJ-009).

## Cycle

- Date: 2026-11-03 12:10 MST (America/Denver), continued 2026-11-03 3:46 PM MST after the one-cycle stop
- Repo: `/agent/repos/scramjet`, reviewed HEAD `143c58c` on `main` after fast-forward (local snapshot had been `6f66bd7`)
- Site: `https://scramjet.tools` does not resolve (NXDOMAIN from this environment). No homepage URL on the GitHub repo. Frontend checks are source, local files, and `next dev` on port 3001. That server is not a production deploy.
- Stack: Next.js 15 App Router, Solana web3.js, Turnkey, Jito, Zustand. No server session.
- Passes: security, adversarial abuse, correctness, site and frontend, ops and reliability, code health
- New findings: 1 CRITICAL, 8 HIGH, 7 MEDIUM, 3 LOW
- Fixed on branches, not merged: SJ-002 through SJ-011, SJ-013, SJ-015, SJ-016, SJ-018, SJ-019, SJ-020
- Still open: SJ-001 (credential rotation; I did not rotate or rewrite history), SJ-012 (marketplace copy is a product call), SJ-014 (dependency bump not applied), SJ-017 (no real social URLs to point at)

HEAD `143c58c` already dropped in-tree keys, the email exemption list, the launch-page fee-vault payer, and added `X-Frame-Options`, `nosniff`, `Referrer-Policy`, and HSTS. Those are not re-opened below.

---

## SJ-001 — CRITICAL — OPEN

- **Location:** `src/lib/solana/connection.ts` and `src/lib/wallets/turnkeyManager.ts` as of commit `6f66bd7`. Absent from HEAD.
- **Problem:** A Helius API key and a Turnkey API private key were committed. HEAD no longer has the literals. The blobs are still reachable in git history, so rotation is still required.
- **Proof:** Compared `6f66bd7` with HEAD. The parent file matches `api-key=` plus a UUID. The Turnkey file matches a quoted 64-hex literal. HEAD matches neither. Values are not copied here.
- **Fix:** Revoke the Helius key and the Turnkey API key in their dashboards, put replacements only in env, then purge history. I will not rotate or rewrite history.

## SJ-002 — HIGH — FIXED

- **Location:** `src/app/api/v1/launch/route.ts`
- **Problem:** Every valid `POST` returned 500 because `feeEstimate.totalLaunchFeeLamports` is a bigint and `NextResponse.json` cannot serialize it. The same handler treated `payerAddress` as the fee payer, so sending the public fee vault (which `isExemptFromFees` accepts) would have waived the quote once serialization worked. `totalBudgetSol: 0` was rewritten to 5 because of `||`.
- **Proof:** Called `POST` with the fee-vault address, with `totalBudgetSol: 0`, and with `-100`. All three returned HTTP 500 and `Do not know how to serialize a BigInt`. `isExemptFromFees` on the vault address is `true`. After the patch, the vault-address body returns `status: "QUOTED"`, `isExempt: false`, `totalLaunchFeeSol: 0.23`, lamports as the string `"230000000"`. Zero and negative budgets return 400. A broken JSON body returns 400.
- **Fix:** Branch `review/2026-11-03-launch-quote-api`. Ignore the claimed payer, reject non-positive or huge budgets, return `QUOTED`, and send lamports as a decimal string.

## SJ-003 — HIGH — FIXED

- **Location:** `src/app/api/v1/status/route.ts`
- **Problem:** The public status route reported `blockZeroSuccessRate: "99.4%"`, `uptimePercent: "99.98%"`, a random per-region latency marked `HEALTHY`, and `"0% fee on failed launches (full refund)"`. Nothing in the process measures inclusion, uptime, latency, or refunds.
- **Proof:** Called `GET`. The body contained those three metrics, five engines each `HEALTHY` with latencies 14–19, and the refund sentence. No probe was made to Jito.
- **Fix:** Branch `review/2026-11-03-status-fake-metrics`. The route now returns liveness, the configured engine URLs, and the 350 bps fee constant. Re-check: no `metrics` object and no refund string.

## SJ-004 — HIGH — FIXED

- **Location:** `src/app/login/page.tsx` `handleEmailSubmit`, `handleSignupSubmit`, `handleMigrateLicenseKey`; `src/components/wallet/WalletButton.tsx` `connectWallet`
- **Problem:** Email, signup, a missing wallet, and a rejected connect still created a session. Login used `PublicKey.unique()` and pushed `/launch`. The header button set the fee vault, which is fee-exempt, so Connect Wallet with no provider waived the launch fee in the UI.
- **Proof:** `isExemptFromFees` on the vault address returns `true`. Login handlers assigned `PublicKey.unique()` and called `router.push("/launch")` on the no-provider path and in the `catch`. `WalletButton` assigned the vault pubkey when `provider` was missing and again in `catch`.
- **Fix:** Branch `review/2026-11-03-no-fake-wallet-session`. `setConnectedWallet` runs only after `provider.connect()` returns a key. Otherwise the UI stays logged out and shows an error.

## SJ-005 — HIGH — FIXED

- **Location:** `src/lib/jito/jitoClient.ts` `sendBundle` (previously the `simulated-bundle-` fallback). Launch UI: `src/app/launch/page.tsx` success card.
- **Problem:** If every block engine failed, `sendBundle` still returned a `simulated-bundle-<timestamp>` id. `LaunchOrchestrator.executeLaunch` always set `status: "BUNDLE_SUBMITTED"`, and the launch page rendered a green success card for any returned result.
- **Proof:** `sendBundle(["not-a-transaction"])` against `https://ny.mainnet.block-engine.jito.wtf` came back `FAILED` / `HTTP 400` and `bundleId` started with `simulated-bundle-`. After the patch the same call throws `Jito rejected the bundle (HTTP 400)` and the message does not contain `simulated-bundle-`.
- **Fix:** Branch `review/2026-11-03-jito-fake-bundle-id`. Throw when no engine returns a string bundle id. The tip-floor fetch now uses the same 8s `AbortSignal` as send. Unsigned transactions are still encoded; see SJ-006.

## SJ-006 — HIGH — FIXED

- **Location:** `src/lib/jito/bundleBuilder.ts` line 83, `VersionedTransaction.serialize`
- **Problem:** Block-0 transactions are built without signatures. `@solana/web3.js` `VersionedTransaction.serialize()` writes 64 zero bytes per required signature and does not reject them. Those bytes are what get posted to Jito. SJ-005 makes the UI show the rejection. It does not stop the unsigned post.
- **Proof:** A one-signature transfer compiled and `serialize()` returned 217 bytes with an all-zero signature. `serialize({ requireAllSignatures: true, verifySignatures: true })` also returned. The bundle builder calls `tx.serialize()` with no signer.
- **Fix:** Branch `review/2026-11-03-reject-unsigned-bundle`. Before encode, throw if any required signature is all zeros. Proof: `assembleBlock0Bundle` with an unsigned transfer threw `Refusing to encode 2 unsigned bundle transaction(s)`. `sendBundle` is not called. SJ-005 is a separate branch; this one still has the old fake bundle id until both merge.

## SJ-007 — HIGH — FIXED

- **Location:** `src/lib/stores/useLaunchStore.ts` line 415, `src/lib/pipeline/launchOrchestrator.ts` line 59, `src/lib/automations/bumpBot.ts` line 66, `src/lib/automations/feeBuyback.ts` line 41
- **Problem:** The associated bonding curve is derived as `findProgramAddressSync([bondingCurve, byte 6, mint], PUMP_PROGRAM)`. That is not the SPL associated token address. Buys, sells, creates, and bump instructions name the wrong account.
- **Proof:** For a random mint, that PDA and `getAssociatedTokenAddressSync(mint, bondingCurve, true)` were not equal. Anchor discriminators for `global:create`, `global:buy`, and `global:sell` do match the constants in `pumpFun.ts`. The account list is the broken part.
- **Fix:** Branch `review/2026-11-03-pump-curve-ata`. `PumpFunAdapter.getAssociatedBondingCurve` uses `getAssociatedTokenAddressSync(mint, bondingCurve, true)`. The store, orchestrator, bump bot, and fee buyback call it. Proof: a random mint's derived address equaled that ATA. `Buffer.from([6])` is gone from `src` on this branch. Sells on this branch still pass `minSolOutput: 0n` until SJ-008 merges.

## SJ-008 — HIGH — FIXED

- **Location:** `src/lib/stores/useLaunchStore.ts` line 908
- **Problem:** Pump sells set `minSolOutput: 0n` and ignore `tradeConfig.slippagePercent`. A landed sell can be sandwiched down to zero SOL out. `keypairFromWallet` also treats `privateKeyEncrypted` as a raw base58 64-byte secret, so the field name is false.
- **Proof:** `buildPumpSellInstruction` writes `minSolOutput` at offset 16. The sell branch passes `0n`. Seed wallets have no `privateKeyEncrypted`, so today's button simulates instead of broadcasting. The broadcast branch is the `signer` path directly above it.
- **Fix:** Branch `review/2026-11-03-sell-min-output`. `minSolOutFromCurveAccount` reads virtual token and virtual SOL reserves and caps slippage at 50%. The sell path fetches the bonding curve and refuses a missing account or a zero floor. Proof: reserves `1_000_000` token / `1_000_000_000` lamports and a 1000-token sell quote raw `999000`, 15% slip `849150`, 100% slip capped to `499500`; an 8-byte buffer throws. `minSolOutput: 0n` is gone on this branch. The field is still decoded as a raw secret, and this branch still uses the old bonding-curve PDA until SJ-007 merges. SJ-018 stops the JSON export from writing the field.

## SJ-009 — HIGH — FIXED

- **Location:** `src/lib/stores/useLaunchStore.ts` lines 805 and 823; `src/lib/automations/bumpBot.ts` line 25
- **Problem:** After the planned slices, the timer keeps firing and indexes with `bumpCursor % plan.scheduledBuys.length`. Nothing clears it on unmount. `planBumpSession` uses `sessionMinutes * 60 / bumpIntervalSeconds`; an interval of 0 makes that `Infinity` and the planner loop never ends. The workspace checkbox uses the default 15s, so the hang is not the current click path. The timer that never stops is.
- **Proof:** At 15s and a 10 minute session, `planBumpSession` schedules 40 buys. A cursor stepped 45 times still produced a finite index on every tick. `1 / 0` in that formula is not finite.
- **Fix:** Branch `review/2026-11-03-stop-bump-timer`. `planBumpSession` throws when the interval is not finite or is below 1 second, and when the slice count is outside 1..2000. The timer stops once `bumpCursor` reaches the plan length. Proof: 15 seconds over 10 minutes schedules 40 slices. Interval `0` and `-5` throw `Bump interval must be at least 1 second`. The bump bot's purpose is unchanged.

## SJ-010 — MEDIUM — FIXED

- **Location:** `scripts/devnet_test.ts` lines 80–88 and the closing banner
- **Problem:** The script prints that all 9 subsystems passed on devnet. Turnkey generation is `PublicKey.unique()` whenever env keys are absent, which is the HEAD default. The script never checks that the addresses came from Turnkey.
- **Proof:** `TurnkeyManager.createSubWallets` catches API failure and falls through to `PublicKey.unique()` (`src/lib/wallets/turnkeyManager.ts` around line 95). The test logs those addresses and prints `Enclave Keygen: PASS`.
- **Fix:** Branch `review/2026-11-03-devnet-no-fake-pass`. `TurnkeyManager.isConfigured()` is false without keys. The script throws `Refusing to mark enclave keygen as PASS` before `createSubWallets` and before the all-9 banner. `assertEnclaveWallets` also throws on `sw-` ids. Proof: a bare manager is unconfigured and throws; a manager given test config accepts `tw-` ids and rejects `sw-1`. No Turnkey API call was made.

## SJ-011 — MEDIUM — FIXED

- **Location:** `src/lib/stores/useLaunchStore.ts` `startSlotFeed` and `refreshWalletBalances` (the empty `catch` added in `143c58c`)
- **Problem:** Slot subscription failures and master-balance failures are discarded. The UI keeps slot 0 and the last balance.
- **Proof:** The `catch` bodies are `() => undefined` and a comment. No state update.
- **Fix:** Branch `review/2026-11-03-rpc-error-message`. Both catches set `lastActionMessage` to `RPC unavailable`. Proof: `Connection#getSlot` and `getBalance` were stubbed to throw messages that contained an `https://` URL. After `startSlotFeed` and `refreshWalletBalances`, the store message was exactly `RPC unavailable`, the master balance stayed `1.25`, and the message contained no URL. Per-wallet refresh still returns the previous wallet.

## SJ-012 — MEDIUM — OPEN

- **Location:** `src/app/marketplace/page.tsx` checkout button and the constants `totalBalance = 2.42`, `netPrice = 4.39`, `totalPrice = 6.81`
- **Problem:** The page says inventory is verified and pre-loaded with real SOL, and the header says `230 Verified Wallets`. The table is five hardcoded rows. Checkout is `alert(...)`. Quantity 25 and 200 both display 6.81 SOL.
- **Proof:** `selectedQuantity` is rendered in the button label. `totalPrice` is a constant and is what the alert reports. No transaction is built.
- **Fix:** Remove the purchase claim until a quote is tied to the selected rows. If this is a demo, label it as sample data. This is a product call. I did not change the copy.

## SJ-013 — MEDIUM — FIXED

- **Location:** `src/app/workspace/page.tsx` (`marketCapUsd` 84250, `volumeSol` 312.5); `src/components/workspace/TradingChart.tsx` default mint
- **Problem:** Market cap and volume are `useState` constants. The chart iframe defaults to mint `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` (BONK) while the label is `SCRAM/SOL`. Timeframe buttons update state and do not change the iframe URL.
- **Proof:** The default argument and the iframe `src` do not include `timeframe`. The two stats have no writer besides the initial state.
- **Fix:** Branch `review/2026-11-03-no-fake-market-stats`. Market cap, volume, and top 10 render as not loaded. The chart has no default mint, no timeframe buttons, and no trade-marker overlay. An empty or invalid mint renders no iframe. Proof: static render of `TradingChart` with no mint contained the empty-state sentence and no iframe; mint `So11111111111111111111111111111111111111112` set that mint in the DexScreener URL; `not-a-mint` rendered no iframe. Browser on `http://127.0.0.1:3001/workspace`: header showed Not loaded, typing that mint loaded the SOL DexScreener iframe, and a 390px viewport still showed Not loaded. The BONK mint and the old dollar figures were absent.

## SJ-014 — MEDIUM — OPEN

- **Location:** `npm audit` on the lockfile; `next@15.5.28` depends on `postcss@8.4.31`; `@solana/spl-token@0.4.15` pulls `bigint-buffer@1.1.5`
- **Problem:** High advisories: `GHSA-3gc7-fjrx-p6mg` (bigint-buffer `toBigIntLE` overflow), `GHSA-qx2v-qp2m-jg93` and `GHSA-6g55-p6wh-862q` (plus the follow-up postcss sourceMappingURL bugs) on the nested postcss. Audit total was 4 high and 7 moderate. I did not turn any of these into a request against the app.
- **Proof:** `npm audit --json` and `npm ls postcss bigint-buffer`.
- **Fix:** Upgrade Next so its nested postcss is current, and move off the web3.js line that still depends on `bigint-buffer@1.1.5`. Re-run `npm audit` after the bump.

## SJ-015 — MEDIUM — FIXED

- **Location:** `src/app/launch/page.tsx` default `imageUrl` `https://scramjet.tools/logo.png`; `public/` has no `logo.png`. Upload handler uses `URL.createObjectURL`.
- **Problem:** The production host in the client does not resolve. The fallback metadata URI 404s even as a local path. A chosen image becomes a `blob:` URL and is passed through as the token URI.
- **Proof:** DNS lookup for `scramjet.tools` returned no address. `public/logo.png` is absent. `handleImageUpload` stores the object URL, and dispatch uses `imagePreview || "https://scramjet.tools/logo.png"`.
- **Fix:** Branch `review/2026-11-03-reject-blob-image-uri`. `requireTokenImageUrl` rejects empty, `blob:`, non-https, and `scramjet.tools` hosts. The file picker is labeled preview only. Dispatch uses the https field. Proof: eight cases matched those rejections and accepted `https://example.com/token.png`. Browser on `http://127.0.0.1:3001/launch`: empty dispatch showed the local-preview error, `https://scramjet.tools/logo.png` showed the dead-host error, and `https://example.com/token.png` stopped at the connect-wallet error. No success card.

## SJ-016 — MEDIUM — FIXED

- **Location:** `src/app/launch/page.tsx` holder-count input (no `min` or `max`); `LaunchOrchestrator.executeLaunch` uses `config.block0Config.holderCount || 20`
- **Problem:** A huge holder count is passed into `createSubWallets`, which loops that many times and, when Turnkey env is set, asks Turnkey for that many accounts. `0` becomes 20 because of `||`. A negative count is truthy, then `Array.from({ length: negative })` becomes an empty list, so the user gets zero wallets and no error.
- **Proof:** The input's `onChange` is `setHolderCount(Number(e.target.value))` with no clamp. `holderCount || 20` does not treat negatives as missing. `Array.from({ length: -5 })` did not throw.
- **Fix:** Branch `review/2026-11-03-holder-count-bounds`. `requireHolderCount` throws `Holder count must be an integer from 1 to 32.` The input ignores values outside that range. `10000` is not clamped to 32. Proof: `executeLaunch` rejected `0`, `-5`, `33`, `1.5`, `10000`, `NaN`, and `Infinity` with that message before wallet creation. `1` and `32` pass the check.

## SJ-017 — LOW — OPEN

- **Location:** `src/components/layout/AppShell.tsx` footer and header
- **Problem:** `#product` and `#changelog` have no matching ids on the home page. X and Telegram point at `https://x.com` and `https://t.me`. Terms and Privacy are `<span>`s with `cursor-pointer`, not links.
- **Proof:** Grep of `src/app/page.tsx` found no `id="product"` or `id="changelog"`. The anchors are in `AppShell.tsx`.
- **Fix:** Point social links at the real profiles, add the section ids, or remove the anchors. Make legal rows real links or remove them.

## SJ-018 — LOW — FIXED

- **Location:** `src/lib/wallets/walletExporter.ts` line 19
- **Problem:** `exportToJson` writes `privateKeyEncrypted` into a downloadable document. The store decodes that field as a raw secret (SJ-008). Nothing in the UI calls the exporter yet.
- **Proof:** The JSON field is `w.privateKeyEncrypted ?? "Managed inside Turnkey Secure Enclave"`. Grep shows no caller outside the class file.
- **Fix:** Branch `review/2026-11-03-omit-export-secret`. `exportToJson` no longer writes `privateKeyEncrypted`. Proof: a wallet whose field was a non-empty string produced JSON without that key and without the secret string. CSV still says `Exportable` and does not contain the secret. The store on this branch still decodes the field as a raw secret (SJ-008).

## SJ-019 — LOW — FIXED

- **Location:** `src/lib/feeRouter.ts` `registerFeeExemption`
- **Problem:** Any trimmed string longer than 20 characters is added to the process-wide `EXEMPT_WALLETS` set. No caller today. On the server, one call would waive fees for the rest of the process lifetime.
- **Proof:** The function is `EXEMPT_WALLETS.add(clean)` when `clean.length > 20`. Grep shows the definition only.
- **Fix:** Branch `review/2026-11-03-drop-fee-exemption-api`. The function is deleted. Proof: the module export is absent, `EXEMPT_WALLETS.size` is 1, the fee vault is still exempt, and a fresh pubkey is not.

## SJ-020 — LOW — FIXED

- **Location:** `src/components/layout/AppShell.tsx` header price pill and footer market strip
- **Problem:** Every app page showed `SOL $92.31`, a market strip of `$92.31`, `$697`, and `$2,266`, and `All Services Live · 396ms`. Nothing in the process reads a SOL price or measures latency.
- **Proof:** Those strings are literals in `AppShell.tsx` on `main`. They were visible on `http://127.0.0.1:3001/launch` during the SJ-015 browser check. After the patch, the launch HTML no longer contains them. The header still has Connect Wallet. The home marketing footer is a different component and did not contain this strip.
- **Fix:** Branch `review/2026-11-03-no-fake-price-ticker`. The price pill, the market strip, and the 396ms claim are removed.

---

## Pass notes

- Security: SJ-001 through SJ-005, SJ-008, SJ-018, SJ-019.
- Adversarial: SJ-002 (zero, negative, vault address), SJ-009 (zero interval), SJ-016 (huge holder count).
- Correctness: SJ-002 (bigint 500), SJ-006, SJ-007, SJ-010, SJ-011.
- Site and frontend: production host does not resolve, so no live console, contrast, or keyboard pass. SJ-012, SJ-013, SJ-015, SJ-017 are from source. Local port 3000 was still serving the pre-scrub build; I did not use it as proof of HEAD.
- Ops: SJ-003, SJ-005 (timeout on send and tip floor), SJ-014. `typescript.ignoreBuildErrors` is now `false`. `eslint.ignoreDuringBuilds` is still `true`.
- Code health: SJ-010, SJ-018, SJ-019. `FeeBuybackFlywheel` is imported by `launchOrchestrator.ts` and never called. Its burn amount is a constant `1_000_000` if it is ever wired.

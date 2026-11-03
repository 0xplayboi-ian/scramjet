# REVIEW_LOG

## ALERT

**CRITICAL. Rotate credentials. I did not rotate them, rewrite git history, or force-push.**

Commit `6f66bd7` (and its ancestors) still contain a live-format Helius RPC API key in `src/lib/solana/connection.ts` and a Turnkey organization id, API public key, and API private key in `src/lib/wallets/turnkeyManager.ts`. HEAD (`143c58c`) removed those literals. The GitHub repo is private, but anyone with a clone or CI cache can still read the old blobs. Treat both credentials as burned. Purge history only with a coordinated history rewrite, which I will not do from here.

**Decision.** `POST /api/v1/launch` was quoting fees from a caller-supplied wallet, including the public fee vault, which is fee-exempt. That quote path is fixed on `review/2026-11-03-launch-quote-api`. The client fee router still exempts the vault when that wallet is actually connected. Say if any other address should be exempt. I did not add one.

**Decision.** The bump bot and ghost funder are still shipped as features whose comments describe holding trending placement and breaking clustering. I did not change that behavior. The runaway timer is SJ-009.

## Cycle

- Date: 2026-11-03 12:10 MST (America/Denver)
- Repo: `/agent/repos/scramjet`, reviewed HEAD `143c58c` on `main` after fast-forward (local snapshot had been `6f66bd7`)
- Site: `https://scramjet.tools` does not resolve (NXDOMAIN from this environment). No homepage URL on the GitHub repo. Frontend checks are source and local files, not a live deployment.
- Stack: Next.js 15 App Router, Solana web3.js, Turnkey, Jito, Zustand. No server session.
- Passes: security, adversarial abuse, correctness, site and frontend, ops and reliability, code health
- New findings: 1 CRITICAL, 8 HIGH, 7 MEDIUM, 3 LOW
- Fixed on branches this cycle: 4 HIGH (SJ-002, SJ-003, SJ-004, SJ-005). Not merged.
- Needs you: credential rotation and history purge. I stopped there.

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

## SJ-006 — HIGH — OPEN

- **Location:** `src/lib/jito/bundleBuilder.ts` line 83, `VersionedTransaction.serialize`
- **Problem:** Block-0 transactions are built without signatures. `@solana/web3.js` `VersionedTransaction.serialize()` writes 64 zero bytes per required signature and does not reject them. Those bytes are what get posted to Jito. SJ-005 makes the UI show the rejection. It does not stop the unsigned post.
- **Proof:** A one-signature transfer compiled and `serialize()` returned 217 bytes with an all-zero signature. `serialize({ requireAllSignatures: true, verifySignatures: true })` also returned. The bundle builder calls `tx.serialize()` with no signer.
- **Fix:** Before encode, throw if any required signature is all zeros. Do not call `sendBundle` until the payer and mint have signed.

## SJ-007 — HIGH — OPEN

- **Location:** `src/lib/stores/useLaunchStore.ts` line 415, `src/lib/pipeline/launchOrchestrator.ts` line 59, `src/lib/automations/bumpBot.ts` line 66, `src/lib/automations/feeBuyback.ts` line 41
- **Problem:** The associated bonding curve is derived as `findProgramAddressSync([bondingCurve, byte 6, mint], PUMP_PROGRAM)`. That is not the SPL associated token address. Buys, sells, creates, and bump instructions name the wrong account.
- **Proof:** For a random mint, that PDA and `getAssociatedTokenAddressSync(mint, bondingCurve, true)` were not equal. Anchor discriminators for `global:create`, `global:buy`, and `global:sell` do match the constants in `pumpFun.ts`. The account list is the broken part.
- **Fix:** Derive the curve ATA with `getAssociatedTokenAddressSync(mint, bondingCurve, true)` in one helper and use it at all four sites.

## SJ-008 — HIGH — OPEN

- **Location:** `src/lib/stores/useLaunchStore.ts` line 908
- **Problem:** Pump sells set `minSolOutput: 0n` and ignore `tradeConfig.slippagePercent`. A landed sell can be sandwiched down to zero SOL out. `keypairFromWallet` also treats `privateKeyEncrypted` as a raw base58 64-byte secret, so the field name is false.
- **Proof:** `buildPumpSellInstruction` writes `minSolOutput` at offset 16. The sell branch passes `0n`. Seed wallets have no `privateKeyEncrypted`, so today's button simulates instead of broadcasting. The broadcast branch is the `signer` path directly above it.
- **Fix:** Do not build or send a sell until a quote produces a positive minimum out from the configured slippage. Stop decoding that field as a plaintext secret, or rename it and refuse non-encrypted values.

## SJ-009 — HIGH — OPEN

- **Location:** `src/lib/stores/useLaunchStore.ts` lines 805 and 823; `src/lib/automations/bumpBot.ts` line 25
- **Problem:** After the planned slices, the timer keeps firing and indexes with `bumpCursor % plan.scheduledBuys.length`. Nothing clears it on unmount. `planBumpSession` uses `sessionMinutes * 60 / bumpIntervalSeconds`; an interval of 0 makes that `Infinity` and the planner loop never ends. The workspace checkbox uses the default 15s, so the hang is not the current click path. The timer that never stops is.
- **Proof:** At 15s and a 10 minute session, `planBumpSession` schedules 40 buys. A cursor stepped 45 times still produced a finite index on every tick. `1 / 0` in that formula is not finite.
- **Fix:** Clear the timer after `scheduledBuys.length` ticks and on unmount. Reject `bumpIntervalSeconds < 1` before planning.

## SJ-010 — MEDIUM — OPEN

- **Location:** `scripts/devnet_test.ts` lines 80–88 and the closing banner
- **Problem:** The script prints that all 9 subsystems passed on devnet. Turnkey generation is `PublicKey.unique()` whenever env keys are absent, which is the HEAD default. The script never checks that the addresses came from Turnkey.
- **Proof:** `TurnkeyManager.createSubWallets` catches API failure and falls through to `PublicKey.unique()` (`src/lib/wallets/turnkeyManager.ts` around line 95). The test logs those addresses and prints `Enclave Keygen: PASS`.
- **Fix:** Fail the script when `turnkeyManager` has no client, or assert the returned keys against a Turnkey read. Do not print a devnet pass banner for the fallback.

## SJ-011 — MEDIUM — OPEN

- **Location:** `src/lib/stores/useLaunchStore.ts` `startSlotFeed` and `refreshWalletBalances` (the empty `catch` added in `143c58c`)
- **Problem:** Slot subscription failures and master-balance failures are discarded. The UI keeps slot 0 and the last balance.
- **Proof:** The `catch` bodies are `() => undefined` and a comment. No state update.
- **Fix:** Set `lastActionMessage` to a fixed string such as `RPC unavailable`. Do not put the provider URL or response body in the UI.

## SJ-012 — MEDIUM — OPEN

- **Location:** `src/app/marketplace/page.tsx` checkout button and the constants `totalBalance = 2.42`, `netPrice = 4.39`, `totalPrice = 6.81`
- **Problem:** The page says inventory is verified and pre-loaded with real SOL, and the header says `230 Verified Wallets`. The table is five hardcoded rows. Checkout is `alert(...)`. Quantity 25 and 200 both display 6.81 SOL.
- **Proof:** `selectedQuantity` is rendered in the button label. `totalPrice` is a constant and is what the alert reports. No transaction is built.
- **Fix:** Remove the purchase claim until a quote is tied to the selected rows. If this is a demo, label it as sample data. This is a product call. I did not change the copy.

## SJ-013 — MEDIUM — OPEN

- **Location:** `src/app/workspace/page.tsx` (`marketCapUsd` 84250, `volumeSol` 312.5); `src/components/workspace/TradingChart.tsx` default mint
- **Problem:** Market cap and volume are `useState` constants. The chart iframe defaults to mint `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` (BONK) while the label is `SCRAM/SOL`. Timeframe buttons update state and do not change the iframe URL.
- **Proof:** The default argument and the iframe `src` do not include `timeframe`. The two stats have no writer besides the initial state.
- **Fix:** Don't render a number you didn't load. Pass the active mint into `TradingChart`. Drop the timeframe control until it changes the query.

## SJ-014 — MEDIUM — OPEN

- **Location:** `npm audit` on the lockfile; `next@15.5.28` depends on `postcss@8.4.31`; `@solana/spl-token@0.4.15` pulls `bigint-buffer@1.1.5`
- **Problem:** High advisories: `GHSA-3gc7-fjrx-p6mg` (bigint-buffer `toBigIntLE` overflow), `GHSA-qx2v-qp2m-jg93` and `GHSA-6g55-p6wh-862q` (plus the follow-up postcss sourceMappingURL bugs) on the nested postcss. Audit total was 4 high and 7 moderate. I did not turn any of these into a request against the app.
- **Proof:** `npm audit --json` and `npm ls postcss bigint-buffer`.
- **Fix:** Upgrade Next so its nested postcss is current, and move off the web3.js line that still depends on `bigint-buffer@1.1.5`. Re-run `npm audit` after the bump.

## SJ-015 — MEDIUM — OPEN

- **Location:** `src/app/launch/page.tsx` default `imageUrl` `https://scramjet.tools/logo.png`; `public/` has no `logo.png`. Upload handler uses `URL.createObjectURL`.
- **Problem:** The production host in the client does not resolve. The fallback metadata URI 404s even as a local path. A chosen image becomes a `blob:` URL and is passed through as the token URI.
- **Proof:** DNS lookup for `scramjet.tools` returned no address. `public/logo.png` is absent. `handleImageUpload` stores the object URL, and dispatch uses `imagePreview || "https://scramjet.tools/logo.png"`.
- **Fix:** Host the image on a name that resolves, and upload the file to a durable URI before it is written into a create instruction. Do not put a `blob:` URL on chain.

## SJ-016 — MEDIUM — OPEN

- **Location:** `src/app/launch/page.tsx` holder-count input (no `min` or `max`); `LaunchOrchestrator.executeLaunch` uses `config.block0Config.holderCount || 20`
- **Problem:** A huge holder count is passed into `createSubWallets`, which loops that many times and, when Turnkey env is set, asks Turnkey for that many accounts. `0` becomes 20 because of `||`. A negative count is truthy, then `Array.from({ length: negative })` becomes an empty list, so the user gets zero wallets and no error.
- **Proof:** The input's `onChange` is `setHolderCount(Number(e.target.value))` with no clamp. `holderCount || 20` does not treat negatives as missing. `Array.from({ length: -5 })` did not throw.
- **Fix:** Clamp to an integer range such as 1..32 before the Turnkey call, and reject anything outside it in the UI.

## SJ-017 — LOW — OPEN

- **Location:** `src/components/layout/AppShell.tsx` footer and header
- **Problem:** `#product` and `#changelog` have no matching ids on the home page. X and Telegram point at `https://x.com` and `https://t.me`. Terms and Privacy are `<span>`s with `cursor-pointer`, not links.
- **Proof:** Grep of `src/app/page.tsx` found no `id="product"` or `id="changelog"`. The anchors are in `AppShell.tsx`.
- **Fix:** Point social links at the real profiles, add the section ids, or remove the anchors. Make legal rows real links or remove them.

## SJ-018 — LOW — OPEN

- **Location:** `src/lib/wallets/walletExporter.ts` line 19
- **Problem:** `exportToJson` writes `privateKeyEncrypted` into a downloadable document. The store decodes that field as a raw secret (SJ-008). Nothing in the UI calls the exporter yet.
- **Proof:** The JSON field is `w.privateKeyEncrypted ?? "Managed inside Turnkey Secure Enclave"`. Grep shows no caller outside the class file.
- **Fix:** Omit the secret field. If you need a backup, export only public keys until the value is actually encrypted by a key that is not the secret itself.

## SJ-019 — LOW — OPEN

- **Location:** `src/lib/feeRouter.ts` `registerFeeExemption`
- **Problem:** Any trimmed string longer than 20 characters is added to the process-wide `EXEMPT_WALLETS` set. No caller today. On the server, one call would waive fees for the rest of the process lifetime.
- **Proof:** The function is `EXEMPT_WALLETS.add(clean)` when `clean.length > 20`. Grep shows the definition only.
- **Fix:** Delete it until exemption changes go through a reviewed config change. Do not accept an address from a request body.

---

## Pass notes

- Security: SJ-001 through SJ-005, SJ-008, SJ-018, SJ-019.
- Adversarial: SJ-002 (zero, negative, vault address), SJ-009 (zero interval), SJ-016 (huge holder count).
- Correctness: SJ-002 (bigint 500), SJ-006, SJ-007, SJ-010, SJ-011.
- Site and frontend: production host does not resolve, so no live console, contrast, or keyboard pass. SJ-012, SJ-013, SJ-015, SJ-017 are from source. Local port 3000 was still serving the pre-scrub build; I did not use it as proof of HEAD.
- Ops: SJ-003, SJ-005 (timeout on send and tip floor), SJ-014. `typescript.ignoreBuildErrors` is now `false`. `eslint.ignoreDuringBuilds` is still `true`.
- Code health: SJ-010, SJ-018, SJ-019. `FeeBuybackFlywheel` is imported by `launchOrchestrator.ts` and never called. Its burn amount is a constant `1_000_000` if it is ever wired.

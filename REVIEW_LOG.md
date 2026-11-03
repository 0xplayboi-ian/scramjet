# REVIEW_LOG

## ALERT

Stop. Live credentials are in the public production bundle and still work.

1. A Turnkey API private key, API public key, and organization id are hardcoded in `src/lib/wallets/turnkeyManager.ts` and shipped in the live launch-page JavaScript. `getWhoami` against `https://api.turnkey.com` succeeded with that key. `LaunchOrchestrator.executeLaunch` calls `turnkeyManager.createSubWallets`, and `signTransactionEnclave` can ask Turnkey to sign. Revoke this API key in the Turnkey dashboard now. Do not wait on a deploy. This agent did not list wallets, sign, or rotate the key.
2. A Helius mainnet RPC API key is hardcoded in `src/lib/solana/connection.ts` and is the default RPC when no RPC env var is set. It is in the live JavaScript. `getHealth` returned success. Revoke it in the Helius dashboard.

The live site is `https://scramjet-vrpj.onrender.com`. The Turnkey material is in `/_next/static/chunks/app/launch/page-871a098f061c150e.js`. The Helius key and the fee-exemption email addresses are in `/_next/static/chunks/997-17945c2e01828fb4.js`.

This branch removes the hardcoded defaults. That does not revoke the keys, and it does not erase git history or the current Render deploy. Redeploy only after the keys are revoked.

Decision needed: `/login` with no Phantom wallet sets the session to the protocol fee vault and the launch UI then shows a 0 SOL fee. Say if that is intentional demo behavior or should be removed.

## Cycle 2026-11-03 (America/Denver)

- Passes run: security, adversarial abuse, correctness, site and frontend, ops and reliability, code health.
- New findings: 2 CRITICAL, 1 HIGH, 1 MEDIUM, 4 LOW.
- Needs a decision: revoke both provider keys (required), and whether passwordless login should impersonate the fee vault.
- Code change on this branch: hardcoded Turnkey and Helius defaults removed. Production is unchanged until you revoke and redeploy.

## Findings

### F-001

- **Severity:** CRITICAL
- **Status:** OPEN
- **Location:** `src/lib/wallets/turnkeyManager.ts` constructor; live file `/_next/static/chunks/app/launch/page-871a098f061c150e.js`; also the organization id on `src/app/docs/page.tsx` (API setup section).
- **Problem:** The Turnkey organization id, API public key, and API private key are string literals. The launch page imports `LaunchOrchestrator`, which constructs `turnkeyManager` at module load, so the private key is in the public bundle. The key is valid.
- **Proof:** Read-only `TurnkeyClient.getWhoami({ organizationId })` returned success and the organization id matched the literal. The private key string is present in the live launch chunk named above. Code path: `src/app/launch/page.tsx` `handleDispatchBundle` -> `LaunchOrchestrator.executeLaunch` -> `turnkeyManager.createSubWallets` / `signTransactionEnclave`.
- **Fix:** Remove the literals (done on this branch). Read the three values only from `TURNKEY_ORGANIZATION_ID`, `TURNKEY_API_PUBLIC_KEY`, and `TURNKEY_API_PRIVATE_KEY`. Revoke the leaked API key in Turnkey, then redeploy. Treat git history as compromised.

### F-002

- **Severity:** CRITICAL
- **Status:** OPEN
- **Location:** `src/lib/solana/connection.ts` `resolveSolanaRpcEndpoints`; live file `/_next/static/chunks/997-17945c2e01828fb4.js`.
- **Problem:** A Helius mainnet URL with an API key is the default primary RPC whenever `NEXT_PUBLIC_SOLANA_RPC_URL` and `SOLANA_RPC_URL` are unset. Client components import this module (`WalletButton`, `/launch`), so the key is in the browser bundle. The comment above the resolver claimed keys are never embedded.
- **Proof:** `getHealth` on that URL returned HTTP 200 with a healthy result. The key string is in the live chunk named above. With no RPC env set, `resolveSolanaRpcEndpoints().primary` is that URL.
- **Fix:** Delete the embedded URL (done on this branch) and fall through to the public mainnet RPC. Set `NEXT_PUBLIC_SOLANA_RPC_URL` from the host environment. Revoke the Helius key, then redeploy.

### F-003

- **Severity:** HIGH
- **Status:** OPEN
- **Location:** `src/app/login/page.tsx` `handleMigrateLicenseKey`, `handleEmailSubmit`, `handleSignupSubmit`; `src/app/launch/page.tsx` around the `connectedWallet` fee check; `src/lib/feeRouter.ts` `EXEMPT_WALLETS`.
- **Problem:** Every login path that does not have Phantom connects the session as the protocol fee vault. That address is fee-exempt, and `/launch` uses it both for the displayed fee and as `masterPayer` when nothing else is connected. Email and signup do not check the address or the message. The Phantom failure path does the same thing.
- **Proof:** `handleMigrateLicenseKey` else/catch and both form handlers call `setConnectedWallet` with `CcwpTCpWMtKGo1fqnZuH4Psdj6yugbmSrAPaeTdEy6Qq`. `isExemptFromFees` returns true for that address. `calculateUpfrontLaunchFee(holderCount, connectedWallet)` returns `totalLaunchFeeSol: 0`. `handleDispatchBundle` uses `connectedWallet ||` that same vault as `masterPayer`.
- **Fix:** Needs a product decision. If login is real, require a wallet signature and never default the payer to the fee vault. If it is a demo, label it as a demo and do not zero protocol fees off that default.

### F-004

- **Severity:** MEDIUM
- **Status:** OPEN
- **Location:** `src/lib/feeRouter.ts` `EXEMPT_EMAILS` and `isExemptFromFees`; live chunk `/_next/static/chunks/997-17945c2e01828fb4.js`.
- **Problem:** Two personal email addresses and a suffix match for `@scramjet.tools` and `@scramjet.com` are compiled into the public fee-router chunk. Anyone who can pass an email into `isExemptFromFees` gets a 0 fee. `registerFeeExemption` mutates the in-memory set and is not called by the UI today.
- **Proof:** The live chunk named above contains both email addresses and `scramjet.tools`. `calculateProtocolFee` / `calculateUpfrontLaunchFee` call `isExemptFromFees`. Launch currently passes a wallet, not an email, so the email path is not exercised by `/launch`.
- **Fix:** Delete the email allowlist from client code. If an exemption must exist, enforce it when building the signed transaction on a server the user does not control. Do not ship personal addresses in the bundle.

### F-005

- **Severity:** MEDIUM
- **Status:** OPEN
- **Location:** `package-lock.json` (`npm audit`)
- **Problem:** `npm audit` reports 4 high and 7 moderate issues. High: `bigint-buffer` (via `@solana/web3.js` / `@solana/spl-token`) and `postcss` <= 8.5.22 (via `next`). No exploit was run against this app.
- **Proof:** `npm audit` on 2026-11-03 after `npm ci`: 11 vulnerabilities, 4 high, 7 moderate, 0 critical. `bigint-buffer` range `*`. `postcss` range `<=8.5.22`.
- **Fix:** Upgrade `postcss` to a patched 8.x. Track a `@solana/web3.js` release that drops the vulnerable `bigint-buffer` path. Do not run `npm audit fix --force` blindly; it will jump major versions. Exploitability in this UI is UNVERIFIED.

### F-006

- **Severity:** LOW
- **Status:** OPEN
- **Location:** `https://scramjet-vrpj.onrender.com/` response headers; `next.config.ts` has no `headers()`.
- **Problem:** HTML responses include `x-powered-by: Next.js` and no `content-security-policy`, `strict-transport-security`, `x-frame-options`, `x-content-type-options`, or `referrer-policy`.
- **Proof:** GET `/`, `/launch`, `/workspace`, `/marketplace`, `/funder`, `/docs`, `/login` returned 200 with those headers absent and `server: cloudflare`. GET `/api/health` and `/does-not-exist` returned 404. Local dev console: `GET /favicon.ico` 404. `public/favicon.svg` exists; there is no `src/app/favicon.ico`.
- **Fix:** Set `poweredByHeader: false` and add a baseline header set in `next.config.ts`. Add an explicit health route if Render should probe something other than `/`.

### F-007

- **Severity:** LOW
- **Status:** OPEN
- **Location:** `src/lib/jito/jitoClient.ts` `sendBundle`
- **Problem:** `fetch` to every Jito block engine has no timeout and no abort. A hung region stalls that promise until the runtime gives up. `render.yaml` also has no health check path (`railway.json` checks `/`).
- **Proof:** `sendBundle` calls `fetch(\`${url}/api/v1/bundles\`)` with method, headers, and body only. `render.yaml` `startCommand` is `npm run start` and declares no `healthCheckPath`.
- **Fix:** Pass an `AbortSignal.timeout(...)` on each regional POST. Add `healthCheckPath: /` to `render.yaml` if you want the same probe Railway uses.

### F-008

- **Severity:** LOW
- **Status:** OPEN
- **Location:** `next.config.ts`; `src/types/index.ts` `privateKeyEncrypted`; `src/lib/stores/useLaunchStore.ts` `keypairFromWallet`
- **Problem:** Production builds ignore TypeScript and ESLint errors. `privateKeyEncrypted` is decoded as a raw base58 secret key, not ciphertext, and nothing in `src/` assigns it.
- **Proof:** `next.config.ts` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` to true. `keypairFromWallet` is the only reader of `privateKeyEncrypted`. Repo search shows no writers. `npx tsc --noEmit` still exits 0. `next lint` is interactive because there is no ESLint config, so it is not a reliable check.
- **Fix:** Turn `ignoreBuildErrors` off once `tsc` is in CI. Rename or delete `privateKeyEncrypted` until a real encrypted blob exists. Add a non-interactive ESLint config before treating `npm run lint` as a gate.

### F-009

- **Severity:** LOW
- **Status:** OPEN
- **Location:** `src/lib/stores/useLaunchStore.ts` `setConnectedWallet` and `refreshWalletBalances`; `src/app/workspace/page.tsx` renders `lastActionMessage`.
- **Problem:** A failed SOL balance read is pasted into the trade HUD as the raw RPC error string. With no dedicated RPC URL, `https://api.mainnet-beta.solana.com` returned 403 for the fee-vault account during local login.
- **Proof:** After "Migrate my License Key" on local `http://127.0.0.1:3000/login`, `/workspace` showed wallet `Ccwp...y6Qq` and the message `failed to get balance of account CcwpTCpWMtKGo1fqnZuH4Psdj6yugbmSrAPaeTdEy6Qq` with `403 Access forbidden`. `setConnectedWallet` catch calls `set({ lastActionMessage: toMessage(error) })`.
- **Fix:** Map transport failures to a short "RPC unavailable" message. Keep the JSON-RPC body in server logs only. Set `NEXT_PUBLIC_SOLANA_RPC_URL` to a provider you control; do not put a key back in source.

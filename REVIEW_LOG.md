# REVIEW_LOG

## ALERT

Revoke the Helius mainnet RPC key that is in the live JavaScript served by https://scramjet-vrpj.onrender.com. It is in `/_next/static/chunks/997-ed100ebf6b7ef90f.js` inside `https://mainnet.helius-rpc.com/?api-key=` and the matching `wss://` URL. This cycle's `getHealth` returned HTTP 200 and `{"jsonrpc":"2.0","result":"ok","id":1}`. This is not the key removed from source in `143c58c`. Revoke it in the Helius dashboard, then redeploy without putting an API key in any `NEXT_PUBLIC_` URL. This cycle did not print the key, list wallets, sign, or rotate credentials.

## Cycle 2026-11-03 12:08 America/Denver

- Deep lane: red team
- Threat note: Assets are the fee exemption, the fee vault address, signing material, RPC credentials, the public JavaScript bundle, and the live `/api/v1/launch` and `/api/v1/status` routes. Untrusted inputs are JSON bodies, wallet address strings, login and funder fields, and every `NEXT_PUBLIC_` value compiled into the browser. The trust boundary is the browser and those public routes; they are not the Turnkey enclave or a signed wallet. The attacker is an unauthenticated caller or a visitor who can read the bundle. The code assumes a `payerAddress` string is the caller's wallet, that `status: "SUCCESS"` and `BUNDLE_SUBMITTED` mean a bundle was accepted, and that a `NEXT_PUBLIC_` RPC URL does not contain a secret. Those assumptions are not enforced.
- Also checked: open Critical and High items F-001, F-002, and F-003 against `origin/main` (`143c58c`) and the live site. Live chunks scanned for the previous Turnkey literals, the previous Helius URL, and fee-exemption emails. Header set on `/`, `/launch`, `/login`, and `/docs`.
- New findings: F-010 Critical, F-011 Medium, F-012 Medium, F-013 Low
- Status changes: F-001 FIXED. F-002 FIXED for the removed hardcoded key; the new live key is F-010. F-003 remains OPEN. Login no longer selects the fee vault; the header connect button still does. F-004 FIXED. F-006 remains OPEN. The other listed headers are now present; `content-security-policy` is not. F-007 remains OPEN. The Jito fetch now has a timeout; `render.yaml` still has no health check path. F-008 remains OPEN. TypeScript build errors are no longer ignored; ESLint during build and the base58 `privateKeyEncrypted` decode remain. F-005 and F-009 were not re-opened and were not closed.
- UNVERIFIED: Whether Turnkey revoked the API key removed from source. It is not in the current bundle, and this cycle did not call `getWhoami`. Whether Helius revoked the removed key. That key is not in the current bundle, and this cycle did not call `getHealth` with it. The launch route does compute `isExemptFromFees(payerAddress)` for the fee vault string, but every valid POST currently returns 500 before that field is sent, so the exemption is not a visible bypass today.
- Coverage limit: Did not read Pump, Meteora, or Raydium instruction layouts, ghost-funder amounts, or marketplace pricing. Did not run `npm audit`. Did not click Pay Launch Fee, did not send a Jito bundle, and did not call a Turnkey wallet or sign endpoint.

## Cycle 2026-11-03 prior secrets pass

- Deep lane: security. That cycle also skimmed the other lanes. This cycle did not repeat that skim.
- Historical alert, not the current one: that cycle reported a Turnkey API key and a hardcoded Helius key in the then-live bundle, and `getWhoami` and `getHealth` succeeded. This cycle found those literals gone from `origin/main` and from the current chunks. It does not claim those old keys still work.
- Findings opened then: F-001 through F-009.

## Findings

### F-001

- Severity: Critical
- Status: FIXED
- Location: `src/lib/wallets/turnkeyManager.ts` constructor. Previously also the live launch chunk `app/launch/page-871a098f061c150e.js`.
- Problem: The Turnkey organization id, API public key, and API private key were string literals, and the private key was in the public launch bundle.
- Path: launch page imports `LaunchOrchestrator`, which constructs `turnkeyManager` at module load, so the literals were shipped to the browser.
- Proof: Prior cycle: read-only `getWhoami` succeeded, and the private key string was in that launch chunk. Retest this cycle: `origin/main` reads `process.env.TURNKEY_ORGANIZATION_ID`, `process.env.TURNKEY_API_PUBLIC_KEY`, and `process.env.TURNKEY_API_PRIVATE_KEY` with an empty fallback. The old long literals are not in `turnkeyManager.ts`. Scanned live chunks, including `app/launch/page-bf4060f4a353aad0.js`, `app/login/page-0e0b93c30e483548.js`, `app/layout-21d4b41549caae66.js`, and `997-ed100ebf6b7ef90f.js`, contained none of those old literals and no 64-character hex secret.
- Refutation attempted: Searched the current live chunks for the old quoted literals rather than trusting the commit message. The key material is gone from this deploy. Revocation at Turnkey was not re-tested.
- Fix: Already done in source. Revoke the old API key in Turnkey if that has not happened yet.

### F-002

- Severity: Critical
- Status: FIXED
- Location: `src/lib/solana/connection.ts` `resolveSolanaRpcEndpoints`. Previously live chunk `997-17945c2e01828fb4.js`.
- Problem: A Helius mainnet URL with an API key was the default primary RPC when no RPC env var was set, and that key was in the browser bundle.
- Path: client components import the connection module, so the hardcoded URL was compiled into the public chunk.
- Proof: Prior cycle: `getHealth` on that URL returned HTTP 200. Retest this cycle: the hardcoded URL is not in `connection.ts`. Its key is not in the current live chunks (different hash from the key in F-010). The current bundle exposure is F-010, not this literal.
- Refutation attempted: Compared the removed key with every `api-key=` value in the current HTML script graph. No match.
- Fix: Already done for this literal. Treat the new deployed key as F-010.

### F-003

- Severity: High
- Status: OPEN
- Location: `src/components/wallet/WalletButton.tsx` `connectWallet`; `src/app/launch/page.tsx` fee check and `masterPayer`; `src/app/funder/page.tsx` `connectMaster`; `src/lib/feeRouter.ts` `EXEMPT_WALLETS`. Login handlers in `src/app/login/page.tsx` no longer do this.
- Problem: Connect Wallet with no Phantom wallet, and a rejected Phantom connect, still sets the session to the protocol fee vault. That address is fee-exempt, and `/launch` uses it for the displayed fee and as `masterPayer`.
- Path: visitor clicks Connect Wallet with no injected wallet, or the provider rejects connect. `connectWallet` calls `setConnectedWallet` with `CcwpTCpWMtKGo1fqnZuH4Psdj6yugbmSrAPaeTdEy6Qq`. `/launch` calls `isExemptFromFees(connectedWallet)` and, on dispatch, sets `masterPayer` to that same key. `/funder` `connectMaster` accepts any typed public key with no signature, including the vault.
- Proof: `WalletButton.tsx` says `Fallback demo connection with the user's configured vault address` and `falling back to vault`, then `new PublicKey("CcwpTCpWMtKGo1fqnZuH4Psdj6yugbmSrAPaeTdEy6Qq")`. Live chunk `/_next/static/chunks/app/layout-21d4b41549caae66.js` contains `falling back to vault` and that address. Local call: `isExemptFromFees` on that address returned true and `calculateUpfrontLaunchFee(24, vault).totalLaunchFeeSol` returned 0. A random key returned false and 0.27. Login source now uses `PublicKey.unique()`, and live chunk `app/login/page-0e0b93c30e483548.js` does not contain the vault address.
- Refutation attempted: Checked whether the login-page fix covered every setter. It did not. `WalletButton` and `connectMaster` still assign an address the visitor cannot sign. `isExemptFromFees` only compares the base58 string.
- Fix: Never default the session to the fee vault. Require a wallet signature before `setConnectedWallet`. On `/funder`, do not treat a typed public key as the connected signer.

### F-004

- Severity: Medium
- Status: FIXED
- Location: `src/lib/feeRouter.ts`. Previously live chunk `997-17945c2e01828fb4.js`.
- Problem: Personal email addresses and `@scramjet.tools` / `@scramjet.com` suffix matches were compiled into the public fee router.
- Path: `isExemptFromFees` treated those emails as a zero-fee allowlist.
- Proof: Prior cycle: the old chunk contained both email addresses and `scramjet.tools`. Retest this cycle: `EXEMPT_WALLETS` contains only the fee vault. Scanned live chunks `997-ed100ebf6b7ef90f.js`, the layout chunk, the login chunk, and `app/launch/page-bf4060f4a353aad0.js` for `@scramjet.tools` and `@scramjet.com`. Count was 0. `scramjet.tools` remains only as a website string in the launch chunk.
- Refutation attempted: Searched the live script graph for the old email literal. It is absent.
- Fix: Already done in source.

### F-005

- Severity: Medium
- Status: OPEN
- Location: `package-lock.json` (`npm audit`)
- Problem: `npm audit` reported 4 high and 7 moderate issues. High: `bigint-buffer` via `@solana/web3.js` / `@solana/spl-token`, and `postcss` `<=8.5.22` via `next`.
- Path: dependency install, not a request handler traced this cycle.
- Proof: Prior cycle, 2026-11-03 after `npm ci`: 11 vulnerabilities, 4 high, 7 moderate, 0 critical.
- Refutation attempted: Not re-run this cycle.
- Fix: Upgrade `postcss` to a patched 8.x. Track a `@solana/web3.js` release that drops the vulnerable `bigint-buffer` path. Do not run `npm audit fix --force` blindly.

### F-006

- Severity: Low
- Status: OPEN
- Location: https://scramjet-vrpj.onrender.com/ response headers. `next.config.ts` `headers()`.
- Problem: Responses still have no `content-security-policy`. The prior missing `x-powered-by`, HSTS, `x-frame-options`, `x-content-type-options`, and `referrer-policy` gaps are closed on the live site.
- Path: any browser load of an HTML response.
- Proof: Prior cycle: those headers were absent and `x-powered-by: Next.js` was present. Retest this cycle: GET `/` returned 200 with `strict-transport-security: max-age=63072000; includeSubDomains; preload`, `x-frame-options: SAMEORIGIN`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, no `x-powered-by`, and `content-security-policy` null. The same header set was on `/launch`, `/login`, and `/docs`. `next.config.ts` sets `poweredByHeader: false` and does not set a CSP.
- Refutation attempted: Re-fetched the live headers instead of trusting `next.config.ts`. Four headers are present. CSP is still absent, so this stays open.
- Fix: Add a content security policy that matches the scripts and images this app actually loads.

### F-007

- Severity: Low
- Status: OPEN
- Location: `render.yaml`. `src/lib/jito/jitoClient.ts` `sendBundle` now passes a timeout.
- Problem: `render.yaml` still has no `healthCheckPath`. The missing Jito fetch timeout from the prior cycle is present in source and the timeout call is in the live launch chunk.
- Path: Render probe configuration. The fetch path is `sendBundle` to each block engine.
- Proof: `sendBundle` contains `signal: AbortSignal.timeout(8000)`. Live chunk `app/launch/page-bf4060f4a353aad0.js` contains `AbortSignal`. `render.yaml` `startCommand` is `npm run start` and declares no `healthCheckPath`.
- Refutation attempted: Checked the live launch chunk for the timeout symbol rather than assuming the source change was deployed. The health-check half is unchanged.
- Fix: Add `healthCheckPath: /` to `render.yaml` if Render should probe the same path Railway probes.

### F-008

- Severity: Low
- Status: OPEN
- Location: `next.config.ts`; `src/lib/stores/useLaunchStore.ts` `keypairFromWallet`; `src/types/index.ts` `privateKeyEncrypted`.
- Problem: Production builds still ignore ESLint errors. `privateKeyEncrypted` is still decoded as a raw base58 secret key. TypeScript errors are no longer ignored during build.
- Path: a sub-wallet object whose `privateKeyEncrypted` field holds a base58 secret is accepted by `keypairFromWallet` and used as a signer.
- Proof: `next.config.ts` has `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: false`. `keypairFromWallet` still does `bs58.decode(wallet.privateKeyEncrypted)` and `Keypair.fromSecretKey`.
- Refutation attempted: Re-read `next.config.ts` after `143c58c`. The TypeScript flag changed. The ESLint flag and the decode did not.
- Fix: Add a non-interactive ESLint config and stop ignoring it during builds. Stop treating `privateKeyEncrypted` as a raw secret.

### F-009

- Severity: Low
- Status: OPEN
- Location: `src/lib/stores/useLaunchStore.ts` `setConnectedWallet`
- Problem: A failed SOL balance read is still stored as the raw error string in `lastActionMessage`.
- Path: `setConnectedWallet` calls `getSolBalance`, and the catch assigns `toMessage(error)` to `lastActionMessage`.
- Proof: Current source: `lastActionMessage: toMessage(error)` in the `setConnectedWallet` catch. The balance refresh path now swallows the transport error, which does not cover this catch.
- Refutation attempted: Re-read the setter. The raw message is still written. No new browser repro this cycle.
- Fix: Map transport failures to a short "RPC unavailable" message. Keep the provider body in server logs only.

### F-010

- Severity: Critical
- Status: OPEN
- Location: live chunk `/_next/static/chunks/997-ed100ebf6b7ef90f.js` on https://scramjet-vrpj.onrender.com/launch. Source path that inlines it: `src/lib/solana/connection.ts` lines 103-107, imported by `src/components/wallet/WalletButton.tsx`.
- Problem: The deployed client bundle contains a working Helius mainnet RPC API key in a `NEXT_PUBLIC_` URL.
- Path: Render builds with `NEXT_PUBLIC_SOLANA_RPC_URL` or `NEXT_PUBLIC_HELIUS_RPC_URL` set to a Helius URL. `resolveSolanaRpcEndpoints` reads those `NEXT_PUBLIC_` names, and `WalletButton` imports that module, so Next inlines the URL into chunk `997-ed100ebf6b7ef90f.js`. Anyone who loads `/launch` can copy the key and call the RPC.
- Proof: The chunk contains `https://mainnet.helius-rpc.com/?api-key=` and `wss://mainnet.helius-rpc.com/?api-key=` with one 36-character value, repeated three times. `POST` `getHealth` to that HTTPS URL returned HTTP 200 and body `{"jsonrpc":"2.0","result":"ok","id":1}`. The value is not in any file tracked on `origin/main`. Source quote: `readEnv(process.env.NEXT_PUBLIC_SOLANA_RPC_URL)` and `readEnv(process.env.NEXT_PUBLIC_HELIUS_RPC_URL)`. Docs quote in `src/app/docs/page.tsx`: `NEXT_PUBLIC_SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY"`.
- Refutation attempted: Hashed this key against the key removed in `143c58c`. They differ. The docs placeholder in live chunk `app/docs/page-23199d4369558786.js` is 15 characters and `getHealth` returned HTTP 401. Removing the hardcoded default does not stop Next from inlining a `NEXT_PUBLIC_` URL.
- Fix: Revoke this Helius key. Set the RPC URL only in a server-only variable such as `SOLANA_RPC_URL`, and proxy browser reads through a route that does not echo the key. Do not put an API key in `NEXT_PUBLIC_SOLANA_RPC_URL`, `NEXT_PUBLIC_SOLANA_WS_URL`, or `NEXT_PUBLIC_HELIUS_RPC_URL`. Redeploy after the revoke.

### F-011

- Severity: Medium
- Status: OPEN
- Location: `src/app/api/v1/launch/route.ts` `POST`; `src/lib/feeRouter.ts` `calculateUpfrontLaunchFee`
- Problem: Any valid unauthenticated `POST /api/v1/launch` returns HTTP 500 because the fee object contains a bigint, and the handler returns that internal error string to the caller.
- Path: caller sends JSON with `tokenName` and `tokenSymbol`. The handler builds `feeEstimate` via `calculateUpfrontLaunchFee`, which sets `totalLaunchFeeLamports` to a `bigint`. `NextResponse.json` throws `Do not know how to serialize a BigInt`. The catch returns `err.message` with status 500. No token is created and no bundle is sent. A `subWalletCount` object fails earlier inside `BigInt(NaN)` and that message is returned too.
- Proof: Quote from `feeRouter.ts`: `totalLaunchFeeLamports: bigint` and `totalLaunchFeeLamports: BigInt(0)`. Quote from the route: `return NextResponse.json({ status: "SUCCESS", launchConfig: { ... feeEstimate ... }})` and `return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })`. Live `POST https://scramjet-vrpj.onrender.com/api/v1/launch` with `{"tokenName":"ReviewProbe","tokenSymbol":"RP","totalBudgetSol":2,"subWalletCount":4}` returned HTTP 500 and `{"error":"Do not know how to serialize a BigInt"}`. The same body came back for the fee-vault payer, for `totalBudgetSol: 0` with `subWalletCount: 0`, and for negative amounts. `{"tokenName":"ReviewProbe","tokenSymbol":"RP","subWalletCount":{"n":1},"totalBudgetSol":1}` returned HTTP 500 and `{"error":"The number NaN cannot be converted to a BigInt because it is not an integer"}`. `{"tokenSymbol":"RP"}` returned HTTP 400 and `{"error":"Missing required token metadata"}`. A local call of the same `POST` handler returned the same 500 body. Malformed JSON `{` returned HTTP 500 and `{"error":"Expected property name or '}' in JSON at position 1 (line 1 column 2)"}`.
- Refutation attempted: Checked for an auth gate or a schema parser before the fee math. There is no middleware, and the only early return is the missing name check. The UI does not call this route, which limits the blast to direct callers. The `SUCCESS` object in source is not what callers receive.
- Fix: Coerce `totalLaunchFeeLamports` to a string before `NextResponse.json`. Reject non-numeric `subWalletCount` and `totalBudgetSol` with HTTP 400 and a fixed message. Do not return `err.message` for parse failures.

### F-012

- Severity: Medium
- Status: OPEN
- Location: `src/lib/jito/bundleBuilder.ts` `assembleBlock0Bundle`; `src/lib/jito/jitoClient.ts` `sendBundle`; `src/lib/pipeline/launchOrchestrator.ts` `executeLaunch`; `src/app/launch/page.tsx` success card. Live chunk `/_next/static/chunks/app/launch/page-bf4060f4a353aad0.js`.
- Problem: The launch page reports a block-0 bundle as submitted when the transactions have empty signatures, and a failed send is given a local `simulated-bundle-` id.
- Path: the visitor clicks Pay Launch Fee and Dispatch. `executeLaunch` asks `BundleBuilder` for transactions and then `jitoClient.sendBundle`. `assembleBlock0Bundle` constructs `VersionedTransaction` objects and never signs them. If every block engine fails, `sendBundle` sets `bundleId` to `simulated-bundle-` plus the current time. `executeLaunch` still returns `status: "BUNDLE_SUBMITTED"`. The page renders that result as `BLOCK-0 BUNDLE SUBMITTED` and shows the bundle id. Login without Phantom reaches this button with `PublicKey.unique()`, a key the visitor cannot sign.
- Proof: Quote from `bundleBuilder.ts`: `txList.push(new VersionedTransaction(deployMsg))` and `Buffer.from(tx.serialize()).toString("base64")`. Quote from `jitoClient.ts`: `const bundleId = (successfulResult as any)?.bundleId || "simulated-bundle-" + Date.now()`. Quote from `launchOrchestrator.ts`: `status: "BUNDLE_SUBMITTED"`. Quote from `launch/page.tsx`: `BLOCK-0 BUNDLE SUBMITTED`. Local `assembleBlock0Bundle` produced two transactions whose signatures were all zeros. With `fetch` stubbed to HTTP 403, `sendBundle` returned five `FAILED` results and a `simulated-bundle-` id, and no request left the process. The live launch chunk contains `simulated-bundle-`, `BUNDLE_SUBMITTED`, and `BLOCK-0 BUNDLE SUBMITTED`.
- Refutation attempted: Checked whether a non-OK engine response throws. It does not. `sendBundle` throws only when the encoded list length is outside 1 through 5. The success card does not read `blockEngineResults`. This cycle did not submit a bundle to Jito.
- Fix: Have the connected wallet sign before `sendBundle`. If no engine returns a bundle id, return `FAILED` and show that error. Remove the `simulated-bundle-` fallback.

### F-013

- Severity: Low
- Status: OPEN
- Location: `src/app/api/v1/status/route.ts` `GET`. Live URL https://scramjet-vrpj.onrender.com/api/v1/status.
- Problem: The public status route reports the service and every Jito block engine as healthy, with a fixed 99.4% block-zero success rate, without measuring either one.
- Path: any caller GETs `/api/v1/status`. The handler maps `JITO_BLOCK_ENGINE_URLS` to `status: "HEALTHY"` and `latencyMs: Math.floor(8 + Math.random() * 14)`, and returns hardcoded `blockZeroSuccessRate: "99.4%"`.
- Proof: Quote: `status: "OPERATIONAL"`, `blockZeroSuccessRate: "99.4%"`, and `status: "HEALTHY"`. Two live GETs both returned HTTP 200 and `OPERATIONAL`, and every engine was `HEALTHY`. Latencies were `11,16,20,19,20` and then `15,19,13,19,19`. The success rate string did not change. A local call of the handler did not fetch the block engines.
- Refutation attempted: Fetched the route twice to see if the latencies were a cached measurement. They changed, and the handler has no `fetch`. The launch UI does not read this route, so the blast is callers of the status URL.
- Fix: Remove the invented rates, or replace them with a real probe that can return a non-healthy status. Do not use `Math.random` as latency.

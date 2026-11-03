# Cipher Browser Final — account code gate

This fork retains **all native InvisiProxy tabs, back/forward controls, settings, service-worker storage and browser interface**. The Cipher login gate is a new entry point, not a rewritten proxy engine. InvisiProxy is AGPL-3.0-only; preserve notices and comply with AGPL for network deployment.

## Secure integration

- `src/server/cipher-gate.ts` intercepts ordinary HTTP **and** Wisp upgrade requests.
- `/cipher/login` is a Cipher-designed new-tab page giving full Settings directions.
- `/cipher/api/login` verifies the entered code against the separate Supabase Edge Function, with rate limiting; no login code is added to the URL or saved as a JavaScript-readable cookie.
- A signed, Secure, HttpOnly, SameSite=Lax cookie lasts 14 days with Remember checked, or only the browser session if unchecked and is isolated from private/incognito sessions by browser behaviour.
- `/cipher/manage` adds a device/session management entry inside InvisiProxy Settings; `/cipher/api/logout` expires the device session and requests local cookies/site storage deletion.
- A session is revalidated against Supabase at least every 45 seconds; revision changes or emergency shutdown invalidate access.
- This **does not** sync login cookies or third-party accounts across devices. Browser website storage is managed by the local browser, not Cipher Cloud. A browser profile is *not* equivalent to a secure multi-device container.

## Deploy the two parts in order

**Do not push the gated server until both services have been configured; with the gate enabled, the server intentionally fails closed when secrets are missing.**

1. Generate two different random secrets of **at least 40 characters** (`CIPHER_BROWSER_BRIDGE_SECRET`, `CIPHER_BROWSER_SESSION_SECRET`). Never paste them into HTML, a public repo or support messages.
2. In **Supabase → Edge Functions → Secrets**, set `CIPHER_BROWSER_BRIDGE_SECRET`. Deploy the function in `supabase/functions/cipher-browser-code-verify/index.ts` with `verify_jwt=false` (it authenticates service-to-service with its own secret). Supabase provides `SUPABASE_SERVICE_ROLE_KEY` to the Edge Function internally; do not copy it to Render.
3. In **Render → CIPHER BROWSER FINAL → Environment**, set `CIPHER_BROWSER_BRIDGE_SECRET` to the exact same value as Supabase, `CIPHER_BROWSER_SESSION_SECRET` to the other random secret, `CIPHER_BROWSER_VERIFY_URL` to `https://cvnbsgfruntizatfmhah.supabase.co/functions/v1/cipher-browser-code-verify`, and `CIPHER_BROWSER_GATE_ENABLED=true`.
4. Upload the changed source files to `shaunjose92-lgtm/InvisiProxyLTS` on `master` or apply the Patch Only ZIP to the repo and push. Render already has auto-deploy enabled for this repository; verify the Docker build before enabling the browser for users.
5. Upload `Cipher_Browser_Final_With_Code.html` as Cipher's page. After the original consent notice, opening Render normally shows the Browsing Code form **once per remembered regular browser**; a fresh private window shows it again. Browser settings and navigation remain unchanged.
6. Check the real Supabase `cipher_browser_ids.login_code` generation for **strong randomness** (not merely 16 predictable characters), verify a code can sign in, then test a wrong code, an expired/revoked code, private browsing, and the Settings → Cipher device session → Sign out action.

The new `tests/integration/cipher-gate.test.ts` covers simulated credentials, redirects, cookies, tampering and logout. The complete Docker build and live sign-in cannot be verified until the two providers are configured and the code is deployed.

## Limits and cautions

- Code-only login grants access to the stored browsing profile; users must not share codes.
- The proxy's local website cookies and localStorage are scoped to the proxy origin, **not** isolated per Cipher account on a shared browser profile. Signing out clears the origin's site data and can remove browsing progress. Do not promise cross-device cookie persistence.
- The design does **not** bypass Google/Meta/Snapchat authentication restrictions.
- The browser code reset button in the Cipher page is temporarily disabled pending verified website-data deletion and session revocation.
- Do not deploy an open proxy without authenticated gating, usage limits, abuse review, and an emergency shutdown mechanism.

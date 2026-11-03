# Cipher Browser — Instagram & Whatnot compatibility fixes (2026-11-03)

This package includes source-level compatibility and privacy changes, not a bypass of Instagram, Whatnot, or Google security checks.

What changed:
- Stop the optional in-memory HTTP cache from retaining document, iframe, fetch/XHR, credential-bearing, cookie-setting, private/no-store, POST and error responses. A stale login error should never be replayed from this cache.
- Make the domain-blocking service worker opt-in. Ad blocking can block authentication resources; switching it off allows more requests and trackers.
- Fix the settings bug where switching ad blocking did not reload the service worker, leaving the old blocker active until manually reloading.
- Add regression tests for sensitive caching and adblock selection.

Deploy:
- `Cipher_Login_Compatibility_Patch_Current_Live.zip` is for the existing GitHub master source (currently commit cdafbd3fe9d29a2c03bb3b9a679a8324baf3ceda).
- `Cipher_Login_Compatibility_Patch_Branded.zip` is for the previously supplied Cipher-branded source package.
- `Cipher_Browser_Branded_With_Compatibility_Fixes.zip` is a complete replacement for the previously supplied Cipher-branded source package.

GitHub connector returned 403 for commits, so none of these files has been pushed or deployed.
Upload the extracted contents *with directory paths preserved*, commit, and let Render build. Do not upload secrets or `.env` files.
For existing users whose ad-block setting is saved as ON, turn it OFF in Cipher Browser Settings once. The page should now reload so the nonblocking service worker becomes active.

Limitations:
- Instagram may still reject credentials from a proxy/hosted IP or require additional verification. A wrong-password message is not proof of an incorrect password.
- Whatnot's Google OAuth sign-in is subject to Google's prohibition on embedded/manipulable browser environments. No fix here overrides that policy.
- The changes were tested locally with Node 22 `--experimental-strip-types`: 18 focused tests passed. Node syntax checks passed for both edited JS files. A full dependency install, Docker build, and authenticated site tests were not performed.
- Cookie jar and third-party website session handling remain in the underlying Scramjet engine and the user's browser. No credential or session-token collection is added.
- This project uses AGPL-3.0-only; preserve the license and provide corresponding source as required.

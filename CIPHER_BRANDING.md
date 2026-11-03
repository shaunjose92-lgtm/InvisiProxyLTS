# Cipher Browser — branded InvisiProxy-based build

This package uses the existing InvisiProxy LTS application as its browser engine, **with Cipher branding in the UI**. It does not just embed the upstream homepage.

- `src/client/pages/ProxyFrame.tsx`: Cipher toolbar identity while keeping tab, navigation, bookmarks, URL bar, menus and settings control IDs.
- `src/client/pages/Scramjet.tsx`: new tab/start page with Cipher language and design.
- `src/client/components/Settings.tsx`, `Header.tsx`, `Footer.tsx`: updated brand, complete existing settings retained, source attribution.
- `views/assets/css/partials/cipher-brand.css`: Cipher visual design system for browser toolbar, start page, settings, home and mobile.
- `views/assets/img/cipher-mark-*.png`, favicon set: new assets; application metadata updated.
- Existing Browsing Code / secure gate files are preserved from the earlier package.

**Functional limits:** no guarantee of social login; the Browsing Code remembers the Cipher access session, not third-party cookies across devices. Google and social services may still reject an intercepted proxy login.

**Licensing:** Upstream InvisiProxy LTS code is AGPL-3.0. Keep `LICENSE` and original copyright notices, and provide corresponding source for hosted changes as required by AGPL. This build is not an official InvisiProxy release.

**Deployment:** Do not deploy over the active service before configuring and testing the account-code gateway as described in `CIPHER_BROWSER_DEPLOY.md`.

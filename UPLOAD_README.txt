CIPHER BROWSER — ONE-UPLOAD PATCH (2026-11-02)

This ZIP includes ONLY modified or newly added repository files, NOT the whole InvisiProxy project.

1. On GitHub, open shaunjose92-lgtm/InvisiProxyLTS.
2. Choose Add file > Upload files.
3. EXTRACT this ZIP on your computer first.
4. Drag all extracted files and folders (src, views, locales, config.json, etc.) onto GitHub's upload area, keeping the folder paths. Do not upload the ZIP itself as a repository source file.
5. Commit the changes to master. Render auto-deploys this repo.
6. Test the new Cipher Browser gate in a normal browser and a private window.

CONFIGURATION STATUS:
- Supabase Edge Function cipher-browser-code-verify: deployed and ACTIVE.
- Render CIPHER BROWSER FINAL: environment variables configured, existing source redeployed LIVE.
- The new gated code remains NOT LIVE until you upload this patch and Render builds it.
- The raw bridge/session secrets are stored in Render, never in this ZIP.

CAUTIONS:
- Preserve all AGPL-3.0 license and upstream copyright notices.
- A secure sign-in needs a real browser-code verification test after deployment.
- This does not fix Google Sign-In, nor does it sync third-party website cookies between devices.
- Do not assume a shared browser's local cookies/settings are isolated per Cipher account.
- If a build fails after uploading, check Render deploy logs and restore the last working GitHub commit.

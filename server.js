import express from "express";
import http from "node:http";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { server: wisp } = require("@mercuryworkshop/wisp-server-node");
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
const SB = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const ALLOWED = (process.env.CIPHER_ORIGINS || "").split(",").filter(Boolean);
const pub = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const app = express();
app.use(express.json({ limit: "64kb" }));
const sb = (p, o = {}) => fetch(SB + "/rest/v1/" + p, { ...o, headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json", Prefer: "return=minimal", ...(o.headers || {}) } });
const verify = async (body) => (await (await fetch(SB + "/rest/v1/rpc/cipher_browser_verify", { method: "POST", headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) })).json().catch(() => ({ ok: false })));
const sign = (d) => { const b = Buffer.from(JSON.stringify(d)).toString("base64url"); return b + "." + crypto.createHmac("sha256", SECRET).update(b).digest("base64url"); };
const unsign = (t = "") => { const [b, s] = t.split("."); if (!b || !s) return null; const e = crypto.createHmac("sha256", SECRET).update(b).digest("base64url"); if (s.length !== e.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(e))) return null; try { const d = JSON.parse(Buffer.from(b, "base64url")); return d.exp > Date.now() ? d : null; } catch { return null; } };
const cookie = (r) => Object.fromEntries((r.headers.cookie || "").split(/;\s*/).map((c) => c.split("=")));
const tries = new Map();
app.post("/api/login", async (req, res) => {
  const ip = req.ip, n = (tries.get(ip) || 0) + 1; tries.set(ip, n); setTimeout(() => tries.delete(ip), 600000).unref();
  if (n > 20) return res.status(429).json({ ok: false });
  const code = String(req.body?.code || "").trim().toUpperCase();
  const v = await verify({ p_action: "login", p_code: code });
  if (!v.ok) return res.status(401).json({ ok: false, throttled: !!v.throttled });
  const t = sign({ u: v.user_id, r: v.revision, exp: Date.now() + 12 * 3600e3 });
  res.setHeader("Set-Cookie", `cbs=${t}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200`);
  res.json({ ok: true });
});
app.post("/api/logout", (q, r) => { r.setHeader("Set-Cookie", "cbs=; Max-Age=0; Path=/"); r.json({ ok: true }); });
const auth = async (req, res, next) => {
  const d = unsign(cookie(req).cbs); if (!d) return res.status(401).json({ ok: false });
  const v = await verify({ p_action: "check", p_user: d.u, p_revision: d.r });
  if (!v.ok) return res.status(401).json({ ok: false });
  req.uid = d.u; next();
};
const clip = (s, n) => String(s ?? "").slice(0, n);
const T = { searches: ["cipher_browser_searches", "created_at"], history: ["cipher_browser_history", "visited_at"], bookmarks: ["cipher_browser_bookmarks", "created_at"] };
app.get("/api/me", auth, (q, r) => r.json({ ok: true }));
app.get("/api/data/:k", auth, async (req, res) => {
  const t = T[req.params.k]; if (!t) return res.sendStatus(404);
  const r = await sb(`${t[0]}?user_id=eq.${req.uid}&order=${t[1]}.desc&limit=100&select=*`); res.json(await r.json());
});
app.post("/api/data/:k", auth, async (req, res) => {
  const t = T[req.params.k]; if (!t) return res.sendStatus(404);
  const b = req.body || {}; const row = { user_id: req.uid };
  if (req.params.k === "searches") row.query = clip(b.query, 500); else { row.url = clip(b.url, 2048); row.title = clip(b.title, 300); }
  const q = req.params.k === "bookmarks" ? `${t[0]}?on_conflict=user_id,url` : t[0];
  await sb(q, { method: "POST", body: JSON.stringify(row), headers: req.params.k === "bookmarks" ? { Prefer: "resolution=merge-duplicates,return=minimal" } : {} }); res.json({ ok: true });
});
app.delete("/api/data/:k", auth, async (req, res) => {
  const t = T[req.params.k]; if (!t) return res.sendStatus(404);
  await sb(`${t[0]}?user_id=eq.${req.uid}${req.query.id ? "&id=eq." + parseInt(req.query.id) : ""}`, { method: "DELETE" }); res.json({ ok: true });
});
app.get("/api/tabs", auth, async (q, r) => r.json((await (await sb(`cipher_browser_tabs?user_id=eq.${q.uid}&select=tabs`)).json())[0]?.tabs || []));
app.put("/api/tabs", auth, async (req, res) => {
  const tabs = (Array.isArray(req.body?.tabs) ? req.body.tabs : []).slice(0, 30).map((x) => ({ url: clip(x.url, 2048), title: clip(x.title, 300) }));
  await sb("cipher_browser_tabs?on_conflict=user_id", { method: "POST", body: JSON.stringify({ user_id: req.uid, tabs, updated_at: new Date() }), headers: { Prefer: "resolution=merge-duplicates,return=minimal" } }); res.json({ ok: true });
});
app.use((q, r, n) => { r.setHeader("Referrer-Policy", "no-referrer"); r.setHeader("X-Content-Type-Options", "nosniff"); n(); });
app.use("/scram/", express.static(scramjetPath));
app.use("/baremux/", express.static(baremuxPath));
app.use("/libcurl/", express.static(libcurlPath));
app.use(express.static(pub));
const server = http.createServer(app);
server.on("upgrade", (req, sock, head) => req.url.endsWith("/wisp/") ? wisp.routeRequest(req, sock, head) : sock.destroy());
server.listen(process.env.PORT || 10000);

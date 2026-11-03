import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const cookieName = '__Host-cipher_browser_session';
const COOKIE_DAYS = 14;
const SESSION_SECONDS = COOKIE_DAYS * 24 * 3600;
const cookieBase = `${cookieName}=`;
const state = new Map<string, { checked: number; valid: boolean }>();
const attempts = new Map<string, { first: number; count: number }>();

export type BrowserIdentity = { sub: string; rev: number; exp: number; nonce: string };
export type CipherGate = {
  check(req: IncomingMessage): Promise<boolean>;
  serve(req: IncomingMessage, res: ServerResponse, next: () => void): void;
  enabled: boolean;
};

export function createCipherGate(): CipherGate {
  // Fail closed: the access gate is on unless an administrator explicitly opts out.
  const enabled = process.env.CIPHER_BROWSER_GATE_ENABLED !== 'false';
  const secret = process.env.CIPHER_BROWSER_SESSION_SECRET ?? '';
  const verifyUrl = process.env.CIPHER_BROWSER_VERIFY_URL ?? '';
  const bridge = process.env.CIPHER_BROWSER_BRIDGE_SECRET ?? '';
  if (enabled && (secret.length < 40 || bridge.length < 40 || !/^https:\/\/[a-z0-9.-]+\.supabase\.co\/functions\/v1\/cipher-browser-code-verify$/i.test(verifyUrl))) {
    throw new Error('Cipher Browser gate requires a strong SESSION_SECRET and verified Supabase function URL');
  }
  function digest(body: string): string { return createHmac('sha256', secret).update(body).digest('base64url'); }
  function token(identity: Omit<BrowserIdentity, 'nonce'>): string {
    const body = Buffer.from(JSON.stringify({ ...identity, nonce: randomBytes(12).toString('hex') })).toString('base64url');
    return `${body}.${digest(body)}`;
  }
  function decode(req: IncomingMessage): BrowserIdentity | null {
    const raw = String(req.headers.cookie || '').split(';').map(s => s.trim()).find(s=>s.startsWith(cookieBase))?.slice(cookieBase.length);
    if (!raw || raw.length > 1000) return null;
    const [body,mac,...rest] = raw.split('.');
    if (!body || !mac || rest.length || mac.length !== 43) return null;
    const expected = digest(body);
    if (Buffer.byteLength(expected) !== Buffer.byteLength(mac) || !timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return null;
    try {
      const parsed = JSON.parse(Buffer.from(body, 'base64url').toString()) as BrowserIdentity;
      if (!/^[0-9a-f-]{36}$/.test(parsed.sub) || !Number.isSafeInteger(parsed.rev) || !Number.isSafeInteger(parsed.exp) || parsed.exp <= Date.now()/1000) return null;
      return parsed;
    } catch { return null; }
  }
  async function verify(body: object): Promise<any> {
    const answer = await fetch(verifyUrl, {
      method: 'POST', headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + bridge },
      body: JSON.stringify(body), signal: AbortSignal.timeout(8500),
      redirect: 'error', cache: 'no-store'
    });
    if (!answer.ok) return null;
    const result = await answer.json();
    return result?.ok ? result : null;
  }
  async function check(req: IncomingMessage): Promise<boolean> {
    if (!enabled) return true;
    const id = decode(req);
    if (!id) return false;
    const key = `${id.sub}/${id.rev}`;
    const saved = state.get(key);
    if (saved && Date.now() - saved.checked < 45_000) return saved.valid;
    try {
      const response = await verify({ action: 'check', user_id: id.sub, revision: id.rev });
      const valid = !!response;
      state.set(key, { checked: Date.now(), valid });
      return valid;
    } catch { return false; }
  }
  function common(res: ServerResponse) {
    res.setHeader('Cache-Control','private, no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options','nosniff');
  }
  function json(res:ServerResponse, status:number, payload:object) { common(res);res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(payload)); }
  function landing(res: ServerResponse) {
    common(res);
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-O8jDF0YGOQi1Fj75zJ16ALRsgCircyYdrbNVSxaPteM='; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.end(LOGIN_HTML);
  }
  async function readJSON(req: IncomingMessage): Promise<any> {
    let s='';
    for await (const chunk of req) { s += chunk.toString('utf8'); if (s.length > 4096) throw Error('size'); }
    return JSON.parse(s);
  }
  function throttle(ip: string) {
    const now=Date.now();let item=attempts.get(ip);
    if (!item || now - item.first > 15*60*1000) item = {first:now,count:0};
    item.count++;attempts.set(ip,item);
    return item.count <= 8;
  }
  setInterval(()=>{const now=Date.now();for(const [k,v] of attempts)if(now-v.first>16*60*1000)attempts.delete(k);for(const [k,v] of state)if(now-v.checked>60*60*1000)state.delete(k);},15*60*1000).unref();
  async function serveAsync(req: IncomingMessage,res:ServerResponse,next:()=>void) {
    if (!enabled) return next();
    const pathname = new URL(req.url || '/', 'https://cipher.local').pathname;
    if (pathname === '/cipher/login' && req.method === 'GET') {
      if (await check(req)) {res.writeHead(303,{Location:'/'});return res.end();}
      return landing(res);
    }
    if (pathname === '/cipher/api/login' && req.method === 'POST') {
      const ip=req.socket.remoteAddress || 'unknown';
      if (!throttle(ip)) return json(res,429,{ok:false,error:'Too many attempts. Please try again later.'});
      try {
        const body=await readJSON(req);const value=typeof body.code==='string'?body.code.trim():'';
        // Never accept weak or excessive codes. Existing Cipher codes must have >=16 random characters.
        if (!/^[A-Za-z0-9._-]{16,128}$/.test(value)) return json(res,401,{ok:false,error:'Invalid Browsing Code.'});
        const result=await verify({action:'login', code:value});
        if (!result || typeof result.user_id!=='string'||!Number.isSafeInteger(result.revision)) return json(res,401,{ok:false,error:'Browsing Code not recognised.'});
        const remember=body.remember !== false;
        const valueCookie=token({sub:result.user_id,rev:result.revision,exp:Math.floor(Date.now()/1000)+(remember ? SESSION_SECONDS : 24*3600)});
        state.set(`${result.user_id}/${result.revision}`,{checked:Date.now(),valid:true});
        // Browser stores only an opaque signed session; never store or URL-encode the original code.
        res.setHeader('Set-Cookie',`${cookieBase}${valueCookie}; Path=/; Secure; HttpOnly; SameSite=Lax${remember ? '; Max-Age='+SESSION_SECONDS : ''}`);
        return json(res,200,{ok:true});
      } catch {return json(res,503,{ok:false,error:'Sign-in temporarily unavailable.'});}
    }
    if (pathname === '/cipher/manage' && req.method === 'GET') {
      if (!(await check(req))) {res.writeHead(303,{Location:'/cipher/login'});return res.end();}
      common(res);res.setHeader('X-Frame-Options','DENY');
      res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Content-Security-Policy', MANAGE_CSP);res.end(MANAGE_HTML);return;
    }
    if (pathname === '/cipher/api/logout' && req.method === 'POST') {
      res.setHeader('Set-Cookie', `${cookieBase}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`);
      // Prevent the next user of a shared laptop accessing existing proxy website cookies.
      res.setHeader('Clear-Site-Data','"cache", "cookies", "storage"');
      return json(res,200,{ok:true});
    }
    if (pathname === '/cipher/api/status' && req.method === 'GET') return json(res,200,{ok:await check(req)});
    if (!(await check(req))) {
      if (req.method === 'GET' && /text\/html/i.test(String(req.headers.accept||''))) {
        res.writeHead(303,{'Location':'/cipher/login', 'Cache-Control':'no-store'});return res.end();
      }
      return json(res,401,{ok:false,error:'Cipher Browsing Code required.'});
    }
    next();
  }
  return {enabled,check,serve(req,res,next){void serveAsync(req,res,next).catch(()=>{if(!res.headersSent)json(res,503,{ok:false,error:'Browser service unavailable.'});else res.end();});}};
}

const LOGIN_HTML = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>Cipher Browser · Sign in</title>
<style>
:root{--bg:#23211d;--panel:#2a2722;--ink:#ede5d4;--muted:#b8ac9a;--sage:#a4b48a;--border:#554d3e}
*{box-sizing:border-box}html,body{min-height:100%;margin:0}body{display:grid;place-items:center;min-height:100svh;padding:24px;color:var(--ink);background:radial-gradient(70vw 70vw at 15% -10%,#374434,transparent 70%),radial-gradient(60vw 80vh at 100% 120%,#342b22,transparent 72%),var(--bg);font:15px/1.6 Inter,system-ui,sans-serif}
main{width:min(560px,100%);background:linear-gradient(150deg,#2c3028,#20231f);border:1px solid var(--border);border-radius:25px;padding:clamp(24px,5vw,46px);box-shadow:0 30px 80px #0007}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.11em;font-size:12px;color:var(--sage)}.logo{display:grid;place-items:center;width:38px;height:38px;background:var(--sage);color:#253124;border-radius:12px;font-family:Georgia;font-size:27px}
.eyebrow{color:var(--sage);letter-spacing:.12em;text-transform:uppercase;font-weight:700;font-size:11px;margin:34px 0 10px}h1{font:500 clamp(35px,6vw,54px)/1.08 Georgia,'Times New Roman',serif;letter-spacing:-.035em;margin:0 0 16px}h1 em{color:var(--sage)}p{color:var(--muted);margin:0 0 23px}label{font-weight:700;font-size:13px;display:block;margin:14px 0 8px}input{width:100%;height:52px;padding:0 15px;background:#171914;border:1px solid #505b46;border-radius:11px;color:#fff;font:600 15px ui-monospace,monospace;letter-spacing:.025em}input:focus{outline:2px solid var(--sage);outline-offset:2px}.remember{display:flex;align-items:center;gap:9px;font-size:12.5px;font-weight:500;color:var(--muted);margin:15px 0 0}.remember input{width:17px;height:17px;accent-color:var(--sage);flex:none}.remember span{line-height:1.3}
button{font:700 14px Inter,system-ui,sans-serif;cursor:pointer;border:0;border-radius:12px;padding:14px 21px}button[type=submit]{width:100%;color:#20291c;background:var(--sage);margin:17px 0 7px}button:disabled{opacity:.6;cursor:wait}.detail{padding:19px;margin-top:23px;border:1px solid var(--border);border-radius:14px;background:#171a15}.detail strong{display:block;margin-bottom:7px}.detail p{font-size:13px;line-height:1.7;margin:0}.small{font-size:12px;color:#9fa69a;margin:14px 0 0}.error{font-size:13px;color:#ffb9b2;min-height:18px}a{color:var(--sage)}.check{color:var(--sage);font-weight:700}ol{margin:10px 0 0;padding-left:20px;color:var(--muted);font-size:13px}li{padding:3px 0}
</style></head><body><main><div class="brand"><span class="logo">C</span>CIPHER / BROWSER</div><div class="eyebrow">Browser access on this device</div><h1>Welcome <em>back.</em></h1><p>Enter your Cipher Browsing Code to unlock this browser. Your regular Edge or Chrome window will remember this device securely. Private windows ask again.</p><form id="form"><label for="code">Cipher Browsing Code</label><input id="code" type="password" placeholder="Paste the code from Cipher Settings" required autocomplete="off" spellcheck="false" autocapitalize="none" autocorrect="off" minlength="16" maxlength="128"><label class="remember" for="remember"><input type="checkbox" id="remember" checked><span>Remember this browser for 14 days <small>(only on your own device)</small></span></label><button id="submit" type="submit">Continue to Cipher Browser →</button><div class="error" id="error" role="alert" aria-live="polite"></div></form><section class="detail"><strong>Where do I find my code?</strong><ol><li>Open <b>Cipher</b> and sign into your normal account.</li><li>Open <b>Settings</b> (the gear icon or Settings tab on mobile).</li><li>Find the section labelled <b>Cipher Browser</b>.</li><li>Under <b>Cipher Browser Login Code</b>, press <b>Copy</b>.</li><li>Come back to this tab and paste the code above.</li></ol></section><p class="small">This code unlocks the proxy; it does not decrypt or transfer website passwords. Cookies from websites stay in this browser's local profile. Avoid sensitive accounts. On a shared computer, use a private window or sign out and clear site data.</p></main><script>
(()=>{'use strict';const form=document.getElementById('form'),btn=document.getElementById('submit'),err=document.getElementById('error'),field=document.getElementById('code');form.addEventListener('submit',async(e)=>{e.preventDefault();btn.disabled=true;err.textContent='';try{const r=await fetch('/cipher/api/login',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({code:field.value.trim(),remember:document.getElementById('remember').checked})});const j=await r.json();if(!r.ok||!j.ok)throw Error(j.error||'Could not sign in.');field.value='';location.replace('/');}catch(ex){err.textContent=ex.message||'Could not sign in.';btn.disabled=false;}});})();
</script></body></html>`;

const MANAGE_CSP = "default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-mDuMmi4irvqeAHqSwUxjEbkxUo1zv/WJNDDmIh5fYbA='; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'";
const MANAGE_HTML = String.raw`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cipher Browser · Device access</title><style>html,body{margin:0;min-height:100%;background:#23211d;color:#ede5d4;font:15px/1.6 system-ui,sans-serif}body{display:grid;place-items:center;padding:24px}.card{width:min(520px,100%);background:#2f2b25;border:1px solid #554e42;border-radius:22px;padding:30px}h1{font:500 42px/1.2 Georgia,serif}p{color:#b3b8ab}button,a{display:inline-block;font:700 14px system-ui,sans-serif;border-radius:10px;padding:12px 18px}button{background:#d58d83;color:#1f211c;border:0;cursor:pointer}a{color:#a4b48a}.error{color:#ffb4aa;min-height:20px}</style></head><body><main class="card"><small>CIPHER / BROWSER SECURITY</small><h1>Device access</h1><p>Your Cipher Browser remembers a signed session on this browser. To use another account on a shared laptop, sign out first. This will clear local proxy website cookies, settings, open tabs and bookmarks on this device.</p><p><a href="/">← Back to browser</a></p><button id="end" type="button">Sign out and clear this device</button><p id="error" class="error" role="alert"></p></main><script>
(()=>{const b=document.getElementById('end'),e=document.getElementById('error');b.addEventListener('click',async()=>{if(!confirm('Sign out and clear local browser data for this proxy on this device?'))return;b.disabled=true;try{const r=await fetch('/cipher/api/logout',{method:'POST',credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('Could not sign out.');location.replace('/cipher/login');}catch(x){e.textContent=x.message||'Sign-out failed';b.disabled=false;}})})();
</script></body></html>`;

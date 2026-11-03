// @ts-nocheck — integration harness uses mocked fetch and runtime globals.
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { createCipherGate } from '../../src/server/cipher-gate.ts';
process.env.CIPHER_BROWSER_GATE_ENABLED='true';
process.env.CIPHER_BROWSER_SESSION_SECRET='this-is-a-valid-testing-secret-that-is-very-long-and-random';
process.env.CIPHER_BROWSER_BRIDGE_SECRET='another-long-test-shared-secret-never-use-in-production';
process.env.CIPHER_BROWSER_VERIFY_URL='https://cvnbsgfruntizatfmhah.supabase.co/functions/v1/cipher-browser-code-verify';
let calls=0,allowed=true;
const original=globalThis.fetch;
globalThis.fetch=async(url,opts)=>{
 if(!String(url).startsWith('https://cvnbsgfruntizatfmhah.supabase.co/functions/v1/')) return original(url,opts);
 calls++; const data=JSON.parse(opts.body);
 assert.equal(opts.headers.Authorization,'Bearer '+process.env.CIPHER_BROWSER_BRIDGE_SECRET);
 const result = data.action==='login' ? {ok:true,user_id:'11111111-1111-4111-8111-111111111111',revision:3} : allowed ? {ok:true}:{ok:false};
 return new Response(JSON.stringify(result),{status:data.action==='check'&&!allowed?401:200,headers:{'content-type':'application/json'}});
};
const gate=createCipherGate();
const server=createServer((req,res)=>gate.serve(req,res,()=>{res.writeHead(200,{'Content-Type':'text/plain'});res.end('PROXY_ACCESS_GRANTED')}));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
try {
 let r=await original(base+'/',{headers:{Accept:'text/html'},redirect:'manual'});
 assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/cipher/login');
 r=await original(base+'/cipher/login');assert.equal(r.status,200);let html=await r.text();assert.match(html,/Where do I find my code/);
 r=await original(base+'/cipher/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:'short'})});assert.equal(r.status,401);
 r=await original(base+'/cipher/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:'ABCD1234EFGH5678IJKL9012'})});assert.equal(r.status,200);
 const rawCookie=r.headers.get('set-cookie');assert.match(rawCookie,/HttpOnly/);assert.match(rawCookie,/SameSite=Lax/);assert.match(rawCookie,/Secure/);assert.doesNotMatch(rawCookie,/ABCD1234/);
 const cookie=rawCookie.split(';')[0];
 r=await original(base+'/',{headers:{Cookie:cookie}});assert.equal(r.status,200);assert.equal(await r.text(),'PROXY_ACCESS_GRANTED');
 r=await original(base+'/',{headers:{Cookie:cookie+'.tampered'}});assert.equal(r.status,401);
 r=await original(base+'/',{headers:{}});assert.equal(r.status,401);
 r=await original(base+'/cipher/api/status',{headers:{Cookie:cookie}}); assert.deepEqual(await r.json(),{ok:true});
 r=await original(base+'/cipher/api/logout',{method:'POST',headers:{Cookie:cookie}});assert.equal(r.status,200);assert.match(r.headers.get('clear-site-data'),/storage/);
 console.log('PASS: 10 checks, login/remembered cookie/private-window distinction/logout/session tampering');
} finally {server.closeAllConnections();await new Promise(r=>server.close(r));globalThis.fetch=original;}

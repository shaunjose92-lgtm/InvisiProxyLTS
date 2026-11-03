// Cipher Browser code verification. Runs only in Supabase Edge Functions.
// Service-role never leaves this Supabase Edge Function.
// The Render bearer is verified against a SHA256 digest of a high-entropy secret.
// The raw secret is held ONLY in Render's environment variables, not in this public file.
const url = Deno.env.get('SUPABASE_URL') || '';
const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const bridgeDigest = '75e9f9f11a1fb1dccd2c905bcb2b3ed20039b92f9ff0a64d2dd034c606f394c8';
const failure = new Map<string, {at:number,n:number}>();

function result(status:number, body:object) {
 return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff'}});
}
const codePattern = /^[A-Za-z0-9._-]{16,128}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function query(path:string) {
 const res=await fetch(`${url}/rest/v1/${path}`,{method:'GET',headers:{apikey:service,authorization:'Bearer '+service,accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(6000)});
 if(!res.ok)throw Error('Supabase query failed');return res.json();
}
// Direct callers get no access. All access comes through Render via a shared secret.
Deno.serve(async (req) => {
 if(req.method!=='POST')return result(405,{ok:false});
 if(!url||!service)return result(503,{ok:false});
 const presented=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
 if(presented.length < 40 || presented.length > 256 || !/^[A-Za-z0-9_-]+$/.test(presented))return result(403,{ok:false});
 const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(presented));
 const hashed = [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2,'0')).join('');
 let diff = 0;
 for(let i=0;i<hashed.length;i++)diff |= hashed.charCodeAt(i) ^ bridgeDigest.charCodeAt(i);
 if(diff !== 0)return result(403,{ok:false});
 const id=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,100);
 const now=Date.now();let window=failure.get(id);
 if(!window || now-window.at>15*60*1000)window={at:now,n:0};
 window.n++;failure.set(id,window);
 if(window.n>40)return result(429,{ok:false});
 try {
   const text=await req.text(); if(text.length>2048)return result(413,{ok:false});
   const data=JSON.parse(text);
   const control=await query('cipher_security_control?select=kill_switch&id=eq.1');
   if(control?.[0]?.kill_switch !== false)return result(403,{ok:false});
   if(data.action==='login') {
     const code=typeof data.code==='string'?data.code.trim():'';
     if(!codePattern.test(code))return result(401,{ok:false});
     // Only project-owner backend can call this function; browser never gets service credentials.
     const params = new URLSearchParams({select:'user_id,profile_revision,deletion_pending', login_code:`eq.${code}`});
     const rows=await query('cipher_browser_ids?'+params.toString());
     if(rows?.length!==1 || rows[0].deletion_pending)return result(401,{ok:false});
     return result(200,{ok:true,user_id:rows[0].user_id,revision:Number(rows[0].profile_revision)});
   }
   if(data.action==='check') {
     if(!uuidPattern.test(data.user_id||'') || !Number.isSafeInteger(data.revision))return result(401,{ok:false});
     const params = new URLSearchParams({select:'profile_revision,deletion_pending', user_id:'eq.'+data.user_id});
     const rows=await query('cipher_browser_ids?'+params.toString());
     if(rows?.length!==1 || rows[0].deletion_pending || Number(rows[0].profile_revision)!==data.revision)return result(401,{ok:false});
     return result(200,{ok:true});
   }
   return result(400,{ok:false});
 } catch {return result(503,{ok:false});}
});

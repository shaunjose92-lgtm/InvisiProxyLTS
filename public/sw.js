importScripts('/controller/controller.sw.js');
const ADS = /(doubleclick\.net|googlesyndication\.com|googleadservices\.com|adsafeprotected\.com|sharethrough\.com|adnxs\.com|pubmatic\.com|rubiconproject\.com|criteo\.(com|net)|amazon-adsystem\.com|moatads\.com|doubleverify\.com|openx\.net|casalemedia\.com|taboola\.com|outbrain\.com|adtrafficquality\.google|smartadserver\.com|omnitagjs\.com|quantserve\.com|quantcount\.com|flashtalking\.com|ad-score\.com|applovin\.com)/i;
function blocked(url) {
  try {
    const u = new URL(url);
    if (!u.pathname.startsWith('/scramjet/')) return false;
    return ADS.test(decodeURIComponent(u.pathname.split('/').slice(4).join('/')).split('/')[2] || '');
  } catch { return false; }
}
async function route(event) {
  const response = await $scramjetController.route(event);
  if (['document', 'iframe', 'worker', 'sharedworker', 'script', 'style'].includes(event.request.destination)) {
    const headers = new Headers(response.headers);
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  return response;
}
self.addEventListener('fetch', event => {
  if (blocked(event.request.url)) {
    const d = event.request.destination;
    event.respondWith(new Response(d === 'script' ? '' : null, { status: d === 'script' ? 200 : 204, headers: { 'Content-Type': d === 'script' ? 'application/javascript' : 'text/plain', 'Cross-Origin-Resource-Policy': 'cross-origin' } }));
    return;
  }
  if ($scramjetController.shouldRoute(event)) event.respondWith(route(event));
});
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

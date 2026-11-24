importScripts("/scram/scramjet.all.js");
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();
self.addEventListener("fetch", (e) => { e.respondWith((async () => { await scramjet.loadConfig(); return scramjet.route(e) ? scramjet.fetch(e) : fetch(e.request); })()); });

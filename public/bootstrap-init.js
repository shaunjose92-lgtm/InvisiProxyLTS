(() => {
  'use strict';
  window.$scramjetUtils = window.$scramjetUtils || { UrlWatcherPlugin: class { constructor(cb) { this.cb = cb; this.__url = 1; } } };
  addEventListener('DOMContentLoaded', () => {
    try { ENG[0] = 'https://www.mojeek.com/search?q='; ENG[1] = 'https://www.bing.com/search?q='; } catch (e) {}
    document.querySelectorAll('.tile').forEach(t => { if (/duckduckgo|bing/i.test(t.dataset.u || '')) { t.dataset.u = 'https://www.mojeek.com'; t.textContent = 'Mojeek'; } });
  });
  const load = s => new Promise((res, rej) => { const e = document.createElement('script'); e.src = s; e.onload = res; e.onerror = () => rej(new Error('Failed to load ' + s)); document.head.append(e); });
  async function sw() {
    if (!navigator.serviceWorker) throw new Error('This browser needs HTTPS and service-worker support.');
    const reg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
    const w = reg.installing || reg.waiting;
    if (w && w.state !== 'activated') await new Promise(r => { const t = setTimeout(r, 8000); w.addEventListener('statechange', () => { if (w.state === 'activated' || w.state === 'redundant') { clearTimeout(t); r(); } }); });
    await new Promise(res => {
      const t = setTimeout(res, 4000);
      const ok = () => { if (navigator.serviceWorker.controller) { clearTimeout(t); res(); } };
      navigator.serviceWorker.addEventListener('controllerchange', ok); ok();
    });
    const worker = navigator.serviceWorker.controller || reg.active || (await navigator.serviceWorker.ready).active;
    if (!worker) {
      let done = 0; try { done = sessionStorage.getItem('cbsw'); } catch (_) {}
      if (!done) { try { sessionStorage.setItem('cbsw', '1'); } catch (_) {} location.reload(); await new Promise(() => {}); }
      throw new Error('Service worker did not start. Clear this site\u2019s data and reload.');
    }
    try { sessionStorage.removeItem('cbsw'); } catch (_) {}
    return worker;
  }
  window.initBootstrap = async function () {
    await load('/scram/scramjet.js');
    await load('/controller/controller.api.js');
    const worker = await sw();
    const { default: LibcurlClient } = await import('/libcurl/index.mjs');
    const wisp = (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/wisp/';
    const transport = new LibcurlClient({ wisp });
    await transport.init();
    const c = new $scramjetController.Controller({
      serviceworker: worker,
      transport,
      config: { prefix: '/scramjet/', scramjetPath: '/scram/scramjet.js', wasmPath: '/scram/scramjet.wasm' }
    });
    await c.wait();
    return {
      createFrame(fe, o) {
        const fr = c.createFrame(fe);
        if (fr.element && fr.element !== fe) console.warn('createFrame ignored the supplied iframe');
        for (const p of (o && o.plugins) || []) {
          if (p && p.__url) { try { $scramjet.Tap.tap(fr.hooks.init.post, ev => { if (!ev.isTopLevel) return; try { p.cb(ev.client.url.href); } catch (_) {} }); } catch (e) { console.warn('url hook', e); } }
        }
        return fr;
      }
    };
  };
})();

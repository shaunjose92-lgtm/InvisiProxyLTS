// Keep the privacy choice explicit: the ad-blocking service worker is opt-in.
// The generic blocklist can also block first-party login dependencies.
export function serviceWorkerForAdBlocking(enabled: unknown): string {
  return enabled === true ? '/sw-blacklist.js' : '/sw.js';
}

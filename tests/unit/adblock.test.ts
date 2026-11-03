import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { serviceWorkerForAdBlocking } from '../../src/browser/adblock.ts';

describe('Browser ad blocker compatibility', () => {
  test('The general service worker is the default to avoid breaking login dependencies.', () => {
    for (const setting of [undefined, null, false, 'false', 'true', 1])
      assert.equal(serviceWorkerForAdBlocking(setting), '/sw.js');
  });

  test('Explicit enablement uses the ad-blocking service worker.', () => {
    assert.equal(serviceWorkerForAdBlocking(true), '/sw-blacklist.js');
  });
});

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { skipHttpCache } from '../../src/browser/http-cache.ts';

const length = (bytes: number): [string, string][] => [
	['Content-Length', String(bytes)],
];

describe('HTTP cache guard', () => {
	test('Media and ranged responses bypass the cache.', () => {
		assert.equal(skipHttpCache('video', [], length(100)), true);
		assert.equal(skipHttpCache('audio', [], []), true);
		assert.equal(
			skipHttpCache('', [['range', 'bytes=0-']], length(100)),
			true
		);
		for (const type of [
			'video/mp4',
			'audio/mpeg',
			'application/vnd.apple.mpegurl',
			'video/MP2T',
			'application/octet-stream',
		])
			assert.equal(
				skipHttpCache('script', [], [['content-type', type]]),
				true,
				type
			);
	});

  test('Authentication and private responses must never enter the proxy HTTP cache.', () => {
    const authHeaders: [string, string][] = [['Authorization', 'Bearer test-token']];
    const sessionHeaders: [string, string][] = [['Set-Cookie', 'session=example; Secure; HttpOnly']];
    const small = length(320);
    assert.equal(skipHttpCache('', [], small), true, 'fetch/XHR responses can contain user data');
    assert.equal(skipHttpCache('document', [], small), true, 'HTML documents may carry CSRF tokens');
    assert.equal(skipHttpCache('iframe', [], small), true);
    assert.equal(skipHttpCache('script', authHeaders, small), true);
    assert.equal(skipHttpCache('style', [], sessionHeaders), true);
    assert.equal(skipHttpCache('image', [], [['Cache-Control', 'private, max-age=60']]), true);
    assert.equal(skipHttpCache('script', [], [['Cache-Control', 'no-store']]), true);
    assert.equal(skipHttpCache('script', [], [['Vary', 'Accept-Encoding, Cookie']]), true);
    assert.equal(skipHttpCache('script', [], small, {method: 'POST', status: 200}), true);
    assert.equal(skipHttpCache('script', [], small, {method: 'GET', status: 401}), true);
    assert.equal(skipHttpCache('script', [], small, {method: 'GET', status: 403}), true);
    assert.equal(skipHttpCache('script', [], small, {method: 'GET', status: 200}), false);
  });

	test('Large or unsized fetch bodies bypass the cache, page assets do not.', () => {
		assert.equal(skipHttpCache('', [], length(1024)), true);
		assert.equal(skipHttpCache('', [], length(512 * 1024)), true);
		assert.equal(skipHttpCache('', [], []), true);
		assert.equal(skipHttpCache('script', [], length(1024 * 1024)), false);
		assert.equal(skipHttpCache('script', [], []), false);
		assert.equal(skipHttpCache('image', [], length(8 * 1024 * 1024)), true);
	});
});

// Scramjet's HttpCachePlugin reads every cacheable body fully into memory
// before storing it, so streamed video (whole MP4s, HLS segments) piles up in
// the tab until it crashes. Responses matching these rules bypass that cache.
const mediaDestinations = ['audio', 'video'];
const mediaType = /^(?:audio|video)\/|mpegurl|mp2t|dash\+xml|octet-stream/i;
const maxCachedBytes = 2 * 1024 * 1024;
// Players pull segments through fetch/XHR, often disguised as images.
const maxFetchedBytes = 256 * 1024;

export type RawHeaders = Iterable<[string, string]>;

function header(headers: RawHeaders, name: string): string | null {
	for (const [key, value] of headers)
		if (key.toLowerCase() === name) return value;
	return null;
}

export interface CacheResponseMeta {
  method?: string;
  status?: number;
}

// Do not let a generic HTTP cache reuse sign-in responses or website state.
// These requests change in response to cookies, CSRF tokens and user sessions.
// This is compatibility and privacy hardening, not an attempt to bypass a
// website's identity checks or its decision to reject a login.
export function skipHttpCache(
  destination: string,
  requestHeaders: RawHeaders,
  responseHeaders: RawHeaders,
  meta: CacheResponseMeta = {}
): boolean {
  if (meta.method && !['GET', 'HEAD'].includes(meta.method.toUpperCase())) return true;
  if (meta.status !== undefined && meta.status !== 200) return true;
  if (['', 'document', 'iframe', 'fetch', 'xhr'].includes(destination)) return true;
  if (header(requestHeaders, 'authorization') !== null || header(requestHeaders, 'cookie') !== null) return true;
  if (header(responseHeaders, 'set-cookie') !== null) return true;
  const cacheControl = header(responseHeaders, 'cache-control') ?? '';
  if (/(?:^|,)\s*(?:private|no-cache|no-store)(?:\s*(?:,|$|=))/i.test(cacheControl)) return true;
  if (/(?:^|,)\s*(?:cookie|authorization|\*)(?:\s*(?:,|$))/i.test(header(responseHeaders, 'vary') ?? '')) return true;
	if (mediaDestinations.includes(destination)) return true;
	if (header(requestHeaders, 'range') !== null) return true;
	if (mediaType.test(header(responseHeaders, 'content-type') ?? ''))
		return true;
	const length = Number.parseInt(
		header(responseHeaders, 'content-length') ?? '',
		10
	);
	const fetched = destination === '';
	if (!Number.isFinite(length)) return fetched;
	return length > (fetched ? maxFetchedBytes : maxCachedBytes);
}

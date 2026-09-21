/**
 * Canonical host + HTTPS enforcement for bwax.me.
 *
 * Google Search Console reported "Duplicate without user-selected canonical"
 * because the apex, www, and http variants all returned 200 with identical
 * content. Collapse every alternate onto the single canonical URL with a 301
 * so no duplicate remains, and echo the canonical as a Link header for crawlers
 * that read HTTP headers before the document.
 */
const CANONICAL_HOST = 'bwax.me';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

const WWW_HOST = `www.${CANONICAL_HOST}`;

const INDEX_PATHS = new Set(['/index.html', '/index.htm', '/index']);

interface Env {
  ASSETS: Fetcher;
}

function redirectToCanonical(pathname: string, search: string): Response {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new Response(null, {
    status: 301,
    headers: {
      Location: `${CANONICAL_ORIGIN}${path}${search}`,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // Only touch the published hosts so local dev and preview hosts keep working.
    const isPublishedHost = host === CANONICAL_HOST || host === WWW_HOST;

    // http -> https and www -> apex, preserving path and query string.
    if (isPublishedHost && (url.protocol === 'http:' || host === WWW_HOST)) {
      return redirectToCanonical(url.pathname || '/', url.search);
    }

    // /index.html and friends are alternates of the canonical home page.
    if (isPublishedHost && INDEX_PATHS.has(url.pathname.toLowerCase())) {
      return redirectToCanonical('/', url.search);
    }

    const response = await env.ASSETS.fetch(request);

    const contentType = response.headers.get('content-type') ?? '';
    if (response.status !== 200 || !contentType.includes('text/html')) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('Link', `<${CANONICAL_ORIGIN}${url.pathname}>; rel="canonical"`);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;

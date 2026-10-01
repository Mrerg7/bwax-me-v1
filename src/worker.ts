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

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://customer-wa9cpywo3l4jte5c.cloudflarestream.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "frame-src https://customer-wa9cpywo3l4jte5c.cloudflarestream.com",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
    "frame-ancestors 'none'",
  ].join('; '),
};

const CACHE_HEADERS = {
  'text/html': 'public, max-age=0, must-revalidate',
  'text/css': 'public, max-age=31536000, immutable',
  'application/javascript': 'public, max-age=31536000, immutable',
  'image/svg+xml': 'public, max-age=31536000, immutable',
  'image/png': 'public, max-age=31536000, immutable',
  'image/webp': 'public, max-age=31536000, immutable',
  'font/woff2': 'public, max-age=31536000, immutable',
  'default': 'public, max-age=86400',
};

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
      ...SECURITY_HEADERS,
    },
  });
}

function applyHeaders(response: Response, contentType: string): Response {
  const headers = new Headers(response.headers);
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => headers.set(key, value));
  const cacheControl = CACHE_HEADERS[contentType as keyof typeof CACHE_HEADERS] || CACHE_HEADERS.default;
  headers.set('Cache-Control', cacheControl);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

    // Directory URLs served without a trailing slash would only get the asset
    // layer's temporary redirect; answer with a permanent one so crawlers
    // consolidate onto the single canonical form instead of keeping both.
    if (isPublishedHost && !url.pathname.endsWith('/') && !url.pathname.includes('.')) {
      const directoryRequest = new Request(`${CANONICAL_ORIGIN}${url.pathname}/${url.search}`);
      const directoryResponse = await env.ASSETS.fetch(directoryRequest);
      if (directoryResponse.status === 200) {
        return redirectToCanonical(`${url.pathname}/`, url.search);
      }
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') ?? '';

    // Apply security and cache headers to all responses
    let finalResponse = applyHeaders(response, contentType.split(';')[0].trim());

    // Add canonical Link header for HTML pages
    if (response.status === 200 && contentType.includes('text/html')) {
      const headers = new Headers(finalResponse.headers);
      headers.set('Link', `<${CANONICAL_ORIGIN}${url.pathname}>; rel="canonical"`);
      finalResponse = new Response(finalResponse.body, {
        status: finalResponse.status,
        statusText: finalResponse.statusText,
        headers,
      });
    }

    return finalResponse;
  },
} satisfies ExportedHandler<Env>;

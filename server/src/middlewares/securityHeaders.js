/**
 * Security headers middleware — applied to every response.
 *
 * Headers set:
 *  - X-Content-Type-Options: nosniff
 *    Prevents MIME-type sniffing; the browser respects Content-Type.
 *  - X-Frame-Options: DENY
 *    Stops the site from being embedded in an <iframe> (clickjacking defence).
 *  - X-XSS-Protection: 1; mode=block
 *    Legacy IE/Chrome XSS filter — still useful for older browsers.
 *  - Referrer-Policy: strict-origin-when-cross-origin
 *    Controls how much referrer info is sent on cross-origin requests.
 *  - Permissions-Policy: camera=(), microphone=(), geolocation=()
 *    Disables browser features the site does not need.
 *  - Strict-Transport-Security (HSTS): max-age=1y; includeSubDomains; preload
 *    Forces HTTPS. Preload is submitted to hstspreload.org for browser
 *    hardcoded lists. Only activated when NODE_ENV=production.
 *  - Content-Security-Policy (CSP): carefully tuned for a React SPA.
 *    'unsafe-inline' for styles is required because Tailwind CSS v3 emits
 *    inline style attributes on elements. It is safe here because we do not
 *    accept user-supplied HTML that would combine with inline JS — React
 *    escapes all values by design.
 *
 *  ⚠️  When adding new third-party scripts (analytics, chat widgets, etc.)
 *  always update the `script-src` and `connect-src` directives to avoid
 *  CSP violations being silently blocked.
 */
const securityHeaders = (req, res, next) => {
  // HSTS — only for production to avoid localhost / staging issues
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content-Security-Policy — tuned for React SPA + Google Fonts + uploads CDN
  const siteUrl = process.env.CLIENT_URL || 'https://tungviet.fun';
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-eval'`,
    // React development needs 'unsafe-eval'; remove it in pure production builds
    // if you have already switched to a bundler that inlines the JS (Vite does).
    // For Vite-built production bundles you can safely change this to:
    // `script-src 'self'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    // 'unsafe-inline' is required for Tailwind CSS v3 inline styles.
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https://tungviet.fun blob:`,
    `connect-src 'self' https://tungviet.fun`,
    `media-src 'self'`,
    `object-src 'none'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  next();
};

export default securityHeaders;

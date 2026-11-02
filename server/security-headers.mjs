export const applicationCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
  "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "frame-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');
export const commonSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Opener-Policy': 'same-origin',
};
export function setSecurityHeaders(res, { api = false, development = false, https = false } = {}) {
  for (const [name, value] of Object.entries(commonSecurityHeaders)) res.setHeader(name, value);
  if (!development)
    res.setHeader(
      'Content-Security-Policy',
      api ? "default-src 'none'; frame-ancestors 'none'; base-uri 'none'" : applicationCsp
    );
  if (https) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
}

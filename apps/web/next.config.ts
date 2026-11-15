import type { NextConfig } from 'next';

const apiProxyTarget = process.env.API_PROXY_TARGET;

if (!apiProxyTarget) {
  throw new Error(
    'API_PROXY_TARGET is not defined. Copy apps/web/.env.example to apps/web/.env.local.',
  );
}

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/**
 * The browser only talks to this origin: /api is proxied to the NestJS API, so the auth
 * cookies are first-party, SameSite=Lax works and no CORS is needed in production.
 */
const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image only: building it needs symlinks,
  // which Windows does not allow without developer mode.
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  poweredByHeader: false,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiProxyTarget}/api/:path*` }];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

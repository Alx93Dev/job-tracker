import type { NextConfig } from 'next';

const apiProxyTarget = process.env.API_PROXY_TARGET;

if (!apiProxyTarget) {
  throw new Error(
    'API_PROXY_TARGET is not defined. Copy apps/web/.env.example to apps/web/.env.local.',
  );
}

/**
 * The browser only talks to this origin: /api is proxied to the NestJS API, so the auth
 * cookies are first-party, SameSite=Lax works and no CORS is needed in production.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiProxyTarget}/api/:path*` }];
  },
};

export default nextConfig;

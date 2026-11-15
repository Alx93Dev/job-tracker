import type { MetadataRoute } from 'next';
import { ROUTES } from '@/lib/routes';

/** Only the public pages are worth indexing; everything else requires a session. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: [ROUTES.login, ROUTES.register], disallow: '/' },
  };
}

import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { buildSecurityHeaders } from './lib/security-headers';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: buildSecurityHeaders({ development: process.env.NODE_ENV !== 'production' }),
      },
    ];
  },
};

export default withNextIntl(nextConfig);

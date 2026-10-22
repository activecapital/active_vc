/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bunny.net',
        port: '',
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "font-src 'self' https: data:",
          "img-src 'self' data: https://cdn.bunny.net",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://stats.g.doubleclick.net",
          "script-src-elem 'self' https://www.googletagmanager.com",
          "connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://analytics.vercel.com https://speed-insights.vercel.com",
          "frame-src 'self' https://www.googletagmanager.com",
        ].join('; '),
      },
    ]
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/:path*',
        // Custom preview domains do not receive Vercel's automatic noindex header.
        // Keep staging excluded even if it is assigned a production deployment.
        has: process.env.VERCEL_ENV === 'production'
          ? [{ type: 'host', value: 'staging\\.active\\.vc' }]
          : [],
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
};

export default nextConfig;

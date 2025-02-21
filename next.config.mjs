/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bunny.net',
        port: '',
      },
    ],
  },
};

export default nextConfig;

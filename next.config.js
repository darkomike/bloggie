/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'iiogqwy4rbrtgwpl.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.firebasestorage.com',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;

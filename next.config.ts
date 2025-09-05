/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'easy-intership.ru', 
      },
    ],
  },
};

export default nextConfig;
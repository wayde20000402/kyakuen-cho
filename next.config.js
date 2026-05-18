/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ["*"] } },
  images: { domains: ["lh3.googleusercontent.com"] },
};
module.exports = nextConfig;

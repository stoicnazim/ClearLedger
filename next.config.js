/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  outputFileTracingRoot: __dirname,
};
module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, //fetch data 2 times
  env: {
    STRAPI_URL: process.env.STRAPI_URL || "http://localhost:1337",
  },
};

export default nextConfig;

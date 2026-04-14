/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // snowflake-sdk uses native Node.js modules — keep it out of the bundle
      config.externals = [...(config.externals ?? []), 'snowflake-sdk'];
    }
    return config;
  },
};

export default nextConfig;

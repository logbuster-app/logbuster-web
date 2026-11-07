import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Posters da OMDb são servidos pelo CDN da Amazon (IMDb).
    remotePatterns: [{ protocol: "https", hostname: "m.media-amazon.com" }],
  },
};

export default nextConfig;

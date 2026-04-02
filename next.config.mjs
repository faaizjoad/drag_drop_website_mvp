/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from any HTTPS source (user-uploaded content via S3/R2)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Cache-Control headers for published site pages
  async headers() {
    return [
      {
        source: "/sites/:slug/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

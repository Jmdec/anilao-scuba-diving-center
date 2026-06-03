import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {},
  async rewrites() {
    const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  workboxOptions: {
    disableDevLogs: true,
  },
  // disable: process.env.NODE_ENV === "development",
})(nextConfig);

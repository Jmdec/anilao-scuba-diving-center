import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  workboxOptions: {
    disableDevLogs: true,
  },
  // disable: process.env.NODE_ENV === "development", // Uncomment to disable PWA in development
})(nextConfig);

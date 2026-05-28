import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {},
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    domains: ["localhost"],
  },
};

export default nextConfig;
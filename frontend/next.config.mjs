/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bật chế độ Standalone Build để giảm tối đa kích thước Docker image và RAM (~50-80MB)
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Tối ưu hóa nén và giảm kích thước bundle
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;


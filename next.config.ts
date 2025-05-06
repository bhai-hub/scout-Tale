
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Added Cloudinary hostname
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude problematic modules from client-side bundle
    // These are often optional dependencies of mongodb or related packages
    // that use Node.js specific APIs like 'child_process'.
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        // Add modules that cause issues here
        // 'mongodb-client-encryption' is a common one if client-side encryption features are (even indirectly) pulled.
        // 'aws4' can be another if AWS SDK parts are pulled.
        // 'kerberos', 'snappy', '@mongodb-js/zstd' are other optional deps of mongodb.
        // You might need to add more based on specific errors.
        // We specifically target `child_process` via `mongodb-client-encryption` if it's the direct cause.
        // However, marking the higher-level optional dependency as external is usually safer.
        (context: any, request: any, callback: any) => {
          if (
            request.startsWith('mongodb-client-encryption') ||
            request.startsWith('aws4') ||
            request.startsWith('kerberos') ||
            request.startsWith('snappy') ||
            request.startsWith('@mongodb-js/zstd') ||
            request.startsWith('child_process') // Explicitly added child_process here
            // Add 'child_process' here if the above don't resolve it,
            // but it's better to handle it via the parent lib.
            // Forcing 'child_process' to be external might hide other issues.
            // request.startsWith('child_process')
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
  serverActions: {
    bodySizeLimit: '5mb', // Increase body size limit for Server Actions to 5MB
  },
};

export default nextConfig;

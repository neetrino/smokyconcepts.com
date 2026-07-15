/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

function loadRootEnv() {
  const root = path.resolve(__dirname, '../..');
  const envFiles = ['.env.local', '.env'];

  for (const file of envFiles) {
    const envPath = path.join(root, file);
    if (!fs.existsSync(envPath)) continue;

    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) continue;

      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, '').trim();
      const existing = process.env[key];
      // Overwrite missing or empty values so updated .env keys take effect.
      if (existing !== undefined && existing !== '') continue;

      process.env[key] = value;
    }
  }
}

loadRootEnv();

const { securityHeaders } = require('./lib/security/security-headers.config.cjs');
const { URL } = require('url');

function normalizePublicUrl(url) {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
}

function getHostnameFromUrl(url) {
  if (!url) return null;

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function getProtocolFromUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' ? 'http' : 'https';
  } catch {
    return null;
  }
}

const r2PublicBaseUrl = normalizePublicUrl(process.env.R2_PUBLIC_URL);
const r2PublicHostname = getHostnameFromUrl(r2PublicBaseUrl);
const r2PublicProtocol = getProtocolFromUrl(r2PublicBaseUrl);

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  transpilePackages: ['@shop/ui', '@shop/design-tokens'],
  async rewrites() {
    const rewrites = [
      {
        source: '/supersudo',
        destination: '/admin',
      },
      {
        source: '/supersudo/:path*',
        destination: '/admin/:path*',
      },
    ];

    if (r2PublicBaseUrl) {
      // Keep existing UI src paths while serving static images from R2/CDN.
      rewrites.push(
        {
          source: '/assets/:path*',
          destination: `${r2PublicBaseUrl}/assets/:path*`,
        },
        {
          source: '/voting-item-placeholder.svg',
          destination: `${r2PublicBaseUrl}/voting-item-placeholder.svg`,
        }
      );
    }

    return rewrites;
  },
  // Standalone output - prevents prerendering of 404 page
  output: 'standalone',
  // typescript.ignoreBuildErrors removed - build will fail on TypeScript errors
  // This ensures type safety in production builds     
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        pathname: '/**',
      },
      ...(r2PublicHostname
        ? [
            {
              protocol: r2PublicProtocol || 'https',
              hostname: r2PublicHostname,
              pathname: '/**',
            },
          ]
        : []),
    ],
    // Allow unoptimized images for development (images will use unoptimized prop)
    // Ensure image optimization is enabled for production
    formats: ['image/avif', 'image/webp'],
    // In development, disable image optimization globally to allow any local IP
    // Components can still use unoptimized prop, but this ensures all images work
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Fix for HMR issues in Next.js 15
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    // Resolve workspace packages and path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      '@shop/ui': path.resolve(__dirname, '../../packages/ui'),
      '@shop/design-tokens': path.resolve(__dirname, '../../packages/design-tokens'),
    };
    
    return config;
  },
  // Turbopack configuration for monorepo
  // Required when webpack config is present - Next.js 16 requires explicit turbopack config
  // Set root to project root where Next.js is installed in node_modules (monorepo workspace)
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Local-first: never bind beyond localhost by default (see .env.example / README security notes).
  transpilePackages: [
    '@certforge/shared',
    '@certforge/certification-engine',
    '@certforge/llm-gateway',
    '@certforge/database',
  ],
  webpack: (config) => {
    // Source uses explicit ".js" specifiers on relative imports (the
    // TypeScript/Node ESM convention for "moduleResolution: bundler"), which
    // actually point at sibling ".ts"/".tsx" files. webpack does not resolve
    // this by default the way tsx/vite do, so alias it explicitly.
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;

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
};

export default nextConfig;

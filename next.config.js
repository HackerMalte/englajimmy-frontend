/** @type {import('next').NextConfig} */
const nextConfig = {
  // Leaner production runtime: ships only the deps the server actually needs,
  // which lowers memory footprint and image size on Railway.
  output: 'standalone',
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de producción estricta
  eslint: {
    ignoreDuringBuilds: false, // Habilitar ESLint en builds
  },
  typescript: {
    ignoreBuildErrors: false, // Habilitar verificación de TypeScript
  },
  images: { 
    domains: ['images.pexels.com', 'i.ibb.co'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // Cache de imágenes por 60 segundos
  },
  experimental: {
    esmExternals: 'loose'
  },
  // Optimizaciones de webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      };
    }
    return config;
  },
  // Configuración de producción
  productionBrowserSourceMaps: false, // Desactivar source maps en producción
  compress: true, // Habilitar compresión gzip
  poweredByHeader: false, // Ocultar header X-Powered-By
  generateEtags: true, // Generar ETags para caché
  // Headers de seguridad adicionales
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ],
      },
    ];
  },
  // Configuración de cache
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
};

module.exports = nextConfig;
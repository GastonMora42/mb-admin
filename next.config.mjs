/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Habilitar características experimentales de React
  experimental: {
    // Habilitar el nuevo router de aplicaciones de Next.js
    appDir: true,
    // Habilitar el uso de características experimentales de React
    runtime: 'nodejs',
    serverComponents: true,
    serverActions: true,
  },
  // Configurar webpack para manejar módulos de react-dom correctamente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
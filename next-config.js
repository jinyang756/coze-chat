/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 环境变量配置
  env: {
    COZE_BOT_ID: process.env.REACT_APP_COZE_BOT_ID,
    COZE_API_KEY: process.env.REACT_APP_COZE_API_KEY,
  },

  // API路由配置
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // 头部安全配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // 静态文件优化
  images: {
    domains: ['www.coze.cn', 'coze.cn'],
  },

  // 构建优化
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
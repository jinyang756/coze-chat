#!/bin/bash

# 扣子智能体网站快速部署脚本
# 使用方法: bash quick-start-script.sh
# 平台信息已预配置，无需用户输入

echo "🚀 扣子智能体网站快速部署脚本"
echo "================================="

# 检查必要工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装 $1"
        exit 1
    fi
}

echo "📋 检查必要工具..."
check_command "node"
check_command "npm"
check_command "git"

# 平台信息设置
echo ""
echo "📝 设置扣子平台信息..."
# 用户信息
USERNAME="user9320701040"
USER_NICKNAME="证通裕达"
VOLCANO_USERNAME="RootUser_2108658236"

# 智能体信息
BOT_ID="7545375886166982691"
API_KEY="pat_rQVfrvRk2QmHz3Q1K6ltQ58pZwqq3b2T8u2972iuZ8e3C9GzpgYGjUVjhW5elDWM"

# 项目名称
PROJECT_NAME="扣子智能体网站接口"

echo "✅ 平台信息已配置："
echo "👤 用户名：$USERNAME"
echo "📛 用户昵称：$USER_NICKNAME"
echo "🌋 火山用户名：$VOLCANO_USERNAME"
echo "🤖 智能体ID：$BOT_ID"
echo "📁 项目名称：$PROJECT_NAME"

# 创建项目目录
echo ""
echo "📁 创建项目目录..."
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# 初始化项目
echo "🔧 初始化项目..."
cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "14.0.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "@tailwindcss/forms": "^0.5.6"
  }
}
EOF

# 创建必要目录
echo "📂 创建项目结构..."
mkdir -p pages/api
mkdir -p public
mkdir -p styles

# 创建环境变量文件
echo "🔐 创建环境配置..."
cat > .env.local << EOF
REACT_APP_COZE_BOT_ID=$BOT_ID
REACT_APP_COZE_API_KEY=$API_KEY
EOF

cat > .env.example << EOF
REACT_APP_COZE_BOT_ID=your_bot_id_here
REACT_APP_COZE_API_KEY=your_api_key_here
EOF

# 创建Next.js配置
cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    COZE_BOT_ID: process.env.REACT_APP_COZE_BOT_ID,
    COZE_API_KEY: process.env.REACT_APP_COZE_API_KEY,
  }
};

module.exports = nextConfig;
EOF

# 创建Tailwind配置
cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
EOF

# 创建PostCSS配置
cat > postcss.config.js << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 创建样式文件
cat > styles/globals.css << EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# 创建Vercel配置
cat > vercel.json << EOF
{
  "framework": "nextjs",
  "env": {
    "REACT_APP_COZE_BOT_ID": "@coze_bot_id",
    "REACT_APP_COZE_API_KEY": "@coze_api_key"
  }
}
EOF

# 创建gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/

# Environment variables
.env*.local
.env

# Vercel
.vercel

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

echo "📦 安装依赖..."
npm install

echo ""
echo "✅ 项目初始化完成!"
echo ""
echo "📋 接下来的步骤:"
echo "1. 将前面提供的React组件代码保存为 pages/index.js"
echo "2. 将增强版API代码保存为 pages/api/coze-chat.js"
echo "3. 运行 'npm run dev' 进行本地测试"
echo "4. 推送到Git仓库并连接到Vercel进行部署"
echo ""
echo "🔧 本地开发命令:"
echo "   npm run dev      # 启动开发服务器"
echo "   npm run build    # 构建生产版本"
echo "   npm run start    # 启动生产服务器"
echo ""
echo "🚀 Vercel部署步骤:"
echo "1. 访问 https://vercel.com"
echo "2. 连接你的Git仓库"
echo "3. 设置环境变量:"
echo "   REACT_APP_COZE_BOT_ID = $BOT_ID"
echo "   REACT_APP_COZE_API_KEY = $API_KEY"
echo "4. 点击Deploy!"
echo ""
echo "🎉 部署完成后，你就可以通过自定义域名访问你的扣子智能体了!"
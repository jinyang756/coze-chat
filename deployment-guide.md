# 扣子智能体网站部署指南

## 项目概述

这个项目可以让你通过自定义域名直接访问扣子(Coze)上发布的智能体，并使用 Vercel 进行托管。

## 功能特性

- 🤖 直接接入扣子平台的智能体
- 💬 现代化的聊天界面
- 🔧 可配置的Bot ID和API密钥
- 📱 响应式设计，支持移动端
- ⚡ 基于Vercel的快速部署
- 🔐 安全的API代理

## 文件结构

```
your-project/
├── pages/
│   ├── api/
│   │   └── coze-chat.js      # API路由文件
│   └── index.js              # 主页面
├── components/
│   └── CozeBotInterface.js   # React组件
├── package.json
├── vercel.json              # Vercel配置
└── README.md
```

## 部署步骤

### 1. 准备扣子Bot信息

首先，你需要在扣子平台获取：
- **Bot ID**: 你发布的智能体的ID
- **API Key**: 扣子平台的API密钥

### 2. 本地开发设置

1. 创建项目文件夹：
```bash
mkdir coze-bot-interface
cd coze-bot-interface
```

2. 初始化项目：
```bash
npm init -y
```

3. 安装依赖：
```bash
npm install next react react-dom lucide-react
npm install -D tailwindcss autoprefixer postcss eslint eslint-config-next
```

4. 创建必要的文件：
   - 将提供的React组件保存为 `pages/index.js`
   - 将API路由保存为 `pages/api/coze-chat.js`
   - 创建 `vercel.json` 配置文件

### 3. Vercel部署

#### 方法一：通过Git连接自动部署

1. 将代码推送到GitHub/GitLab/Bitbucket
2. 在 [Vercel](https://vercel.com) 注册账号
3. 点击 "New Project" 并连接你的Git仓库
4. 配置环境变量：
   - `REACT_APP_COZE_BOT_ID`: 你的Bot ID
   - `REACT_APP_COZE_API_KEY`: 你的API密钥
5. 点击Deploy

#### 方法二：Vercel CLI部署

1. 安装Vercel CLI：
```bash
npm install -g vercel
```

2. 登录Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
vercel
```

4. 设置环境变量：
```bash
vercel env add REACT_APP_COZE_BOT_ID
vercel env add REACT_APP_COZE_API_KEY
```

### 4. 自定义域名设置

1. 在Vercel项目设置中，找到 "Domains" 选项
2. 添加你的自定义域名
3. 根据提示配置DNS记录

## 环境变量配置

在Vercel项目设置中配置以下环境变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `REACT_APP_COZE_BOT_ID` | 扣子Bot的ID | `bot_123456789` |
| `REACT_APP_COZE_API_KEY` | 扣子平台API密钥 | `pat_xxxxxxxxxxxxx` |

## API接口说明

### POST /api/coze-chat

**请求参数：**
```json
{
  "message": "用户消息内容",
  "botId": "Bot ID",
  "apiKey": "API密钥"
}
```

**响应格式：**
```json
{
  "success": true,
  "reply": "Bot回复内容",
  "conversation_id": "会话ID"
}
```

## 自定义配置

### 修改界面样式

你可以通过修改Tailwind CSS类来自定义界面样式：

1. 主题颜色：修改 `bg-blue-500` 等颜色类
2. 布局：调整容器的宽度和间距
3. 字体：添加自定义字体类

### 添加功能

可以扩展的功能：
- 对话历史保存
- 多Bot切换
- 文件上传支持
- 语音输入/输出
- 主题切换

## 故障排除

### 常见问题

1. **API调用失败**
   - 检查Bot ID和API Key是否正确
   - 确认Bot已在扣子平台正确发布
   - 检查网络连接和防火墙设置

2. **部署失败**
   - 检查package.json依赖是否完整
   - 确认所有必要文件都已上传
   - 查看Vercel部署日志

3. **界面显示异常**
   - 检查React组件语法
   - 确认Tailwind CSS正确加载
   - 查看浏览器控制台错误

### 调试方法

1. 本地调试：
```bash
npm run dev
```

2. 查看API日志：
在Vercel项目面板中查看Function日志

3. 网络调试：
使用浏览器开发者工具检查网络请求

## 安全注意事项

1. **API密钥保护**：
   - 不要在前端代码中硬编码API密钥
   - 使用环境变量存储敏感信息
   - 定期更换API密钥

2. **访问控制**：
   - 考虑添加用户认证
   - 实现请求频率限制
   - 设置CORS策略

3. **数据隐私**：
   - 不要记录用户敏感对话
   - 遵守相关数据保护法规
   - 实现适当的数据加密

## 技术支持

如果遇到问题：
1. 查看扣子平台官方文档
2. 检查Vercel部署日志
3. 参考本文档的故障排除部分

## 许可证

MIT License - 可自由使用和修改
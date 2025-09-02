// /api/coze-chat.js
// 增强版 Vercel Serverless Function for Coze API integration

const COZE_API_BASE = 'https://www.coze.cn/api';
const MAX_RETRIES = 3;
const TIMEOUT = 30000; // 30秒超时

// 请求频率限制（简单内存存储，生产环境建议使用Redis）
const requestCounts = new Map();

// 频率限制检查
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000; // 1分钟窗口
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip).filter(time => time > windowStart);
  
  if (requests.length >= 20) { // 每分钟最多20个请求
    return false;
  }
  
  requests.push(now);
  requestCounts.set(ip, requests);
  return true;
}

// 带重试的fetch函数
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
      
      // 如果是服务器错误且还有重试次数，继续重试
      if (response.status >= 500 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 指数退避
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export default async function handler(req, res) {
  // 设置CORS头
  const allowedOrigins = [
    'http://localhost:3000',
    'https://your-domain.vercel.app',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: '方法不被允许',
      message: '仅支持POST请求'
    });
  }

  // 获取客户端IP进行频率限制
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress ||
                   'unknown';

  // 检查频率限制
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      error: '请求过于频繁',
      message: '请稍后再试，每分钟最多20个请求'
    });
  }

  try {
    const { message, botId, apiKey, conversationId } = req.body;

    // 验证必要参数
    if (!message?.trim()) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '消息内容不能为空' 
      });
    }

    const finalBotId = botId || process.env.REACT_APP_COZE_BOT_ID;
    const finalApiKey = apiKey || process.env.REACT_APP_COZE_API_KEY;

    if (!finalBotId) {
      return res.status(400).json({ 
        error: '配置错误',
        message: '缺少Bot ID配置' 
      });
    }

    if (!finalApiKey) {
      return res.status(400).json({ 
        error: '配置错误',
        message: '缺少API Key配置' 
      });
    }

    // 构建请求体
    const requestBody = {
      conversation_id: conversationId || `conversation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bot_id: finalBotId,
      user: `user_${clientIP.replace(/[^a-zA-Z0-9]/g, '_')}`,
      query: message.trim(),
      chat_history: [],
      stream: false
    };

    console.log('发送请求到Coze API:', {
      bot_id: finalBotId,
      user: requestBody.user,
      query_length: message.length
    });

    // 调用Coze API
    const cozeResponse = await fetchWithRetry(`${COZE_API_BASE}/conversation/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CozeWebInterface/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!cozeResponse.ok) {
      const errorText = await cozeResponse.text();
      console.error('Coze API错误:', {
        status: cozeResponse.status,
        statusText: cozeResponse.statusText,
        error: errorText
      });
      
      let errorMessage = 'API调用失败';
      
      switch (cozeResponse.status) {
        case 400:
          errorMessage = '请求参数错误，请检查Bot配置';
          break;
        case 401:
          errorMessage = 'API密钥无效或已过期';
          break;
        case 403:
          errorMessage = '没有权限访问该Bot';
          break;
        case 404:
          errorMessage = '未找到指定的Bot';
          break;
        case 429:
          errorMessage = 'API调用频率超限，请稍后重试';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = '服务暂时不可用，请稍后重试';
          break;
        default:
          errorMessage = `服务错误 (${cozeResponse.status})`;
      }
      
      return res.status(cozeResponse.status === 429 ? 429 : 500).json({ 
        error: errorMessage,
        status: cozeResponse.status
      });
    }

    const data = await cozeResponse.json();
    console.log('Coze API响应结构:', {
      hasMessages: !!data.messages,
      messagesCount: data.messages?.length || 0,
      hasReply: !!data.reply,
      hasContent: !!data.content
    });
    
    // 解析响应数据
    let reply = '抱歉，我暂时无法回复。';
    
    if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
      // 查找最后一条assistant消息
      const assistantMessages = data.messages.filter(msg => 
        msg.role === 'assistant' && msg.content && msg.content.trim()
      );
      if (assistantMessages.length > 0) {
        reply = assistantMessages[assistantMessages.length - 1].content.trim();
      }
    } else if (data.reply && data.reply.trim()) {
      reply = data.reply.trim();
    } else if (data.content && data.content.trim()) {
      reply = data.content.trim();
    }

    // 记录成功的API调用
    console.log('API调用成功:', {
      conversation_id: requestBody.conversation_id,
      reply_length: reply.length,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      reply: reply,
      conversation_id: data.conversation_id || requestBody.conversation_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('处理请求时出错:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    let errorMessage = '服务暂时不可用';
    
    if (error.name === 'AbortError') {
      errorMessage = '请求超时，请稍后重试';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = '网络连接失败，请检查网络设置';
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name,
        code: error.code
      } : undefined
    });
  }
}
// /api/coze-chat.js
// Vercel Serverless Function for Coze API integration

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不被允许' });
  }

  try {
    const { message, botId, apiKey } = req.body;

    // 验证必要参数
    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    if (!botId) {
      return res.status(400).json({ error: '缺少Bot ID' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: '缺少API Key' });
    }

    // 构建请求体
    const requestBody = {
      conversation_id: `conversation_${Date.now()}`,
      bot_id: botId,
      user: "user_001",
      query: message,
      chat_history: [],
      stream: false
    };

    // 调用Coze API
    const cozeResponse = await fetch('https://www.coze.cn/api/conversation/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!cozeResponse.ok) {
      const errorText = await cozeResponse.text();
      console.error('Coze API错误:', errorText);
      
      if (cozeResponse.status === 401) {
        return res.status(401).json({ error: 'API密钥无效或已过期' });
      } else if (cozeResponse.status === 403) {
        return res.status(403).json({ error: '没有权限访问该Bot' });
      } else if (cozeResponse.status === 404) {
        return res.status(404).json({ error: '未找到指定的Bot' });
      } else {
        return res.status(500).json({ error: `Coze API调用失败: ${cozeResponse.status}` });
      }
    }

    const data = await cozeResponse.json();
    
    // 解析响应数据
    let reply = '抱歉，我暂时无法回复。';
    
    if (data.messages && data.messages.length > 0) {
      // 查找最后一条assistant消息
      const assistantMessages = data.messages.filter(msg => msg.role === 'assistant');
      if (assistantMessages.length > 0) {
        reply = assistantMessages[assistantMessages.length - 1].content;
      }
    } else if (data.reply) {
      reply = data.reply;
    } else if (data.content) {
      reply = data.content;
    }

    return res.status(200).json({
      success: true,
      reply: reply,
      conversation_id: data.conversation_id || requestBody.conversation_id
    });

  } catch (error) {
    console.error('处理请求时出错:', error);
    return res.status(500).json({ 
      error: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
}
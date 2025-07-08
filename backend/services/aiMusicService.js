const fetch = require('node-fetch');

// Stability AI 的官方API端点（2024年更新）
const STABILITY_API_HOST = 'https://api.stability.ai';

/**
 * 使用Stability AI的Stable Audio 2.0模型生成纯音乐
 * @param {string} prompt - 音乐描述提示词
 * @param {number} duration - 音乐时长（秒）
 * @returns {Promise<Buffer>} - 返回生成的音频文件的Buffer
 */
const generateMusicWithStability = async (prompt, duration) => {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error('AI音乐生成功能暂未配置。请联系管理员获取Stability AI API密钥以启用此功能。您仍可以使用上传音乐和其他功能。');
  }

  console.log(`🎵 调用 Stability AI Stable Audio 2.0, 提示词: "${prompt}"`);

  // 根据最新的Stable Audio 2.0 API文档更新端点和参数
  const response = await fetch(
    `${STABILITY_API_HOST}/v2beta/stable-audio/generate/audio`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: Math.min(duration, 47), // Stable Audio 2.0最大支持47秒
        output_format: 'mp3'
      }),
    }
  );

  if (!response.ok) {
    let errorMessage = '未知错误';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
    } catch {
      errorMessage = await response.text() || `HTTP ${response.status}`;
    }
    
    console.error('❌ Stability AI API 错误:', response.status, errorMessage);
    
    // 根据不同的错误状态码提供更友好的错误信息
    if (response.status === 401) {
      throw new Error('API密钥无效，请检查STABILITY_API_KEY配置');
    } else if (response.status === 402) {
      throw new Error('账户余额不足，请充值Stability AI credits');
    } else if (response.status === 429) {
      throw new Error('API调用频率过高，请稍后重试');
    } else {
      throw new Error(`AI服务调用失败: ${errorMessage}`);
    }
  }

  console.log('✅ Stability AI 音频流接收成功');
  // 直接返回音频流的Buffer
  return response.buffer();
};

module.exports = {
  generateMusicWithStability,
}; 
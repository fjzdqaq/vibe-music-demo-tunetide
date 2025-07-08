const fetch = require('node-fetch');

// Stability AI 的官方API端点
const STABILITY_API_HOST = 'https://api.stability.ai';
const ENGINE_ID = 'stable-audio-2.0';

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

  console.log(`🎵 调用 Stability AI (${ENGINE_ID}), 提示词: "${prompt}"`);

  const response = await fetch(
    `${STABILITY_API_HOST}/v2/creative/audio/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'audio/wav',
      },
      body: JSON.stringify({
        text: prompt,
        duration: duration,
        // model: ENGINE_ID, // 根据最新的API文档，此参数可能已包含在URL中或默认
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Stability AI API 错误:', response.status, errorText);
    throw new Error(`AI服务调用失败: ${errorText}`);
  }

  console.log('✅ Stability AI 音频流接收成功');
  // 直接返回音频流的Buffer
  return response.buffer();
};

module.exports = {
  generateMusicWithStability,
}; 
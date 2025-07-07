const fetch = require('node-fetch');

// Hugging Face Space的API端点
const HF_SPACE_API = "https://facebook-musicgen.hf.space/run/predict";

// 轮询函数，用于等待Hugging Face完成任务
const poll = async (fn, interval = 2000, maxAttempts = 30) => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (e) {
      // 忽略轮询中的错误，继续尝试
    }
    attempts++;
    await new Promise(res => setTimeout(res, interval));
  }
  throw new Error('AI任务超时或失败');
};

/**
 * 使用Hugging Face上的公共MusicGen Space生成音乐 (Fetch版本)
 * @param {string} prompt - 音乐描述提示词
 * @param {number} duration - 音乐时长（秒）
 * @returns {Promise<string>} - 返回生成的音乐文件的临时URL
 */
const generateMusicWithHuggingFace = async (prompt, duration) => {
  console.log('🎵 连接到Hugging Face公共MusicGen服务 (Fetch版)...');
  
  try {
    const response = await fetch(HF_SPACE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          prompt, // Text
          null,   // Melody
          duration,
        ]
      })
    });
    
    if (!response.ok) {
        throw new Error(`提交任务失败: ${response.statusText}`);
    }
    
    // Hugging Face Spaces API是异步的，需要轮询结果
    // 但对于这个公共Space，它可能会直接在第一个请求中等待并返回
    const result = await response.json();

    console.log('✅ Hugging Face任务完成. 结果:', JSON.stringify(result, null, 2));

    if (result && result.data && result.data[0] && result.data[0].url) {
      // 有些Space会直接返回结果的URL
      return result.data[0].url;
    } else {
        throw new Error('Hugging Face API返回的数据格式不正确');
    }

  } catch (error) {
    console.error('❌ 调用Hugging Face服务失败:', error);
    throw new Error('AI音乐生成服务当前繁忙或不可用，请稍后再试。');
  }
};

module.exports = {
  generateMusicWithHuggingFace,
}; 
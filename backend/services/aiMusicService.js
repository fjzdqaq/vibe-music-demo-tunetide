const Replicate = require('replicate');
const fetch = require('node-fetch');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  fetch: fetch,
});

/**
 * 使用Replicate的Riffusion模型生成音乐
 * @param {string} prompt - 音乐描述提示词
 * @returns {Promise<string>} - 返回生成的音乐文件的URL
 */
const generateMusicWithReplicate = async (prompt) => {
  console.log('🎵 调用 Replicate API, 使用 riffusion 模型...');

  // Riffusion模型版本，以速度快著称
  const modelVersion = "8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05";

  try {
    const output = await replicate.run(
      `riffusion/riffusion:${modelVersion}`,
      {
        input: {
          prompt_a: prompt,
          denoising: 0.75,
          seed: Math.floor(Math.random() * 100000)
        }
      }
    );

    console.log('✅ Replicate API 调用成功. 输出:', output);

    if (!output || !output.audio) {
      throw new Error('Replicate API 未返回有效的音乐URL');
    }

    // Riffusion直接返回音频URL
    return output.audio;
    
  } catch (error) {
    console.error('❌ Replicate API 调用失败:', error);
    if (error.response) {
      const errorBody = await error.response.json().catch(() => ({ detail: '无法解析错误响应' }));
      console.error('Replicate API 错误详情:', errorBody.detail);
      throw new Error(errorBody.detail || 'AI音乐生成服务遇到未知错误。');
    }
    throw new Error('AI音乐生成服务暂时不可用，请稍后再试。');
  }
};

module.exports = {
  generateMusicWithReplicate,
}; 
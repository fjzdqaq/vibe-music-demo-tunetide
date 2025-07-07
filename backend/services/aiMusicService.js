const Replicate = require('replicate');
const fetch = require('node-fetch');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  fetch: fetch,
});

/**
 * 使用Replicate的MusicGen模型生成音乐
 * @param {string} prompt - 音乐描述提示词
 * @param {number} duration - 音乐时长（秒）
 * @returns {Promise<string>} - 返回生成的音乐文件的URL
 */
const generateMusicWithReplicate = async (prompt, duration) => {
  console.log('🎵 调用 Replicate API, 使用 musicgen-melody 模型...');

  // 模型版本hash，确保使用的是稳定版本
  const modelVersion = "b587b3d3258385a0248c504381387cf451a44e21975949d21123a241c61853d7";

  try {
    const output = await replicate.run(
      `joehoover/musicgen-melody:${modelVersion}`,
      {
        input: {
          model_version: "melody",
          prompt: prompt,
          duration: duration,
          output_format: "wav"
        }
      }
    );

    console.log('✅ Replicate API 调用成功. 输出:', output);

    if (!output) {
      throw new Error('Replicate API 未返回有效的音乐URL');
    }

    return output;
  } catch (error) {
    console.error('❌ Replicate API 调用失败:', error);
    // 这里可以根据error.status来判断是否是认证失败
    if (error.response && error.response.status === 401) {
      throw new Error('Replicate API认证失败，请检查API Token是否正确配置。');
    }
    throw new Error('AI音乐生成服务暂时不可用，请稍后再试。');
  }
};

module.exports = {
  generateMusicWithReplicate,
}; 
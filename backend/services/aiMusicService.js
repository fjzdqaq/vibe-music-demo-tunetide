const { client } = require("@gradio/client");
const fetch = require('node-fetch');

/**
 * 使用Hugging Face上的公共MusicGen Space生成音乐
 * @param {string} prompt - 音乐描述提示词
 * @param {number} duration - 音乐时长（秒）
 * @returns {Promise<string>} - 返回生成的音乐文件的临时URL
 */
const generateMusicWithHuggingFace = async (prompt, duration) => {
  console.log('🎵 连接到Hugging Face公共MusicGen服务...');
  
  try {
    // 连接到Facebook官方的MusicGen Space
    const app = await client("facebook/MusicGen", {});

    console.log(`🚀 提交生成任务, 提示词: "${prompt}", 时长: ${duration}s`);

    // 提交预测任务
    // 这里的参数名和顺序需要和Hugging Face Space上的UI组件完全对应
    const result = await app.predict("/predict", [
      prompt, // Text
      null,   // Melody (null for text-to-music)
      duration, // Duration
    ]);

    console.log('✅ Hugging Face任务完成. 结果:', result);

    // result.data[0].url 是返回的临时文件URL
    if (result && result.data && result.data[0] && result.data[0].url) {
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
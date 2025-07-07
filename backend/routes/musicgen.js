const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { uploadToOSS } = require('../utils/ossUpload');
const Song = require('../models/Song');
const fetch = require('node-fetch');

const router = express.Router();

// 使用 Stability AI 的 Stable Audio API
const generateAIMusic = async (prompt, duration = 30, withVocals = true) => {
  try {
    console.log('🎵 调用Stability AI生成音乐:', prompt);
    
    // 构建更好的提示词
    let enhancedPrompt = prompt;
    if (withVocals) {
      enhancedPrompt += ', with vocals, singing, melodic vocals, lyrical song';
    } else {
      enhancedPrompt += ', instrumental, no vocals, background music';
    }
    
    console.log('🎯 增强提示词:', enhancedPrompt);
    
    // 调用 Stability AI API
    const response = await fetch('https://api.stability.ai/v2beta/stable-audio/generate/music', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        duration: Math.min(duration, 47), // Stability AI 最大47秒
        cfg_scale: 7,
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Stability AI API错误:', response.status, errorText);
      throw new Error(`API错误 ${response.status}: ${errorText}`);
    }

    const audioBuffer = await response.buffer();
    console.log('✅ Stability AI音乐生成成功，大小:', audioBuffer.length, 'bytes');
    return audioBuffer;
    
  } catch (error) {
    console.error('❌ Stability AI生成失败:', error.message);
    throw new Error(`AI音乐生成失败: ${error.message}`);
  }
};

// AI歌曲生成接口
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { prompt, duration = 30, withVocals = true } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供歌曲描述'
      });
    }

    console.log('🎵 开始生成AI歌曲:', prompt);
    console.log('🎤 包含人声:', withVocals ? '是' : '否');
    console.log('⏱️ 时长:', duration, '秒');
    
    // 使用Stability AI生成真实的AI音乐
    const audioBuffer = await generateAIMusic(prompt, Math.min(duration, 47), withVocals);
    
    // 创建文件名
    const fileName = `ai-music-${Date.now()}.wav`;
    
    // 上传到OSS
    console.log('📤 上传音频到OSS...');
    const ossUrl = await uploadToOSS(audioBuffer, fileName, 'audio/wav');
    console.log('✅ OSS上传成功:', ossUrl);
    
    // 保存到数据库
    const song = new Song({
      title: `AI生成: ${prompt.substring(0, 50)}`,
      artist: withVocals ? 'Stability AI Singer' : 'Stability AI Instrumental',
      fileName: fileName,
      filePath: ossUrl,
      coverPath: '/default-cover.jpg',
      duration: duration,
      isPublic: false,
      uploadedBy: req.user.id,
      isAIGenerated: true,
      aiPrompt: prompt,
      withVocals: withVocals
    });
    
    await song.save();
    
    console.log('✅ AI歌曲生成成功:', song.title);
    
    res.json({
      success: true,
      message: withVocals ? '带人声歌曲生成成功！' : '纯音乐生成成功！',
      song: {
        id: song._id,
        title: song.title,
        artist: song.artist,
        filePath: song.filePath,
        duration: song.duration,
        isAIGenerated: true,
        aiPrompt: prompt,
        withVocals: withVocals
      }
    });
    
  } catch (error) {
    console.error('❌ AI歌曲生成失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI歌曲生成失败'
    });
  }
});

// 获取AI生成历史
router.get('/history', requireAuth, async (req, res) => {
  try {
    const aiSongs = await Song.find({ 
      uploadedBy: req.user.userId,
      isAIGenerated: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      songs: aiSongs
    });
  } catch (error) {
    console.error('❌ 获取AI生成历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取AI生成历史失败'
    });
  }
});

module.exports = router; 
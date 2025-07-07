const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { uploadToOSS } = require('../utils/ossUpload');
const Song = require('../models/Song');

const router = express.Router();

// AI歌曲生成接口
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { prompt, duration = 15, style = 'pop' } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供歌曲描述'
      });
    }

    console.log('🎵 开始生成AI歌曲:', prompt);
    
    // 调用HuggingFace MusicGen API
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/musicgen-small', {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: duration,
          temperature: 0.8
        }
      })
    });

    console.log('📡 HuggingFace响应状态:', response.status);

    if (!response.ok) {
      if (response.status === 503) {
        return res.status(503).json({
          success: false,
          message: '模型正在加载中，请稍后重试（约1-2分钟）',
          code: 'MODEL_LOADING'
        });
      } else if (response.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'API认证失败，请检查配置',
          code: 'AUTH_ERROR'
        });
      } else {
        const errorText = await response.text();
        console.error('❌ HuggingFace API错误:', errorText);
        return res.status(500).json({
          success: false,
          message: 'AI服务暂时不可用，请稍后重试'
        });
      }
    }

    // 获取音频数据
    const audioBuffer = await response.arrayBuffer();
    
    if (audioBuffer.byteLength === 0) {
      return res.status(500).json({
        success: false,
        message: '生成的音频文件为空'
      });
    }

    console.log('📦 音频文件大小:', Math.round(audioBuffer.byteLength / 1024), 'KB');

    // 生成唯一文件名
    const timestamp = Date.now();
    const filename = `ai-song-${timestamp}.wav`;
    
    // 直接上传到OSS
    console.log('☁️ 正在上传到阿里云OSS...');
    const audioUrl = await uploadToOSS(Buffer.from(audioBuffer), `music/audio/${filename}`);
    
    console.log('✅ AI歌曲生成并上传成功:', audioUrl);

    // 可选：保存到数据库作为临时歌曲
    const tempSong = new Song({
      title: `AI生成 - ${prompt.substring(0, 20)}...`,
      artist: 'AI Generated',
      audioUrl: audioUrl,
      duration: duration,
      scope: 'private',
      uploadedBy: req.user._id,
      isAIGenerated: true,
      aiPrompt: prompt
    });
    
    await tempSong.save();

    res.json({
      success: true,
      audioUrl: audioUrl,
      songId: tempSong._id,
      filename: filename,
      duration: duration,
      size: audioBuffer.byteLength,
      prompt: prompt
    });

  } catch (error) {
    console.error('💥 AI歌曲生成失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误，请稍后重试'
    });
  }
});

// 获取AI生成歌曲历史
router.get('/history', requireAuth, async (req, res) => {
  try {
    const aiSongs = await Song.find({
      uploadedBy: req.user._id,
      isAIGenerated: true
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title artist audioUrl duration createdAt aiPrompt');

    res.json({
      success: true,
      songs: aiSongs
    });

  } catch (error) {
    console.error('获取AI歌曲历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取历史记录失败'
    });
  }
});

module.exports = router; 
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { uploadToOSS } = require('../utils/ossUpload');
const Song = require('../models/Song');
const fetch = require('node-fetch');
const { generateMusicWithStability } = require('../services/aiMusicService');

const router = express.Router();

// AI纯音乐生成接口
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { prompt, duration = 30 } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, message: '请提供音乐描述' });
    }

    console.log(`🎵 接收到AI纯音乐生成请求: "${prompt}", 时长: ${duration}s`);
    
    // 1. 调用AI音乐服务直接生成音频Buffer
    const audioBuffer = await generateMusicWithStability(prompt, duration);
    console.log(`✅ 音频Buffer已生成, 大小: ${audioBuffer.length} bytes`);

    // 2. 将AI生成的音频Buffer包装成类似multer文件对象的格式
    const fileName = `AI-Music-${Date.now()}.mp3`;
    const audioFile = {
      buffer: audioBuffer,
      originalname: fileName,
      mimetype: 'audio/mpeg',
      size: audioBuffer.length
    };

    console.log(`📤 正在上传AI生成的音乐到OSS...`);
    
    // 3. 重用现有的uploadToOSS函数
    const uploadResult = await uploadToOSS({
      audioFile: audioFile,
      coverFile: null, // AI音乐暂时不生成封面
      title: `AI生成: ${prompt.substring(0, 50)}`,
      artist: 'Stability AI',
      uploadedBy: req.user._id,
      scope: 'private', // AI生成的音乐默认为私有
      isAIGenerated: true,
      aiPrompt: prompt,
      withVocals: false // 纯音乐，无人声
    });

    console.log(`✅ AI音乐上传和保存成功`);
    
    // 4. 返回成功响应
    res.json({
      success: true,
      message: 'AI音乐生成成功！',
      song: uploadResult.song,
    });
    
  } catch (error) {
    console.error('❌ AI纯音乐生成流程失败:', error.message);
    
    // 如果是API密钥未配置的错误，返回400而不是500
    if (error.message.includes('AI音乐生成功能暂未配置')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'AI_SERVICE_NOT_CONFIGURED'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'AI纯音乐生成失败，请稍后重试',
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
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

    // 2. 上传到OSS
    const fileName = `ai-music-${Date.now()}.wav`;
    console.log(`📤 正在上传 "${fileName}" 到OSS...`);
    const ossUrl = await uploadToOSS(audioBuffer, fileName, 'audio/wav');
    console.log(`✅ OSS上传成功: ${ossUrl}`);
    
    // 3. 保存到数据库
    const song = new Song({
      title: `AI生成: ${prompt.substring(0, 50)}`,
      artist: 'Stability AI',
      fileName: fileName,
      filePath: ossUrl,
      coverPath: '/default-cover.jpg',
      duration: duration,
      isPublic: false,
      uploadedBy: req.user.id,
      isAIGenerated: true,
      aiPrompt: prompt,
      withVocals: false, // 明确这是纯音乐
    });
    
    await song.save();
    console.log(`💾 AI纯音乐 "${song.title}" 已保存到数据库`);
    
    // 4. 返回成功响应
    res.json({
      success: true,
      message: 'AI纯音乐生成成功！',
      song: song,
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
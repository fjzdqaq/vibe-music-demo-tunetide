const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { uploadToOSS } = require('../utils/ossUpload');
const Song = require('../models/Song');
const fetch = require('node-fetch');
const { generateMusicWithHuggingFace } = require('../services/aiMusicService');

const router = express.Router();

// AI歌曲生成接口
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { prompt, duration = 15 } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, message: '请提供歌曲描述' });
    }

    console.log(`🎵 接收到AI歌曲生成请求: "${prompt}", 时长: ${duration}s`);
    
    // 1. 调用AI音乐服务生成音乐URL
    const musicUrl = await generateMusicWithHuggingFace(prompt, duration);

    // 2. 从URL下载音频数据
    console.log('⬇️ 正在从Hugging Face下载生成的音频...');
    const audioResponse = await fetch(musicUrl);
    if (!audioResponse.ok) {
      throw new Error(`无法下载生成的音频文件: ${audioResponse.statusText}`);
    }
    const audioBuffer = await audioResponse.buffer();
    console.log(`✅ 音频下载成功, 大小: ${audioBuffer.length} bytes`);

    // 3. 上传到OSS
    const fileName = `ai-music-${Date.now()}.wav`;
    console.log(`📤 正在上传 "${fileName}" 到OSS...`);
    const ossUrl = await uploadToOSS(audioBuffer, fileName, 'audio/wav');
    console.log(`✅ OSS上传成功: ${ossUrl}`);
    
    // 4. 保存到数据库
    const song = new Song({
      title: `AI生成: ${prompt.substring(0, 50)}`,
      artist: 'MusicGen AI',
      fileName: fileName,
      filePath: ossUrl,
      coverPath: '/default-cover.jpg',
      duration: duration,
      isPublic: false,
      uploadedBy: req.user.id,
      isAIGenerated: true,
      aiPrompt: prompt,
      withVocals: true, // MusicGen默认生成带人声的
    });
    
    await song.save();
    console.log(`💾 AI歌曲 "${song.title}" 已保存到数据库`);
    
    // 5. 返回成功响应
    res.json({
      success: true,
      message: 'AI歌曲生成成功！',
      song: song,
    });
    
  } catch (error) {
    console.error('❌ AI歌曲生成流程失败:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'AI歌曲生成失败，请稍后重试',
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
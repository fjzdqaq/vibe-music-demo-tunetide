const express = require('express');
const router = express.Router();
const PlayQueue = require('../models/PlayQueue');
const Song = require('../models/Song');
const { requireAuth } = require('../middleware/auth');

// 获取用户的播放队列
router.get('/', requireAuth, async (req, res) => {
  try {
    const queueItems = await PlayQueue.find({ userId: req.user._id })
      .populate('songId', 'title artist coverUrl duration audioUrl')
      .sort({ addedAt: -1 }) // 按添加时间倒序
      .limit(100); // 限制返回最近100首歌曲
    
    res.json({
      success: true,
      data: queueItems.map(item => ({
        _id: item._id,
        song: item.songId,
        addedType: item.addedType,
        addedAt: item.addedAt,
        playedAt: item.playedAt
      }))
    });
  } catch (error) {
    console.error('获取播放队列失败:', error);
    res.status(500).json({
      success: false,
      message: '获取播放队列失败'
    });
  }
});

// 手动添加歌曲到播放队列
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json({
        success: false,
        message: '歌曲ID不能为空'
      });
    }
    
    // 检查歌曲是否存在
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: '歌曲不存在'
      });
    }
    
    // 检查是否已经在队列中（最近1小时内添加的相同歌曲）
    const recentDuplicate = await PlayQueue.findOne({
      userId: req.user._id,
      songId: songId,
      addedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // 1小时内
    });
    
    if (recentDuplicate) {
      return res.status(400).json({
        success: false,
        message: '歌曲已在播放队列中'
      });
    }
    
    // 添加到播放队列
    const queueItem = new PlayQueue({
      userId: req.user._id,
      songId: songId,
      addedType: 'manual'
    });
    
    await queueItem.save();
    
    res.json({
      success: true,
      message: '歌曲已添加到播放队列'
    });
  } catch (error) {
    console.error('添加歌曲到播放队列失败:', error);
    res.status(500).json({
      success: false,
      message: '添加歌曲到播放队列失败'
    });
  }
});

// 记录播放历史
router.post('/played', requireAuth, async (req, res) => {
  try {
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json({
        success: false,
        message: '歌曲ID不能为空'
      });
    }
    
    // 检查歌曲是否存在
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: '歌曲不存在'
      });
    }
    
    // 添加播放历史到队列
    const queueItem = new PlayQueue({
      userId: req.user._id,
      songId: songId,
      addedType: 'played',
      playedAt: new Date()
    });
    
    await queueItem.save();
    
    res.json({
      success: true,
      message: '播放历史已记录'
    });
  } catch (error) {
    console.error('记录播放历史失败:', error);
    res.status(500).json({
      success: false,
      message: '记录播放历史失败'
    });
  }
});

// 从播放队列中移除歌曲
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const queueItem = await PlayQueue.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!queueItem) {
      return res.status(404).json({
        success: false,
        message: '队列项不存在'
      });
    }
    
    res.json({
      success: true,
      message: '已从播放队列中移除'
    });
  } catch (error) {
    console.error('从播放队列移除歌曲失败:', error);
    res.status(500).json({
      success: false,
      message: '从播放队列移除歌曲失败'
    });
  }
});

// 清空播放队列
router.delete('/', requireAuth, async (req, res) => {
  try {
    await PlayQueue.deleteMany({ userId: req.user._id });
    
    res.json({
      success: true,
      message: '播放队列已清空'
    });
  } catch (error) {
    console.error('清空播放队列失败:', error);
    res.status(500).json({
      success: false,
      message: '清空播放队列失败'
    });
  }
});

module.exports = router; 
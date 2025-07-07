const express = require('express');
const EmotionCapsule = require('../models/EmotionCapsule');
const { requireAuth } = require('../middleware/auth');
const { getBeijingTime, isInBeijingFuture, formatBeijingTime } = require('../utils/timeUtils');

const router = express.Router();

// 获取用户的情绪胶囊列表
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query; // 'locked', 'unlocked', 'all'
    
    let query = { userId: req.user._id };
    
    if (status === 'locked') {
      query.isUnlocked = false;
    } else if (status === 'unlocked') {
      query.isUnlocked = true;
    }

    const capsules = await EmotionCapsule.find(query)
      .populate('songId', 'title artist coverUrl audioUrl duration')
      .sort({ createdAt: -1 });

    res.json(capsules);
  } catch (error) {
    console.error('获取情绪胶囊列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取即将解锁的胶囊 - 必须在 /:id 路由之前
router.get('/upcoming/unlock', requireAuth, async (req, res) => {
  try {
    const beijingNow = getBeijingTime();
    const beijingNextWeek = new Date(beijingNow.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 查询在北京时间接下来一周内解锁的胶囊
    const upcomingCapsules = await EmotionCapsule.find({
      userId: req.user._id,
      isUnlocked: false,
      unlockTime: { 
        $gte: new Date(beijingNow.getTime() - 8 * 60 * 60 * 1000), // 转换为UTC时间查询
        $lte: new Date(beijingNextWeek.getTime() - 8 * 60 * 60 * 1000)
      }
    })
    .populate('songId', 'title artist coverUrl audioUrl duration')
    .sort({ unlockTime: 1 });

    console.log('即将解锁的胶囊查询:', {
      beijingNow: formatBeijingTime(beijingNow),
      beijingNextWeek: formatBeijingTime(beijingNextWeek),
      found: upcomingCapsules.length
    });

    res.json(upcomingCapsules);
  } catch (error) {
    console.error('获取即将解锁的胶囊错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个情绪胶囊
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const capsule = await EmotionCapsule.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('songId', 'title artist coverUrl audioUrl duration');

    if (!capsule) {
      return res.status(404).json({ message: '情绪胶囊不存在' });
    }

    // 如果胶囊还未解锁，检查是否到期
    if (!capsule.isUnlocked && new Date() >= capsule.unlockTime) {
      await capsule.unlock();
      console.log('胶囊自动解锁:', {
        capsuleId: capsule._id,
        unlockTime: capsule.unlockTime,
        currentTime: new Date()
      });
    }

    res.json(capsule);
  } catch (error) {
    console.error('获取情绪胶囊错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新的情绪胶囊
router.post('/', requireAuth, async (req, res) => {
  try {
    const { songId, emotionText, unlockTime } = req.body;

    // 基本验证
    if (!songId) {
      return res.status(400).json({ message: '歌曲ID不能为空' });
    }

    if (!emotionText || !emotionText.trim()) {
      return res.status(400).json({ message: '心情文字不能为空' });
    }

    if (!unlockTime) {
      return res.status(400).json({ message: '解锁时间不能为空' });
    }

    // 验证解锁时间
    const unlockDate = new Date(unlockTime);
    if (isNaN(unlockDate.getTime())) {
      return res.status(400).json({ message: '解锁时间格式无效' });
    }

    // 检查解锁时间是否在未来（直接比较UTC时间）
    if (unlockDate <= new Date()) {
      return res.status(400).json({ message: '解锁时间必须在未来' });
    }

    // 创建情绪胶囊
    const capsule = new EmotionCapsule({
      userId: req.user._id,
      songId,
      emotionText: emotionText.trim(),
      unlockTime: unlockDate, // unlockDate已经是正确的UTC Date对象
      isUnlocked: false
    });

    await capsule.save();

    // 返回创建的胶囊信息
    const populatedCapsule = await EmotionCapsule.findById(capsule._id)
      .populate('songId', 'title artist coverUrl audioUrl duration');

    console.log('情绪胶囊创建成功:', {
      userId: req.user._id,
      songTitle: populatedCapsule.songId?.title,
      unlockTime: formatBeijingTime(unlockDate)
    });

    res.status(201).json({
      message: '情绪胶囊创建成功',
      capsule: populatedCapsule
    });
  } catch (error) {
    console.error('创建情绪胶囊错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 解锁情绪胶囊
router.put('/:id/unlock', requireAuth, async (req, res) => {
  try {
    const capsule = await EmotionCapsule.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!capsule) {
      return res.status(404).json({ message: '情绪胶囊不存在' });
    }

    // 检查是否已经解锁
    if (capsule.isUnlocked) {
      return res.status(400).json({ message: '胶囊已经解锁' });
    }

    // 检查是否可以解锁（时间是否到达）
    const beijingNow = getBeijingTime();
    const unlockBeijingTime = new Date(capsule.unlockTime.getTime() + 8 * 60 * 60 * 1000);
    
    if (beijingNow < unlockBeijingTime) {
      return res.status(400).json({ 
        message: '解锁时间未到',
        unlockTime: formatBeijingTime(unlockBeijingTime),
        currentTime: formatBeijingTime(beijingNow)
      });
    }

    // 解锁胶囊
    await capsule.unlock();

    const updatedCapsule = await EmotionCapsule.findById(capsule._id)
      .populate('songId', 'title artist coverUrl audioUrl duration');

    console.log('情绪胶囊解锁成功:', {
      capsuleId: capsule._id,
      userId: req.user._id,
      unlockTime: formatBeijingTime(beijingNow)
    });

    res.json({
      message: '情绪胶囊解锁成功',
      capsule: updatedCapsule
    });
  } catch (error) {
    console.error('解锁情绪胶囊错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新情绪胶囊（仅未解锁的）
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { emotionText, unlockTime } = req.body;

    const capsule = await EmotionCapsule.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!capsule) {
      return res.status(404).json({ message: '情绪胶囊不存在' });
    }

    if (capsule.isUnlocked) {
      return res.status(400).json({ message: '已解锁的胶囊不能修改' });
    }

    if (emotionText) capsule.emotionText = emotionText;
    if (unlockTime) {
      const unlockDate = new Date(unlockTime);
      
      // 检查解锁时间是否在未来
      if (unlockDate <= new Date()) {
        return res.status(400).json({ 
          message: '解锁时间必须在未来'
        });
      }
      
      capsule.unlockTime = unlockDate;
    }

    await capsule.save();

    const updatedCapsule = await EmotionCapsule.findById(capsule._id)
      .populate('songId', 'title artist coverUrl audioUrl duration');

    res.json({
      message: '情绪胶囊更新成功',
      capsule: updatedCapsule
    });
  } catch (error) {
    console.error('更新情绪胶囊错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除情绪胶囊
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const capsule = await EmotionCapsule.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!capsule) {
      return res.status(404).json({ message: '情绪胶囊不存在' });
    }

    console.log('情绪胶囊删除成功:', {
      capsuleId: req.params.id,
      userId: req.user._id
    });

    res.json({ message: '情绪胶囊删除成功' });
  } catch (error) {
    console.error('删除情绪胶囊错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 
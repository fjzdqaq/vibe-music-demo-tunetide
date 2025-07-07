const express = require('express');
const User = require('../models/User');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const EmotionCapsule = require('../models/EmotionCapsule');
const { requireAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// 获取数据库统计信息
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSongs = await Song.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const publicSongs = await Song.countDocuments({ scope: 'public' });
    const privateSongs = await Song.countDocuments({ scope: 'private' });
    
    // 获取最近注册的用户
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // 获取最近上传的歌曲
    const recentSongs = await Song.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('uploadedBy', 'username');
    
    res.json({
      stats: {
        totalUsers,
        totalSongs,
        totalAdmins,
        publicSongs,
        privateSongs,
        regularUsers: totalUsers - totalAdmins
      },
      recentUsers,
      recentSongs
    });
  } catch (error) {
    console.error('获取系统统计信息失败:', error);
    res.status(500).json({ message: '获取统计信息失败', error: error.message });
  }
});

// 获取所有用户（隐藏密码）
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * pageSize;
    
    // 构建查询条件
    let query = {};
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = { username: searchRegex };
    }
    
    // 获取用户列表
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    
    // 获取总数
    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);
    
    res.json({
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: pageSize,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

// 获取所有歌曲
router.get('/songs', async (req, res) => {
  try {
    const songs = await Song.find({}).sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    console.error('获取歌曲列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有播放列表
router.get('/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find({})
      .populate('userId', 'username')
      .populate('songs', 'title artist')
      .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    console.error('获取播放列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有情绪胶囊
router.get('/emotion-capsules', async (req, res) => {
  try {
    const capsules = await EmotionCapsule.find({})
      .populate('userId', 'username')
      .populate('songId', 'title artist')
      .sort({ createdAt: -1 });
    res.json(capsules);
  } catch (error) {
    console.error('获取情绪胶囊列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取完整的数据库快照
router.get('/database', async (req, res) => {
  try {
    const [users, songs, playlists, emotionCapsules] = await Promise.all([
      User.find({}, '-passwordHash').sort({ createdAt: -1 }),
      Song.find({}).sort({ createdAt: -1 }),
      Playlist.find({}).populate('userId', 'username').populate('songs', 'title artist').sort({ createdAt: -1 }),
      EmotionCapsule.find({}).populate('userId', 'username').populate('songId', 'title artist').sort({ createdAt: -1 })
    ]);

    const database = {
      users: {
        count: users.length,
        data: users
      },
      songs: {
        count: songs.length,
        data: songs
      },
      playlists: {
        count: playlists.length,
        data: playlists
      },
      emotionCapsules: {
        count: emotionCapsules.length,
        data: emotionCapsules
      },
      lastUpdated: new Date().toISOString()
    };

    res.json(database);
  } catch (error) {
    console.error('获取数据库快照失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户详情
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 获取用户的歌曲数量
    const songCount = await Song.countDocuments({ uploadedBy: user._id });
    
    res.json({
      user,
      stats: {
        songCount
      }
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ message: '获取用户详情失败', error: error.message });
  }
});

// 删除用户
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 不能删除管理员自己
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: '不能删除自己的账户' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 删除用户上传的歌曲
    await Song.deleteMany({ uploadedBy: userId });
    
    // 删除用户
    await User.findByIdAndDelete(userId);
    
    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ message: '删除用户失败', error: error.message });
  }
});

// 切换用户管理员状态
router.patch('/users/:id/toggle-admin', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 不能修改自己的管理员状态
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: '不能修改自己的管理员状态' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    user.isAdmin = !user.isAdmin;
    await user.save();
    
    res.json({ 
      message: user.isAdmin ? '用户已设为管理员' : '用户管理员权限已移除',
      user 
    });
  } catch (error) {
    console.error('切换用户管理员状态失败:', error);
    res.status(500).json({ message: '操作失败', error: error.message });
  }
});

module.exports = router; 
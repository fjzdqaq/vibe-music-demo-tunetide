const express = require('express');
const Song = require('../models/Song');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// 获取所有歌曲（智能过滤、支持搜索和分页）
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      q, // 搜索关键词
      page = 1, // 页码
      limit = 20, // 每页数量
      sortBy = 'createdAt', // 排序字段
      order = 'desc' // 排序方向
    } = req.query;

    const user = req.user; // 从可选的认证中间件获取用户信息
    
    // 构建基本查询条件
    let query = {};
    
    if (user && user.isAdmin) {
      // 管理员可以看到所有歌曲，不需要任何过滤
      query = {};
    } else if (user) {
      // 普通用户：公共歌曲 + 自己的私有歌曲
      query = {
        $or: [
          { scope: 'public' },
          { uploadedBy: new mongoose.Types.ObjectId(user._id) }
        ]
      };
    } else {
      // 游客：只能看到公共歌曲
      query = { scope: 'public' };
    }

    // 添加搜索条件
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i'); // 不区分大小写搜索
      const searchConditions = [
        { title: searchRegex },
        { artist: searchRegex }
      ];
      
      // 如果原有查询条件，需要与搜索条件合并
      if (Object.keys(query).length > 0 && query.$or) {
        query = {
          $and: [
            { $or: query.$or }, // 原有的权限查询
            { $or: searchConditions } // 搜索条件
          ]
        };
      } else {
        // 管理员或没有权限限制时，直接应用搜索条件
        query = { $or: searchConditions };
      }
    }

    // 分页参数
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit))); // 限制每页最多50条
    const skip = (pageNumber - 1) * pageSize;

    // 排序参数
    const sortField = ['createdAt', 'title', 'artist', 'duration'].includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortOrder };

    // 获取总数（用于计算分页）
    const totalCount = await Song.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    // 获取歌曲列表
    const songs = await Song.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize)
      .populate('uploadedBy', 'username'); // 填充上传者信息

    res.json({
      songs,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: pageSize,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      },
      search: q ? { query: q.trim(), resultsCount: totalCount } : null
    });
  } catch (error) {
    console.error('获取歌曲列败:', error);
    res.status(500).json({ 
      message: '获取歌曲失败', 
      error: error.message 
    });
  }
});

// 根据ID获取单首歌曲
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: '歌曲不存在' });
    }
    res.json(song);
  } catch (error) {
    console.error('获取歌曲错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加新歌曲（需要认证）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, artist, coverUrl, audioUrl, duration } = req.body;
    
    // 验证必填字段
    if (!title || !artist || !audioUrl) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要字段：title, artist, audioUrl' 
      });
    }

    // 创建歌曲对象
    const songData = {
      title: title.trim(),
      artist: artist.trim(),
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      audioUrl: audioUrl,
      duration: duration || 0,
      uploadedBy: req.user.id
    };

    const song = new Song(songData);
    await song.save();

    res.json({
      success: true,
      message: '歌曲创建成功',
      song: {
        id: song._id,
        title: song.title,
        artist: song.artist,
        coverUrl: song.coverUrl,
        audioUrl: song.audioUrl,
        duration: song.duration
      }
    });
  } catch (error) {
    console.error('创建歌曲失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '创建歌曲失败' 
    });
  }
});

// 更新歌曲信息（需要认证）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, artist, coverUrl, audioUrl, duration } = req.body;
    
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { title, artist, coverUrl, audioUrl, duration },
      { new: true, runValidators: true }
    );

    if (!song) {
      return res.status(404).json({ message: '歌曲不存在' });
    }

    res.json({
      message: '歌曲更新成功',
      song
    });
  } catch (error) {
    console.error('更新歌曲错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除歌曲（需要认证）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: '歌曲不存在' });
    }

    res.json({ message: '歌曲删除成功' });
  } catch (error) {
    console.error('删除歌曲错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 
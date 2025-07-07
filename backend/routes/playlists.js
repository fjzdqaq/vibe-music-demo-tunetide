const express = require('express');
const Playlist = require('../models/Playlist');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// 获取用户的播放列表
router.get('/', requireAuth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id })
      .populate('songs', 'title artist coverUrl audioUrl duration')
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    console.error('获取播放列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 根据ID获取单个播放列表
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('songs', 'title artist coverUrl audioUrl duration');

    if (!playlist) {
      return res.status(404).json({ message: '播放列表不存在' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('获取播放列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新播放列表
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: '播放列表名称不能为空' });
    }

    const playlist = new Playlist({
      userId: req.user._id,
      name,
      description: description || '',
      songs: []
    });

    await playlist.save();

    res.status(201).json({
      message: '播放列表创建成功',
      playlist
    });
  } catch (error) {
    console.error('创建播放列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新播放列表
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, songs } = req.body;
    
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ message: '播放列表不存在' });
    }

    if (name) playlist.name = name;
    if (songs) playlist.songs = songs;

    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id)
      .populate('songs', 'title artist coverUrl audioUrl duration');

    res.json({
      message: '播放列表更新成功',
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('更新播放列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 向播放列表添加歌曲
router.post('/:id/songs', requireAuth, async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: '歌曲ID不能为空' });
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ message: '播放列表不存在' });
    }

    // 检查歌曲是否已存在
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: '歌曲已在播放列表中' });
    }

    playlist.songs.push(songId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id)
      .populate('songs', 'title artist coverUrl audioUrl duration');

    res.json({
      message: '歌曲添加成功',
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('添加歌曲错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 从播放列表删除歌曲
router.delete('/:id/songs/:songId', requireAuth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ message: '播放列表不存在' });
    }

    playlist.songs = playlist.songs.filter(
      songId => songId.toString() !== req.params.songId
    );
    
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(playlist._id)
      .populate('songs', 'title artist coverUrl audioUrl duration');

    res.json({
      message: '歌曲删除成功',
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('删除歌曲错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除播放列表
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ message: '播放列表不存在' });
    }

    res.json({ message: '播放列表删除成功' });
  } catch (error) {
    console.error('删除播放列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 
const mongoose = require('mongoose');

const playQueueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  addedType: {
    type: String,
    enum: ['played', 'manual'], // played: 播放历史, manual: 手动添加
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  playedAt: {
    type: Date, // 如果是播放历史，记录播放时间
    default: null
  }
});

// 创建复合索引，确保用户的播放队列按时间排序
playQueueSchema.index({ userId: 1, addedAt: -1 });

module.exports = mongoose.model('PlayQueue', playQueueSchema); 
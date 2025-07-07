const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  coverUrl: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // 秒数
    required: true
  },
  scope: {
    type: String,
    enum: ['public', 'private'],
    default: 'private',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 添加文本搜索索引
songSchema.index({ title: 'text', artist: 'text' });

module.exports = mongoose.model('Song', songSchema); 
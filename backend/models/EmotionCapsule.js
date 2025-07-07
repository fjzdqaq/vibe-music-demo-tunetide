const mongoose = require('mongoose');

const emotionCapsuleSchema = new mongoose.Schema({
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
  emotionText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  unlockTime: {
    type: Date,
    required: true
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  unlockedAt: {
    type: Date
  }
});

// 添加索引优化查询
emotionCapsuleSchema.index({ userId: 1, unlockTime: 1 });
emotionCapsuleSchema.index({ unlockTime: 1, isUnlocked: 1 });

// 解锁胶囊的方法
emotionCapsuleSchema.methods.unlock = function() {
  this.isUnlocked = true;
  this.unlockedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('EmotionCapsule', emotionCapsuleSchema); 
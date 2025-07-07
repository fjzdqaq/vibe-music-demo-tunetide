const EmotionCapsule = require('../models/EmotionCapsule');
const { getBeijingTime, isInBeijingFuture, formatBeijingTime } = require('./timeUtils');

const checkUnlockCapsules = async () => {
  try {
    const beijingNow = getBeijingTime();
    console.log('检查胶囊解封（北京时间）:', formatBeijingTime(beijingNow));

    // 查找所有未解锁且已到期的胶囊（使用UTC时间查询数据库）
    const expiredCapsules = await EmotionCapsule.find({
      isUnlocked: false,
      unlockTime: { $lte: new Date(beijingNow.getTime() - 8 * 60 * 60 * 1000) } // 转换为UTC时间
    }).populate('songId', 'title artist');

    if (expiredCapsules.length === 0) {
      console.log('没有需要解锁的胶囊');
      return;
    }

    console.log(`发现 ${expiredCapsules.length} 个到期胶囊，开始解锁...`);

    for (const capsule of expiredCapsules) {
      try {
        await capsule.unlock();
        console.log('胶囊解锁成功:', {
          capsuleId: capsule._id,
          songTitle: capsule.songId?.title,
          unlockTime: formatBeijingTime(capsule.unlockTime),
          currentTime: formatBeijingTime(beijingNow)
        });
      } catch (error) {
        console.error('解锁胶囊失败:', capsule._id, error);
      }
    }

    console.log(`胶囊解锁完成，共解锁 ${expiredCapsules.length} 个胶囊`);
  } catch (error) {
    console.error('检查胶囊解封失败:', error);
  }
};

module.exports = {
  checkUnlockCapsules
}; 
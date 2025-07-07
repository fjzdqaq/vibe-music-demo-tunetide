const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { uploadFiles, handleUploadError } = require('../middleware/upload');
const { uploadToOSS } = require('../utils/ossUpload');

// 上传音乐文件
router.post('/music', requireAuth, uploadFiles, async (req, res) => {
  try {
    console.log('收到音乐上传请求');
    console.log('文件信息:', req.files);
    console.log('表单数据:', req.body);

    // 检查必填字段
    if (!req.body.title || !req.body.artist) {
      return res.status(400).json({
        success: false,
        message: '请提供歌曲标题和艺术家'
      });
    }

    if (!req.files || !req.files.audioFile || !req.files.audioFile[0]) {
      return res.status(400).json({
        success: false,
        message: '请选择音频文件'
      });
    }

    console.log('开始上传文件到OSS', {
      audioFile: req.files.audioFile[0].originalname,
      coverFile: req.files.coverFile?.[0]?.originalname,
      title: req.body.title,
      artist: req.body.artist,
      isAdmin: req.user.isAdmin
    });

    // 准备文件对象
    const audioFile = req.files.audioFile[0];
    const coverFile = req.files.coverFile?.[0] || null;

    // 确定歌曲可见性：管理员上传的歌曲默认为公共，普通用户为私有
    const scope = req.user.isAdmin ? 'public' : 'private';

    // 上传到OSS
    const uploadResult = await uploadToOSS({
      audioFile,
      coverFile,
      title: req.body.title.trim(),
      artist: req.body.artist.trim(),
      uploadedBy: req.user._id,
      scope
    });

    console.log('文件上传成功', uploadResult);

    res.json({
      success: true,
      message: `上传成功${req.user.isAdmin ? '（公共可见）' : '（私有）'}`,
      data: uploadResult
    });

  } catch (error) {
    console.error('上传处理失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '上传失败，请重试'
    });
  }
});

// 获取上传进度（占位符）
router.get('/progress/:uploadId', requireAuth, (req, res) => {
  // 简单的进度响应
  res.json({
    success: true,
    progress: 100,
    status: 'completed'
  });
});

// 取消上传（占位符）
router.delete('/cancel/:uploadId', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: '上传已取消'
  });
});

// 使用错误处理中间件
router.use(handleUploadError);

module.exports = router; 
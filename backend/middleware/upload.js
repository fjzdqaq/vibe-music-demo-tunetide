const multer = require('multer');
const path = require('path');

// 配置multer存储
const storage = multer.memoryStorage(); // 使用内存存储，不保存到磁盘

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的音频文件类型
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/mp4', 'audio/ogg', 'audio/aac'];
  // 允许的图片文件类型
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  const allowedTypes = [...allowedAudioTypes, ...allowedImageTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB限制
    files: 2, // 最多2个文件（音频+封面）
  },
  fileFilter: fileFilter
});

// 导出上传中间件
module.exports = {
  // 多个文件（音频+封面）
  uploadFiles: upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'coverFile', maxCount: 1 }
  ]),
  
  // 错误处理中间件
  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: '文件太大，请选择小于100MB的文件'
        });
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: '文件数量超出限制'
        });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: '意外的文件字段'
        });
      }
    }

    if (err.message.includes('不支持的文件类型')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    console.error('上传错误:', err);
    res.status(500).json({
      success: false,
      message: '文件上传失败'
    });
  }
}; 
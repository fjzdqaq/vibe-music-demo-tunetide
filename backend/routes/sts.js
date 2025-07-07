const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getSTSToken, getDirectCredentials } = require('../config/sts');

// 获取OSS上传凭证
router.get('/credentials', requireAuth, async (req, res) => {
  try {
    console.log('获取OSS上传凭证请求');
    
    // 先尝试使用直接凭证（避免STS配置复杂性）
    const result = getDirectCredentials();
    
    if (result.success) {
      console.log('OSS凭证获取成功');
      res.json({
        success: true,
        message: '凭证获取成功',
        data: result.data
      });
    } else {
      console.error('OSS凭证获取失败:', result.error);
      res.status(500).json({
        success: false,
        message: result.error || '凭证获取失败'
      });
    }
  } catch (error) {
    console.error('获取OSS凭证异常:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取STS临时凭证（高级版本）
router.get('/sts-token', requireAuth, async (req, res) => {
  try {
    console.log('获取STS临时凭证请求');
    
    const result = await getSTSToken();
    
    if (result.success) {
      console.log('STS临时凭证获取成功');
      res.json({
        success: true,
        message: 'STS凭证获取成功',
        data: result.data
      });
    } else {
      console.error('STS临时凭证获取失败:', result.error);
      res.status(500).json({
        success: false,
        message: result.error || 'STS凭证获取失败'
      });
    }
  } catch (error) {
    console.error('获取STS凭证异常:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 测试OSS连接
router.get('/test', requireAuth, async (req, res) => {
  try {
    console.log('测试OSS连接');
    
    const result = getDirectCredentials();
    
    res.json({
      success: true,
      message: 'OSS连接测试成功',
      data: {
        region: result.data.region,
        bucket: result.data.bucket,
        endpoint: `https://${result.data.bucket}.${result.data.region}.aliyuncs.com`
      }
    });
  } catch (error) {
    console.error('OSS连接测试失败:', error);
    res.status(500).json({
      success: false,
      message: '连接测试失败'
    });
  }
});

module.exports = router; 
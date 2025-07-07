const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-here';

// 可选认证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // 没有token，继续处理（可选认证）
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(); // 用户不存在，继续处理（可选认证）
    }
    
    req.user = user;
    next();
  } catch (error) {
    return next(); // token无效，继续处理（可选认证）
  }
};

// 强制认证中间件
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供访问令牌' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: '令牌无效' });
  }
};

// 管理员权限中间件
const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供访问令牌' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ message: '需要管理员权限' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: '令牌无效' });
  }
};

module.exports = {
  authenticateToken,
  requireAuth,
  requireAdmin
}; 
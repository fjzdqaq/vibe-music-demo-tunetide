import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // 在加载用户信息时，可以显示一个加载指示器
    return <div>加载中...</div>;
  }

  if (!user) {
    // 如果用户未登录，重定向到登录页，并记录他们想访问的页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 
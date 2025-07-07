import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('认证检查失败:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  // 登录
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, userId, username } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, username }));
      
      setToken(token);
      setUser({ userId, username });
      
      return { success: true, user: { userId, username } };
    } catch (error) {
      console.error('登录失败:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || '登录失败' 
      };
    }
  };

  // 注册
  const register = async (credentials) => {
    try {
      const response = await authAPI.register(credentials);
      const { token, userId, username } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, username }));
      
      setToken(token);
      setUser({ userId, username });
      
      return { success: true, user: { userId, username } };
    } catch (error) {
      console.error('注册失败:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || '注册失败' 
      };
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // 检查是否已认证
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
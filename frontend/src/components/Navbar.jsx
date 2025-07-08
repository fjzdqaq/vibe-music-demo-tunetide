import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ListMusic, Clock, Upload, User, LogOut, Shield, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getLinkClass = ({ isActive }) => 
    `flex items-center space-x-2 px-4 py-2 text-gray-700 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-primary-100 text-primary-700 font-semibold' : 'hover:bg-gray-100'
    }`;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary-600">TuneTide</h1>
        </div>

        {/* 主导航 */}
        <nav className="flex items-center space-x-6">
          <NavLink to="/" className={getLinkClass}>
            <Home className="w-5 h-5" />
            <span>主页</span>
          </NavLink>
          <NavLink to="/playlists" className={getLinkClass}>
            <Heart className="w-5 h-5" />
            <span>喜欢列表</span>
          </NavLink>
          <NavLink to="/capsules" className={getLinkClass}>
            <Clock className="w-5 h-5" />
            <span>情绪胶囊</span>
          </NavLink>
          <NavLink to="/upload" className={getLinkClass}>
            <Upload className="w-5 h-5" />
            <span>上传音乐</span>
          </NavLink>
          {user && user.isAdmin && (
            <NavLink to="/admin" className={getLinkClass}>
              <Shield className="w-5 h-5" />
              <span>管理员</span>
            </NavLink>
          )}
        </nav>

        {/* 用户区域 */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <NavLink 
                to="/profile" 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-sm">
                  {user.username}
                  {user.isAdmin && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                      管理员
                    </span>
                  )}
                </span>
              </NavLink>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-sm">退出登录</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <NavLink to="/login" className="btn btn-ghost">登录</NavLink>
              <NavLink to="/register" className="btn btn-primary">注册</NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar; 
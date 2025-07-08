import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Clock, Upload, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getLinkClass = ({ isActive }) => 
    `flex items-center space-x-4 px-4 py-3 text-gray-700 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-primary-100 text-primary-700 font-semibold' : 'hover:bg-gray-100'
    }`;

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-600">TuneTide</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">菜单</p>
        <NavLink to="/" className={getLinkClass}>
          <Home className="w-5 h-5" />
          <span>主页</span>
        </NavLink>
        <NavLink to="/search" className={getLinkClass}>
          <Search className="w-5 h-5" />
          <span>搜索</span>
        </NavLink>
        
        <p className="px-4 pt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">音乐库</p>
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
      </nav>

      <div className="mt-auto">
        {user ? (
          <div className="space-y-2">
            <NavLink to="/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-sm">{user.username}</span>
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 p-2 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">退出登录</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
             <NavLink to="/login" className="btn btn-primary w-full">登录</NavLink>
             <NavLink to="/register" className="btn btn-ghost w-full">注册</NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
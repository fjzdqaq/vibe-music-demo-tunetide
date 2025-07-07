import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Calendar, Music, Clock, ListMusic, Edit } from 'lucide-react';
import { songAPI, playlistAPI, capsuleAPI } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    songsCount: 0,
    playlistsCount: 0,
    capsulesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const [playlistsRes, capsulesRes] = await Promise.all([
        playlistAPI.getPlaylists(),
        capsuleAPI.getCapsules()
      ]);

      setStats({
        songsCount: 0, // 暂时设置为0，因为需要用户上传的歌曲统计
        playlistsCount: playlistsRes.data?.length || 0,
        capsulesCount: capsulesRes.data?.length || 0
      });
    } catch (error) {
      console.error('获取用户统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">请先登录查看个人信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-500">TuneTide 用户</p>
              {user.createdAt && (
                <div className="flex items-center space-x-1 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    加入时间: {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
            <span>编辑资料</span>
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">播放列表</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.playlistsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">情绪胶囊</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.capsulesCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">上传歌曲</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.songsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 账户设置 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">账户设置</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">用户名</p>
              <p className="text-sm text-gray-500">{user.username}</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              修改
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">密码</p>
              <p className="text-sm text-gray-500">上次修改时间: 未知</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              修改密码
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">删除账户</p>
              <p className="text-sm text-gray-500">永久删除您的账户和所有数据</p>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              删除账户
            </button>
          </div>
        </div>
      </div>

      {/* 退出登录按钮 */}
      <div className="mt-6 text-center">
        <button
          onClick={logout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default Profile; 
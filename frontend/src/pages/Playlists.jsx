import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { Music, Plus, Play, Trash2, X } from 'lucide-react';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取播放列表
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistAPI.getPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('获取播放列表失败:', error);
      setError('获取播放列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建播放列表
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setError('播放列表名称不能为空');
      return;
    }

    try {
      setCreateLoading(true);
      setError('');
      const response = await playlistAPI.createPlaylist({ 
        name: createForm.name.trim(),
        description: createForm.description.trim() 
      });
      
      // 添加到本地状态
      setPlaylists(prev => [response.data.playlist, ...prev]);
      
      // 重置表单和关闭模态框
      setCreateForm({ name: '', description: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('创建播放列表失败:', error);
      setError(error.response?.data?.message || '创建播放列表失败');
    } finally {
      setCreateLoading(false);
    }
  };

  // 删除播放列表
  const handleDeletePlaylist = async (playlistId, playlistName) => {
    if (!confirm(`确定要删除播放列表"${playlistName}"吗？`)) {
      return;
    }

    try {
      await playlistAPI.deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p._id !== playlistId));
    } catch (error) {
      console.error('删除播放列表失败:', error);
      setError('删除播放列表失败');
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setShowCreateModal(false);
    setCreateForm({ name: '', description: '' });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          我的播放列表
        </h1>
        <p className="text-xl text-gray-600">
          管理您的音乐收藏
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={() => setError('')}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            关闭
          </button>
        </div>
      )}

      {/* 创建播放列表按钮 */}
      <div className="mb-8">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>创建播放列表</span>
        </button>
      </div>

      {/* 播放列表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlists.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">还没有播放列表</p>
            <p className="text-sm text-gray-400">点击上方按钮创建您的第一个播放列表</p>
          </div>
        ) : (
          playlists.map((playlist) => (
            <div key={playlist._id} className="card p-6 hover:shadow-md transition-shadow">
              {/* 播放列表封面 */}
              <div className="w-full h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>

              {/* 播放列表信息 */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {playlist.name}
                </h3>
                {playlist.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {playlist.description}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {playlist.songs?.length || 0} 首歌曲
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  创建于 {new Date(playlist.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between">
                <Link 
                  to={`/playlists/${playlist._id}`}
                  className="btn btn-secondary text-sm flex items-center space-x-1"
                >
                  <Play className="w-4 h-4" />
                  <span>查看</span>
                </Link>
                
                <button
                  onClick={() => handleDeletePlaylist(playlist._id, playlist.name)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="删除播放列表"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建播放列表模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">创建播放列表</h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label htmlFor="playlistName" className="block text-sm font-medium text-gray-700 mb-2">
                  播放列表名称
                </label>
                <input
                  id="playlistName"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="input"
                  placeholder="给你的播放列表起个名字..."
                  autoFocus
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.name.length}/50 字符
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="playlistDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  播放列表描述
                </label>
                <textarea
                  id="playlistDescription"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="input"
                  placeholder="描述你的播放列表..."
                  rows="3"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.description.length}/200 字符（可选）
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost"
                  disabled={createLoading}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading || !createForm.name.trim()}
                >
                  {createLoading ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists; 
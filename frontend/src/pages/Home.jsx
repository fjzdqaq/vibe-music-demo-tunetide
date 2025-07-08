import React, { useState, useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { songAPI, playlistAPI, capsuleAPI } from '../services/api';
import { Search, Play, Plus, Clock, X, Calendar, Heart, ListPlus } from 'lucide-react';
import { getBeijingTime, formatBeijingTimeForInput, parseBeijingTimeFromInput, addDaysToBeijingTime } from '../utils/timeUtils';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // 喜欢列表相关状态
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  
  // 情绪胶囊相关状态  
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);
  const [selectedSongForCapsule, setSelectedSongForCapsule] = useState(null);
  const [capsuleForm, setCapsuleForm] = useState({
    emotionText: '',
    unlockTime: ''
  });
  
  const [error, setError] = useState('');
  const { playSong, currentSong, isPlaying, addToPlayQueue } = usePlayer();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchSongs();
  }, [currentPage, debouncedSearchQuery]);

  // 获取用户的喜欢列表
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await songAPI.getSongs({
        q: debouncedSearchQuery,
        page: currentPage,
        limit: 20,
      });
      setSongs(response.data.songs);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalItems(response.data.pagination?.totalItems || 0);
    } catch (error) {
      console.error('获取歌曲失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await playlistAPI.getPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('获取喜欢列表失败:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  const handlePlaySong = (song) => {
    playSong(song, songs);
  };

  // 添加到播放队列
  const handleAddToPlayQueue = async (song) => {
    const success = await addToPlayQueue(song);
    if (success) {
      alert('歌曲已添加到播放队列！');
    } else {
      alert('添加失败，请稍后再试');
    }
  };

  // 添加到喜欢列表
  const handleAddToFavorite = (song) => {
    setSelectedSongForPlaylist(song);
    setShowPlaylistModal(true);
    setError('');
  };

  const addSongToPlaylist = async (playlistId) => {
    try {
      await playlistAPI.addSongToPlaylist(playlistId, selectedSongForPlaylist._id);
      setShowPlaylistModal(false);
      setSelectedSongForPlaylist(null);
      alert('歌曲已添加到喜欢列表！');
    } catch (error) {
      console.error('添加歌曲到喜欢列表失败:', error);
      setError(error.response?.data?.message || '添加失败');
    }
  };

  // 创建情绪胶囊
  const handleCreateCapsule = (song) => {
    setSelectedSongForCapsule(song);
    setShowCapsuleModal(true);
    setError('');
    
    // 设置默认解锁时间为北京时间一周后
    const beijingNow = getBeijingTime();
    const nextWeek = addDaysToBeijingTime(beijingNow, 7);
    
    setCapsuleForm({
      emotionText: '',
      unlockTime: formatBeijingTimeForInput(nextWeek)
    });
  };

  const createCapsule = async (e) => {
    e.preventDefault();
    if (!capsuleForm.emotionText.trim()) {
      setError('请写下您此刻的心情');
      return;
    }

    try {
      // 解析用户输入的北京时间
      const selectedBeijingTime = parseBeijingTimeFromInput(capsuleForm.unlockTime);
      const currentBeijingTime = getBeijingTime();
      
      // 检查时间是否在未来（北京时间比较）
      if (selectedBeijingTime <= currentBeijingTime) {
        setError('解锁时间必须在未来');
        return;
      }
      
      await capsuleAPI.createCapsule({
        songId: selectedSongForCapsule._id,
        emotionText: capsuleForm.emotionText.trim(),
        unlockTime: selectedBeijingTime.toISOString() // 发送UTC时间给后端
      });
      
      setShowCapsuleModal(false);
      setSelectedSongForCapsule(null);
      setCapsuleForm({ emotionText: '', unlockTime: '' });
      alert('情绪胶囊创建成功！');
    } catch (error) {
      console.error('创建情绪胶囊失败:', error);
      setError(error.response?.data?.message || '创建失败');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const closeModals = () => {
    setShowPlaylistModal(false);
    setShowCapsuleModal(false);
    setSelectedSongForPlaylist(null);
    setSelectedSongForCapsule(null);
    setError('');
  };

  if (loading && songs.length === 0) {
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
      {/* 欢迎区域 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          欢迎来到 TuneTide
        </h1>
        <p className="text-xl text-gray-600">
          发现音乐，收藏心情，留住时光
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索歌曲或艺术家..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {loading && debouncedSearchQuery !== searchQuery && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}
        </form>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            {debouncedSearchQuery !== searchQuery 
              ? '正在搜索...' 
              : `搜索：${debouncedSearchQuery}`
            }
          </p>
        )}
      </div>

      {/* 歌曲列表 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {debouncedSearchQuery ? `搜索结果` : '所有歌曲'}
          </h2>
          <div className="text-sm text-gray-500">
            共 {totalItems} 首歌曲
            {debouncedSearchQuery && (
              <span className="ml-2 text-blue-600">
                (搜索结果)
              </span>
            )}
          </div>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {debouncedSearchQuery ? '没有找到相关歌曲' : '暂无歌曲'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <div
                key={song._id}
                className={`flex items-center p-4 rounded-lg hover:bg-gray-50 transition-colors ${
                  currentSong?._id === song._id ? 'bg-primary-50' : ''
                }`}
              >
                {/* 封面 */}
                <div className="w-12 h-12 bg-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {song.title[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* 歌曲信息 */}
                <div className="flex-1 min-w-0 ml-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {song.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {song.artist}
                  </p>
                </div>

                {/* 可见性状态（仅管理员可见） */}
                {user && user.isAdmin && (
                  <div className="mr-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      song.scope === 'public' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {song.scope === 'public' ? '公共' : '私有'}
                    </span>
                  </div>
                )}

                {/* 时长 */}
                <div className="text-sm text-gray-500 mr-4">
                  {formatDuration(song.duration)}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlaySong(song)}
                    className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                    title="播放"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleAddToPlayQueue(song)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="添加到播放队列"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleAddToFavorite(song)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="添加到喜欢列表"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleCreateCapsule(song)}
                    className="p-2 text-gray-400 hover:text-secondary-600 transition-colors"
                    title="创建情绪胶囊"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                第 {currentPage} 页，共 {totalPages} 页
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* 添加到喜欢列表模态框 */}
      {showPlaylistModal && selectedSongForPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">添加到喜欢列表</h2>
              <button onClick={closeModals} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">将添加歌曲：</p>
              <p className="font-medium">{selectedSongForPlaylist.title}</p>
              <p className="text-sm text-gray-500">{selectedSongForPlaylist.artist}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  暂无喜欢列表，请先创建一个喜欢列表
                </p>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist._id}
                    onClick={() => addSongToPlaylist(playlist._id)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      {playlist.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {playlist.songs?.length || 0} 首歌曲
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 创建情绪胶囊模态框 */}
      {showCapsuleModal && selectedSongForCapsule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">创建情绪胶囊</h2>
              <button onClick={closeModals} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">关联歌曲：</p>
              <p className="font-medium">{selectedSongForCapsule.title}</p>
              <p className="text-sm text-gray-500">{selectedSongForCapsule.artist}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={createCapsule}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  此刻的心情
                </label>
                <textarea
                  value={capsuleForm.emotionText}
                  onChange={(e) => setCapsuleForm({...capsuleForm, emotionText: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="4"
                  placeholder="写下您此刻听这首歌的心情..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {capsuleForm.emotionText.length}/1000 字符
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  解锁时间
                </label>
                <input
                  type="datetime-local"
                  value={capsuleForm.unlockTime}
                  onChange={(e) => setCapsuleForm({...capsuleForm, unlockTime: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="btn btn-ghost"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!capsuleForm.emotionText.trim()}
                >
                  创建胶囊
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 
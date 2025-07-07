import React, { useState, useEffect } from 'react';
import { Clock, Plus, Lock, Unlock, X, Heart, Calendar, Music, Play } from 'lucide-react';
import { capsuleAPI, songAPI } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';
import { formatBeijingTimeForDisplay, formatBeijingTimeForInput, addDaysToBeijingTime, getBeijingTime, parseBeijingTimeFromInput } from '../utils/timeUtils';

const Capsules = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'locked', 'unlocked'
  const [error, setError] = useState('');
  
  // 创建胶囊表单
  const [createForm, setCreateForm] = useState({
    songId: '',
    emotionText: '',
    unlockTime: ''
  });
  const [songs, setSongs] = useState([]);
  const [songSearch, setSongSearch] = useState('');
  const [showSongSelector, setShowSongSelector] = useState(false);
  
  const { playSong } = usePlayer();

  useEffect(() => {
    fetchCapsules();
    fetchSongs();
  }, []);

  const fetchCapsules = async () => {
    try {
      setLoading(true);
      const response = await capsuleAPI.getCapsules();
      setCapsules(response.data || []);
    } catch (error) {
      console.error('获取情绪胶囊失败:', error);
      setError('获取情绪胶囊失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = async () => {
    try {
      const response = await songAPI.getSongs({ limit: 100 });
      setSongs(response.data.songs || []);
    } catch (error) {
      console.error('获取歌曲失败:', error);
    }
  };

  const handleCreateCapsule = async (e) => {
    e.preventDefault();
    if (!createForm.emotionText.trim()) {
      setError('请写下您此刻的心情');
      return;
    }
    if (!createForm.songId) {
      setError('请选择一首歌曲');
      return;
    }
    if (!createForm.unlockTime) {
      setError('请设置解锁时间');
      return;
    }

    try {
      // 1. 将用户选择的本地时间字符串转换为Date对象
      const localUnlockDate = new Date(createForm.unlockTime);

      // 2. 转换为标准的UTC ISO字符串再发送
      await capsuleAPI.createCapsule({
        songId: createForm.songId,
        emotionText: createForm.emotionText.trim(),
        unlockTime: localUnlockDate.toISOString(),
      });
      
      setShowCreateModal(false);
      setCreateForm({ songId: '', emotionText: '', unlockTime: '' });
      setError('');
      fetchCapsules();
      alert('情绪胶囊创建成功！');
    } catch (error) {
      console.error('创建情绪胶囊失败:', error);
      setError(error.response?.data?.message || '创建失败');
    }
  };

  const handleDeleteCapsule = async (capsuleId) => {
    if (!confirm('确定要删除这个情绪胶囊吗？')) return;

    try {
      await capsuleAPI.deleteCapsule(capsuleId);
      fetchCapsules();
      alert('情绪胶囊已删除');
    } catch (error) {
      console.error('删除情绪胶囊失败:', error);
      alert('删除失败');
    }
  };

  const handleUnlockCapsule = async (capsuleId) => {
    try {
      await capsuleAPI.unlockCapsule(capsuleId);
      // 重新获取数据以更新UI
      fetchCapsules();
      alert('情绪胶囊已解锁！');
    } catch (error) {
      console.error('解锁情绪胶囊失败:', error);
      alert(error.response?.data?.message || '解锁失败，可能时间还未到');
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setError('');
    // 设置默认解锁时间为一周后
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCreateForm({
      songId: '',
      emotionText: '',
      unlockTime: nextWeek.toISOString().slice(0, 16)
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowSongSelector(false);
    setError('');
  };

  const selectSong = (song) => {
    setCreateForm({...createForm, songId: song._id});
    setShowSongSelector(false);
  };

  const getSelectedSong = () => {
    return songs.find(song => song._id === createForm.songId);
  };

  const filteredCapsules = capsules.filter(capsule => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'locked') return !capsule.isUnlocked;
    if (filterStatus === 'unlocked') return capsule.isUnlocked;
    return true;
  });

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(songSearch.toLowerCase()) ||
    song.artist.toLowerCase().includes(songSearch.toLowerCase())
  );

  const lockedCount = capsules.filter(c => !c.isUnlocked).length;
  const unlockedCount = capsules.filter(c => c.isUnlocked).length;

  const formatDateTime = (dateString) => {
    return formatBeijingTimeForDisplay(dateString);
  };

  const isUnlockable = (capsule) => {
    return !capsule.isUnlocked && new Date() >= new Date(capsule.unlockTime);
  };

  const handlePlayCapsuleSong = (capsule) => {
    if (capsule.songId) {
      playSong(capsule.songId, [capsule.songId]);
    }
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
          情绪时间胶囊
        </h1>
        <p className="text-xl text-gray-600">
          将此刻的心情封存，在未来的某个时刻重新感受
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 创建胶囊按钮 */}
      <div className="mb-8">
        <button 
          onClick={openCreateModal}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>创建情绪胶囊</span>
        </button>
      </div>

      {/* 胶囊状态筛选 */}
      <div className="mb-8">
        <div className="flex space-x-4">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          >
            全部 ({capsules.length})
          </button>
          <button 
            onClick={() => setFilterStatus('locked')}
            className={`btn ${filterStatus === 'locked' ? 'btn-secondary' : 'btn-ghost'}`}
          >
            <Lock className="w-4 h-4 mr-2" />
            未解锁 ({lockedCount})
          </button>
          <button 
            onClick={() => setFilterStatus('unlocked')}
            className={`btn ${filterStatus === 'unlocked' ? 'btn-secondary' : 'btn-ghost'}`}
          >
            <Unlock className="w-4 h-4 mr-2" />
            已解锁 ({unlockedCount})
          </button>
        </div>
      </div>

      {/* 胶囊网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCapsules.length === 0 ? (
          <div className="col-span-full">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? '还没有情绪胶囊' 
                  : `暂无${filterStatus === 'locked' ? '未解锁' : '已解锁'}的胶囊`}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {filterStatus === 'all' && '创建您的第一个时间胶囊'}
              </p>
            </div>
          </div>
        ) : (
          filteredCapsules.map((capsule) => (
            <div 
              key={capsule._id} 
              className={`card p-6 transition-all duration-300 ${capsule.isUnlocked ? 'bg-green-50 border-green-200' : isUnlockable(capsule) ? 'bg-yellow-50 border-yellow-200 cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'bg-gray-50 border-gray-200'}`}
              onClick={() => isUnlockable(capsule) && handleUnlockCapsule(capsule._id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {capsule.isUnlocked ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Unlock className="w-4 h-4 text-white" />
                    </div>
                  ) : isUnlockable(capsule) ? (
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {capsule.isUnlocked ? '已解锁' : isUnlockable(capsule) ? '可解锁' : '未解锁'}
                    </div>
                    <div className="text-gray-500">
                      {formatDateTime(capsule.unlockTime)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCapsule(capsule._id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 关联歌曲 - 仅在解锁后显示 */}
              {capsule.isUnlocked && capsule.songId && (
                <div className="mb-4 p-3 bg-white rounded-lg border animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{capsule.songId.title}</p>
                        <p className="text-xs text-gray-500">{capsule.songId.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePlayCapsuleSong(capsule)}
                      className="p-1 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* 情绪文本 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">当时的心情</span>
                </div>
                <div className={`p-3 rounded-lg ${capsule.isUnlocked ? 'bg-white' : 'bg-gray-100'}`}>
                  {capsule.isUnlocked ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {capsule.emotionText}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {isUnlockable(capsule) ? '点击解锁查看内容' : '等待解锁时间到达'}
                    </p>
                  )}
                </div>
              </div>

              {/* 创建时间 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  创建于 {formatDateTime(capsule.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建胶囊模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">创建情绪胶囊</h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateCapsule}>
              {/* 选择歌曲 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Music className="w-4 h-4 inline mr-1" />
                  选择歌曲
                </label>
                {getSelectedSong() ? (
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{getSelectedSong().title}</p>
                      <p className="text-sm text-gray-500">{getSelectedSong().artist}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSongSelector(true)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      更换
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSongSelector(true)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
                  >
                    点击选择歌曲
                  </button>
                )}
              </div>

              {/* 心情文本 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-1" />
                  此刻的心情
                </label>
                <textarea
                  value={createForm.emotionText}
                  onChange={(e) => setCreateForm({...createForm, emotionText: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="4"
                  placeholder="写下您此刻的心情..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.emotionText.length}/1000 字符
                </p>
              </div>

              {/* 解锁时间 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  解锁时间
                </label>
                <input
                  type="datetime-local"
                  value={createForm.unlockTime}
                  onChange={(e) => setCreateForm({...createForm, unlockTime: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!createForm.emotionText.trim() || !createForm.songId}
                >
                  创建胶囊
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 歌曲选择模态框 */}
      {showSongSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">选择歌曲</h2>
              <button onClick={() => setShowSongSelector(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="搜索歌曲..."
                value={songSearch}
                onChange={(e) => setSongSearch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSongs.map((song) => (
                <button
                  key={song._id}
                  onClick={() => selectSong(song)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{song.title}</div>
                  <div className="text-sm text-gray-500">{song.artist}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Capsules; 
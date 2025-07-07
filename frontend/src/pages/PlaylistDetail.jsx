import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playlistAPI } from '../services/api';
import { usePlayer } from '../contexts/PlayerContext';
import { Play, Music, ArrowLeft } from 'lucide-react';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        console.log('正在获取播放列表，ID:', id);
        const response = await playlistAPI.getPlaylist(id);
        console.log('API响应:', response.data);
        setPlaylist(response.data);
        setError(null);
      } catch (err) {
        console.error('获取播放列表失败:', err);
        console.error('错误详情:', err.response?.data);
        setError('无法加载播放列表详情，请稍后再试。');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center p-10">
        <p className="text-gray-600">正在加载播放列表...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-600">{error}</p>
        <Link to="/playlists" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          <ArrowLeft className="inline mr-2 w-4 h-4" />
          返回播放列表
        </Link>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center p-10">
        <p className="text-gray-600">未找到该播放列表。</p>
        <Link to="/playlists" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          <ArrowLeft className="inline mr-2 w-4 h-4" />
          返回播放列表
        </Link>
      </div>
    );
  }

  console.log('播放列表数据:', playlist);
  console.log('歌曲列表:', playlist.songs);

  return (
    <div className="p-6 bg-white min-h-screen">
      <Link to="/playlists" className="text-gray-600 hover:text-gray-800 mb-6 inline-flex items-center">
        <ArrowLeft className="mr-2 w-4 h-4" />
        返回所有播放列表
      </Link>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-gray-600 mt-2">{playlist.description}</p>
        )}
        <p className="text-gray-500 text-sm mt-2">{(playlist.songs || []).length} 首歌曲</p>
      </div>

      {playlist.songs && playlist.songs.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ul className="divide-y divide-gray-100">
            {playlist.songs.map((song, index) => (
              <li
                key={song._id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-center">
                  <span className="text-gray-500 w-8 text-center font-medium">{index + 1}</span>
                  <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-md object-cover ml-4 mr-4 shadow-sm" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{song.title}</h3>
                    <p className="text-gray-600 text-sm">{song.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => playSong(song)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label={`播放 ${song.title}`}
                >
                  <Play className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Music className="mx-auto text-gray-400 mb-4 w-16 h-16" />
          <p className="text-gray-600 text-lg mb-2">这个播放列表是空的</p>
          <p className="text-gray-500 text-sm mb-6">快去添加一些喜欢的歌曲吧！</p>
          <Link to="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            去首页添加歌曲
          </Link>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail; 
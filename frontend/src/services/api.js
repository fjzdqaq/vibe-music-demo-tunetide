import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器 - 自动添加认证 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证 API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (credentials) => api.post('/auth/register', credentials),
  getProfile: () => api.get('/auth/me'),
};

// 歌曲 API
export const songAPI = {
  getSongs: (params) => api.get('/songs', { params }),
  getSong: (id) => api.get(`/songs/${id}`),
  searchSongs: async (keyword = '') => {
    const response = await api.get(`/songs/search?keyword=${keyword}`);
    return response.data;
  },
  getAllSongs: async () => {
    const response = await api.get('/songs');
    return response.data;
  },
  createSong: async (songData) => {
    const response = await api.post('/songs', songData);
    return response.data;
  },
  updateSong: (id, data) => api.put(`/songs/${id}`, data),
  deleteSong: async (id) => {
    const response = await api.delete(`/songs/${id}`);
    return response.data;
  },
};

// 播放列表 API
export const playlistAPI = {
  getPlaylists: () => api.get('/playlists'),
  getPlaylist: (id) => api.get(`/playlists/${id}`),
  createPlaylist: (data) => api.post('/playlists', data),
  updatePlaylist: (id, data) => api.put(`/playlists/${id}`, data),
  deletePlaylist: (id) => api.delete(`/playlists/${id}`),
  addSongToPlaylist: (playlistId, songId) => 
    api.post(`/playlists/${playlistId}/songs`, { songId }),
  removeSongFromPlaylist: (playlistId, songId) => 
    api.delete(`/playlists/${playlistId}/songs/${songId}`),
};

// 播放队列 API
export const playQueueAPI = {
  getPlayQueue: () => api.get('/play-queue'),
  addToPlayQueue: (songId) => api.post('/play-queue/add', { songId }),
  recordPlayed: (songId) => api.post('/play-queue/played', { songId }),
  removeFromPlayQueue: (id) => api.delete(`/play-queue/${id}`),
  clearPlayQueue: () => api.delete('/play-queue'),
};

// 情绪胶囊 API
export const capsuleAPI = {
  getCapsules: (params) => api.get('/capsules', { params }),
  getCapsule: (id) => api.get(`/capsules/${id}`),
  createCapsule: (data) => api.post('/capsules', data),
  updateCapsule: (id, data) => api.put(`/capsules/${id}`, data),
  deleteCapsule: (id) => api.delete(`/capsules/${id}`),
  unlockCapsule: (id) => api.put(`/capsules/${id}/unlock`),
  getUpcomingCapsules: () => api.get('/capsules/upcoming/unlock'),
};

// 文件上传 API
export const uploadAPI = {
  uploadMusic: (formData, onUploadProgress) => {
    return api.post('/upload/music', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5分钟超时
      onUploadProgress: onUploadProgress,
    });
  },
  getUploadProgress: (uploadId) => api.get(`/upload/progress/${uploadId}`),
  cancelUpload: (uploadId) => api.delete(`/upload/cancel/${uploadId}`),
};

// 管理员 API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleAdmin: (id) => api.patch(`/admin/users/${id}/toggle-admin`),
};

// AI音乐生成 API
export const musicgenAPI = {
  generateMusic: async (data) => {
    const response = await api.post('/musicgen/generate', data);
    return response.data;
  },
};

export default api; 
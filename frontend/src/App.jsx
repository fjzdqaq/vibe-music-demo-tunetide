import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';

import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Player from './components/Player';

import Home from './pages/Home';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';

import Capsules from './pages/Capsules';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/playlists" element={<PrivateRoute><Playlists /></PrivateRoute>} />
              <Route path="/playlists/:id" element={<PrivateRoute><PlaylistDetail /></PrivateRoute>} />

              <Route path="/capsules" element={<PrivateRoute><Capsules /></PrivateRoute>} />
              <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Player />
        </div>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App; 
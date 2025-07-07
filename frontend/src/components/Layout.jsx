import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Player from './Player';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-24">
        <Outlet />
      </main>
      <Player />
    </div>
  );
};

export default Layout; 
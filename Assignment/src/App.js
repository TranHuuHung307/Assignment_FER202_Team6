import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Protected from './components/Protected';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Owner from './pages/Owner';
import User from './pages/User';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Role 0: Admin mới vào được */}
          <Route path="/admin" element={
            <Protected allowedRole="0">
              <Admin />
            </Protected>
          } />

          {/* Role 1: Chủ sân mới vào được */}
          <Route path="/owner" element={
            <Protected allowedRole="1">
              <Owner />
            </Protected>
          } />

          {/* Role 2: Người dùng đặt sân */}
          <Route path="/user" element={
            <Protected allowedRole="2">
              <User />
            </Protected>
          } />

          {/* Điều hướng mặc định */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
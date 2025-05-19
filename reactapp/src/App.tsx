import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MainLayout from './layout/MainLayout';
import Footer from './components/Footer';
import Nominate from './pages/Nominate';
import AdminPage from './components/AdminPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Các route sử dụng MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<div>Trang chủ</div>} />
          <Route path="nominate" element={<Nominate />} />
        </Route>
        {/* Route cho trang admin, không dùng MainLayout */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
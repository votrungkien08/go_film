import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MainLayout from './layout/MainLayout';
import Footer from './components/Footer';
import Nominate from './pages/Nominate';
//import FilmDetail from './layout/FilmDetail';
import AdminPage from './components/AdminPage';
import FilmDetail from './layout/FilmDetail';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import FilmList from './pages/FilmList';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Các route sử dụng MainLayout */}
        <Route path="/" element={<MainLayout />}>
          {/* <Route index element={<div>Trang chủ</div>} /> */}
          <Route path="nominate" element={<Nominate />} />
          <Route path="film/:slug" element={<FilmDetail />} />
          <Route path="films" element={<FilmList />} /> {/* THÊM MỚI: Route cho FilmList */}

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
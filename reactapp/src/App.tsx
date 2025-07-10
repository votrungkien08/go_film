// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MainLayout from './layouts/MainLayout';
import Footer from './components/Footer';
import Nominate from './pages/Nominate';
import { Toaster } from 'sonner';
import AdminPage from './components/AdminPage';
import FilmDetail from './layouts/FilmDetail';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import FilmList from './pages/FilmList';
import './App.css';
import BuyPoints from './components/ui/BuyPoints';
import Chatbot from './Chatbot';
import { ThemeProvider } from "./components/theme-provider";
import Histories from './pages/Histories';
import Favorites from './pages/Favorites';
import {DashboardLayout} from './layouts/dashboard/layout';
import DashboardPage from './pages/dashboard';
import  SignInPage  from './pages/sign-in';
import  UserPage  from './pages/user';
import  ProductsPage  from './pages/products';
import  BlogPage  from './pages/blog';
import  CommentPage  from './pages/comments';
import  FilmPage  from './pages/film-control';
import  AddPage  from './pages/add';
import  RevenuePage  from './pages/revenue';

import { ParallaxProvider } from '../src/utils/ParallaxContext';
import { MUIThemeProvider } from 'src/theme/theme-provider';

// import { ModeToggle } from './components/mode-toggle';
// import { useEffect } from 'react';
function App() {
  return (
    <>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            {/* Các route sử dụng MainLayout */}
            <Route path="/" element={<MainLayout />}>
              <Route path="nominate" element={<Nominate />} />
              <Route path="chatbot" element={<Chatbot />} />
              <Route path="film/:slug" element={<FilmDetail />} />
              <Route path="films" element={<FilmList />} /> {/* THÊM MỚI: Route cho FilmList */}
              <Route path="favorites" element={<Favorites />} />
              <Route path="histories" element={<Histories />} />

            </Route>
            {/* Route cho trang admin, không dùng MainLayout */}
            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            
            {/* <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage  />} />
            </Route> */}
            {/* <Route path="/dashboard" element={
              <ProtectedAdminRoute>
                  <MUIThemeProvider>
                    <DashboardLayout>
                    </DashboardLayout>
                  </MUIThemeProvider>
              </ProtectedAdminRoute>
              
            } >
              <Route index element={<DashboardPage />} />
              <Route path='user' element={<UserPage  />} />
              <Route path='products' element={<ProductsPage  />} />
              <Route path='blog' element={<BlogPage  />} />
              <Route path='sign-in' element={<SignInPage />} />
              <Route path='404' element={<DashboardPage />} />
            </Route> */}
            <Route element={<ProtectedAdminRoute />}>
              <Route
                path="/dashboard"
                element={
                  <MUIThemeProvider>
                    <DashboardLayout />
                  </MUIThemeProvider>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="user" element={<UserPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="sign-in" element={<SignInPage />} />
                <Route path="404" element={<DashboardPage />} />
                <Route path="comment" element={<CommentPage />} />
                <Route path="films" element={<FilmPage />} />
                <Route path="add" element={<AddPage />} />
                <Route path="revenue" element={<RevenuePage />} />
              </Route>
            </Route>

            {/* Route cho trang BuyPoints, độc lập, không dùng MainLayout */}
            <Route path="/buy-points" element={<BuyPoints />} />

          </Routes>
        </Router>
        <Toaster
          position="top-right"
          theme="dark"                // Phù hợp với nền tối
          richColors={false}          // Tắt để custom màu
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #FF6B35',
            },
            success: {
              style: {
                background: '#1a1a1a',
                color: '#10B981',
                border: '1px solid #10B981',
              },
            },
            error: {
              style: {
                background: '#1a1a1a',
                color: '#EF4444',
                border: '1px solid #EF4444',
              },
            },
          }}
        />
      </ThemeProvider>
      

    </>
  );
}

export default App;
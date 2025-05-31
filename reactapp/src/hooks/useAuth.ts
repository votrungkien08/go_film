// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';

interface AuthData {
  isLoggedIn: boolean;
  checkLoginStatus: () => Promise<void>;
}

export const useAuth = (): AuthData => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    
  // Hàm kiểm tra trạng thái đăng nhập
  const checkLoginStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`http://localhost:8000/api/user`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setIsLoggedIn(!!data.user);
      } catch (err) {
        console.error('Fetch user error:', err);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };
  // Kiểm tra trạng thái đăng nhập khi component mount và khi nhận sự kiện loginSuccess/logoutSuccess
  useEffect(() => {
    checkLoginStatus();
    const handleLoginSuccess = () => checkLoginStatus();
    const handleLogoutSuccess = () => {
      setIsLoggedIn(false);
    };
    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logoutSuccess', handleLogoutSuccess);
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logoutSuccess', handleLogoutSuccess);
    };
  }, []);

  return { isLoggedIn, checkLoginStatus };
};
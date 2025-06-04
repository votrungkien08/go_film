// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { User } from '../types/index.ts'
interface AuthData {
  isLoggedIn: boolean;
  user: User | null;
  checkLoginStatus: () => Promise<void>;
}

export const useAuth = (): AuthData => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  // Hàm kiểm tra trạng thái đăng nhập
  // Thay thế toàn bộ hàm checkLoginStatus:
  const checkLoginStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`http://localhost:8000/api/user`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setIsLoggedIn(true);
            setUser(data.user);
            console.log('User loaded:', data.user); // Debug log
          } else {
            setIsLoggedIn(false);
            setUser(null);
            localStorage.removeItem('token');
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Fetch user error:', err);
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };
  // Kiểm tra trạng thái đăng nhập khi component mount và khi nhận sự kiện loginSuccess/logoutSuccess
  useEffect(() => {
    checkLoginStatus();
    const handleLoginSuccess = () => checkLoginStatus();
    const handleLogoutSuccess = () => {
      setIsLoggedIn(false);
      setUser(null);
    };
    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logoutSuccess', handleLogoutSuccess);
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logoutSuccess', handleLogoutSuccess);
    };
  }, []);

  return { isLoggedIn, user, checkLoginStatus };
};
// src/hooks/useAdminFavorites.ts

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export interface Favorite {
  id: number;
  user_name: string;
  film_title: string;
  created_at: string;
}

export function useAdminFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/admin/favorites', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched favorites admin:', response.data.favorites);
        setFavorites(response.data.favorites);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Lỗi khi lấy danh sách yêu thích'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return {
    favorites,
    loading,
  };
}

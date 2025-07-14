// src/hooks/useAdminFavorites.ts

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export interface Rating {
  id: number;
  user_name: string;
  film_title: string;
  created_at: string;
}

export function useAdminRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/admin/ratings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched ratings admin:', response.data.ratings);
        setRatings(response.data.ratings);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Lỗi khi lấy danh sách đánh giá'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return {
    ratings,
    loading,
  };
}

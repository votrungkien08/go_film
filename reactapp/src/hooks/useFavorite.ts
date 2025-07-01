// src/hooks/useFavorite.ts
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';


interface FavoriteData {
  isFavorite: boolean;
  handleToggleFavorite: () => Promise<void>;
  likeCount: number;
}
// toggle like
export const useFavorite = (filmId: number | undefined, isLoggedIn: boolean): FavoriteData => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState(0);
    // check favorite

  useEffect(() => {
    if (!filmId || !isLoggedIn) {
      setIsFavorite(false);
      return;
    }
    const fetchCountFavorites = async () => {
      if (!filmId) return;
      try {
        const res = await axios.get(`http://localhost:8000/api/favorite-film/${filmId}`);
        setLikeCount(res.data.likeCount || 0);
      } catch (err) {
        console.error('Lỗi khi fetch likeCount:', err);
      }
    }
    const checkFavorite = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/film/${filmId}/favorite`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(response.data.favorite);
      } catch (err: any) {
        setIsFavorite(false);
        console.error('Lỗi khi kiểm tra yêu thích:', err.response?.data || err.message);
      }
    };
    fetchCountFavorites()
    checkFavorite();
  }, [filmId, isLoggedIn]);

  const handleToggleFavorite = useCallback(async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thêm/xóa yêu thích.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (isFavorite) {
        await axios.delete(`http://localhost:8000/api/removeFavorite/${filmId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
        toast.success('Đã xóa khỏi danh sách yêu thích!');
      } else {
        await axios.post(
          `http://localhost:8000/api/addFavorite`,
          { film_id: filmId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
        toast.success('Đã thêm vào danh sách yêu thích!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật danh sách yêu thích.');
    }
  }, [isFavorite, filmId, isLoggedIn]);

  return { isFavorite, likeCount, handleToggleFavorite };
};
import { useEffect,useState,useCallback } from "react";
import axios from "axios"; 
import { toast } from "react-toastify";
import {Rating} from '../types';



interface RatingData {
  rating: number | null;
  setRating: (rating: number | null) => void;
  showRating: Rating[];
  averageRating: number;
  handlePostRating: () => Promise<void>;
}


export const useRating = (filmId: number | undefined, isLoggedIn: boolean): RatingData => {
  const [rating, setRating] = useState<number | null>(null);
  const [showRating, setShowRating] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
    // Lấy đánh giá của người dùng hiện tại

  useEffect(() => {
    if (!filmId || !isLoggedIn) return;
    const fetchUserRating = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/film/rating/${filmId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRating(response.data.rating || null);
      } catch (err: any) {
        console.error('Lỗi khi lấy đánh giá:', err.response?.data || err.message);
      }
    };
    fetchUserRating();
  }, [filmId, isLoggedIn]);
    // get rating film

  const fetchRatings = useCallback(async () => {
    if (!filmId) return;
    try {
      const response = await fetch(`http://localhost:8000/api/film/getRating/${filmId}`);
      const data = await response.json();
      if (data.rating) {
        setShowRating(data.rating);
        const total = data.rating.reduce((sum: number, r: Rating) => sum + r.rating, 0);
        const avg = data.rating.length ? total / data.rating.length : 0;
        setAverageRating(avg);
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh sách đánh giá:', err.message);
    }
  }, [filmId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);
  

    // Xử lý gửi đánh giá

  const handlePostRating = useCallback(async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để đánh giá.');
      return;
    }
    // if(isLoggedIn && film?.is_premium && (paymentStatus?.user_points ?? 0) < (paymentStatus?.points_required ?? 0)) {
    //   toast.error('Bạn không đủ điểm để đánh giá');
    //   return;
    // }
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn số sao từ 1 đến 5!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/film/postRating',
        { film_id: filmId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đánh giá đã được gửi!');
      const response = await axios.get(`http://localhost:8000/api/film/rating/${filmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRating(response.data.rating || null);

      await fetchRatings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
    }
  }, [rating, filmId, isLoggedIn]);

  return { rating, setRating, showRating, averageRating, handlePostRating };
};
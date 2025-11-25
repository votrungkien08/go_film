import {useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { type Comment } from '../types';
import { useQuery, keepPreviousData, useQueryClient  } from "@tanstack/react-query";
interface CommentsData {
  comments: Comment[];
  comment: string;
  setComment: (value: string) => void;
  handlePostComment: () => Promise<void>;
}
async function fetchComments(filmId: number) { 

  if (filmId) {
    const { data } = await axios.get(`http://localhost:8000/api/film/comments/${filmId}`);
    console.log('Tất cả comment 2:', data.comments);
    return data.comments;
  }

}
export const useComments = (filmId: number | undefined, isLoggedIn: boolean): CommentsData => {
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  // Lấy danh sách bình luận
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', filmId],
    queryFn: () => fetchComments(filmId!),
    enabled: !!filmId,
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
    // Xử lý gửi bình luận
  const handlePostComment = useCallback(async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để bình luận.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng nhập bình luận!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const checkResponse = await axios.post(
        'http://localhost:8000/api/checkComment',
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkResponse.data.status === 'blocked') {
        toast.error(checkResponse.data.message);
        // alert(checkResponse.data.message);
        return;
      }
      await axios.post(
        'http://localhost:8000/api/film/postComment',
        { film_id: filmId, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      queryClient.invalidateQueries({queryKey: ['comments', filmId]});
      toast.success('Bình luận đã được gửi!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi bình luận.');
    }
  },[comment, filmId, isLoggedIn, queryClient]);

   return { comments, comment, setComment, handlePostComment };
};
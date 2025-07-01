// src/hooks/useComments.ts
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {Comment} from '../types';
// import { toast } from "sonner";
interface CommentsData {
  comments: Comment[];
  commentsLoading: boolean;
  commentsError: string;
  comment: string;
  setComment: (comment: string) => void;
  handlePostComment: () => Promise<void>;
}

export const useComments = (filmId: number | undefined, isLoggedIn: boolean, fetchAll: boolean =false): CommentsData => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [comment, setComment] = useState('');
    // Lấy danh sách bình luận

  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      setCommentsError('');
      try {
        let response;
        if(fetchAll) {
          response = await axios.get(`http://localhost:8000/api/comments`);

        }
        else if (filmId) {
          response = await axios.get(`http://localhost:8000/api/film/comments/${filmId}`);

        } else {
          setComments([]);
          return;
        }
        console.log('đây là comment nè',response.data);
        setComments(response.data.comments);
      } catch (err: any) {
        setCommentsError(err.response?.data?.message || 'Không thể tải bình luận.');
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [filmId]);
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
      const response = await axios.get(`http://localhost:8000/api/film/comments/${filmId}`);
      setComments(response.data.comments);
      toast.success('Bình luận đã được gửi!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi bình luận.');
    }
  }, [comment, filmId, isLoggedIn]);

  return { comments, commentsLoading, commentsError, comment, setComment, handlePostComment };
};
import {Comment} from '../types';
import { useState, useEffect, useCallback } from 'react';
// import { useComments } from '../hooks/useComment';
export const useAdminComments = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // fetch comment
    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/comments');
            const data = await response.json();
            if (Array.isArray(data)) setComments(data);
            else if (data.comments) setComments(data.comments);
            else setComments([]);
        } catch (err) {
            setError('Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    },[]);
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);
    
    const toggleBlockComment = useCallback(async (idComment: number) => {
    try {
      await fetch(`http://localhost:8000/api/toggleBlockComment/${idComment}`, {
        method: 'POST',
      });
      await fetchComments(); // refresh danh sách comment sau khi đổi trạng thái
    } catch (err) {
      setError('Lỗi khi cập nhật trạng thái bình luận');
    }
    }, [fetchComments]);

    return { comments, loading, error, toggleBlockComment };
}
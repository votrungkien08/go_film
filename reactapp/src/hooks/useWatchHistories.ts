import { useEffect, useState,useRef } from 'react';
import axios from 'axios';
import {WatchHistories} from '../types';
import { toast } from 'sonner';


export const useWatchHistories = (selectedEpisode: any,videoRef: React.RefObject<HTMLVideoElement>) => {
    const [watchHistory, setWatchHistory] = useState<WatchHistories[]>([]);
    const token = localStorage.getItem('token');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const handleTimeUpdate = () => {
        try {
            if (!videoRef.current) return;
            const currentTime = Math.floor(videoRef.current.currentTime);
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => { 
                    fetch('http://localhost:8000/api/store-histories',{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${token}`,},
                    body: JSON.stringify({
                        episodes_id: selectedEpisode.id, // Tập đang xem
                        progress_time: currentTime,
                    }),
                });
            console.log('Saved progress_time:', currentTime);
            },3000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách xem phim');
            
        }
    }

    useEffect(() => {
        
        const fetchWatchHistories = async () => {
            if (!token) {
                // toast.error('Vui lòng đăng nhập để lấy lịch sử xem phim');
                return;
            }
            try {
                const response = await axios.get('http://localhost:8000/api/watch-histories',
                    {headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${token}`,}}
                );
                console.log(response.data);
                setWatchHistory(response.data.history);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách xem phim');
                
            }
        }

        fetchWatchHistories();
    }, [token]);


    useEffect(() => {
        const video = videoRef.current;
        if (video && watchHistory && watchHistory.length > 0 && selectedEpisode) {
            const currentHistory = watchHistory.find((item) => item.episodes_id === selectedEpisode.id);
            if (currentHistory && currentHistory.progress_time > 0) {
                // videoRef.current.currentTime = currentHistory.progress_time;
                const setProgress = () => {
                    video.currentTime = currentHistory.progress_time;
                    console.log('Set currentTime to:', currentHistory.progress_time);
                    // Auto-play the video
                    // video.play().catch((err) => {
                    //     console.error('Failed to play video:', err);
                    //     // toast.error('Không thể phát video tự động');
                    // });
                };

                // Check if video is ready (readyState >= 2 means metadata is loaded)
                if (video.readyState >= 2) {
                    setProgress();
                } else {
                    video.addEventListener('loadedmetadata', setProgress, { once: true });
                }
            }
        }
    },[watchHistory, selectedEpisode,videoRef]);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            return () => video.removeEventListener('timeupdate', handleTimeUpdate);
        }
    });

    return {watchHistory,videoRef,handleTimeUpdate};

}
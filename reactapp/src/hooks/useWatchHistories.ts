import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { WatchHistories } from '../types';
import { toast } from 'sonner';

export const useWatchHistories = (
    selectedEpisode: any,
    videoRef: React.RefObject<HTMLVideoElement>,
    setCurrentTime?: (time: number) => void
) => {
    const [watchHistory, setWatchHistory] = useState<WatchHistories[]>([]);
    const token = localStorage.getItem('token');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleTimeUpdate = async () => {
        try {
            if (!videoRef.current || !selectedEpisode?.id) return;
            const currentTime = Math.floor(videoRef.current.currentTime);

            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (setCurrentTime) setCurrentTime(currentTime);

            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    // **SỬA**: Đổi 'episodes_id' thành 'episode_id'
                    const response = await axios.post(
                        'http://localhost:8000/api/store-histories',
                        {
                            episode_id: selectedEpisode.id,
                            progress_time: currentTime,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log('Saved watch history:', response.data);
                } catch (err: any) {
                    console.error('Error saving watch history:', err.response?.data || err.message);
                    toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch sử xem phim');
                }
            }, 3000);
        } catch (err: any) {
            console.error('Error in handleTimeUpdate:', err);
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch sử xem phim');
        }
    };

    useEffect(() => {
        const fetchWatchHistories = async () => {
            if (!token) {
                // toast.error('Vui lòng đăng nhập để lấy lịch sử xem phim');
                return;
            }
            try {
                const response = await axios.get('http://localhost:8000/api/watch-histories', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Watch histories:', response.data);
                setWatchHistory(response.data.history);
            } catch (err: any) {
                console.error('Error fetching watch histories:', err.response?.data || err.message);
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách xem phim');
            }
        };

        fetchWatchHistories();
    }, [token, selectedEpisode?.id]);

    useEffect(() => {
        const video = videoRef.current;
        if (video && selectedEpisode?.id) {
            // **SỬA**: Đổi 'episodes_id' thành 'episode_id'
            const currentHistory = watchHistory.find((item) => item.episode_id === selectedEpisode.id);
            if (currentHistory && currentHistory.progress_time > 0) {
                const setProgress = () => {
                    video.currentTime = currentHistory.progress_time;
                    console.log('Set currentTime to:', currentHistory.progress_time);
                    console.log('⏪ Selected episode:', selectedEpisode?.id);
                    console.log('⏱️ Found history:', currentHistory);
                };

                if (video.readyState >= 2) {
                    setProgress();
                } else {
                    video.addEventListener('loadedmetadata', setProgress, { once: true });
                }
            }
        }
        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            return () => video.removeEventListener('timeupdate', handleTimeUpdate);
        }
    }, [watchHistory, selectedEpisode, videoRef]);

    return { watchHistory, videoRef, handleTimeUpdate };
};
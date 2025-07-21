import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { WatchHistories } from '../types';
import { toast } from 'sonner';


export const useWatchHistories = (
    selectedEpisode: any,
    videoRef: React.RefObject<HTMLVideoElement>,
    setCurrentTime?: (time: number) => void,
    isRestoringProgressRef?: React.MutableRefObject<boolean>
) => {
    const [watchHistory, setWatchHistory] = useState<WatchHistories[]>([]);
    const token = localStorage.getItem('token');
    // useRef 1 ob thuoc tinh current cập nhật mà k render lại component
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);


    // const isRestoringProgressRef = useRef(false);
    const handleTimeUpdate = async () => {
        try {
            // if (isRestoringProgressRef.current) return;
            if (!videoRef.current || !selectedEpisode?.id || !token) return;
            const currentTime = Math.floor(videoRef.current.currentTime);
            if (currentTime <= 0) return;
            // Ngăn không gọi api nhiều lần
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            if (setCurrentTime) setCurrentTime(currentTime);
            // gọi API sau khi 3 giây không có sự kiện timeupdate mới
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    // **SỬA**: Đổi 'episodes_id' thành 'episode_id'
                    const response = await axios.post(
                        'http://localhost:8000/api/store-histories',
                        {
                            episodes_id: selectedEpisode.id,
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
            }, 1000);
        } catch (err: any) {
            console.error('Error in handleTimeUpdate:', err);
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch sử xem phim');
        }
    };

    useEffect(() => {
        const fetchWatchHistories = async () => {
            if (!token) {
                return;
            }
            try {
                // get-histories API sẽ lưu lịch sử xem phim
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
                toast.error('Có lỗi xảy ra khi lấy danh sách xem phim');
            }
        };

        fetchWatchHistories();
    }, [token, selectedEpisode?.id]);



    useEffect(() => {
        const video = videoRef.current;
        if (video && selectedEpisode?.id) {
            video.pause();

            const currentHistory = watchHistory.find((item) => item.episodes_id === selectedEpisode.id);

            const setProgress = () => {
                if (currentHistory && currentHistory.progress_time > 0) {
                    if (isRestoringProgressRef) isRestoringProgressRef.current = true;

                    video.currentTime = currentHistory.progress_time;
                    if (setCurrentTime) setCurrentTime(currentHistory.progress_time);

                    video.addEventListener('seeked', () => {
                        console.log('✅ Seeked to', video.currentTime);
                        if (isRestoringProgressRef) isRestoringProgressRef.current = false;
                    }, { once: true });

                    console.log('⏪ Đã tìm thấy lịch sử:', currentHistory);
                } else {
                    // Không có lịch sử thì reset về 0
                    video.currentTime = 0;
                    if (setCurrentTime) setCurrentTime(0);
                    console.log('⏪ Không tìm thấy lịch sử, đặt lại currentTime = 0');
                }

                setTimeout(() => {
                    if (isRestoringProgressRef) isRestoringProgressRef.current = false;
                }, 1000);
            };

            if (video.readyState >= 3) {
                setProgress();
            } else {
                video.addEventListener('loadedmetadata', setProgress, { once: true });
            }
        }

        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            return () => video.removeEventListener('timeupdate', handleTimeUpdate);
        }
    }, [watchHistory, selectedEpisode, videoRef]);






    return { watchHistory, videoRef, handleTimeUpdate };
};
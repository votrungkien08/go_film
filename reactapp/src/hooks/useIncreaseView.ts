import { useState, useEffect, RefObject } from 'react';
import axios from 'axios';

interface UseIncreaseViewProps {
  filmId: number | undefined;
  videoRef: RefObject<HTMLVideoElement>;
  selectedEpisode: any;
}

export const useIncreaseView = ({ filmId, videoRef, selectedEpisode }: UseIncreaseViewProps) => {
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Ngăn gửi nhiều yêu cầu đồng thời
  const minimumPlayTime = 30;

  const incrementView = async () => {
    if (!filmId || hasIncrementedView || isProcessing) return;

    setIsProcessing(true);
    console.log('Sending request to increase view for filmId:', filmId); // Debug
    try {
      const response = await axios.post('http://localhost:8000/api/increaseView', { id: filmId });
      console.log('API response:', response.data); // Debug
      setViewCount(response.data.view_count);
      setHasIncrementedView(true);
    } catch (error: any) {
      console.error('Error increasing view:', error.response?.data?.error || error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Tùy chọn 1: Tăng view sau 5 giây
  const handleViewIncrement = () => {
    if (videoRef.current && !hasIncrementedView && !isProcessing && !videoRef.current.paused && videoRef.current.currentTime >= minimumPlayTime && filmId) {
      incrementView();
    }
  };

  // Reset khi chuyển tập
  useEffect(() => {
    setHasIncrementedView(false);
    setIsProcessing(false);
  }, [selectedEpisode]);

  // Gắn sự kiện ended và seeked
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      console.log('Video ended'); // Debug
      setHasIncrementedView(false);
    };

    const handleSeeked = () => {
      console.log('Video seeked to:', video.currentTime); // Debug
      if (video.currentTime === 0) {
        setHasIncrementedView(false);
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [videoRef]);

  return { handleViewIncrement, viewCount };
};
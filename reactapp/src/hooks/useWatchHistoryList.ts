import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { WatchHistories } from '../types';

interface EnhancedWatchHistory extends WatchHistories {
    film?: {
        id: number;
        title_film: string;
        slug: string;
        thumb: string;
    };
    episode?: {
        id: number;
        film_id: number;
        episode_number: string;
        episode_title: string;
        episode_url: string;
    };
}

export const useWatchHistoryList = () => {
    const [watchHistory, setWatchHistory] = useState<EnhancedWatchHistory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('token');

    const getEpisodeNumber = (number: string): number => {
        const match = number.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    };

    const fetchFilmEpisodes = async (episodeId: number) => {
        if (!episodeId) {
            console.warn(`Skipping fetchFilmEpisodes for invalid episodeId: ${episodeId}`);
            return null;
        }
        try {
            const response = await axios.get(`http://localhost:8000/api/episode/${episodeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(`fetchFilmEpisodes ${episodeId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error fetching episode ${episodeId}:`, error);
            return null;
        }
    };

    useEffect(() => {
        const fetchWatchHistories = async () => {
            if (!token) {
                toast.error('Vui lòng đăng nhập để lấy lịch sử xem phim', {
                    duration: 5000,
                    position: 'top-center',
                });
                setLoading(false);
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
                const histories = response.data.history;

                const enhancedHistories = await Promise.all(
                    histories.map(async (history: WatchHistories) => {
                        const filmEpisodes = await fetchFilmEpisodes(history.episode_id);
                        return {
                            ...history,
                            film: filmEpisodes?.film,
                            episode: filmEpisodes?.episode,
                        };
                    })
                );
                console.log('Enhanced histories:', enhancedHistories);

                const latestHistories = Object.values(
                    enhancedHistories.reduce((acc: { [key: number]: EnhancedWatchHistory }, history) => {
                        if (
                            history.film &&
                            history.episode?.id &&
                            (!acc[history.film.id] ||
                                getEpisodeNumber(history.episode.episode_title) >
                                getEpisodeNumber(acc[history.film.id].episode?.episode_title || 'FULL'))
                        ) {
                            acc[history.film.id] = history;
                        }
                        return acc;
                    }, {})
                );
                console.log('Latest histories:', latestHistories);

                const sortedHistories = latestHistories.sort(
                    (a, b) => new Date(b.watch_at).getTime() - new Date(a.watch_at).getTime()
                );
                setWatchHistory(sortedHistories);
                console.log('Sorted watch histories:', sortedHistories);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách xem phim', {
                    duration: 5000,
                    position: 'top-center',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWatchHistories();
    }, [token]);

    return { watchHistory, setWatchHistory, loading };
};
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { WatchHistories } from '../types';
import { motion } from 'framer-motion';

// Mở rộng interface để chứa thông tin phim
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

const Histories = () => {
    const [watchHistory, setWatchHistory] = useState<EnhancedWatchHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const variants = {
        hidden: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.4 } },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
    };

    // Cắt chuỗi thành số
    const getEpisodeNumber = (number: string): number => {
        const match = number.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    };

    // Lấy thông tin tập phim
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

    // **THÊM**: Hàm xóa lịch sử xem
    const deleteHistory = async (historyId: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/watch-histories/${historyId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setWatchHistory(watchHistory.filter((history) => history.id !== historyId));
            toast.success('Đã xóa lịch sử xem');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa lịch sử xem');
        }
    };

    useEffect(() => {
        const fetchWatchHistories = async () => {
            if (!token) {
                toast.error('Vui lòng đăng nhập để lấy lịch sử xem phim');
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
                        console.log('Processing history:', history);
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
                setLoading(false);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách xem phim');
                setLoading(false);
            }
        };

        fetchWatchHistories();
    }, [token]);

    // **THÊM**: Skeleton loading component
    const SkeletonCard = () => (
        <div className="col-span-2 p-4 bg-neutral-900 rounded-lg shadow-md border border-gray-600 animate-pulse">
            <div className="w-40 h-60 bg-gray-700 rounded-lg"></div>
            <div className="mt-2 h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="mt-2 h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
    );

    if (loading) {
        return (
            <div className="grid grid-cols-12 gap-4 min-h-[1000px] py-20">
                <div className="col-span-1"></div>
                <div className="col-span-10">
                    <h1 className="text-4xl font-bold mb-8 text-white">Lịch sử xem</h1>
                    <div className="grid grid-cols-10 gap-4">
                        {[...Array(5)].map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                </div>
                <div className="col-span-1"></div>
            </div>
        );
    }

    if (!watchHistory.length) {
        return (
            <div className="flex flex-col py-60 items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">Lịch sử xem</h1>
                <p className="text-lg">Bạn chưa có lịch sử xem nào.</p>
            </div>
        );
    }

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-12 gap-4 min-h-[1000px] py-20 px-4"
        >
            <div className="col-span-1"></div>
            <div className="col-span-10">
                <h1 className="text-4xl font-bold mb-8 text-white">Lịch sử xem</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {watchHistory.map((history) => (
                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            key={history.id}
                            className="relative p-4 bg-neutral-800 rounded-xl shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative w-full h-64">
                                {history.film?.thumb ? (
                                    <img
                                        src={history.film.thumb}
                                        alt={history.film.title_film}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}
                                {/* **THÊM**: Badge hiển thị số tập */}
                                {history.episode?.episode_number && (
                                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                        Tập {history.episode.episode_number}
                                    </span>
                                )}
                                {/* **THÊM**: Nút xóa lịch sử */}
                                <button
                                    onClick={() => deleteHistory(history.id)}
                                    className="absolute top-2 right-2 bg-gray-900 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                                    title="Xóa lịch sử"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                                {/* **THÊM**: Overlay khi hover */}
                                <a
                                    href={`/film/${history.film?.slug}?episode=${getEpisodeNumber(history.episode?.episode_title || '0')}`}
                                    className="absolute inset-0 bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center rounded-lg"
                                >
                                    <h3 className="text-lg font-semibold text-white text-center">
                                        {history.film?.title_film || 'Tên phim không xác định'}
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        Tập: {history.episode?.episode_title || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        Xem lúc: {new Date(history.watch_at).toLocaleString()}
                                    </p>
                                </a>
                            </div>
                            {/* **THÊM**: Thanh tiến trình */}
                            <div className="mt-2">
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="bg-red-600 h-1.5 rounded-full"
                                        style={{ width: `${Math.min((history.progress_time / 3600) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Đã xem: {Math.floor(history.progress_time / 60)} phút
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="col-span-1"></div>
        </motion.div>
    );
};

export default Histories;
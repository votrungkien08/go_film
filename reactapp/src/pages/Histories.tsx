
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { WatchHistories } from '../types';
import { motion, scale } from 'framer-motion';
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
        hidden: { opacity: 0, y: 100, scale: 0.8, transition: { duration: 0.5 } },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
    }
    // cắt chuỗi thành số
    const getEpisodeNumber = (number: string): number => {
        const match = number.match(/\d+/); // 
        return match ? parseInt(match[0]) : 0;
    };
    // object episode and film
    const fetchFilmEpisodes = async (episodeId: number) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/episode/${episodeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(`fetchFilmEpisodes ${episodeId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error details ${episodeId}:`, error);
            return null;
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
                        Authorization: `Bearer ${token}`
                    }
                });
                // history array chứa object
                console.log(`Watch histories:`, response.data);

                const histories = response.data.history;

                // Lấy chi tiết phim và tập
                const enhancedHistories = await Promise.all(
                    histories.map(async (history: WatchHistories) => {
                        const filmEpisodes = await fetchFilmEpisodes(history.episodes_id);
                        return {
                            ...history,
                            film: filmEpisodes?.film,
                            episode: filmEpisodes?.episode
                        };
                    })
                );
                console.log(`Enhanced histories:`, enhancedHistories);



                // Lọc chỉ giữ lại tập có episode_number lớn nhất cho mỗi phim
                const latestHistories = Object.values(
                    enhancedHistories.reduce((acc: { [key: number]: EnhancedWatchHistory }, history) => {
                        console.log(`Processing history:`, history);
                        if (
                            history.film &&
                            history.episode.id &&
                            (!acc[history.film.id] ||
                                getEpisodeNumber(history.episode.episode_title) >
                                getEpisodeNumber(acc[history.film.id].episode?.episode_title || 'FULL'))
                        ) {
                            acc[history.film.id] = history;
                        }
                        return acc;
                    }, {})
                );
                console.log(`Latest histories:`, latestHistories);

                // Sắp xếp theo watch_at giảm dần (mới nhất trước)
                const sortedHistories = latestHistories.sort(
                    (a, b) => new Date(b.watch_at).getTime() - new Date(a.watch_at).getTime()
                );

                setWatchHistory(sortedHistories);
                console.log(`Sorted watch histories:`, sortedHistories);
                setLoading(false);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách xem phim');
                setLoading(false);
            }
        };

        fetchWatchHistories();
    }, [token]);

    if (loading) {
        return (
            <div className="flex flex-col py-60 items-center justify-center ">
                <h1 className="text-4xl font-bold mb-4">Lịch sử xem</h1>
                <p className="text-lg">Đang tải...</p>
            </div>
        );
    }

    if (!watchHistory.length) {
        return (
            <div className="flex flex-col py-60 items-center justify-center ">
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
            className="grid grid-cols-12 gap-4 min-h-[1000px] py-20">
            <div className='col-span-1'></div>
            <div className='col-span-10'>
                <h1 className="text-4xl font-bold mb-8">Lịch sử xem</h1>
                <div className="grid grid-cols-10 gap-4">
                    {watchHistory.map((history) => (
                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} key={history.id} className="col-span-2 p-4 bg-neutral-900 rounded-lg shadow-md border border-gray-600 hover:shadow-lg transition-shadow" >
                            <div className="group w-40 h-60 relative">
                                {history.film?.thumb && (
                                    <img
                                        src={history.film.thumb}
                                        alt={history.film.title_film}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                )}
                                <a
                                    href={`/film/${history.film?.slug}?episode=${getEpisodeNumber(history.episode?.episode_title || '0')}`}
                                    className="left-0 top-0 absolute backdrop-blur-lg w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg cursor-pointer"
                                >
                                    <h3 className="text-base font-semibold ">
                                        {history.film?.title_film || 'Tên phim không xác định'}
                                    </h3>
                                </a>


                            </div>
                        </motion.div>
                    ))}

                </div>
            </div>
            <div className='col-span-1'></div>

        </motion.div>
    );
};

export default Histories;

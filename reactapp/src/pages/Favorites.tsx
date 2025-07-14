
import React from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useFavoriteList } from '../hooks/useFavoriteList';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
    const { favoriteFilms, loading } = useFavoriteList();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const variants = {
        hidden: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.4 } },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
    };

    // Function to remove a favorite film
    const removeFavorite = async (filmId: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/favorites/${filmId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            // Assuming you have a mechanism to update favoriteFilms in useFavoriteList
            toast.success('Đã xóa phim khỏi danh sách yêu thích');
            // Optionally, refresh the favorite list or update state
            // You might need to update useFavoriteList hook to handle this
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa phim yêu thích');
        }
    };

    // Skeleton loading component
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
                    <h1 className="text-4xl font-bold mb-8">Phim yêu thích</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                </div>
                <div className="col-span-1"></div>
            </div>
        );
    }

    if (!favoriteFilms.length) {
        return (
            <div className="flex flex-col py-60 items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Phim yêu thích</h1>
                <p className="text-lg">Bạn chưa có phim yêu thích nào.</p>
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
                <h1 className="text-4xl font-bold mb-8 ">Phim yêu thích</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {favoriteFilms.map((favorite) => (
                        <motion.div
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            key={favorite.id}
                            className="relative p-4 bg-neutral-800 rounded-xl shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative w-full h-64">
                                {favorite.thumb ? (
                                    <img
                                        src={favorite.thumb}
                                        alt={favorite.title_film}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}
                                {/* Delete button */}
                                <button
                                    onClick={() => removeFavorite(favorite.id)}
                                    className="absolute top-2 right-2 bg-gray-900 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                                    title="Xóa khỏi yêu thích"
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
                                {/* Hover overlay */}
                                <a
                                    href={`/film/${favorite.slug}`}
                                    className="absolute inset-0 bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center rounded-lg"
                                >
                                    <h3 className="text-lg font-semibold text-white text-center">
                                        {favorite.title_film || 'Tên phim không xác định'}
                                    </h3>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="col-span-1"></div>
        </motion.div>
    );
};

export default Favorites;


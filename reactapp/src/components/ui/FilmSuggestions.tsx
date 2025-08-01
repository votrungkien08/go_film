
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, easeIn } from 'framer-motion';

interface Film {
    id: number;
    slug: string;
    title_film: string;
    thumb: string;
    year?: { release_year: string };
    genres?: { genre_name: string }[];
    content: string;
}

interface FilmSuggestionsProps {
    genres?: { genre_name: string }[];
}

const FilmSuggestions: React.FC<FilmSuggestionsProps> = ({ genres }) => {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Hàm chọn ngẫu nhiên n phần tử từ mảng
    const getRandomFilms = useCallback((arr: Film[], n: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }, []);

    useEffect(() => {
        const fetchFilms = async () => {
            try {
                setLoading(true);
                // Nếu có genres, gọi endpoint filter với tham số genre
                const genreNames = genres?.map((g) => g.genre_name).join(',') || '';
                const response = await axios.get('http://localhost:8000/api/films/filter', {
                    params: { genre: genreNames },
                });
                // Chọn ngẫu nhiên 4 phim
                const randomFilms = getRandomFilms(response.data, 4);
                setFilms(randomFilms);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách phim gợi ý');
                setLoading(false);
                console.error('Error fetching films:', err);
            }
        };

        fetchFilms();
    }, [genres, getRandomFilms]);

    // Định nghĩa variants cho hiệu ứng framer-motion
    const variants = {
        hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.5, ease: easeIn } },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeIn } },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <svg
                    className="animate-spin h-5 w-5 text-orange-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span className="ml-2 text-white">Đang tải...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            className="py-8"
        >
            <h2 className="text-2xl font-bold mb-6 text-orange-500">Phim gợi ý cho bạn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {films.map((film) => (
                    <div
                        key={film.id}
                        className="bg-[#444444] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                        <img
                            src={film.thumb}
                            alt={film.title_film}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-white truncate">
                                {film.title_film}
                            </h3>
                            <p className="text-sm text-gray-300 mt-1">
                                {film.year?.release_year || 'N/A'} •{' '}
                                {film.genres?.map((g) => g.genre_name).join(', ') || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                {film.content}
                            </p>
                            <button
                                onClick={() => navigate(`/ film / ${film.slug} `)}
                                className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300"
                            >
                                Xem ngay
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default FilmSuggestions;

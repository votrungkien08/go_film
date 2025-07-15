import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
interface Film {
    id: number;
    slug: string;
    title_film: string;
    thumb: string;
    film_type: number;
    view: number;
    year: { release_year: number } | null | undefined;
    country: { country_name: string } | null | undefined;
    genres: { id: number; genre_name: string }[] | undefined;
    created_at: string;
    film_episodes: {
        id: number;
        episode_number: number;
        episode_title: string;
        episode_url: string;
        duration: string;
    }[];
}

const FilmList = () => {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    // Helper function to get duration display text
    const getDurationDisplay = (film: Film): string => {
        if (!film.film_episodes || film.film_episodes.length === 0) {
            return 'Chưa có thông tin';
        }

        if (film.film_type === 0) {
            // Phim lẻ - hiển thị thời lượng của tập duy nhất
            const episode = film.film_episodes[0];
            return episode.duration && episode.duration !== 'N/A' ? episode.duration : 'Chưa có thông tin';
        } else {
            // Phim bộ - hiển thị số tập
            const totalEpisodes = film.film_episodes.length;
            return `${totalEpisodes} tập`;
        }
    };

    // Helper function to convert URL-friendly slugs back to display names
    const convertSlugToName = (slug: string): string => {
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        const fetchFilms = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams(location.search);

                // gọi favorite từ URL
                const isFavorite = params.get('favorite') === 'true';
                // gọi rank từ URL
                const isRank = params.get('rank') === 'true';

                // goi update từ URL
                const isUpdate = params.get('update') === 'true';
                const apiUrl = isFavorite ? 'http://localhost:8000/api/favorite' : isRank ? 'http://localhost:8000/api/films' : isUpdate ? 'http://localhost:8000/api/films' : 'http://localhost:8000/api/filter-films';

                // Build the new parameter structure to match your FilmController
                const requestParams: any = {};

                if (!isFavorite && !isRank && !isUpdate) {
                    if (params.has('genre')) {
                        const genreParam = params.get('genre');
                        if (genreParam) {
                            requestParams.genre = convertSlugToName(genreParam);
                        }
                    }
                    if (params.has('country')) {
                        const countryParam = params.get('country');
                        if (countryParam) {
                            requestParams.country = convertSlugToName(countryParam);
                        }
                    }
                    if (params.has('year')) {
                        requestParams.year = params.get('year');
                    }
                    if (params.has('type')) {
                        requestParams.type = params.get('type');
                    }
                    if (params.has('search')) {
                        requestParams.search = params.get('search');
                    }
                }
                // sắp xếp theo view cho rank
                if (isRank) {
                    requestParams.sort = 'view';
                    requestParams.order = 'desc';
                }

                if (isUpdate) {
                    requestParams.sort = 'created_at';
                    requestParams.order = 'desc';
                    requestParams.limit = 50; // Giới hạn số lượng phim cập nhật
                }


                const response = await axios.get(apiUrl, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    params: isFavorite ? {} : requestParams
                });
                let fetchedFilms = response.data.film || response.data;
                if (isRank) {
                    fetchedFilms = [...fetchedFilms].sort((a, b) => b.view - a.view);
                }
                if (isUpdate) {
                    fetchedFilms = [...fetchedFilms].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                }
                // console.log('Danh sách phim1:', response.data.film);
                // console.log('Danh sách phim2:', response.data);
                setFilms(fetchedFilms);
                setLoading(false);
            } catch (err: any) {
                setError('Không thể tải danh sách phim');
                setLoading(false);
                console.error('Lỗi khi lấy danh sách phim:', err.response?.data || err.message);
            }
        };
        fetchFilms();
    }, [location.search]);

    if (loading) {
        return <div className="text-center text-white">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8 min-h-[1000px] pt-[70px]">
            <h2 className="text-2xl font-bold  mb-6">
                {new URLSearchParams(location.search).get('favorite') === 'true'
                    ? 'Danh Sách Phim Đề Cử'
                    : new URLSearchParams(location.search).get('rank') === 'true'
                        ? 'Danh Sách Phim Xếp Hạng'
                        : new URLSearchParams(location.search).get('update') === 'true'
                            ? 'Danh Sách Phim Mới Cập Nhật'
                            : 'Danh Sách Phim'}
            </h2>
            {films.length === 0 ? (
                <p className="text-gray-400">Không tìm thấy phim nào.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
                    {films.map((film) => (
                        <Link
                            key={film.id}
                            to={`/film/${film.slug}`}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <img
                                src={film.thumb}
                                alt={film.title_film}
                                className="w-full h-64 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white truncate">
                                    {film.title_film}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {film.year?.release_year || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {film.country?.country_name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {(film.genres ?? []).map((g) => g.genre_name).join(', ') || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {film.film_type === 0 ? 'Phim lẻ' : 'Phim bộ'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {getDurationDisplay(film)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default FilmList;
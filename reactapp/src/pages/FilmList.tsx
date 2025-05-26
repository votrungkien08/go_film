import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

interface Film {
    id: number;
    slug: string;
    title_film: string;
    thumb: string;
    film_type: boolean;
    year: { release_year: number };
    country: { country_name: string };
    genres: { id: number; genre_name: string }[];
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

        if (film.film_type) {
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

                // Build the new parameter structure to match your FilmController
                const requestParams: any = {};

                // Handle genre parameter (can be multiple)
                if (params.has('genre')) {
                    const genreParam = params.get('genre');
                    if (genreParam) {
                        // Convert slug back to display name
                        requestParams.genre = convertSlugToName(genreParam);
                    }
                }

                // Handle country parameter
                if (params.has('country')) {
                    const countryParam = params.get('country');
                    if (countryParam) {
                        // Convert slug back to display name
                        requestParams.country = convertSlugToName(countryParam);
                    }
                }

                // Handle year parameter
                if (params.has('year')) {
                    requestParams.year = params.get('year');
                }

                // Handle film type parameter
                if (params.has('type')) {
                    requestParams.type = params.get('type');
                }

                // Handle search parameter (keep as is)
                if (params.has('search')) {
                    requestParams.search = params.get('search');
                }

                const response = await axios.get('http://localhost:8000/api/filter-films', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    params: requestParams,
                });

                setFilms(response.data);
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
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Danh sách phim</h2>
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
                                    {film.year.release_year}  {film.country.country_name}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {film.country.country_name}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {film.genres.map((g) => g.genre_name).join(', ')}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {film.film_type ? 'Phim lẻ' : 'Phim bộ'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {getDurationDisplay(film)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilmList;
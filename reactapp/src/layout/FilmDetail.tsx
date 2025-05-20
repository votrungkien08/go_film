
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Episode {
    episode_number: number;
    episode_title: string;
    episode_url: string;
    duration: string;
}

interface Year {
    id: number;
    release_year: number;
}

interface Country {
    id: number;
    country_name: string;
}

interface Genre {
    id: number;
    genre_name: string;
}

interface Film {
    id: number;
    slug: string;
    title_film: string;
    thumb: string;
    film_type: boolean;
    year: Year | null;
    country: Country | null;
    genres: Genre[];
    actor: string;
    director: string;
    content: string;
    view: number;
    is_premium: boolean;
    point_required: number | null;
    film_episodes: Episode[];
}

const FilmDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [film, setFilm] = useState<Film | null>(null);
    const [error, setError] = useState('');
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

    // Lấy chi tiết phim từ API
    useEffect(() => {
        const fetchFilm = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/films/${slug}`);
                setFilm(response.data);
                // Chọn tập đầu tiên hoặc video mặc định
                if (response.data.film_episodes && response.data.film_episodes.length > 0) {
                    setSelectedEpisode(response.data.film_episodes[0]);
                }
            } catch (err: any) {
                console.error('Lỗi khi lấy chi tiết phim:', err.response?.data || err.message);
                setError('Không tìm thấy phim hoặc lỗi server.');
            }
        };
        fetchFilm();
    }, [slug]);

    // Xử lý chọn tập phim
    const handleEpisodeSelect = (episode: Episode) => {
        setSelectedEpisode(episode);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-red-500 text-center">
                    {error}
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300]"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!film) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="p-6">
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-300 hover:text-[#ff4c00] mb-4 flex items-center"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Quay lại
                </button>
                <h1 className="text-3xl font-bold">{film.title_film}</h1>
            </div>

            {/* Phần chính */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trình phát video và thông tin phim */}
                <div className="lg:col-span-2">
                    {/* Trình phát video */}
                    <div className="relative aspect-[16/9] bg-black rounded-lg overflow-hidden">
                        {selectedEpisode ? (
                            <video
                                controls
                                className="w-full h-full"
                                poster={film.thumb}
                                src={selectedEpisode.episode_url}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                <p className="text-white">Không có video để phát</p>
                            </div>
                        )}
                    </div>

                    {/* Danh sách tập (cho phim bộ) */}
                    {!film.film_type && film.film_episodes.length > 0 && (
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold mb-2">Danh sách tập</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                {film.film_episodes.map(episode => (
                                    <button
                                        key={episode.episode_number}
                                        onClick={() => handleEpisodeSelect(episode)}
                                        className={`p-2 rounded text-left ${selectedEpisode?.episode_number === episode.episode_number
                                            ? 'bg-[#ff4c00] text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {episode.episode_title || `Tập ${episode.episode_number}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Thông tin phim */}
                <div className="lg:col-span-1">
                    <img
                        src={film.thumb}
                        alt={film.title_film}
                        className="w-full rounded-lg mb-4 object-cover aspect-[2/3]"
                    />
                    <div className="space-y-2">
                        <p>
                            <span className="font-semibold">Thể loại: </span>
                            {film.genres.map(genre => genre.genre_name).join(', ') || 'N/A'}
                        </p>
                        <p>
                            <span className="font-semibold">Năm phát hành: </span>
                            {film.year?.release_year || 'N/A'}
                        </p>
                        <p>
                            <span className="font-semibold">Quốc gia: </span>
                            {film.country?.country_name || 'N/A'}
                        </p>
                        <p>
                            <span className="font-semibold">Diễn viên: </span>
                            {film.actor || 'N/A'}
                        </p>
                        <p>
                            <span className="font-semibold">Đạo diễn: </span>
                            {film.director || 'N/A'}
                        </p>
                        <p>
                            <span className="font-semibold">Nội dung: </span>
                            {film.content || 'N/A'}
                        </p>
                        <p>
                            <span className="font-semibold">Lượt xem: </span>
                            {film.view}
                        </p>
                        <p>
                            <span className="font-semibold">Phim Premium: </span>
                            {film.is_premium ? 'Có' : 'Không'}
                        </p>
                        <p>
                            <span className="font-semibold">Điểm yêu cầu: </span>
                            {film.is_premium ? film.point_required || '0' : 'N/A'}
                        </p>
                        <p>
                            <span className="font-semibold">Loại phim: </span>
                            {film.film_type ? 'Phim lẻ' : 'Phim bộ'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilmDetail;
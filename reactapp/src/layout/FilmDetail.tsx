import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { openAuthPanel } from '../utils/auth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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

interface Comment {
    id: number;
    user_id: number;
    film_id: number;
    comment: string;
    created_at: string;
    user: {
        name: string;
    } | null;
}

const FilmDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [film, setFilm] = useState<Film | null>(null);
    const [error, setError] = useState('');
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    const [tab, setTab] = useState<'comment' | 'rating'>('comment');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState('');

    // Hàm kiểm tra trạng thái đăng nhập
    const checkLoginStatus = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch(`http://localhost:8000/api/user`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                setIsLoggedIn(!!data.user);
            } catch (err) {
                console.error('Fetch user error:', err);
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
    };

    // Kiểm tra trạng thái đăng nhập khi component mount và khi nhận sự kiện loginSuccess/logoutSuccess
    useEffect(() => {
        checkLoginStatus();

        const handleLoginSuccess = () => {
            checkLoginStatus();
        };
        window.addEventListener('loginSuccess', handleLoginSuccess);

        const handleLogoutSuccess = () => {
            checkLoginStatus();
            setRating(null);
        };
        window.addEventListener('logoutSuccess', handleLogoutSuccess);

        return () => {
            window.removeEventListener('loginSuccess', handleLoginSuccess);
            window.removeEventListener('logoutSuccess', handleLogoutSuccess);
        };
    }, []);

    // Lấy chi tiết phim
    useEffect(() => {
        const fetchFilm = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/film/${slug}`);
                setFilm(response.data);
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

    // Lấy danh sách bình luận
    useEffect(() => {
        const fetchComments = async () => {
            if (!film?.id) return;
            setCommentsLoading(true);
            setCommentsError('');
            try {
                const response = await axios.get(`http://localhost:8000/api/film/comments/${film.id}`);
                setComments(response.data.comments);
            } catch (err: any) {
                console.error('Lỗi khi lấy bình luận:', err.response?.data || err.message);
                setCommentsError('Không thể tải bình luận.');
            } finally {
                setCommentsLoading(false);
            }
        };
        fetchComments();
    }, [film?.id]);

    // Lấy đánh giá của người dùng hiện tại
    useEffect(() => {
        const fetchUserRating = async () => {
            if (!film?.id || !isLoggedIn) return;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/film/rating/${film.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRating(response.data.rating || null);
            } catch (err: any) {
                console.error('Lỗi khi lấy đánh giá:', err.response?.data || err.message);
            }
        };
        fetchUserRating();
    }, [film?.id, isLoggedIn]);

    const handleEpisodeSelect = (episode: Episode) => {
        setSelectedEpisode(episode);
    };

    // Xử lý gửi bình luận
    const handlePostComment = async () => {
        if (!isLoggedIn) {
            setShowAuthPrompt(true);
            return;
        }
        if (!comment.trim()) {
            alert('Vui lòng nhập bình luận!');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:8000/api/film/postComment',
                { film_id: film?.id, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComment('');
            alert('Bình luận đã được gửi!');
            const response = await axios.get(`http://localhost:8000/api/film/comments/${film?.id}`);
            setComments(response.data.comments);
        } catch (err: any) {
            console.error('Lỗi khi gửi bình luận:', err.response?.data || err.message);
            alert('Có lỗi xảy ra khi gửi bình luận.');
        }
    };

    // Xử lý gửi đánh giá
    const handlePostRating = async () => {
        if (!isLoggedIn) {
            setShowAuthPrompt(true);
            return;
        }
        if (!rating || rating < 1 || rating > 5) {
            alert('Vui lòng chọn số sao từ 1 đến 5!');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:8000/api/film/postRating',
                { film_id: film?.id, rating },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Đánh giá đã được gửi!');
            const response = await axios.get(`http://localhost:8000/api/film/rating/${film?.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRating(response.data.rating || null);
        } catch (err: any) {
            console.error('Lỗi khi gửi đánh giá:', err.response?.data || err.message);
            alert('Có lỗi xảy ra khi gửi đánh giá.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-[#333333] flex flex-col items-center justify-center text-red-500">
                <h4 className="text-xl font-semibold">{error}</h4>
                <button
                    className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300"
                    onClick={() => navigate('/')}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!film) {
        return (
            <div className="min-h-screen bg-[#333333] flex items-center justify-center text-white">
                <div className="flex items-center gap-2">
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
                    <span>Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#333333] text-white py-6">
            <div className="container mx-auto px-4">
                <button
                    className="flex items-center gap-2 text-gray-300 hover:text-orange-500 transition-colors duration-300 mb-6"
                    onClick={() => navigate('/')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                </button>

                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-orange-500">{film.title_film}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                            {selectedEpisode ? (
                                <video
                                    controls
                                    className="w-full h-full object-cover"
                                    poster={film.thumb}
                                    src={selectedEpisode.episode_url}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="flex items-center justify-center bg-gray-800 h-full text-gray-300">
                                    <p>Không có video để phát</p>
                                </div>
                            )}
                        </div>

                        {!film.film_type && film.film_episodes.length > 0 && (
                            <div className="mt-4">
                                <h2 className="text-xl font-semibold mb-3">Danh sách tập</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                    {film.film_episodes.map(episode => (
                                        <button
                                            key={episode.episode_number}
                                            onClick={() => handleEpisodeSelect(episode)}
                                            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${selectedEpisode?.episode_number === episode.episode_number
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]'
                                                }`}
                                        >
                                            {episode.episode_title || `Tập ${episode.episode_number}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex border-b border-gray-700 mt-4">
                            <button
                                className={`px-4 py-2 rounded-t-md ${tab === 'comment' ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] cursor-pointer'
                                    }`}
                                onClick={() => setTab('comment')}
                            >
                                Bình luận
                            </button>
                            <button
                                className={`px-4 py-2 rounded-t-md ${tab === 'rating' ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] cursor-pointer'
                                    }`}
                                onClick={() => setTab('rating')}
                            >
                                Đánh giá
                            </button>
                        </div>

                        <div className="mt-4">
                            {tab === 'comment' && (
                                <div className="bg-[#444444] rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <UserCircleIcon className="h-10 w-10 text-gray-300" />
                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            onFocus={() => !isLoggedIn && setShowAuthPrompt(true)}
                                            className="flex-1 p-2 bg-[#3A3A3A] text-white border border-gray-600 rounded-md focus:outline-none focus:border-orange-500"
                                            placeholder="Nhập bình luận của bạn..."
                                        />
                                        <button
                                            onClick={handlePostComment}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300 cursor-pointer"
                                        >
                                            Đăng
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {commentsLoading && (
                                            <div className="flex items-center justify-center">
                                                <svg
                                                    className="animate-spin h-5 w-5 text-orange-500"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                <span className="ml-2">Đang tải bình luận...</span>
                                            </div>
                                        )}
                                        {commentsError && (
                                            <p className="text-red-500 text-center">{commentsError}</p>
                                        )}
                                        {!commentsLoading && comments.length === 0 && !commentsError && (
                                            <p className="text-gray-400 text-center">Chưa có bình luận nào.</p>
                                        )}
                                        {!commentsLoading &&
                                            comments.map(comment => (
                                                <div key={comment.id} className="flex items-start gap-3">
                                                    <UserCircleIcon className="h-8 w-8 text-gray-300" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-semibold text-orange-500">
                                                                {comment.user?.name || 'Ẩn danh'}
                                                            </p>
                                                            <p className="text-sm text-gray-400">
                                                                {dayjs(comment.created_at).fromNow()}
                                                            </p>
                                                        </div>
                                                        <p className="text-gray-200">{comment.comment}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                            {tab === 'rating' && (
                                <div className="bg-[#444444] rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <UserCircleIcon className="h-10 w-10 text-gray-300" />
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className={`text-2xl ${rating && rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handlePostRating}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
                                        >
                                            Gửi đánh giá
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-[#444444] rounded-lg p-4 shadow-lg">
                            <img
                                src={film.thumb}
                                alt={film.title_film}
                                className="w-3/4 mx-auto rounded-md mb-4 object-cover aspect-square max-h-48"
                            />
                            <div className="space-y-2">
                                <p>
                                    <span className="font-semibold text-orange-500">Thể loại:</span>{' '}
                                    {film.genres.map(genre => genre.genre_name).join(', ') || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Năm phát hành:</span>{' '}
                                    {film.year?.release_year || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Quốc gia:</span>{' '}
                                    {film.country?.country_name || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Diễn viên:</span>{' '}
                                    {film.actor || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Đạo diễn:</span>{' '}
                                    {film.director || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Nội dung:</span>{' '}
                                    {film.content || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Lượt xem:</span> {film.view}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Phim Premium:</span>{' '}
                                    {film.is_premium ? 'Có' : 'Không'}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Điểm yêu cầu:</span>{' '}
                                    {film.is_premium ? film.point_required || '0' : 'N/A'}
                                </p>
                                <p>
                                    <span className="font-semibold text-orange-500">Loại phim:</span>{' '}
                                    {film.film_type ? 'Phim lẻ' : 'Phim bộ'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {showAuthPrompt && (
                    <div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
                        onClick={() => setShowAuthPrompt(false)}
                    >
                        <div
                            className="bg-[#444444] w-96 rounded-lg p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-semibold mb-4 text-white">
                                Vui lòng đăng nhập để sử dụng chức năng này
                            </h2>
                            <div className="flex justify-around">
                                <button
                                    onClick={() => setShowAuthPrompt(false)}
                                    className="px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#4A4A4A] transition-colors duration-300"
                                >
                                    Thoát
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAuthPrompt(false);
                                        openAuthPanel();
                                    }}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
                                >
                                    Đồng ý
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilmDetail;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, CircleChevronLeft, CircleChevronRight } from 'lucide-react';

interface Film {
    id: number;
    slug: string;
    title_film: string;
    thumb: string;
    trailer: string;
    film_type: boolean;
    year: { id: number; release_year: number } | null;
    country: { id: number; country_name: string } | null;
    genres: { id: number; genre_name: string }[];
    actor: string;
    director: string;
    content: string;
    view: number;
    is_premium: boolean;
    point_required: number | null;
    film_episodes: { episode_number: number; episode_title: string; episode_url: string; duration: string }[];
}

interface Rating {
    id: number;
    user_id: number;
    film_id: number;
    created_at: Date;
}

const Nominate = () => { 

    const navigate = useNavigate();
    const [films, setFilms] = useState<Film[]>([]);
    const [error, setError] = useState('');
    const [currentFilm, setCurrentFilm] = useState<Film | null>(null);
    const topFilmFavorite = films.slice(0, 10);

    // Lấy index phim
    const currentIndex = topFilmFavorite.findIndex(film => film.id === currentFilm?.id);
    console.log('currentIndex', currentIndex, 'currentFilm', currentFilm, 'topFilmFavorite', topFilmFavorite);

    // Nút Previous
    const goToPreviousFilm = () => {
        if (currentIndex > 0) {
            setCurrentFilm(topFilmFavorite[currentIndex - 1]);
        } else if (currentIndex === 0 && topFilmFavorite.length > 0) {
            setCurrentFilm(topFilmFavorite[topFilmFavorite.length - 1]); // Quay lại phim cuối
        }

    };

    // Nút Next
    const goToNextFilm = () => {
        if (currentIndex < topFilmFavorite.length - 1) {
            setCurrentFilm(topFilmFavorite[currentIndex + 1]);
        } else if (currentIndex === topFilmFavorite.length - 1 && topFilmFavorite.length > 0) {
            setCurrentFilm(topFilmFavorite[0]); // Quay lại phim đầu
        }
    };

    // Lấy currentFilm
    useEffect(() => {
        if (topFilmFavorite.length > 0 && !currentFilm) {
            setCurrentFilm(topFilmFavorite[0]); // Chỉ đặt lại khi chưa có currentFilm
        }
    }, [topFilmFavorite, currentFilm]);

    // Gọi API để lấy danh sách phim
    useEffect(() => {
        const fetchFilms = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/favorite', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                console.log('phim ne', response.data.film);
                setFilms(response.data.film);
            } catch (err: any) {
                console.error('Lỗi khi lấy danh sách phim:', err.response?.data || err.message);
                setError('Không thể tải danh sách phim.');
            }
        };
        fetchFilms();
    }, []);

    // duration next 10s
    useEffect(() => {
        if (!currentFilm) return;

        const timer = setTimeout(() => {
            goToNextFilm();
        }, 10000); // sau 10 giây

        return () => clearTimeout(timer); // clear nếu currentFilm đổi
    }, [currentFilm]);

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 relative -mx-4 gap-4">
                {/* Trailer */}
                <div
                    className="w-full aspect-[16/9] relative group  before:content-none after:content-none"
                    style={{
                        content: 'none',
                        counterReset: 'none',
                        counterIncrement: 'none',
                        fontSize: '0px',
                        overflow: 'hidden',
                    }}
                >
                    {currentFilm ? (
                        <>
                            {currentFilm.trailer && (
                                <video
                                    className="absolute top-0 left-0 w-full h-full transition-opacity duration-300"
                                    src={currentFilm.trailer}
                                    autoPlay
                                    muted
                                    loop
                                    controls={false}
                                    poster={currentFilm.thumb} // Hiển thị thumb khi video chưa load
                                >
                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                </video>
                            )}
                            {currentFilm.is_premium && (
                                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                    Premium
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-lg">
                            <p className="text-white">Không có phim</p>
                        </div>
                    )}
                </div>

                <div className="absolute text-left bottom-40 left-0 w-[400px] p-4">
                    <h1 className="text-3xl font-bold text-white">{currentFilm?.title_film}</h1>
                    <p className="text-sm mt-2 text-white line-clamp-5">{currentFilm?.content}</p>
                    <div className="buttons flex gap-4 mt-4">
                        <button
                            onClick={() => currentFilm && navigate(`/film/${currentFilm.slug}`)}
                            className="cursor-pointer play-button flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg"
                        >
                            <Play /> Xem ngay
                        </button>
{/* 
                        <button className="detail-button bg-black text-white px-4 py-2 rounded-lg border border-white">
                            Chi tiết
                        </button> */}
                    </div>
                </div>

                <div className="text-white absolute flex items-center justify-center right-0 bottom-40">
                    <button className="cursor-pointer" onClick={goToPreviousFilm}>
                        <CircleChevronLeft className="w-14 h-14" />
                    </button>
                    {topFilmFavorite.map((film) => (
                        <button
                            key={film.id}
                            className={`h-3 w-3 m-2 rounded-full transition-all duration-300 ${currentFilm?.id === film.id ? 'bg-white scale-125' : 'bg-neutral-500'
                                }`}
                        />
                    ))}
                    <button className="cursor-pointer" onClick={goToNextFilm}>
                        <CircleChevronRight className="w-14 h-14" />
                    </button>
                </div>
            </div>
        </div>
    );
}


export default Nominate;
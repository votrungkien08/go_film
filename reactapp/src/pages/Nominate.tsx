import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Film {
    id: number;
    slug: string;
    title_film: string;
    thumb: string;
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

const Nominate = () => {
    const navigate = useNavigate();
    const [films, setFilms] = useState<Film[]>([]);
    const [error, setError] = useState('');

    // Gọi API để lấy danh sách phim
    useEffect(() => {
        const fetchFilms = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/films', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setFilms(response.data);
            } catch (err: any) {
                console.error('Lỗi khi lấy danh sách phim:', err.response?.data || err.message);
                setError('Không thể tải danh sách phim.');
            }
        };
        fetchFilms();
    }, []);

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-4 py-4">
            <div className="col-span-2"></div>
            <div className="col-span-8">
                <div className="grid grid-cols-8 gap-4 mb-4">
                    <div className="col-span-4 flex items-center h-12">
                        <img src="/img/logofilm.png" alt="Logo" className="w-10 h-10" />
                        <h1 className="ml-2 text-white font-bold">PHIM ĐỀ CỬ</h1>
                    </div>
                    <div className="col-span-4 flex items-center justify-end">
                        <h1
                            className="mr-2 text-white font-bold cursor-pointer"
                            onClick={() => navigate('/films')} // Tùy chọn: dẫn đến trang danh sách phim
                        >
                            XEM TẤT CẢ
                        </h1>
                        <img src="/img/logofilm.png" alt="Logo" className="w-10 h-10" />
                    </div>
                </div>
                <div className="grid grid-cols-8 gap-4">
                    <div
                        className="col-span-4 relative group aspect-[16/9] cursor-pointer"
                        onClick={() => films[0] && navigate(`/film/${films[0].slug}`)}
                    >
                        {films[0] ? (
                            <>
                                <img
                                    src={films[0].thumb}
                                    alt={films[0].title_film}
                                    className="w-full h-full object-cover rounded-lg"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <h2 className="text-white text-lg font-semibold text-center px-2">
                                        {films[0].title_film}
                                    </h2>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-lg">
                                <p className="text-white">Không có phim</p>
                            </div>
                        )}
                    </div>
                    <div className="col-span-4 grid grid-cols-2 grid-rows-2 gap-4">
                        {[1, 2, 3, 4].map(index => (
                            <div
                                key={index}
                                className="relative group aspect-[16/9] cursor-pointer"
                                onClick={() => films[index] && navigate(`/film/${films[index].slug}`)}
                            >
                                {films[index] ? (
                                    <>
                                        <img
                                            src={films[index].thumb}
                                            alt={films[index].title_film}
                                            className="w-full h-full object-cover rounded-lg"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <h2 className="text-white text-sm font-semibold text-center px-2">
                                                {films[index].title_film}
                                            </h2>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-lg">
                                        <p className="text-white">Không có phim</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-8 gap-4 mt-4">
                    {[5, 6, 7, 8].map(index => (
                        <div
                            key={index}
                            className="col-span-2 relative group aspect-[16/9] cursor-pointer"
                            onClick={() => films[index] && navigate(`/film/${films[index].slug}`)}
                        >
                            {films[index] ? (
                                <>
                                    <img
                                        src={films[index].thumb}
                                        alt={films[index].title_film}
                                        className="w-full h-full object-cover rounded-lg"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <h2 className="text-white text-sm font-semibold text-center px-2">
                                            {films[index].title_film}
                                        </h2>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-lg">
                                    <p className="text-white">Không có phim</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-span-2"></div>
        </div>
    );
};

export default Nominate;
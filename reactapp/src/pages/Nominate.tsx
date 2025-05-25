import { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    created_at: Date
}

const Nominate = () => {
    const navigate = useNavigate();
    const [films, setFilms] = useState<Film[]>([]);
    console.log("Dữ liệu films:", films);
    const [error, setError] = useState('');
    const [currentFilm,setCurrentFilm] = useState(null);
    const [rating,setRating] = useState<Rating[]>([]);

    const topFilmFavorite = films.slice(0,4);
    function getYouTubeId(url?: string): string | undefined {
        if (!url) return undefined;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match?.[1];
    }
    // lấy currentfilm
    useEffect(() => {
        if (films && films.length > 0) {
            setCurrentFilm(films[0]);
        }
    }, [films]);

    // Gọi API để lấy danh sách phim
    useEffect(() => {
        const fetchFilms = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/favorite', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                console.log('phim ne',response.data.film)
                setFilms(response.data.film);
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
        <div className="grid grid-cols-12 gap-4 py-4 pt-[100px]">
            <div className="col-span-1"></div>
            <div className="col-span-10">
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

                <div className="grid grid-cols-8 gap-4 ">
                    {/* bên trái */}
                    <div className="col-span-4 h-full   aspect-[16/9] relative group  cursor-pointer before:content-none after:content-none"
                        style={{
                            content: 'none',
                            counterReset: 'none',
                            counterIncrement: 'none',
                            fontSize: '0px',
                            overflow: 'hidden'}}
                        // onClick={() => currentFilm && navigate(`/film/${currentFilm.slug}`)}
                    >
                        {films[0] ? (
                            <>

                                {currentFilm?.trailer && (
                                    <iframe
                                    className="absolute top-0 left-0 w-full h-full  transition-opacity duration-300 rounded-lg"
                                    src={`https://www.youtube.com/embed/${getYouTubeId(currentFilm?.trailer)}?autoplay=1&mute=1&controls=0`}
                                    title="Trailer"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    ></iframe>
                                )

                                }
                                {currentFilm?.is_premium && (
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
                    {/* bên phải */}
                    <div className="col-span-4 h-full  aspect-[16/9] grid grid-cols-2 grid-rows-2 gap-4">
                        {topFilmFavorite.map((film,index)=> (
                            <div onMouseOver={() => setCurrentFilm(film) } onClick={() =>(setCurrentFilm(film), navigate(`/film/${films[index].slug}`))} key={film.id} className='relative  group cursor-pointer'>
                                {films ? (
                                    <>
                                        <img  loading="lazy" className="w-full h-full object-cover rounded-lg"  src={film.thumb} alt={film.title_film}/>
                                        {films.is_premium && (
                                            <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center">
                                                Premium
                                            </div>
                                        )}
                                        <div className="backdrop-blur-sm cursor-pointer absolute inset-0  bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <h2 className="text-white  text-sm font-semibold text-center px-2">
                                                {film.title_film}
                                            </h2>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-lg">
                                        <p className="text-white">Không có phim</p>
                                    </div>
                                )
                                }
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <div className="col-span-1"></div>
        </div>
    );
};

export default Nominate;
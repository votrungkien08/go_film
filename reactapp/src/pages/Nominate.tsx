import { useEffect, useState } from 'react';
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

const Nominate = () => {
    const navigate = useNavigate();
    const [films, setFilms] = useState<Film[]>([]);
    console.log("Dữ liệu films:", films);
    const [error, setError] = useState('');
    const [currentFilm,setCurrentFilm] = useState(null);
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
                {/* <div className='grid grid-cols-8 gap-4'>
                    <div onClick={() => films[0] && navigate(`/film/${films[0].slug}`)} className='col-span-4'>
                            <h1>bbb</h1>
                    </div>
                <div className="col-span-4 grid grid-cols-2 gap-4 h-full">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="bg-gray-700 rounded-lg min-h-[100px] flex items-center justify-center">
                                <span className="text-white">Phim {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div> */}
                <div className="grid grid-cols-8 gap-4 ">
                    <div className="col-span-4 h-full   aspect-[16/9] relative group  cursor-pointer before:content-none after:content-none"
                        style={{
                            content: 'none',
                            counterReset: 'none',
                            counterIncrement: 'none',
                            fontSize: '0px',
                            lineHeight: '0',
                            overflow: 'hidden'}}
                        onClick={() => currentFilm && navigate(`/film/${currentFilm.slug}`)}
                    >
                        {films[0] ? (
                            <>
                                {/* <img
                                    src={films[0].thumb}
                                    alt={films[0].title_film}
                                    className="w-full h-full object-cover  rounded-lg"
                                    loading="lazy"
                                /> */}
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
                                {/* <div className=" absolute inset-0  bg-opacity-50 flex items-center justify-center opacity-5 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <h2 className="text-white text-lg font-semibold text-center px-2">
                                        {films[0].title_film}
                                    </h2>
                                </div> */}
                            </>
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-lg">
                                <p className="text-white">Không có phim</p>
                            </div>
                        )}
                    </div>
                    <div className="col-span-4 h-full  aspect-[16/9] grid grid-cols-2 grid-rows-2 gap-4">
                        {[1,2,3,4].map(index=> (
                            <div onMouseOver={() => films[index] && setCurrentFilm(films[index])} onClick={() =>films[index] &&(setCurrentFilm(films[index]), navigate(`/film/${films[index].slug}`))} key={index} className='relative  group cursor-pointer'>
                                {films[index] ? (
                                    <>
                                        <img  loading="lazy" className="w-full h-full object-cover rounded-lg"  src={films[index].thumb} alt={films[index].title_film}/>
                                        {films[index].is_premium && (
                                            <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded text-center">
                                                Premium
                                            </div>
                                        )}
                                        <div className="backdrop-blur-sm absolute inset-0  bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <h2 className="text-white  text-sm font-semibold text-center px-2">
                                                {films[index].title_film}
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
            <div className="col-span-2"></div>
        </div>
    );
};

export default Nominate;
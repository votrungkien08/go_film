import { useEffect,useState } from "react"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const Rank = () => {
    const navigate = useNavigate();
    const [films, setFilms] = useState<Film[]>([]);
    const [error, setError] = useState<string | null>(null);
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
    const topFilms = [...films]
        .sort((a, b) => b.view - a.view)
        .slice(0, 5);
    return (
        <>
            <div className="grid grid-cols-12 gap-4 py-4">
                <div className="col-span-1"></div>

                <div className=" col-span-10 grid grid-cols-5 gap-4">
                    {topFilms.map((item,index) => (
                        <>
                            <div className="col-span-1 relative overflow-visible group">

                                <div className=" text-left text-black text-[200px] font-black" style={{WebkitTextStroke: '3px #cbcbcb'}}>
                                    {index+1}
                                </div>
                                <img className="absolute top-16 left-18 z-10 rounded-lg   object-cover w-32 h-48 " src={item.thumb} alt="" />
                                <div onClick={()=> {navigate(`/film/${item.slug}`)}}  className="backdrop-blur-sm absolute top-16 left-18 z-20 rounded-lg w-32 h-48 cursor-pointer opacity-0 group-hover:opacity-100   flex items-center justify-center ">
                                    <p className="text-center  text-sm font-semibold">{item.title_film}</p>
                                </div>
                            </div>
                        </>
                        
                    ))}
                    
                </div>

                <div className="col-span-1"></div>

            </div>
        </>
    )
}


export default Rank
import { useRef,useEffect,useState } from "react"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../components/theme-provider";
import { motion } from 'framer-motion';
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
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [films, setFilms] = useState<Film[]>([]);
    const [error, setError] = useState<string | null>(null);
    const getEpisodeNumber = (number: string): number => {
        const match = number.match(/\d+/); // 
        return match ? parseInt(match[0]) : 0;
    };
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
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollLeft = () => {
        if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };
    const topFilms = [...films]
        .sort((a, b) => b.view - a.view)
        .slice(0, 10);
    return (
        <>
            <div className="grid grid-cols-12 min-h-80 gap-4 py-4">
                
                <div className="col-span-1"></div>

                <div className="col-span-10 gap-4 ">
                    <div className="grid grid-cols-8 gap-4 mb-4 shadow shadow-gray-500/50 ">
                        <div className="col-span-4 flex items-center h-12">
                            <img src="/img/logofilm.png" alt="Logo" className="w-10 h-10" style={{filter: 'invert(53%) sepia(94%) saturate(749%) hue-rotate(353deg) brightness(101%) contrast(101%)'}} />
                            <h1 className="ml-2  font-bold">BẢNG XẾP HẠNG</h1>
                        </div>
                        <div className="col-span-4 flex items-center justify-end">
                            <h1
                                className="mr-2  font-bold cursor-pointer"
                                onClick={() => navigate('/films')} // Tùy chọn: dẫn đến trang danh sách phim
                            >
                                XEM TẤT CẢ
                            </h1>
                            <img src="/img/logofilm.png" alt="Logo" className="w-10 h-10" />
                        </div>
                    </div>
                    <div className="group relative">
                        <button onClick={scrollLeft} className={`h-48 opacity-0 group-hover:opacity-100   text-7xl  z-30 top-16 absolute left-0    p-4  cursor-pointer ${theme === 'dark' ? "to-white/50 group-hover:bg-white/40 text-black" : ""} ${theme === 'light' ? "to-black/50 group-hover:bg-black/40 text-white" : ""} ${theme === 'system' ? " to-white/50 group-hover:bg-white/40 text-black" : ""} `} >&#8249;</button>

                        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide flex flex-nowrap gap-4">
                            {topFilms.map((item,index) => (
                            
                                <motion.div whileHover={{ scale: 1.2 }}  whileTap={{ scale: 0.8 }} key={index} className="min-w-[20%] max-w-[20%] relative overflow-visible  group/item ">

                                    <div className=" text-left text-black text-[200px] font-black" style={{WebkitTextStroke: '3px #cbcbcb'}}>
                                        {index+1}
                                    </div>
                                    <img className="absolute top-16 left-18 z-9 rounded-lg   object-cover w-32 h-48 " src={item.thumb} alt="" />
                                    <div  onClick={()=> {navigate(`/film/${item.slug}`)}}  className="backdrop-blur-sm absolute top-16 left-18 z-20 rounded-lg w-32 h-48 cursor-pointer opacity-0 group-hover/item:opacity-100 transition-opacity duration-300  flex items-center justify-center ">
                                        <p className="text-center  text-sm font-semibold ">{item.title_film}</p>
                                    </div>
                                </motion.div>
                            
                                
                            ))}
                            
                        </div>
                        <button onClick={scrollRight} className={`h-48  opacity-0 group-hover:opacity-100 text-7xl  z-30 top-16  absolute right-0    p-4  cursor-pointer ${theme === 'dark' ? "to-white/50 group-hover:bg-white/40 text-black" : ""} ${theme === 'light' ? "to-black/50 group-hover:bg-black/40 text-white" : ""} ${theme === 'system' ? " to-white/50 group-hover:bg-white/40 text-black" : ""}`}>&#8250;</button>
                    </div>

                </div>


                <div className="col-span-1"></div>

            </div>
        </>
    )
}


export default Rank
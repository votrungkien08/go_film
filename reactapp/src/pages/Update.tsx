import { useRef ,useEffect,useState } from "react"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area"

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
    created_at: string;
    film_episodes: { episode_number: number; episode_title: string; episode_url: string; duration: string }[];
}

const Update = () => {
    const navigate = useNavigate();
    const [films, setFilms] = useState<Film[]>([]);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
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
    const updateFilm = [...films]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    console.log('film',films,'error',error);
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
    // if (error) {
    //     return (
    //         <div className="min-h-screen bg-[#333333] flex flex-col items-center justify-center text-red-500">
    //             <h4 className="text-xl font-semibold">{error}</h4>
    //             <button
    //                 className="mt-4 bg-orange-500  px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300"
    //                 onClick={() => navigate('/')}
    //             >
    //                 Quay lại
    //             </button>
    //         </div>
    //     );
    // }

    // if (!film) {
    //     return (
    //         <div className="min-h-screen bg-[#333333] flex items-center justify-center ">
    //             <div className="flex items-center gap-2">
    //                 <svg
    //                     className="animate-spin h-5 w-5 text-orange-500"
    //                     xmlns="http://www.w3.org/2000/svg"
    //                     fill="none"
    //                     viewBox="0 0 24 24"
    //                 >
    //                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    //                     <path
    //                         className="opacity-75"
    //                         fill="currentColor"
    //                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    //                     ></path>
    //                 </svg>
    //                 <span>Đang tải...</span>
    //             </div>
    //         </div>
    //     );
    // }


    return (
        <>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-1"></div>
                <div className="col-span-10">
                <div className="grid grid-cols-10 gap-4 mb-4">
                    <div className="col-span-5 flex items-center h-12">
                            <img src="/img/logofilm.png" alt="Logo" className="w-10 h-10" />
                            <h1 className="ml-2  font-bold">PHIM ĐỀ CỬ</h1>
                        </div>
                        <div className="col-span-5 flex items-center justify-end">
                            <h1
                                className="mr-2  font-bold cursor-pointer"
                                onClick={() => navigate('/films')} // Tùy chọn: dẫn đến trang danh sách phim
                            >
                                XEM TẤT CẢ
                            </h1>
                            <img src="/img/logofilm.png" alt="Logo" className="w-10 h-10" />
                        </div>
                    </div>
                    <div className="col-span-10">
                        {/* <div ref={scrollRef} className='grid grid-cols-10 col-span-10 gap-4 '>
                            <button onClick={scrollLeft} className="z-10 top-1/2 -translate-y-1/2 absolute left-0 text-black bg-opacity-50 rounded-full  p-4 bg-white cursor-pointer">&#8249;</button>
                            {updateFilm.map((item,index) => (
                                <div key={item.id} className="col-span-2 cursor-pointer relative group">
                                    <img className='w-full h-full object-cover rounded-lg' src={item.thumb} alt="" />
                                    <div onClick={()=> {navigate(`/film/${item.slug}`)}} className='absolute rounded-lg bottom-0 opacity-0 backdrop-blur-sm group-hover:opacity-100  flex items-center justify-center w-full h-full'>
                                        <h2 className=' text-sm font-semibold text-center px-2'>{item.title_film}</h2>
                                    </div>
                                </div>
                            ))}
                            
                            <button onClick={scrollRight} className="z-10 top-1/2 -translate-y-1/2 absolute right-0 text-black bg-opacity-50 rounded-full  p-4 bg-white cursor-pointer">&#8250;</button>
                        </div> */}
                        <div className="relative">
                            <button onClick={scrollLeft} className="z-10 top-1/2 -translate-y-1/2 absolute left-0 text-black bg-opacity-50 rounded-full  p-4 bg-white cursor-pointer">&#8249;</button>
                            
                            <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
                                <div className="flex flex-nowrap gap-4">
                                    {updateFilm.map((item,index) => (
                                        <div key={item.id} className="min-w-[20%] max-w-[20%] overflow-hidden cursor-pointer relative group">
                                            <img className='w-full h-full object-cover rounded-lg' src={item.thumb} alt="" />
                                            <div onClick={()=> {navigate(`/film/${item.slug}`)}} className='absolute rounded-lg bottom-0 opacity-0 backdrop-blur-sm group-hover:opacity-100  flex items-center justify-center w-full h-full'>
                                                <h2 className=' text-sm font-semibold text-center px-2'>{item.title_film}</h2>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <button onClick={scrollRight} className="z-10 top-1/2 -translate-y-1/2 absolute right-0 text-black bg-opacity-50 rounded-full  p-4 bg-white cursor-pointer">&#8250;</button>
                            
                        </div>
                    </div>
                </div>
                <div className="col-span-1"></div>
            </div>   
        </>
    )
}

export default Update;
import { useFilmBySlug } from "@/hooks/useFilm";
import { useParams, useNavigate } from "react-router-dom";
import {
    Play,
    Heart,
    MessageCircle,
    Star,
    Clock,
    Calendar,
    Globe,
    User,
} from "lucide-react";
import { useFavorite } from "@/hooks/useFavorite";
import { useAuth } from "@/hooks/useAuth";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useState } from "react";
import { useRatingMutation,useFetchUserRating,useFetchRatings } from "@/hooks/useRating";
import { toast } from "sonner";
const CommentsSection = lazy(() => import("@/components/comments/CommentSection"));
export default function InfomationFilm() {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const { film } = useFilmBySlug(slug!);
    const { isLogin } = useAuth();
    const { isFavorite, likeCount, handleToggleFavorite } = useFavorite(
        film?.id!,
        isLogin
    );
    // console.log("slug param:", slug);
    // console.log("InfomationFilm isLoggedIn", isLogin);
    // console.log("InfomationFilm film", isFavorite, film?.id);
    // console.log("InfomationFilm film:", film);
    const handleNextFilmDetail = (slug: string) => {
        navigate(`/watch-film/${slug}`);
    };

    const stars = Array(10).fill(0);
    const [showFormRating,setShowFormRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
    const { addRating } = useRatingMutation();
    const fetchUserRating = useFetchUserRating(film?.id!);
    console.log("fetchUserRating:", fetchUserRating);
    const fetchRatings = useFetchRatings(film?.id!);
    const averageRating = fetchRatings?.rating.length ? fetchRatings?.rating.reduce((acc,item) => acc + item.rating ,0) / fetchRatings?.rating.length : 0;
    const refFormRating = useRef(null);


    const handleMoveOver = (value: number) => {
        setHoverValue(value);
    }
    const handleMoveLeave = () => { 
        setHoverValue(undefined);
    }
    const handleClickStar = (value: number) => {
        setRating(value);
    }
    const handlePostRating = (film_id: number, rating: number) => { 
        if(!isLogin) {
            toast.error("Vui lòng đăng nhập để đánh giá phim");
            return;
        }
        addRating.mutate({ film_id, rating });
    }
    useEffect(() => {
    if (showFormRating) {
        const section = document.getElementById("rating-section");
        if (section) {
        section.scrollIntoView({ behavior: "smooth" ,block: "center" });
        }
    }
    }, [showFormRating]);
    return (
        <div className="-mx-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="relative  bg-pattern w-full aspect-[16/9] mt-[40px] overflow-hidden">
                <img
                    src={film?.thumb}
                    className=" w-full h-full  object-cover"
                    alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                <div
                    className="absolute inset-0 opacity-60"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)",
                        backgroundSize: "4px 4px",
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative -mt-80 z-10 max-w-7xl ">
                <div className=" backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
                    <div className="grid lg:grid-cols-3 gap-8 p-8">
                        {/* Left Column - Poster & Info */}
                        <div className="lg:col-span-1 space-y-6 text-left">
                            {/* Movie Poster */}
                            <div className="relative group">
                                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                                    <img
                                        src={film?.thumb}
                                        alt={film?.title_film}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            </div>

                            {/* Movie Title */}
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                                    {film?.title_film}
                                </h1>
                                <div className="inline-flex items-center bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1">
                                    <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                                    <span className="text-orange-300 font-medium">
                                        {film?.year?.release_year}
                                    </span>
                                </div>
                            </div>

                            {/* Movie Details */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Giới thiệu
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed line-clamp-4">
                                        {film?.content}
                                    </p>
                                </div>

                                {/* Genres */}
                                <div>
                                    <h4 className="text-white font-medium mb-2">
                                        Thể loại
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {film?.genres.map((item) => (
                                            <span
                                                key={item.id}
                                                className="inline-flex items-center bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 rounded-full px-3 py-1 text-sm text-gray-200 transition-colors cursor-pointer"
                                            >
                                                {item.genre_name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center text-gray-300">
                                        <Globe className="w-4 h-4 mr-3 text-blue-400" />
                                        <span className="text-sm">
                                            Quốc gia:{" "}
                                            <span className="text-white font-medium">
                                                {film?.country?.country_name}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <Clock className="w-4 h-4 mr-3 text-green-400" />
                                        <span className="text-sm">
                                            Thời lượng:{" "}
                                            <span className="text-white font-medium">
                                                {
                                                    film?.film_episodes[0]
                                                        ?.duration
                                                }
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <User className="w-4 h-4 mr-3 text-purple-400" />
                                        <span className="text-sm">
                                            Đạo diễn:{" "}
                                            <span className="text-white font-medium">
                                                {film?.director}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <User className="w-4 h-4 mr-3 text-purple-400" />
                                        <span className="text-sm">
                                            Diễn viên:{" "}
                                            <span className="text-white font-medium">
                                                {film?.actor}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Actions & Episodes */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() =>
                                    {
                                        handleNextFilmDetail(slug!)
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }
                                    }
                                    className="group relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
                                >
                                    <div className="flex items-center justify-center">
                                        <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                        <span>Xem ngay</span>
                                    </div>
                                </button>

                                <button onClick={handleToggleFavorite} className="group relative bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50 hover:border-orange-600 py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105">
                                    <div
                                        
                                        className="flex flex-col items-center space-y-1"
                                    >
                                        <Heart
                                            className={`w-5 h-5 group-hover:text-[#ff4c00] group-hover:fill-[#ff4c00] ${
                                                isFavorite
                                                    ? "text-[#ff4c00] fill-[#ff4c00]"
                                                    : ""
                                            } transition-colors`}
                                        />
                                        <span className="text-sm">
                                            Yêu thích
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        document
                                            .getElementById("comment-section")
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                            });
                                    }}
                                    className="group relative bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50 hover:border-blue-500/50 py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                                >
                                    <div className="flex flex-col items-center space-y-1">
                                        <MessageCircle className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                                        <span className="text-sm">
                                            Bình luận
                                        </span>
                                    </div>
                                </button>

                                <button
                                    ref={refFormRating}
                                    onClick={() => {
                                        setShowFormRating(!showFormRating);
                                    }}
                                    style={{zIndex:999}}
                                    className="group  bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50 hover:border-yellow-500/50 py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                                >
                                    <div className="flex flex-col items-center space-y-1">
                                        <Star className="w-5 h-5 group-hover:text-yellow-400 group-hover:fill-yellow-400 transition-colors" />
                                        <span className="text-sm">
                                            Đánh giá
                                        </span>
                                    </div>
                                </button>
                                    {showFormRating && (
                                        <div 
                                            
                                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" 
                                            onClick={() => setShowFormRating(false)}  
                                            >
                                                <div 
                                                    id="rating-section"
                                                    className="flex flex-col items-center space-y-4 bg-gray-900 rounded-2xl p-6 border border-orange-700 shadow-2xl" 
                                                    onClick={(e) => e.stopPropagation()} 
                                                >
                                                    <h3 className="text-white text-left text-xl font-bold">{film?.title_film}</h3>
                                                    <div className="flex items-center space-x-2 ">
                                                        <div className="w-10 h-10"><img className="w-full h-full " src="/img/gofilmicon.png" alt="" /></div>
                                                        <span className="flex">{averageRating} </span>
                                                        <Star size={32} className="text-yellow-400 fill-current"/>
                                                    </div>
                                                    <div className="flex left-0 items-center space-x-2 ">
                                                        <h2>Đánh giá của bạn {fetchUserRating!.rating}</h2>
                                                        <Star size={32} className="text-yellow-400 fill-current"/>
                                                    </div>
                                                    <h3 className="text-white text-xl font-bold">Đánh giá phim ({rating}/10)</h3>
                                                    <div className="flex items-center justify-center space-x-1">
                                                        {stars.map((_, index) => (
                                                            <Star
                                                                key={index}
                                                                size={32}  
                                                                onClick={() => handleClickStar(index + 1)}
                                                                onMouseOver={() => handleMoveOver(index + 1)}
                                                                onMouseLeave={handleMoveLeave}
                                                                className={`cursor-pointer transition-all ${
                                                                    (hoverValue || rating) > index 
                                                                        ? "text-yellow-400 fill-current drop-shadow-lg" 
                                                                        : "text-gray-500"
                                                                }`} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setShowFormRating(false); 
                                                            handlePostRating(film?.id!,rating);
                                                        }}
                                                        className="mt-4 bg-orange-600 hover:bg-orange-700 text-black font-semibold px-6 py-2 rounded-lg transition-all"
                                                    >
                                                        Gửi đánh giá
                                                    </button>
                                                </div>
                                        </div>
                                    )}
                            </div>

                            {/* Episodes Section */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">
                                        Danh sách tập
                                    </h2>
                                    <div className="text-sm text-gray-400 bg-gray-700/30 rounded-full px-3 py-1">
                                        {film?.film_episodes?.length} tập
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        {
                                            handleNextFilmDetail(slug!)
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }
                                    }
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto custom-scrollbar"
                                >
                                    {film?.film_episodes?.map((ep, index) => (
                                        <button
                                            key={ep.id}
                                            className="group relative flex flex-col items-center justify-center rounded-xl py-3 px-2 transition-all duration-300 hover:scale-105 hover:bg-[#ff4c00] hover:shadow-lg border bg-gray-700/50 border-gray-600/50"
                                        >
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Play className="w-3 h-3 text-gray-300 group-hover:text-white transition-colors" />
                                                <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                                                    {ep.episode_title}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* comments */}
                            <div id="comment-section" className="mt-6">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Bình luận
                                </h2>
                                <Suspense
                                    fallback={<div>Loading comments...</div>}
                                >
                                    <CommentsSection />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

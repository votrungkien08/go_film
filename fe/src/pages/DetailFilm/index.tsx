import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Hls from "hls.js";
import { toast } from "sonner";
// import { useWatchHistories } from "../hooks/useWatchHistories";
import FilmSuggestions from "../../components/ui/FilmSuggestions";
import {
    Play,
    Heart,
    MessageCircle,
    Star,
    CircleChevronLeft,
} from "lucide-react";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { useFavorite } from "../../hooks/useFavorite";
import { useAuth } from "@/hooks/useAuth";
import { useFilmBySlug } from "../../hooks/useFilm";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
const CommentsSection = lazy(() => import("@/components/comments/CommentSection"));

dayjs.extend(relativeTime);

const FilmDetail = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const episodeParam = params.get("episode");
    const [selectedEpisode, setSelectedEpisode] = useState<string>('');
    const { isLogin } = useAuth();
    const { film } = useFilmBySlug(slug!);
    const [videoURL, setVideoURL] = useState<string>("");
    const { isFavorite, handleToggleFavorite } = useFavorite(
        film?.id,
        isLogin
    );

    const handleChangeEpisode = async (episode_title: string) => {
        navigate(`/watch-film/${slug}?episode=${episode_title}`);

    };

    const initHLS = useCallback((videoUrl: string) => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        console.log("🔧 Khởi tạo HLS với URL:", videoUrl);

        const isM3U8 = videoUrl.includes(".m3u8") || videoUrl.includes("m3u8");
            if (isM3U8) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                } else if (Hls.isSupported()) {
                    if (hlsRef.current) {
                        console.log("🧹 Dọn dẹp HLS cũ");
                        hlsRef.current.destroy();
                        hlsRef.current = null;
                    }

                    const hls = new Hls({
                        debug: true,
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90,
                    });
                    hlsRef.current = hls;
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);

                    hls.on(Hls.Events.ERROR, (event, data) => {
                        console.error("Lỗi HLS:", data);
                        if (data.fatal) {
                            switch (data.type) {
                                case Hls.ErrorTypes.NETWORK_ERROR:
                                    console.error("Lỗi mạng, thử tải lại...");
                                    hls.startLoad();
                                    break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    console.error("Lỗi media, thử khôi phục...");
                                    hls.recoverMediaError();
                                    break;
                                default:
                                    console.error("Lỗi không thể khôi phục");
                                    hls.destroy();
                                    break;
                            }
                        }
                    });
                } else {
                    console.error("Browser không hỗ trợ HLS");
                    toast.error(
                        "Trình duyệt của bạn không hỗ trợ phát video HLS. Vui lòng sử dụng trình duyệt khác."
                    );
                }
            } else {
                video.src = videoUrl;
            }
    }, []);
    useEffect(() => {
        const episode =
        film?.film_episodes.find(
            (item) => item.episode_title === episodeParam,
            
        ) || film?.film_episodes[0];
        if (episode) {
            console.log("Episode URL:", episode?.episode_url);
            initHLS(episode.episode_url);
            setVideoURL(episode.episode_url);
            // setepisodeId(episode.id)
        }
        setSelectedEpisode(episodeParam!)
    },[episodeParam,film,initHLS])

    const hlsRef = useRef<Hls | null>(null);



    if (!film) {
        return (
            <div className="min-h-screen  flex items-center justify-center text-white">
                <div className="flex items-center gap-2">
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
                    <span>Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-[60px]">
            <button
                className="flex items-center gap-2 text-white"
                onClick={() => navigate(-1)}
            >
                <CircleChevronLeft className="cursor-pointer hover:scale-110 transition-transform duration-200 w-8 h-8" />
                <p className="text-[20px] ">Đang xem phim: {film.title_film}</p>
            </button>

            <div className="relative w-full pb-[56.25%] mt-4">
                <iframe
                    src={videoURL}
                    allow="autoplay; fullscreen"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                ></iframe>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                {/* column left */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start ">
                        <div className="w-[160px] h-[200px] left-0">
                            <img
                                className="w-full h-full rounded-lg object-cover"
                                src={film?.thumb}
                                alt=""
                            />
                        </div>
                        <div className="text-left ml-4">
                            <h1 className="line-clamp-2">{film.title_film}</h1>
                            <div className="mt-4">
                                <span className="text-orange-300 font-medium mr-4">
                                    {film?.year?.release_year}
                                </span>
                                <span>
                                    Số tập{film.film_episodes[0].episode_number}
                                </span>
                            </div>
                            {film.genres.map((item) => (
                                <span
                                    key={item.id}
                                    className="inline-flex mt-4 items-center bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 rounded-full px-3 py-1 text-sm text-gray-200 transition-colors cursor-pointer"
                                >
                                    {item.genre_name}
                                </span>
                            ))}
                        </div>
                        <div className="text-left ml-2">
                            <p className="line-clamp-4 w-[350px]">
                                {film.content}
                            </p>
                            <Link
                                className="text-orange-300"
                                to={`/film/${film.slug}`}
                            >
                                Thông tin phim
                            </Link>
                        </div>
                    </div>

                    <div className="border-t border-t-neutral-700">
                        <div className="flex items-center justify-between my-4">
                            <h2 className="text-2xl font-bold text-white">
                                Danh sách tập
                            </h2>
                            <div className="text-sm text-gray-400 bg-gray-700/30 rounded-full px-3 py-1">
                                {film?.film_episodes?.length} tập
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {film?.film_episodes?.map((ep, index) => {
                                    console.log("🔎 episodeParam:", episodeParam);
                                    console.log("🔎 ep.episode_title:", ep.episode_title);
                                    console.log("🔎 So sánh:", String(ep.episode_title) === String(episodeParam));
                                const isActive =
                                    String(ep.episode_title) === String(selectedEpisode ?? film?.film_episodes[0].episode_title);
                                console.log('episodeParam',episodeParam,isActive)
                                return (
                                    <button
                                        onClick={() =>
                                            handleChangeEpisode(
                                                ep.episode_title
                                            )
                                        }
                                        key={ep.id}
                                        className={`group relative flex flex-col items-center justify-center rounded-xl py-3 px-2 transition-all duration-300 hover:scale-105 hover:bg-[#ff4c00] hover:shadow-lg border  border-gray-600/50
                                        ${
                                            isActive
                                                ? "bg-[#ff4c00] text-white"
                                                : "bg-gray-700/50"
                                        }
                                        `}
                                    >
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Play className="w-3 h-3 text-gray-300 group-hover:text-white transition-colors" />
                                            <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                                                {ep.episode_title}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div id="comment-section">
                        <Suspense fallback={<div>Đang tải bình luận...</div>}>
                            <CommentsSection />
                        </Suspense>
                    </div>
                </div>
                {/* column right */}
                <div className="col-span-1  ">
                    <div className="flex justify-between w-full  border-l border-l-neutral-700">
                        <button
                            onClick={handleToggleFavorite}
                            className="group w-[100px] h-[100px] relative  flex flex-col justify-center items-center ml-2 hover:bg-gray-600/50 bg-gray-700/50 border border-gray-600/50 rounded-xl transition-all duration-300 hover:scale-105
                            before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-[2px] before:bg-[#ff4c00] before:transition-all before:duration-500
                            after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#ff4c00] after:transition-all after:duration-500  hover:before:w-[80%] hover:after:w-[80%] 
                        "
                        >
                            <Heart
                                className={`w-5 h-5 group-hover:text-[#ff4c00] group-hover:fill-[#ff4c00] ${
                                    isFavorite
                                        ? "text-[#ff4c00] fill-[#ff4c00]"
                                        : ""
                                } transition-colors`}
                            />
                            <span className="text-sm ">Yêu thích</span>
                        </button>

                        <button
                            onClick={() => {
                                document
                                    .getElementById("comment-section")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    });
                            }}
                            className="group w-[100px] h-[100px] relative flex flex-col justify-center items-center bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50   rounded-xl transition-all duration-300 hover:scale-105
                        before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-[2px] before:bg-[#ff4c00] before:transition-all before:duration-500
                            after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#ff4c00] after:transition-all after:duration-500  hover:before:w-[80%] hover:after:w-[80%] 
                        "
                        >
                            <MessageCircle className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                            <span className="text-sm">Bình luận</span>
                        </button>

                        <button
                            className="group w-[100px] h-[100px] relative bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50 rounded-xl transition-all duration-300 hover:scale-105
                            before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-[2px] before:bg-[#ff4c00] before:transition-all before:duration-500
                            after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#ff4c00] after:transition-all after:duration-500  hover:before:w-[80%] hover:after:w-[80%] 
                    "
                        >
                            <div className="flex flex-col items-center space-y-1">
                                <Star className="w-5 h-5 group-hover:text-yellow-400 group-hover:fill-yellow-400 transition-colors" />
                                <span className="text-sm">Đánh giá</span>
                            </div>
                        </button>
                    </div>
                    <div>
                        <FilmSuggestions />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilmDetail;

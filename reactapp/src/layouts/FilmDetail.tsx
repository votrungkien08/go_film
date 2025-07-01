import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { HeartIcon as HeartSolidIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { openAuthPanel } from '../utils/auth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useFilmData } from '../hooks/useFilm';
import { useComments } from '../hooks/useComment';
import { useRating } from '../hooks/useRating';
import { useFavorite } from '../hooks/useFavorite';
import { useAuth } from '../hooks/useAuth';
import { easeIn, motion } from 'framer-motion';
// Import Hls.js
import Hls from 'hls.js';
import { useWatchHistories } from '../hooks/useWatchHistories';
import { useIncreaseView } from '../hooks/useIncreaseView';
import { RotateCcw, RotateCw, Pause ,Play, Maximize  } from 'lucide-react';
dayjs.extend(relativeTime);

const FilmDetail = () => {
    const variants = {
        hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.5, ease: easeIn } },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeIn } },
    };

    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    // Lấy episodeParam từ search
    // query params selectedEpisode
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const episodeParam = params.get('episode');
    // Gọi useFilmData trước để có film
    const { film, error, selectedEpisode, setSelectedEpisode } = useFilmData(slug!, episodeParam!);

    const { comments, commentsLoading, commentsError, comment, setComment, handlePostComment } = useComments(film?.id, isLoggedIn);
    const { rating, setRating, showRating, averageRating, handlePostRating } = useRating(film?.id, isLoggedIn);
    const { isFavorite,likeCount, handleToggleFavorite } = useFavorite(film?.id, isLoggedIn);
    const [tab, setTab] = useState<'comment' | 'rating' | 'info'>('comment');
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    
    // Thêm: Hàm để trích xuất số tập cho danh sách tập
    const getEpisodeNumber = (number: string): number => {
        const match = number.match(/\d+/); // Trích xuất số từ chuỗi, ví dụ "12" -> 12
        return match ? parseInt(match[0]) : 0;
    };
    
    // Ref cho video element và HLS instance
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // State quản lý thời gian hiện tại và tổng thời gian của video
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);



    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (video) {
            setDuration(video.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        const seekTime = parseFloat(e.target.value);
        if (video) {
            video.currentTime = seekTime;
            setCurrentTime(seekTime);
        }
    };
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60)
            .toString()
            .padStart(2, '0');
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    };


    // skip 10s
    const skipForward = () => {
        if (videoRef.current) {
        videoRef.current.currentTime += 10; // tua tới 10s
        }
    };
    // back 10s
    const skipBackward = () => {
        if (videoRef.current) {
        videoRef.current.currentTime -= 10; // tua lui 10s
        }
    };
    // state quản lý việc hiển thị controls
    const [showControls, setShowControls] = useState(true);
    let controlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const resetControlsTimer = () => {
        setShowControls(true);

        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }

        controlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, 3000); // 5 giây
    };

    // state quản lý trạng thái phát video
    const [isPlaying, setIsPlaying] = useState(false);
    // di chuyển chuột để reset controls
    const handleMouseMove = () => {
        resetControlsTimer();
    };
    const pauseVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
            resetControlsTimer();
        }
    };
    const playVideo = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
            resetControlsTimer();
        }
    };
    const videoWrapperRef = useRef<HTMLDivElement>(null);

    const toggleFullScreen = () => {
        const videoContainer = videoWrapperRef.current; // ref cho div chứa video và các nút

        if (!document.fullscreenElement) {
            if (videoContainer?.requestFullscreen) {
            videoContainer.requestFullscreen();
            } else if ((videoContainer as any).webkitRequestFullscreen) {
            (videoContainer as any).webkitRequestFullscreen();
            } else if ((videoContainer as any).mozRequestFullScreen) {
            (videoContainer as any).mozRequestFullScreen();
            } else if ((videoContainer as any).msRequestFullscreen) {
            (videoContainer as any).msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
            document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
            }
        }
    };


    const { handleTimeUpdate} = useWatchHistories(selectedEpisode, videoRef, setCurrentTime);
    const { handleViewIncrement } = useIncreaseView({ filmId: film?.id, videoRef, selectedEpisode });
    // Function để khởi tạo HLS player
    const initializeHLS = (videoUrl: string) => {
        if (!videoRef.current) return;

        const video = videoRef.current;

        // Dọn dẹp HLS instance cũ nếu có
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Kiểm tra xem URL có phải là m3u8 không
        const isM3U8 = videoUrl.includes('.m3u8') || videoUrl.includes('m3u8');

        if (isM3U8) {
            // Kiểm tra browser có hỗ trợ HLS natively không
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari và iOS hỗ trợ HLS natively
                video.src = videoUrl;
            } else if (Hls.isSupported()) {
                // Sử dụng Hls.js cho các browser khác
                const hls = new Hls({
                    debug: false,
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsRef.current = hls;
                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('HLS manifest đã được tải thành công');
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('Lỗi HLS:', data);
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error('Lỗi mạng, thử tải lại...');
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error('Lỗi media, thử khôi phục...');
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error('Lỗi không thể khôi phục');
                                hls.destroy();
                                break;
                        }
                    }
                });
            } else {
                console.error('Browser không hỗ trợ HLS');
                alert('Trình duyệt của bạn không hỗ trợ phát video HLS. Vui lòng sử dụng trình duyệt khác.');
            }
        } else {
            // Video thông thường (MP4, WebM, etc.)
            video.src = videoUrl;
        }
    };

    // Effect để khởi tạo HLS khi selectedEpisode thay đổi
    // useEffect(() => {
    //     // if (selectedEpisode?.episode_url) {
    //     //     initializeHLS(selectedEpisode.episode_url);
    //     // }

    //     // // Cleanup function
    //     // return () => {
    //     //     if (hlsRef.current) {
    //     //         hlsRef.current.destroy();
    //     //         hlsRef.current = null;
    //     //     }
    //     // };
    //     const video = videoRef.current;

    //     if (selectedEpisode?.episode_url) {
    //         initializeHLS(selectedEpisode.episode_url);
    //     }

    //     if (video) {
    //         const handlePlay = () => {
    //             setIsPlaying(true);
    //             resetControlsTimer();
    //         };

    //         const handlePause = () => {
    //             setIsPlaying(false);
    //             resetControlsTimer();
    //         };

    //         video.addEventListener('play', handlePlay);
    //         video.addEventListener('pause', handlePause);

    //         return () => {
    //             video.removeEventListener('play', handlePlay);
    //             video.removeEventListener('pause', handlePause);
    //         };
    //     }
    // }, [selectedEpisode]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') skipBackward();
            if (e.key === 'ArrowRight') skipForward();
        };
        window.addEventListener('keydown', handleKeyDown);
        const video = videoRef.current;
        if (!video) {
            return;
        }
        const updateCurrentTime = () => {
            setCurrentTime(video.currentTime);
        };

        video.addEventListener('timeupdate', updateCurrentTime);
        if (selectedEpisode?.episode_url) {
            initializeHLS(selectedEpisode.episode_url);
        }

        

        const handlePlay = () => {
            setIsPlaying(true);
            resetControlsTimer();
        };

        const handlePause = () => {
            setIsPlaying(false);
            resetControlsTimer();
        };

        const handleFullscreenChange = () => {
            const isFullscreen =
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).mozFullScreenElement ||
                (document as any).msFullscreenElement;

            if (isFullscreen) {
                // Luôn hiển thị controls khi fullscreen và reset timer
                setShowControls(true);
                resetControlsTimer();
            }
        };

        if (video) {
            video.addEventListener("play", handlePlay);
            video.addEventListener("pause", handlePause);
            video.addEventListener("mousemove", resetControlsTimer);
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        return () => {
            video.removeEventListener('timeupdate', updateCurrentTime);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
}, [selectedEpisode]);

    if (error) {
        return (
            <div className="min-h-screen  flex flex-col items-center justify-center text-red-500">
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
            <div className="min-h-screen  flex items-center justify-center ">
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

    // Đảm bảo averageRating là số hợp lệ
    const ratingValue = Number.isFinite(averageRating) ? averageRating : 0;
    const percentage = ratingValue / 5 * 100;

    return (
        <motion.div       
            variants={variants}
            initial="hidden"
            animate="visible" 
            className="min-h-screen  text-white py-6"
        >
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
                        <div ref={videoWrapperRef}  className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                            {selectedEpisode ? (
                                <video
                                    ref={videoRef}
                                    // controls
                                    className="w-full h-full object-cover"
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onTimeUpdate={() => {handleTimeUpdate(); handleViewIncrement()}}
                                    poster={film.thumb}
                                    crossOrigin="anonymous"
                                    playsInline
                                    preload="metadata"
                                    onMouseMove={handleMouseMove}
                                >
                                    Trình duyệt của bạn không hỗ trợ phát video.
                                </video>
                            ) : (
                                <div className="flex items-center justify-center bg-gray-800 h-full text-gray-300">
                                    <p>Không có video để phát</p>
                                </div>
                            )}
                            {showControls && (
                                <>
                                
                                    <div  className="absolute top-1/2 left-1/2 -translate-x-1/2 flex gap-6">
                                        <button onClick={skipBackward} className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition">
                                        <RotateCcw className="w-6 h-6 text-white" />
                                        </button>
                                        {isPlaying ? (
                                            <button onClick={pauseVideo} className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition">
                                                <Pause className="w-6 h-6 text-white" />
                                            </button>

                                        ) : (
                                            <button onClick={playVideo} className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition">
                                                <Play className="w-6 h-6 text-white" />
                                            </button>

                                        )}
                                        <button onClick={skipForward} className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition">
                                            <RotateCw className="w-6 h-6 text-white" />
                                        </button>
                                        

                                        
                                    </div>

                                    <div className='absolute bottom-4 left-0 w-full px-4 z-50 pointer-events-auto'>
                                            <input
                                                type="range"
                                                min={0}
                                                max={duration}
                                                step="0.1"
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="w-full accent-red-500"
                                                />
                                            <div className='flex items-center justify-between '>
                                                <div className=" text-white text-sm mt-1">
                                                    <span>{formatTime(currentTime)}</span>/
                                                    <span>{formatTime(duration)}</span>
                                                </div>

                                                <button onClick={toggleFullScreen} className="p-2    bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition">
                                                    <Maximize className="w-6 h-6 text-white" />
                                                </button>
                                            </div>    
                                    </div>
                                </>
                                
                                

                            )}
                        </div>

                        

                        {/* Danh sách tập */}
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold mb-3">Danh sách tập</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                {film.film_episodes.map((episode, index) => (
                                    <button
                                        key={episode.id || `${episode.episode_number}-${index}`}
                                        onClick={() => {setSelectedEpisode(episode);navigate(`/film/${slug}?episode=${getEpisodeNumber(episode.episode_title)}`, { replace: true }); }}
                                        className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer ${String(selectedEpisode?.id) === String(episode.id)
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]'
                                            }`}
                                    >
                                        {episode.episode_title || `Tập ${episode.episode_number}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex border-b border-gray-700 mt-4">
                            <button
                                className={`mr-2 px-4 py-2 rounded-t-md ${tab === 'comment' ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] cursor-pointer'}`}
                                onClick={() => setTab('comment')}
                            >
                                Bình luận
                            </button>
                            <button
                                className={`mr-2 px-4 py-2 rounded-t-md ${tab === 'rating' ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] cursor-pointer'}`}
                                onClick={() => setTab('rating')}
                            >
                                Đánh giá
                            </button>
                            <button
                                className={`px-4 py-2 rounded-t-md ${tab === 'info' ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] cursor-pointer'}`}
                                onClick={() => setTab('info')}
                            >
                                Thông tin
                            </button>
                        </div>

                        <div className="mt-4">
                            {tab === 'comment' && (
                                <div className="bg-[#444444] rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2">
                                            <UserCircleIcon className="h-10 w-10 text-gray-300" />
                                        </div>
                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
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
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                <span className="ml-2">Đang tải bình luận...</span>
                                            </div>
                                        )}
                                        {commentsError && <p className="text-red-500 text-center">{commentsError}</p>}
                                        {!commentsLoading && comments.length === 0 && !commentsError && (
                                            <p className="text-gray-400 text-center">Chưa có bình luận nào.</p>
                                        )}
                                        {!commentsLoading &&
                                            Array.isArray(comments) &&
                                            comments.map((comment) => (
                                                <div key={comment.id} className="border rounded-sm flex items-center gap-3">
                                                    <div className="h-full flex p-2 items-center">
                                                        <UserCircleIcon className="inline-block h-10 w-10 text-gray-300" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="pr-4 whitespace-nowrap font-semibold text-orange-500">
                                                                {comment.user?.name || 'Ẩn danh'}
                                                            </p>
                                                            <p className="text-gray-200 break-words my-2 text-left w-96 mr-4">{comment.comment}</p>
                                                            <p className="whitespace-nowrap text-left text-sm text-gray-400 mr-2">
                                                                {dayjs(comment.created_at).fromNow()}
                                                            </p>
                                                        </div>
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
                                            {[1, 2, 3, 4, 5].map((star) => (
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
                                            onFocus={() => !isLoggedIn && setShowAuthPrompt(true)}
                                            onClick={handlePostRating}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
                                        >
                                            Gửi đánh giá
                                        </button>
                                    </div>
                                </div>
                            )}
                            {tab === 'info' && (
                                <div className="bg-[#444444] rounded-lg p-4">
                                    <div className="text-left">
                                        <p className="py-2">
                                            <span className="font-semibold text-orange-500">Thể loại:</span>{' '}
                                            {film.genres.map((genre) => genre.genre_name).join(', ') || 'N/A'}
                                        </p>
                                        <p className="py-2">
                                            <span className="font-semibold text-orange-500">Năm phát hành:</span>{' '}
                                            {film.year?.release_year || 'N/A'}
                                        </p>
                                        <p className="py-2">
                                            <span className="font-semibold text-orange-500">Quốc gia:</span>{' '}
                                            {film.country?.country_name || 'N/A'}
                                        </p>
                                        <p className="py-2">
                                            <span className="font-semibold text-orange-500">Diễn viên:</span>{' '}
                                            {film.actor || 'N/A'}
                                        </p>
                                        <p className="py-2">
                                            <span className="font-semibold text-orange-500">Đạo diễn:</span>{' '}
                                            {film.director || 'N/A'}
                                        </p>
                                        <p className="py-2">
                                            <span className="font-semibold text-orange-500">Nội dung:</span>{' '}
                                            {film.content || 'N/A'}
                                        </p>
                                        <p className="py-2">
                                            <span className="font-semibold text-orange-500">Loại phim:</span>{' '}
                                            {film.film_type ? 'Phim lẻ' : 'Phim bộ'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-[#444444] text-left rounded-lg p-4 shadow-lg">
                            <img
                                src={film.thumb}
                                alt={film.title_film}
                                className="mx-auto rounded-sm object-contain max-h-48"
                            />
                            <div className="py-4 flex items-center justify-start">
                                <button className="bg-orange-500 w-24 h-10 rounded-lg">Yêu thích</button>
                                {isFavorite ? (
                                    <HeartSolidIcon
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                setShowAuthPrompt(true);
                                                return;
                                            }
                                            handleToggleFavorite();
                                        }}
                                        className="w-8 h-8 text-orange-500 ml-4 cursor-pointer"
                                    />
                                ) : (
                                    <HeartOutlineIcon
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                setShowAuthPrompt(true);
                                                return;
                                            }
                                            handleToggleFavorite();
                                        }}
                                        className="w-8 h-8 text-gray-500 ml-4 stroke-orange-500 cursor-pointer"
                                    />
                                )}
                                <span className='ml-2'>{likeCount}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-3 text-white mt-4">
                                    {/* Vòng tròn phần trăm */}
                                    <div className="w-[50px] h-[50px]">
                                        <CircularProgressbar
                                            value={percentage}
                                            text={`${Math.round(percentage)}%`}
                                            styles={buildStyles({
                                                textSize: '30px',
                                                textColor: '#fff',
                                                pathColor: '#FFD700',
                                                trailColor: '#333',
                                            })}
                                        />
                                    </div>

                                    {/* Dãy sao và thông tin */}
                                    <div>
                                        {/* Hiển thị sao */}
                                        <div className="text-yellow-400 text-lg">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <span key={index}>
                                                    {ratingValue >= index + 1 ? '★' : ratingValue > index ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Thông tin chi tiết */}
                                        <div className="text-sm text-gray-300">
                                            ({showRating.length} lượt, đánh giá: <span className="text-white font-bold">{ratingValue.toFixed(1)}</span> trên 5)
                                        </div>
                                    </div>
                                </div>
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
                            </div>
                        </div>
                    </div>
                </div>

                {showAuthPrompt && (
                    <div
                        className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50"
                        onClick={() => setShowAuthPrompt(false)}
                    >
                        <div className="bg-[#000000] w-96 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
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
        </motion.div>
    );
};

export default FilmDetail;
import { useEffect, useState, useRef, useCallback } from 'react';
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
import Hls from 'hls.js';
import axios from 'axios';
import { toast } from 'sonner';
import { useWatchHistories } from '../hooks/useWatchHistories';
import { useIncreaseView } from '../hooks/useIncreaseView';
import { RotateCcw, RotateCw, Pause, Play, Maximize, Lock } from 'lucide-react';
dayjs.extend(relativeTime);

interface PaymentStatus {
    can_watch: boolean;
    already_paid: boolean;
    is_premium: boolean;
    has_enough_points?: boolean;
    points_required?: number;
    user_points?: number;
    message: string;
}

const FilmDetail = () => {
    const videoWrapperRef = useRef<HTMLDivElement>(null);

    const lastCurrentTimeRef = useRef(0);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    const variants = {
        hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.5, ease: easeIn } },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeIn } },
    };

    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const episodeParam = params.get('episode');
    const { isLoggedIn, user } = useAuth();
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

    const { film, error, selectedEpisode, setSelectedEpisode } = useFilmData(slug!, episodeParam!);
    const { comments, commentsLoading, commentsError, comment, setComment, handlePostComment } = useComments(film?.id, isLoggedIn,film,paymentStatus);
    const { rating, setRating, showRating, averageRating, handlePostRating } = useRating(film?.id, isLoggedIn);
    const { isFavorite, likeCount, handleToggleFavorite } = useFavorite(film?.id, isLoggedIn);


    const [tab, setTab] = useState<'comment' | 'rating' | 'info'>('comment');
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [showPremiumFunction, setShowPremiumFunction] = useState(false);
    const [showPointsPrompt, setShowPointsPrompt] = useState(false);
    const [canWatch, setCanWatch] = useState(false);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [hasRewarded, setHasRewarded] = useState(false);

    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [deducted, setDeducted] = useState(false);


    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

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
            video.play();
            setIsPlaying(true);
        }
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const skipForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime += 10;
        }
    };

    const skipBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime -= 10;
        }
    };

    const resetControlsTimer = () => {
        setShowControls(true);
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };
    // mouse move
    const handleMouseMove = () => {
        resetControlsTimer();
    };
    // button pause
    const pauseVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
            resetControlsTimer();
        }
    };
    // button play
    const playVideo = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
            resetControlsTimer();
        }
    };

    const toggleFullScreen = () => {
        const videoContainer = videoWrapperRef.current;
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

    const getEpisodeNumber = (number: string): number => {
        const match = number.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    };
    const isRestoringProgressRef = useRef(false);
    const { handleTimeUpdate } = useWatchHistories(selectedEpisode, videoRef, setCurrentTime, isRestoringProgressRef);
    const { handleViewIncrement } = useIncreaseView({ filmId: film?.id, videoRef, selectedEpisode });

    const initializeHLS = (videoUrl: string) => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const isM3U8 = videoUrl.includes('.m3u8') || videoUrl.includes('m3u8');
        if (isM3U8) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else if (Hls.isSupported()) {
                const hls = new Hls({
                    debug: false,
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90,
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
            video.src = videoUrl;
        }
    };

    const checkPaymentStatus = useCallback(async () => {
        console.log('🔑 Kiểm tra trạng thái thanh toán... đây nè ');
        if (!film?.id || !selectedEpisode?.id || !isLoggedIn) return;

        setIsCheckingPayment(true);
        try {
            const response = await axios.post(
                'http://localhost:8000/api/films/deduct-points',
                {
                    film_id: film.id,
                    episode_id: selectedEpisode.id,
                    only_check: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            console.log('Payment status response:', response.data);
            console.log('Payment status response setCanWatch:', response.data.can_watch);
            setPaymentStatus(response.data);
            // setCanWatch(response.data.can_watch);

            // if (response.data.can_watch && selectedEpisode.episode_url) {
            //     initializeHLS(selectedEpisode.episode_url);
            // }
        } catch (error: unknown) {
            console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response?: { status?: number; data?: { message?: string } } };
                if (err.response?.status === 403) {
                    setPaymentStatus({
                        can_watch: false,
                        already_paid: false,
                        is_premium: true,
                        has_enough_points: false,
                        points_required: film?.point_required ?? undefined,
                        user_points: user?.points,
                        message: err.response.data?.message || 'Bạn không đủ điểm để xem phim này',
                    });
                    setCanWatch(false);
                    return;
                }
                if (err.response?.status !== 401 && err.response?.status !== 403) {
                    console.error('Lỗi không xác định 401 & 403:', err.response?.data?.message || '401 & 403 Có lỗi xảy ra khi kiểm tra trạng thái thanh toán');
                    setCanWatch(true);
                    if (selectedEpisode.episode_url) {
                        initializeHLS(selectedEpisode.episode_url);
                    }
                }
            }
        } finally {
            setIsCheckingPayment(false);
        }
    }, [film?.id, selectedEpisode?.id, isLoggedIn, film?.point_required, user?.points, selectedEpisode?.episode_url]);

    const deductPoints = useCallback(async () => {
        if (!film?.id || !selectedEpisode?.id || !isLoggedIn || !film.is_premium) return;
        try {
            const response = await axios.post(
                'http://localhost:8000/api/films/deduct-points',
                {
                    film_id: film.id,
                    episode_id: selectedEpisode.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            console.log('API deduct-points response:', response.data);
            console.log('API deduct-points response can watch:', response.data.can_watch);
            if (response.data.can_watch) {
                setCanWatch(true);
                setPaymentStatus((prev) => (prev ? { ...prev, can_watch: true, already_paid: true } : null));
                toast.success(`Đã trừ ${film.point_required} điểm. Điểm còn lại: ${response.data.remaining_points}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        } catch (error: unknown) {
            console.error('Lỗi khi trừ điểm:', error);
            let message = 'Lỗi khi trừ điểm. Vui lòng thử lại.';
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const err = error as { response?: { data?: { error?: string } } };
                if (err.response?.data?.error) message = err.response.data.error;
            }
            toast.error(message, {
                duration: 3000,
                position: 'top-center',
            });
        }
    }, [film, selectedEpisode, isLoggedIn]);

    const checkRewardStatus = useCallback(async () => {
        if (!film?.id || !selectedEpisode?.id || !isLoggedIn || film.is_premium) return;

        try {
            const response = await axios.post(
                'http://localhost:8000/api/films/reward-points',
                {
                    film_id: film.id,
                    episode_id: selectedEpisode.id,
                    only_check: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setHasRewarded(response.data.has_rewarded);
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái tích điểm:', error);
            setHasRewarded(false);
        }
    }, [film?.id, selectedEpisode?.id, isLoggedIn, film?.is_premium]);

    const rewardPoints = useCallback(async () => {
        if (!film?.id || !selectedEpisode?.id || !isLoggedIn || film.is_premium) return;
        try {
            const response = await axios.post(
                'http://localhost:8000/api/films/reward-points',
                {
                    film_id: film.id,
                    episode_id: selectedEpisode.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            if (response.data.success) {
                toast.success('Bạn đã được cộng 3 điểm khi xem phim thường!', {
                    duration: 3000,
                    position: 'top-center',
                });
                setHasRewarded(true);
            }
        } catch (error: unknown) {
            // Không hiển thị toast lỗi nếu đã tích điểm trước đó
        }
    }, [film, selectedEpisode, isLoggedIn]);

    useEffect(() => {
        console.log('🔑 Đã đăng ký sự kiện change episode', canWatch);
        // Mỗi khi đổi tập, reset lại trạng thái xem
        setCanWatch(false);

        // Phim thường → cho xem ngay
        if (!film?.is_premium) {
            console.log('🔑 Đã đăng ký sự kiện Phim thường episode', canWatch);
            checkRewardStatus();
            rewardPoints();
            setCanWatch(true);
            return;
        }

        // Phim premium & đã login → check payment
        if (isLoggedIn) {
            console.log('🔑 Đã đăng ký sự kiện Phim premium episode', canWatch);
            checkPaymentStatus();
            deductPoints();
            setCanWatch(true);
            return;
        }

        // Phim premium & chưa login → show login prompt
        setShowPremiumPromtf(true);
    }, [film?.is_premium, isLoggedIn, checkRewardStatus, checkPaymentStatus]);

    useEffect(() => {
        if (!canWatch || !selectedEpisode?.episode_url || !videoRef.current) return;
        if (hlsRef.current) return;
        if (canWatch && selectedEpisode?.episode_url) {
            console.log('🔑 canWatch = true và có URL, init HLS & seek:', selectedEpisode.episode_url);
            initializeHLS(selectedEpisode.episode_url);


        }
        return () => {
            hlsRef.current?.destroy();
            hlsRef.current = null;
        };
    }, [canWatch, selectedEpisode?.episode_url]);

    // useEffect để kiểm tra trạng thái điểm và hiển thị thông báo
    useEffect(() => {
        if (!paymentStatus || !film?.is_premium || !isLoggedIn) return;

        if (!paymentStatus.can_watch && !paymentStatus.already_paid) {
            if (paymentStatus.has_enough_points === false) {
                setShowPointsPrompt(true);
            }
        }
    }, [paymentStatus, film?.is_premium, isLoggedIn]);

    // useEffect để trừ điểm cho phim premium
    useEffect(() => {
        if (!videoRef.current || !film?.is_premium || !isLoggedIn || !canWatch || paymentStatus?.already_paid) return;

        setDeducted(false);
        lastCurrentTimeRef.current = 0;

        const handleTimeUpdate = () => {
            const duration = videoRef.current!.duration;
            const currentTime = videoRef.current!.currentTime;

            if (!duration || isNaN(duration)) return;

            const fortyPercentDuration = duration * 0.4;
            // Nếu đang auto-seek do lịch sử thì bỏ qua thông báo, nhưng vẫn cho phép trừ điểm nếu xem đến 90%
            if (isRestoringProgressRef.current) {
                lastCurrentTimeRef.current = currentTime;
                if (!deducted && currentTime / duration >= 0.9) {
                    deductPoints();
                    setDeducted(true);
                    videoRef.current!.removeEventListener('timeupdate', handleTimeUpdate);
                }
                return;
            }

            if (Math.abs(currentTime - lastCurrentTimeRef.current) > fortyPercentDuration) {
                setDeducted(true);
                videoRef.current!.removeEventListener('timeupdate', handleTimeUpdate);
                return;
            }

            lastCurrentTimeRef.current = currentTime;

            if (!deducted && currentTime / duration >= 0.9) {
                deductPoints();
                setDeducted(true);
                videoRef.current!.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };

        videoRef.current.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            videoRef.current && videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [film?.is_premium, canWatch, paymentStatus?.already_paid, deductPoints]);

    // useEffect để tích điểm cho phim không premium
    useEffect(() => {
        if (!videoRef.current || film?.is_premium || !isLoggedIn || !canWatch) return;

        setDeducted(false);
        lastCurrentTimeRef.current = 0;

        const handleTimeUpdate = () => {
            const duration = videoRef.current!.duration;
            const currentTime = videoRef.current!.currentTime;

            if (!duration || isNaN(duration)) return;

            // Nếu đang auto-seek do lịch sử thì bỏ qua thông báo, nhưng vẫn cho phép cộng điểm nếu xem đến 90%
            if (isRestoringProgressRef.current) {
                lastCurrentTimeRef.current = currentTime;
                if (!deducted && currentTime / duration >= 0.9) {
                    rewardPoints();
                    setDeducted(true);
                    videoRef.current!.removeEventListener('timeupdate', handleTimeUpdate);
                }
                return;
            }

            if (!hasRewarded && Math.abs(currentTime - lastCurrentTimeRef.current) > duration * 0.1) {
                setDeducted(true);
                videoRef.current!.removeEventListener('timeupdate', handleTimeUpdate);
                toast.info('Bạn đã tua quá 10% thời lượng video, không thể tích điểm.', {
                    duration: 3000,
                    position: 'top-center',
                });
                return;
            }

            lastCurrentTimeRef.current = currentTime;

            if (!deducted && currentTime / duration >= 0.9) {
                rewardPoints();
                setDeducted(true);
                videoRef.current!.removeEventListener('timeupdate', handleTimeUpdate);
            }
        };

        videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            videoRef.current && videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [film?.is_premium, isLoggedIn, canWatch, rewardPoints, hasRewarded]);

    if (error) {
        return (
            <div className="min-h-screen bg-[#333333] flex flex-col items-center justify-center text-red-500">
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
            <div className="min-h-screen bg-[#333333] flex items-center justify-center text-white">
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

    const ratingValue = Number.isFinite(averageRating) ? averageRating : 0;
    const percentage = ratingValue / 5 * 100;



    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-[#333333] text-white py-6"
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

                        <div ref={videoWrapperRef} className="relative aspect-video  rounded-lg overflow-hidden shadow-lg">
                            {canWatch && (
                                <>
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        onLoadedMetadata={handleLoadedMetadata}
                                        onTimeUpdate={() => {
                                            handleTimeUpdate();
                                            handleViewIncrement();
                                        }}
                                        poster={film.thumb}
                                        crossOrigin="anonymous"
                                        playsInline
                                        preload="metadata"
                                        onMouseMove={handleMouseMove}
                                    >
                                        Trình duyệt của bạn không hỗ trợ phát video.
                                    </video>
                                    {showControls && (
                                        <>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 flex gap-6">
                                                <button
                                                    onClick={skipBackward}
                                                    className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition"
                                                >
                                                    <RotateCcw className="w-6 h-6 text-white" />
                                                </button>
                                                {isPlaying ? (
                                                    <button
                                                        onClick={pauseVideo}
                                                        className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition"
                                                    >
                                                        <Pause className="w-6 h-6 text-white" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={playVideo}
                                                        className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition"
                                                    >
                                                        <Play className="w-6 h-6 text-white" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={skipForward}
                                                    className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition"
                                                >
                                                    <RotateCw className="w-6 h-6 text-white" />
                                                </button>
                                            </div>

                                            <div className="absolute bottom-4 left-0 w-full px-4 z-50 pointer-events-auto">
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={duration} // Thêm fallback
                                                    step="0.1"
                                                    value={currentTime}
                                                    onChange={handleSeek}
                                                    className="w-full accent-red-500"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div className="text-white text-sm mt-1">
                                                        <span>{formatTime(currentTime)}</span>/<span>{formatTime(duration)}</span>
                                                    </div>
                                                    <button
                                                        onClick={toggleFullScreen}
                                                        className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition"
                                                    >
                                                        <Maximize className="w-6 h-6 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {!canWatch && (
                                <div className="relative flex flex-col items-center justify-center aspect-video rounded-lg bg-gray-800  text-center p-6 shadow-lg">
                                    <Lock className="w-12 h-12 text-red-500 mb-4" />
                                    <h2 className="text-xl font-semibold mb-2">Bạn cần mua điểm để xem phim này</h2>
                                    <p className="text-sm text-gray-300 mb-4">
                                        Phim thuộc danh mục <span className="text-yellow-400 font-semibold">Premium</span>
                                    </p>

                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <h2 className="text-xl font-semibold mb-3">Danh sách tập</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                {film.film_episodes.map((episode, index) => (
                                    <button
                                        key={episode.id || `${episode.episode_number}-${index}`}
                                        onClick={() => {
                                            setIsPlaying(false);
                                            setSelectedEpisode(episode);
                                            navigate(`/film/${slug}?episode=${getEpisodeNumber(episode.episode_title)}`, { replace: true });
                                        }}
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
                                className={`mr-2 px-4 py-2 rounded-t-md ${tab === 'comment' ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] cursor-pointer'
                                    }`}
                                onClick={() => setTab('comment')}
                            >
                                Bình luận
                            </button>
                            <button
                                className={`mr-2 px-4 py-2 rounded-t-md ${tab === 'rating' ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] cursor-pointer'
                                    }`}
                                onClick={() => setTab('rating')}
                            >
                                Đánh giá
                            </button>
                            <button
                                className={`px-4 py-2 rounded-t-md ${tab === 'info' ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A] cursor-pointer'
                                    }`}
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
                                            className="flex-1 p-2 bg-[#3A3A3A] text-white border border-gray-600 rounded-md focus:outline-none focus:border-orange-500"
                                            placeholder="Nhập bình luận của bạn..."
                                        />
                                        <button
                                            // onFocus={() => { if(!isLoggedIn) {
                                            //     setShowAuthPrompt(true);
                                            // } else if(isLoggedIn && film.is_premium && paymentStatus?.user_points >= paymentStatus?.points_required ) {
                                            //     setShowPointsPrompt(true)
                                            // }
                                            // }}
                                            onClick={() => {
                                                if(!isLoggedIn) {
                                                    console.log('da vo comment login')

                                                    setShowAuthPrompt(true);
                                                    return
                                                } 
                                                if (film.is_premium) {
                                                    console.log('da vo comment phim')

                                                    if(!paymentStatus?.already_paid) {
                                                        console.log('da vo comment pay')

                                                        setShowPremiumFunction(true);
                                                        return

                                                    }

                                                }
                                                handlePostComment()
                                            }}
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
                                            [...comments]
                                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                .map((comment) => (
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
                                                    className={`text-2xl cursor-pointer ${rating && rating >= star ? 'text-yellow-400' : 'text-gray-400'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            // onFocus={() => !isLoggedIn && setShowAuthPrompt(true)}
                                            // onFocus={() => { 
                                            // }}
                                            onClick={() => {
                                                if(!isLoggedIn) {
                                                    console.log('da vo rating login')

                                                    setShowAuthPrompt(true);
                                                    return
                                                } 
                                                if (film.is_premium) {
                                                    console.log('da vo rating phim')

                                                    if(!paymentStatus?.already_paid) {
                                                        console.log('da vo rating pay')

                                                        setShowPremiumFunction(true);
                                                        return

                                                    }

                                                }
                                                console.log('da click',handlePostRating())
                                                handlePostRating()
                                            }}
                                            className="px-4 py-2 cursor-pointer bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
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
                            <img src={film.thumb} alt={film.title_film} className="mx-auto rounded-sm object-contain max-h-48" />
                            <div className="py-4 flex items-center justify-start">
                                <button
                                    onClick={() => {
                                        if(!isLoggedIn) {
                                            console.log('da vo favorite login')
                                            setShowAuthPrompt(true);
                                            return
                                        } 
                                        if (film.is_premium) {
                                            console.log('da vo favorite phim')
                                            if(!paymentStatus?.already_paid) {
                                                console.log('da vo favorite pay')
                                                setShowPremiumFunction(true);
                                                return

                                            }
                                        }
                                        handleToggleFavorite();
                                    }}
                                    className={`w-24 h-10 rounded-lg ${isFavorite ? 'bg-orange-500 text-white' : 'bg-[#3A3A3A] text-gray-300 hover:bg-[#4A4A4A]'}`}
                                >
                                    {isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                                </button>
                                {isFavorite ? (
                                    <HeartSolidIcon
                                        onClick={() => {
                                            if(!isLoggedIn) {
                                                console.log('da vo favorite login')
                                                setShowAuthPrompt(true);
                                                return
                                            } 
                                            if (film.is_premium) {
                                                console.log('da vo favorite phim')
                                                if(!paymentStatus?.already_paid) {
                                                    console.log('da vo favorite pay')
                                                    setShowPremiumFunction(true);
                                                    return

                                                }
                                            }
                                            handleToggleFavorite();
                                        }}
                                        className="w-8 h-8 text-orange-500 ml-4 cursor-pointer"
                                    />
                                ) : (
                                    <HeartOutlineIcon
                                        onClick={() => {
                                            if(!isLoggedIn) {
                                            console.log('da vo favorite login')
                                            setShowAuthPrompt(true);
                                            return
                                            } 
                                            if (film.is_premium) {
                                                console.log('da vo favorite phim')
                                                if(!paymentStatus?.already_paid) {
                                                    console.log('da vo favorite pay')
                                                    setShowPremiumFunction(true);
                                                    return

                                                }
                                            }
                                            handleToggleFavorite();
                                        }}
                                        className="w-8 h-8 text-gray-500 ml-4 stroke-orange-500 cursor-pointer"
                                    />
                                )}
                                <span className="ml-2">{likeCount}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-3 text-white mt-4">
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
                                    <div>
                                        <div className="text-yellow-400 text-lg">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <span key={index}>
                                                    {ratingValue >= index + 1 ? '★' : ratingValue > index ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            ( <span className='text-white text-xl font-bold'>{showRating.length}</span> lượt, đánh giá:{' '}
                                            <span className="text-white font-bold">{ratingValue.toFixed(1)}</span>/5 )
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
                                    {film.is_premium ? film.point_required || '0' : 0}
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
                            <h2 className="text-xl font-semibold mb-4 text-white">Vui lòng đăng nhập</h2>
                            <div className="flex justify-around">
                                <button
                                    onClick={() => setShowAuthPrompt(false)}
                                    className="px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#4A4A4A] transition-colors duration-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAuthPrompt(false);
                                        openAuthPanel();
                                    }}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
                                >
                                    Đăng nhập
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {showPremiumFunction && (
                    <div
                        className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50"
                        onClick={() => setShowPremiumFunction(false)}
                    >
                        <div className="bg-[#000000] w-96 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-xl font-semibold mb-4 text-white">Vui lòng mua phim để sử dụng chức năng này</h2>
                            <div className="flex justify-around">
                                <button
                                    onClick={() => setShowPremiumFunction(false)}
                                    className="px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#4A4A4A] transition-colors duration-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPointsPrompt(false);
                                        navigate('/buy-points');
                                    }}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300"
                                >
                                    Mua điểm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showPointsPrompt  && (
                    <div
                        className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50"
                        onClick={() => setShowPointsPrompt(false)}
                    >
                        <div className="bg-[#000000] w-96 rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-xl font-semibold mb-4 text-white">
                                Bạn không đủ điểm để xem phim này. Bạn có muốn mua điểm premium?
                            </h2>
                            <div className="flex justify-around">
                                <button
                                    onClick={() => setShowPointsPrompt(false)}
                                    className="px-4 py-2 bg-[#3A3A3A] text-white rounded-md hover:bg-[#4A4A4A] transition-colors duration-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPointsPrompt(false);
                                        navigate('/buy-points');
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
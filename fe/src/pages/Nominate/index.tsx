import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, CircleChevronLeft, CircleChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type Film } from "@/types";
import { useFilmNominate } from "@/hooks/useFilm";
const Nominate = () => {
    const navigate = useNavigate();
    const [currentFilm, setCurrentFilm] = useState<Film>();

    const { nominateFilms, isLoadingNominate } = useFilmNominate();

    // Lấy index phim
    const currentIndex = nominateFilms.findIndex(
        (film) => film.id === currentFilm?.id
    );
    // console.log("Current Index:", currentIndex);
    // console.log("films Index:", nominateFilms);
    // console.log("isLoading:", isLoadingNominate);
    // Nút Previous
    const goToPreviousFilm = () => {
        if (currentIndex > 0) {
            setCurrentFilm(nominateFilms[currentIndex - 1]);
        } else if (currentIndex === 0 && nominateFilms.length > 0) {
            setCurrentFilm(nominateFilms[nominateFilms.length - 1]); // Quay lại phim cuối
        }
    };

    // Nút Next
    const goToNextFilm = () => {
        if (currentIndex < nominateFilms.length - 1) {
            setCurrentFilm(nominateFilms[currentIndex + 1]);
        } else if (
            currentIndex === nominateFilms.length - 1 &&
            nominateFilms.length > 0
        ) {
            setCurrentFilm(nominateFilms[0]); // Quay lại phim đầu
        }
    };

    // Lấy currentFilm
    useEffect(() => {
        if (nominateFilms.length > 0 && !currentFilm) {
            setCurrentFilm(nominateFilms[0]); // Chỉ đặt lại khi chưa có currentFilm
        }
    }, [nominateFilms, currentFilm]);

    // duration next 10s
    useEffect(() => {
        if (!currentFilm) return;

        const timer = setTimeout(() => {
            goToNextFilm();
        }, 10000); // sau 10 giây

        return () => clearTimeout(timer); // clear nếu currentFilm đổi
    }, [currentFilm]);

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 relative -mx-4 gap-4">
                {/* Trailer */}
                <div
                    className="w-full aspect-[16/9] relative group  before:content-none after:content-none"
                    style={{
                        content: "none",
                        counterReset: "none",
                        counterIncrement: "none",
                        fontSize: "0px",
                        overflow: "hidden",
                    }}
                >
                    {currentFilm ? (
                        <>
                            {/* {console.log("trailerne", currentFilm.trailer)} */}
                            {currentFilm.trailer && (
                                <video
                                    className="absolute top-0 left-0 w-full h-full transition-opacity duration-300"
                                    src={currentFilm.trailer}
                                    autoPlay
                                    muted
                                    loop
                                    controls={false}
                                    poster={currentFilm.thumb} // Hiển thị thumb khi video chưa load
                                >
                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                </video>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full  flex items-center justify-center rounded-lg">
                            <Skeleton className="w-full h-full rounded-lg"></Skeleton>
                        </div>
                    )}
                </div>

                <div className="absolute text-left bottom-40 left-0 w-[400px] p-4">
                    {isLoadingNominate ? (
                        <>
                            <Skeleton className="w-3/4 h-16 rounded-lg mb-4"></Skeleton>
                            <Skeleton className="w-3/4 h-30 rounded-lg"></Skeleton>
                            <div className="buttons flex gap-4 mt-4">
                                <Skeleton className="w-2/4 h-16 rounded-lg"></Skeleton>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-white">
                                {currentFilm?.title_film}
                            </h1>
                            <p className="text-sm mt-2 text-white line-clamp-5">
                                {currentFilm?.content}
                            </p>
                            <div className="buttons flex gap-4 mt-4">
                                <button
                                    onClick={() =>
                                        currentFilm &&
                                        navigate(`/film/${currentFilm.slug}`)
                                    }
                                    className="cursor-pointer play-button flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg"
                                >
                                    <Play /> Xem ngay
                                </button>
                                {/* 
                            <button className="detail-button bg-black text-white px-4 py-2 rounded-lg border border-white">
                                Chi tiết
                            </button> */}
                            </div>
                        </>
                    )}
                </div>

                <div className="text-white absolute flex items-center justify-center right-0 bottom-40">
                    {isLoadingNominate ? (
                        <>
                            <div className="w-14 h-14">
                                <Skeleton className="w-14 h-14 rounded-full" />
                            </div>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-3 w-3 m-2 rounded-full"
                                />
                            ))}
                            <div className="w-14 h-14">
                                <Skeleton className="w-full h-full rounded-full" />
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                className="cursor-pointer"
                                onClick={goToPreviousFilm}
                            >
                                <CircleChevronLeft className="w-14 h-14" />
                            </button>
                            {nominateFilms.map((film) => (
                                <button
                                    key={film.id}
                                    className={`h-3 w-3 m-2 rounded-full transition-all duration-300 ${
                                        currentFilm?.id === film.id
                                            ? "bg-white scale-125"
                                            : "bg-neutral-500"
                                    }`}
                                />
                            ))}
                            <button
                                className="cursor-pointer"
                                onClick={goToNextFilm}
                            >
                                <CircleChevronRight className="w-14 h-14" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Nominate;

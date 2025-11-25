import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/theme-provider";
import { motion } from "framer-motion";
import { Skeleton } from "../../components/ui/skeleton";
import {useFilmRank} from '../../hooks/useFilm'
const Rank = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { rankFilm, isLoading} = useFilmRank();

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
    const topFilms = [...rankFilm].sort((a, b) => b.view - a.view).slice(0, 10);

    return (
        <>
            <div className="grid grid-cols-12 min-h-80 gap-4 py-4 border-t border-gray-700/50">
                <div className="col-span-1"></div>
                <div className="col-span-10 gap-4">
                    <div className="grid grid-cols-8 gap-4 mb-4 shadow shadow-gray-500/50">
                        <div className="col-span-4 flex items-center h-12">
                            <img
                                src="/img/logofilm.png"
                                alt="Logo"
                                className="w-10 h-10"
                                style={
                                    theme === "dark" || theme === "system"
                                        ? {
                                              filter: "invert(100%) sepia(100%) saturate(2%) hue-rotate(162deg) brightness(105%) contrast(101%)",
                                          }
                                        : {}
                                }
                            />
                            <h1 className="ml-2 font-bold">BẢNG XẾP HẠNG</h1>
                        </div>
                        <div
                            onClick={() =>
                            {
                                navigate("/films?rank=true")
                                window.scrollTo({top:0,behavior:"smooth"})
                            }  }
                            className="col-span-4 flex items-center justify-end cursor-pointer"
                        >
                            <h1 className="mr-2 font-bold">XEM TẤT CẢ</h1>
                            <img
                                src="/img/movie_4-512.png"
                                alt="Logo"
                                className="w-10 h-10"
                                style={
                                    theme === "dark" || theme === "system"
                                        ? {
                                              filter: "invert(100%) sepia(100%) saturate(2%) hue-rotate(162deg) brightness(105%) contrast(101%)",
                                          }
                                        : {}
                                }
                            />
                        </div>
                    </div>
                    <div className="group relative">
                        <button
                            onClick={scrollLeft}
                            className={`h-48 opacity-0 group-hover:opacity-100 text-7xl z-30 top-16 absolute left-0 p-4 cursor-pointer ${
                                theme === "dark"
                                    ? "to-white/50 group-hover:bg-white/40 text-black"
                                    : ""
                            } ${
                                theme === "light"
                                    ? "to-black/50 group-hover:bg-black/40 text-white"
                                    : ""
                            } ${
                                theme === "system"
                                    ? "to-white/50 group-hover:bg-white/40 text-black"
                                    : ""
                            }`}
                        >
                            ‹
                        </button>
                        <div
                            ref={scrollRef}
                            className="overflow-x-auto scrollbar-hide flex flex-nowrap gap-4"
                        >
                            {isLoading ? (
                                <>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="min-w-[20%] max-w-[20%]  relative overflow-hidden"
                                        >
                                            <div
                                                className="text-left text-black text-[200px] font-black"
                                                style={{
                                                    WebkitTextStroke:
                                                        "3px #cbcbcb",
                                                }}
                                            >
                                                {i + 1}
                                            </div>
                                            <div className="absolute top-16 left-18 z-9 w-32 h-48">
                                                <Skeleton className="w-full h-full rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {topFilms.map((item, index) => (
                                        <motion.div
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.8 }}
                                            key={index}
                                            className="min-w-[20%] max-w-[20%] relative overflow-visible group/item"
                                        >
                                            <div
                                                className="text-left text-black text-[200px] font-black"
                                                style={{
                                                    WebkitTextStroke:
                                                        "3px #cbcbcb",
                                                }}
                                            >
                                                {index + 1}
                                            </div>
                                            <img
                                                loading="lazy"
                                                className="absolute top-16 left-18 z-9 rounded-lg object-cover w-32 h-48"
                                                src={item.thumb}
                                                alt=""
                                            />
                                            <div
                                                onClick={() => {
                                                    navigate(
                                                        `/film/${item.slug}`
                                                    );
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                                className="backdrop-blur-sm absolute top-16 left-18 z-20 rounded-lg w-32 h-48 cursor-pointer opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                                            >
                                                <p className="text-center text-sm font-semibold">
                                                    {item.title_film}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </div>
                        <button
                            onClick={scrollRight}
                            className={`h-48 opacity-0 group-hover:opacity-100 text-7xl z-30 top-16 absolute right-0 p-4 cursor-pointer ${
                                theme === "dark"
                                    ? "to-white/50 group-hover:bg-white/40 text-black"
                                    : ""
                            } ${
                                theme === "light"
                                    ? "to-black/50 group-hover:bg-black/40 text-white"
                                    : ""
                            } ${
                                theme === "system"
                                    ? "to-white/50 group-hover:bg-white/40 text-black"
                                    : ""
                            }`}
                        >
                            ›
                        </button>
                    </div>
                </div>
                <div className="col-span-1"></div>
            </div>
        </>
    );
};

export default Rank;

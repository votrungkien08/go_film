import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilmUpdate } from '@/hooks/useFilm';

const Update = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const { updateFilm, isLoading } = useFilmUpdate();
    const films = [...updateFilm]
        .sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        )
        .slice(0, 10);


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

    return (
        <>
            <div className="grid grid-cols-12 min-h-80 gap-4 my-8 border-t border-gray-700/50">
                <div className="col-span-1"></div>
                <div className="col-span-10">
                    <div className="grid grid-cols-10 gap-4 mb-4 shadow shadow-gray-500/50">
                        <div className="col-span-5 flex items-center h-12">
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
                            <h1 className="ml-2 font-bold">
                                PHIM MỚI CẬP NHẬT
                            </h1>
                        </div>
                        <div
                            onClick={() =>
                            {
                                navigate("/films?update=true")
                                window.scrollTo({top:0,behavior:"smooth"})
                            } }
                            className="col-span-5 flex items-center justify-end cursor-pointer"
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
                    <div className="col-span-10 relative group">
                        <button
                            onClick={scrollLeft}
                            className={`h-full text-7xl opacity-0 group-hover:opacity-100 bg-gradient-to-l from-transparent transition-all duration-300 z-10 top-1/2 -translate-y-1/2 absolute left-0 p-4 cursor-pointer ${
                                theme === "dark"
                                    ? "to-white/50 group-hover:bg-white/10 text-black"
                                    : ""
                            } ${
                                theme === "light"
                                    ? "to-black/50 group-hover:bg-black/40 text-white"
                                    : ""
                            } ${
                                theme === "system"
                                    ? "to-white/50 group-hover:bg-white/10 text-black"
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
                                            className="min-w-[20%] max-w-[20%] aspect-[2/3] overflow-hidden"
                                        >
                                            <Skeleton className="w-full h-full rounded-lg" />
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {films.map((item, index) => (
                                        <motion.div
                                            whileHover={{ scale: 0.9 }}
                                            whileTap={{ scale: 0.8 }}
                                            key={item.id}
                                            className="min-w-[20%] max-w-[20%] overflow-hidden cursor-pointer relative group/item"
                                        >
                                            <img
                                                loading="lazy"
                                                className="w-full h-full object-cover rounded-lg"
                                                src={item.thumb}
                                                alt=""
                                            />
                                            <div
                                                onClick={() => {
                                                    navigate(
                                                        `/film/${item.slug}`
                                                    );
                                                    window.scrollTo({top:0,behavior:"smooth"})
                                                }}
                                                className="absolute rounded-lg bottom-0 opacity-0 backdrop-blur-sm group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center w-full h-full"
                                            >
                                                <h2 className="text-sm font-semibold text-center px-2">
                                                    {item.title_film}
                                                </h2>
                                            </div>
                                        </motion.div>
                                    ))}
                                </>
                            )}
                        </div>
                        <button
                            onClick={scrollRight}
                            className={`text-7xl opacity-0 group-hover:opacity-100 h-full bg-gradient-to-r from-transparent transition-all duration-300 z-10 top-1/2 -translate-y-1/2 absolute right-0 p-4 cursor-pointer ${
                                theme === "dark"
                                    ? "to-white/50 group-hover:bg-white/10 text-black"
                                    : ""
                            } ${
                                theme === "light"
                                    ? "to-black/50 group-hover:bg-black/40 text-white"
                                    : ""
                            } ${
                                theme === "system"
                                    ? "to-white/50 group-hover:bg-white/10 text-black"
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

export default Update;

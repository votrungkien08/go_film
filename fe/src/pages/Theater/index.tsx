import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/theme-provider";
import { Skeleton } from "../../components/ui/skeleton";
import {useFilmTheater} from '../../hooks/useFilm'
const Theater = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { theaterFilm, isLoading} = useFilmTheater();
    console.log('theaterFilm',theaterFilm);
    const scrollRef = useRef<HTMLDivElement>(null);
    const topFilms = [...theaterFilm].sort((a, b) => b.view - a.view).slice(0, 10);

    return (
        <>
            <div className="grid grid-cols-12 gap-4 py-4 border-t border-gray-700/50">
                <div className="col-span-1"></div>
                <div className="col-span-10 gap-4 min-h-80">
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
                            <h1 className="ml-2 font-bold">PHIM CHIẾU RẠP</h1>
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

                        <div
                            ref={scrollRef}
                            className="overflow-x-auto h-full  scrollbar-hide flex flex-nowrap gap-4"
                        >
                            {isLoading ? (
                                <>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="min-w-[20%] max-w-[20%]  relative"
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
                                        <>
                                            <div
                                            key={index}
                                            className="min-w-[20%] max-w-[20%] relative rounded-lg  group/item"
                                        >
                                            <div
                                                style={{
                                                    clipPath: index % 2 === 0 
                                                        ? "polygon(5.761% 100%, 94.239% 100%, 94.239% 100%, 95.174% 99.95%, 96.06% 99.803%, 96.887% 99.569%, 97.642% 99.256%, 98.313% 98.87%, 98.889% 98.421%, 99.357% 97.915%, 99.706% 97.362%, 99.925% 96.768%, 100% 96.142%, 100% 3.858%, 100% 3.858%, 99.913% 3.185%, 99.662% 2.552%, 99.263% 1.968%, 98.731% 1.442%, 98.08% .984%, 97.328% .602%, 96.488% .306%, 95.577% .105%, 94.609% .008%, 93.6% .024%, 5.121% 6.625%, 5.121% 6.625%, 4.269% 6.732%, 3.468% 6.919%, 2.728% 7.178%, 2.058% 7.503%, 1.467% 7.887%, .962% 8.323%, .555% 8.805%, .253% 9.326%, .065% 9.88%, 0 10.459%, 0 96.142%, 0 96.142%, .075% 96.768%, .294% 97.362%, .643% 97.915%, 1.111% 98.421%, 1.687% 98.87%, 2.358% 99.256%, 3.113% 99.569%, 3.94% 99.803%, 4.826% 99.95%, 5.761% 100%)"
                                                        : "polygon(94.239% 100%, 5.761% 100%, 5.761% 100%, 4.826% 99.95%, 3.94% 99.803%, 3.113% 99.569%, 2.358% 99.256%, 1.687% 98.87%, 1.111% 98.421%, .643% 97.915%, .294% 97.362%, .075% 96.768%, 0 96.142%, 0 3.858%, 0 3.858%, .087% 3.185%, .338% 2.552%, .737% 1.968%, 1.269% 1.442%, 1.92% .984%, 2.672% .602%, 3.512% .306%, 4.423% .105%, 5.391% .008%, 6.4% .024%, 94.879% 6.625%, 94.879% 6.625%, 95.731% 6.732%, 96.532% 6.919%, 97.272% 7.178%, 97.942% 7.503%, 98.533% 7.887%, 99.038% 8.323%, 99.445% 8.805%, 99.747% 9.326%, 99.935% 9.88%, 100% 10.459%, 100% 96.142%, 100% 96.142%, 99.925% 96.768%, 99.706% 97.362%, 99.357% 97.915%, 98.889% 98.421%, 98.313% 98.87%, 97.642% 99.256%, 96.887% 99.569%, 96.06% 99.803%, 95.174% 99.95%, 94.239% 100%)",
                                                }}
                                                className="w-full h-[350px] ">
                                                <img

                                                    loading="lazy"
                                                    className=" top-16 left-18 z-9 transition-transform duration-500  group-hover/item:scale-110  object-cover w-full h-full"
                                                    src={item.thumb}
                                                    alt=""
                                                />
                                            </div>

                                            <div
                                                onClick={() => {
                                                    navigate(
                                                        `/film/${item.slug}`
                                                    );
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                                style={{
                                                    clipPath: index % 2 === 0 
                                                        ? "polygon(5.761% 100%, 94.239% 100%, 94.239% 100%, 95.174% 99.95%, 96.06% 99.803%, 96.887% 99.569%, 97.642% 99.256%, 98.313% 98.87%, 98.889% 98.421%, 99.357% 97.915%, 99.706% 97.362%, 99.925% 96.768%, 100% 96.142%, 100% 3.858%, 100% 3.858%, 99.913% 3.185%, 99.662% 2.552%, 99.263% 1.968%, 98.731% 1.442%, 98.08% .984%, 97.328% .602%, 96.488% .306%, 95.577% .105%, 94.609% .008%, 93.6% .024%, 5.121% 6.625%, 5.121% 6.625%, 4.269% 6.732%, 3.468% 6.919%, 2.728% 7.178%, 2.058% 7.503%, 1.467% 7.887%, .962% 8.323%, .555% 8.805%, .253% 9.326%, .065% 9.88%, 0 10.459%, 0 96.142%, 0 96.142%, .075% 96.768%, .294% 97.362%, .643% 97.915%, 1.111% 98.421%, 1.687% 98.87%, 2.358% 99.256%, 3.113% 99.569%, 3.94% 99.803%, 4.826% 99.95%, 5.761% 100%)"
                                                        : "polygon(94.239% 100%, 5.761% 100%, 5.761% 100%, 4.826% 99.95%, 3.94% 99.803%, 3.113% 99.569%, 2.358% 99.256%, 1.687% 98.87%, 1.111% 98.421%, .643% 97.915%, .294% 97.362%, .075% 96.768%, 0 96.142%, 0 3.858%, 0 3.858%, .087% 3.185%, .338% 2.552%, .737% 1.968%, 1.269% 1.442%, 1.92% .984%, 2.672% .602%, 3.512% .306%, 4.423% .105%, 5.391% .008%, 6.4% .024%, 94.879% 6.625%, 94.879% 6.625%, 95.731% 6.732%, 96.532% 6.919%, 97.272% 7.178%, 97.942% 7.503%, 98.533% 7.887%, 99.038% 8.323%, 99.445% 8.805%, 99.747% 9.326%, 99.935% 9.88%, 100% 10.459%, 100% 96.142%, 100% 96.142%, 99.925% 96.768%, 99.706% 97.362%, 99.357% 97.915%, 98.889% 98.421%, 98.313% 98.87%, 97.642% 99.256%, 96.887% 99.569%, 96.06% 99.803%, 95.174% 99.95%, 94.239% 100%)",
                                                }}
                                                className=" absolute top-0 z-20  w-full h-[350px] group-hover/item:bg-yellow-500/10 cursor-pointer opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                                            >

                                            </div>

                                            <div className="flex flex-col items-center mt-2">
                                                <h3 className="text-amber-400 font-extrabold text-[48px] italic leading-none drop-shadow-[2px_2px_3px_rgba(0,0,0,0.6)]">
                                                    {index + 1}
                                                </h3>
                                                <p className="text-center text-sm font-semibold line-clamp-2">
                                                    {item.title_film}
                                                </p>
                                            </div>
                                        </div>

                                        </>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-span-1"></div>
            </div>
        </>
    );
};

export default Theater;

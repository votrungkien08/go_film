import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, easeIn } from "framer-motion";
import { Play } from "lucide-react";
interface Film {
    id: number;
    slug: string;
    title_film: string;
    thumb: string;
    year?: { release_year: string };
    genres?: { genre_name: string }[];
    content: string;
}

interface FilmSuggestionsProps {
    genres?: { genre_name: string }[];
}

const FilmSuggestions: React.FC<FilmSuggestionsProps> = ({ genres }) => {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const getRandomFilms = useCallback((arr: Film[], n: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(arr.length, n));
    }, []);

    useEffect(() => {
        const fetchFilms = async () => {
            try {
                setLoading(true);
                const genreNames =
                    genres?.map((g) => g.genre_name).join(",") || "";
                console.log("Genres gửi tới API:", genreNames);
                const response = await axios.get(
                    "http://localhost:8000/api/films/filter",
                    {
                        params: genreNames ? { genre: genreNames } : {},
                    }
                );
                console.log("Danh sách phim từ API:", response.data);
                const randomFilms = getRandomFilms(response.data, 4);
                console.log("Phim ngẫu nhiên:", randomFilms);
                setFilms(randomFilms);
                setLoading(false);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(`Không thể tải phim gợi ý: ${err.message}`);
                } else {
                    setError("Có lỗi xảy ra khi tải phim gợi ý");
                }
                setLoading(false);
                console.error("Error fetching films:", err);
            }
        };

        fetchFilms();
    }, [genres, getRandomFilms]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-4">
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
                <span className="ml-2 text-white">Đang tải...</span>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    if (films.length === 0) {
        return (
            <div className="text-center py-4 text-gray-400">
                Không tìm thấy phim gợi ý.
            </div>
        );
    }

    return (
        <div className="py-4">
            <h2 className="text-xl text-left font-bold mb-4 text-orange-500">
                Phim gợi ý cho bạn
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {films.map((film) => (
                    <div
                        key={film.id}
                        className="bg-gradient-to-br from-slate-300 to-stone-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex"
                    >
                        <div className="w-40 flex-shirk-0">
                            <img
                                src={film.thumb}
                                alt={film.title_film}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "https://via.placeholder.com/150";
                                }}
                            />
                        </div>
                        <div className="p-4 flex-1 min-w-0 text-left">
                            <h3 className="text-lg font-semibold text-white line-clamp-2">
                                {film.title_film}
                            </h3>
                            <p className="text-sm text-gray-300 mt-1">
                                {film.year?.release_year || "N/A"} •{" "}
                                {film.genres
                                    ?.map((g) => g.genre_name)
                                    .join(", ") || "N/A"}
                            </p>
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                {film.content}
                            </p>
                            <div className="mt-3">
                                <button
                                    onClick={() =>
                                    {
                                        navigate(`/watch-film/${film.slug}`);
                                        window.scrollTo({top:0,behavior:"smooth"})
                                    }
                                    }
                                    className="cursor-pointer inline-block bg-orange-500 text-white p-4 rounded-full hover:bg-orange-600 transition-colors duration-300 text-sm"
                                >
                                    <Play className="w-7 h-7" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilmSuggestions;

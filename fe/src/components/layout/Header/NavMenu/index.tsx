import { type Genre, type Year, type Country } from "@/types";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGenre } from "@/hooks/useGenre";
import { useYear } from "@/hooks/useYear";
import { useCountry } from "@/hooks/useCountry";
import { motion } from "framer-motion";
import DropdownMenu from './DropMenu';
export const NavMenu = () => {
    // animation
    const refTab = useRef(null);
    const [hoverPosition, setHoverPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });
    const navigate = useNavigate();
    // list film category
    const genres = useGenre();
    const years = useYear();
    const countries = useCountry();



    const createSlug = (text: string): string => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "d")
            .replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^a-z0-9\s-]/g, "") 
            .replace(/\s+/g, "-") 
            .replace(/-+/g, "-") 
            .replace(/^-|-$/g, "") 
            .trim();
    };
    const handleGenreSelect = (genre: Genre) => {
        const genreSlug = createSlug(genre.genre_name);
        navigate(`/filter?genre=${(genreSlug)}`);
    };
    const handleYearSelect = (year: Year) => {
        navigate(`/filter?year=${year.release_year}`);
    };

    const handleCountrySelect = (country: Country) => {
        const countrySlug = createSlug(country.country_name);
        navigate(`/filter?country=${countrySlug}`);
    };

    const handleFilmTypeSelect = (filmType: string) => {
        const typeSlug = filmType === "true" ? "phim-bo" : "phim-le";
        navigate(`/filter?type=${typeSlug}`);
    };

    const handleHover = (e: React.MouseEvent<HTMLHeadingElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const containerRect = refTab.current?.getBoundingClientRect();
        if (containerRect) {
            setHoverPosition({
                left: rect.left - containerRect.left,
                width: rect.width,
                opacity: 1,
            });
        }
    };

    const handleMouseLeave = () => {
        
        setHoverPosition((prev) => ({
            ...prev,
            opacity: 0,
        }));
    };

    return (
            <div
                ref={refTab}
                    className="relative col-span-5 flex items-center justify-center h-full"
        >
            
                <DropdownMenu<Genre>
                    title="THỂ LOẠI"
                    dataItems={genres}
                    getLabel={(g) => g.genre_name}
                    onSelect={handleGenreSelect}
                /> 
                <DropdownMenu<Country>
                    title="QUỐC GIA"
                    dataItems={countries}
                    getLabel={(c) => c.country_name}
                    onSelect={handleCountrySelect}
                /> 
                <DropdownMenu<Year>
                    title="NĂM"
                    dataItems={years}
                    getLabel={(y) => String(y.release_year)}
                    onSelect={handleYearSelect}
                /> 
                <div
                    tabIndex={0}
                        className="group h-full flex items-center justify-center cursor-pointer"
                    >
                <h2
                    style={{ pointerEvents: 'auto' }}
                    
                        className="mr-8 py-4 text-left font-bold group-hover:text-[#ff4c00]"
                        onClick={() => handleFilmTypeSelect("false")}
                        onMouseEnter={handleHover}
                        onMouseLeave={handleMouseLeave}
                    >
                        PHIM LẺ
                    </h2>
                </div>
                <div
                        tabIndex={0}
                        className="group h-full flex items-center justify-center cursor-pointer"
                    >
                <h2
                    style={{ pointerEvents: 'auto' }}
                        className="mr-8 py-4 text-left font-bold group-hover:text-[#ff4c00]"
                    onClick={() => {
                        handleFilmTypeSelect("true")
                        console.log('phimbo')
                        }}
                        onMouseEnter={handleHover}
                        onMouseLeave={handleMouseLeave}
                    >
                        PHIM BỘ
                    </h2>
                </div>
                <motion.div
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                    animate={hoverPosition}
                    className="absolute bottom-0 left-0 h-[4px] bg-[#ff4c00] rounded-full"
                />
            </div>
    )
}
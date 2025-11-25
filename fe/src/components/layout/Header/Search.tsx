import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
// Make sure useTheme is exported from theme-provider or adjust the import path accordingly
import { useTheme } from "@/components/theme-provider";
import {  Search as SearchIcon } from "lucide-react"
export default function Search() {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/filter?search=${(searchQuery)}`);
        } 
    };
    return (
            <div
                    tabIndex={0}
                    className="group col-span-3 h-full flex items-center relative cursor-pointer"
                >
                    <form onSubmit={handleSearch} className="w-full">
                        <input
                            placeholder="Tìm kiếm"
                            className={`h-[30px] w-full pl-2 border rounded-2xl outline-none group-hover:border-[#ff4c00] ${
                                theme === "light"
                                    ? "placeholder:text-black border-black"
                                    : ""
                            } ${
                                theme === "dark"
                                    ? "placeholder:text-white border-white"
                                    : ""
                            } ${
                                theme === "system"
                                    ? "system-placeholder:text-white"
                                    : ""
                            }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-8 h-8 absolute right-0 top-1/2 transform -translate-y-1/2"
                        >
                            <SearchIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
    )
}
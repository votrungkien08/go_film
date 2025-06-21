import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Select from 'react-select';
import { FiFilter, FiX, FiChevronDown, FiFilm, FiGlobe, FiCalendar, FiClock, FiList } from 'react-icons/fi';

interface Genre {
    id: number;
    genre_name: string;
}

interface Year {
    id: number;
    release_year: number;
}

interface Country {
    id: number;
    country_name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdvancedFilter = () => {
    const navigate = useNavigate();
    const [genres, setGenres] = useState<Genre[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterData, setFilterData] = useState({
        genre: [] as string[],
        year: '',
        country: '',
        filmType: '',
        duration: '',
        sortBy: 'release_year_desc',
    });
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen]);

    useEffect(() => {
        const fetchData = async (endpoint: string, setter: (data: any) => void, field: string) => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Vui lòng đăng nhập để sử dụng bộ lọc');
                    setter([]);
                    return;
                }
                const response = await axios.get(`${API_URL}/api/${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = response.data[field] || [];
                const uniqueData = data.filter(
                    (item: any, index: number, self: any[]) =>
                        item.id != null && self.findIndex((i) => i.id === item.id) === index
                );
                setter(uniqueData);
            } catch (err: any) {
                console.error(`Lỗi khi lấy ${endpoint}:`, err.response?.data || err.message);
                toast.error(`Không thể tải danh sách ${endpoint}`);
                setter([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData('genres', setGenres, 'genres');
        fetchData('years', setYears, 'years');
        fetchData('countries', setCountries, 'country');
    }, []);

    const createSlug = (text: string): string =>
        text && typeof text === 'string'
            ? text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            : '';

    const handleGenreChange = (selectedOptions: any) => {
        try {
            const selectedGenres = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
            setFilterData({ ...filterData, genre: selectedGenres });
        } catch (error) {
            console.error('Lỗi trong handleGenreChange:', error); // THÊM MỚI
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterData({ ...filterData, [e.target.name]: e.target.value });
    };

    const handleAdvancedSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const queryParams = new URLSearchParams();
        if (filterData.genre.length > 0) {
            filterData.genre.forEach((genre) => {
                queryParams.append('genre', createSlug(genre));
            });
        }
        if (filterData.year && !isNaN(Number(filterData.year))) queryParams.append('year', filterData.year);
        if (filterData.country?.trim()) queryParams.append('country', createSlug(filterData.country));
        if (['phim-le', 'phim-bo'].includes(filterData.filmType)) queryParams.append('type', filterData.filmType);
        if (['short', 'medium', 'long'].includes(filterData.duration)) queryParams.append('duration', filterData.duration);
        if (['release_year_desc', 'release_year_asc', 'title_asc', 'title_desc'].includes(filterData.sortBy)) {
            queryParams.append('sort', filterData.sortBy);
        }
        navigate(`/films?${queryParams.toString()}`);
        setIsFilterOpen(false);
    };

    const resetFilters = () => {
        setFilterData({
            genre: [],
            year: '',
            country: '',
            filmType: '',
            duration: '',
            sortBy: 'release_year_desc',
        });
        navigate('/films');
        setIsFilterOpen(false);
    };

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: '#1F2937',
            borderColor: '#4B5563',
            color: '#fff',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            boxShadow: 'none',
            '&:hover': { borderColor: '#ff4c00' },
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: '#1F2937',
            borderRadius: '0.5rem',
            maxHeight: '200px',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#ff4c00' : '#1F2937',
            color: '#fff',
            '&:hover': { backgroundColor: '#374151' },
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: '#ff4c00',
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: '#fff',
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: '#fff',
            '&:hover': { backgroundColor: '#e04300', color: '#fff' },
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: '#9CA3AF',
        }),
        input: (provided: any) => ({
            ...provided,
            color: '#fff',
        }),
    };

    return (
        <>
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="fixed z-40 top-20 right-8 bg-[#ff4c00] text-white p-4 rounded-full shadow-lg hover:bg-[#e04300] transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#ff4c00]/30"
                aria-label="Lọc nâng cao"
                style={{ boxShadow: '0 4px 24px 0 rgba(255,76,0,0.25)' }}
            >
                <FiFilter size={28} />
            </button>

            <div
                ref={popoverRef}
                className={`fixed z-50 top-36 right-8 w-full max-w-3xl bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-800 transition-all duration-500 ease-in-out ${isFilterOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-8 pointer-events-none'} animate-fade-in`}
                style={{ maxWidth: '420px' }}
            >
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white flex items-center gap-2"><FiFilter /> Bộ lọc nâng cao</span>
                    <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-full transition-colors">
                        <FiX size={22} />
                    </button>
                </div>
                {isLoading ? (
                    <p className="text-white text-center mt-4">Đang tải dữ liệu...</p>
                ) : (
                    <form onSubmit={handleAdvancedSearch} className="space-y-4 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex text-sm text-gray-300 mb-2 items-center gap-1"><FiList /> Thể loại</label>
                                <Select
                                    isMulti
                                    isSearchable
                                    name="genre"
                                    options={genres?.length ? genres.map((genre) => ({ value: genre.genre_name, label: genre.genre_name })) : []} // SỬA: Kiểm tra genres
                                    value={filterData.genre.map((genre) => ({ value: genre, label: genre }))}
                                    onChange={handleGenreChange}
                                    styles={customStyles}
                                    placeholder="Chọn thể loại..."
                                    classNamePrefix="react-select"
                                    className="w-full"
                                    noOptionsMessage={() => "Không có thể loại nào"}
                                />
                            </div>
                            <div>
                                <label className="flex text-sm text-gray-300 mb-2 items-center gap-1"><FiCalendar /> Năm phát hành</label>
                                <div className="relative">
                                    <select
                                        name="year"
                                        value={filterData.year}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00] pr-8 appearance-none"
                                    >
                                        <option value="">Tất cả năm</option>
                                        {years.map((year) => (
                                            <option key={year.id} value={year.release_year}>
                                                {year.release_year}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="flex text-sm text-gray-300 mb-2 items-center gap-1"><FiGlobe /> Quốc gia</label>
                                <div className="relative">
                                    <select
                                        name="country"
                                        value={filterData.country}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00] pr-8 appearance-none"
                                    >
                                        <option value="">Tất cả quốc gia</option>
                                        {countries.map((country) => (
                                            <option key={country.id} value={country.country_name}>
                                                {country.country_name}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="flex text-sm text-gray-300 mb-2 items-center gap-1"><FiFilm /> Loại phim</label>
                                <div className="relative">
                                    <select
                                        name="filmType"
                                        value={filterData.filmType}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00] pr-8 appearance-none"
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="phim-le">Phim lẻ</option>
                                        <option value="phim-bo">Phim bộ</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="flex text-sm text-gray-300 mb-2 items-center gap-1"><FiClock /> Thời lượng</label>
                                <div className="relative">
                                    <select
                                        name="duration"
                                        value={filterData.duration}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00] pr-8 appearance-none"
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="short">Dưới 90 phút</option>
                                        <option value="medium">90-120 phút</option>
                                        <option value="long">Trên 120 phút</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="flex text-sm text-gray-300 mb-2 items-center gap-1"><FiList /> Sắp xếp theo</label>
                                <div className="relative">
                                    <select
                                        name="sortBy"
                                        value={filterData.sortBy}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00] pr-8 appearance-none"
                                    >
                                        <option value="release_year_desc">Năm phát hành (Mới nhất)</option>
                                        <option value="release_year_asc">Năm phát hành (Cũ nhất)</option>
                                        <option value="imdb_desc">Điểm IMDb (Cao nhất)</option>
                                        <option value="imdb_asc">Điểm IMDb (Thấp nhất)</option>
                                        <option value="title_asc">Tên phim (A-Z)</option>
                                        <option value="title_desc">Tên phim (Z-A)</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-6 gap-2">
                            <button
                                type="submit"
                                className="bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-all font-semibold w-1/2 flex items-center justify-center gap-2 shadow-md"
                            >
                                <FiFilter /> Tìm kiếm
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-600 transition-all font-semibold w-1/2 flex items-center justify-center gap-2 shadow-md"
                            >
                                <FiX /> Xóa bộ lọc
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-32px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.4s cubic-bezier(.4,0,.2,1); }
            `}</style>
        </>
    );
};

export default AdvancedFilter;
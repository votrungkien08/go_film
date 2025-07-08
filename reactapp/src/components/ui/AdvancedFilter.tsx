import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Select from 'react-select';
import { FiFilter, FiX, FiChevronDown, FiFilm, FiGlobe, FiCalendar, FiClock, FiList } from 'react-icons/fi';

// Định nghĩa các interface để khai báo cấu trúc dữ liệu cho thể loại, năm phát hành, và quốc gia
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

// Khai báo URL API, lấy từ biến môi trường hoặc mặc định là localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdvancedFilter = () => {
    // Hook useNavigate để điều hướng đến các trang khác
    const navigate = useNavigate();

    // State để lưu danh sách thể loại, năm, quốc gia, trạng thái tải, trạng thái mở form, và dữ liệu bộ lọc
    const [genres, setGenres] = useState<Genre[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Theo dõi trạng thái tải dữ liệu
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Kiểm soát hiển thị/ẩn form bộ lọc
    const [filterData, setFilterData] = useState({
        genre: [] as string[], // Mảng các thể loại được chọn
        year: '', // Năm phát hành
        country: '', // Quốc gia
        filmType: '', // Loại phim (phim lẻ/phim bộ)
        duration: '', // Thời lượng phim
        sortBy: 'release_year_desc', // Tiêu chí sắp xếp (mặc định: năm mới nhất)
    });

    // Tham chiếu đến phần tử DOM của form bộ lọc để xử lý sự kiện click ngoài
    const popoverRef = useRef<HTMLDivElement>(null);

    // useEffect để xử lý sự kiện click bên ngoài form để đóng form
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Kiểm tra nếu click ngoài popoverRef thì đóng form
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        // Thêm sự kiện mousedown khi form mở, gỡ khi form đóng
        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        // Cleanup sự kiện khi component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen]);

    // useEffect để lấy dữ liệu từ API khi component được mount
    useEffect(() => {
        // Hàm chung để gọi API và cập nhật state
        const fetchData = async (endpoint: string, setter: (data: any) => void, field: string) => {
            setIsLoading(true); // Bắt đầu tải dữ liệu
            try {
                const response = await axios.get(`${API_URL}/api/${endpoint}`);
                const data = response.data[field] || []; // Lấy dữ liệu từ response
                // Lọc dữ liệu trùng lặp dựa trên id
                const uniqueData = data.filter(
                    (item: any, index: number, self: any[]) =>
                        item.id != null && self.findIndex((i) => i.id === item.id) === index
                );
                setter(uniqueData); // Cập nhật state
            } catch (err: any) {
                // Xử lý lỗi và hiển thị thông báo
                console.error(`Lỗi khi lấy ${endpoint}:`, err.response?.data || err.message);
                toast.error(`Không thể tải danh sách ${endpoint}`);
                setter([]); // Đặt state về rỗng nếu lỗi
            } finally {
                setIsLoading(false); // Kết thúc tải dữ liệu
            }
        };

        // Gọi API để lấy danh sách thể loại, năm, và quốc gia
        fetchData('genres', setGenres, 'genres');
        fetchData('years', setYears, 'years');
        fetchData('countries', setCountries, 'country');
    }, []); // Chạy một lần khi component mount

    // Hàm chuyển đổi chuỗi thành slug để sử dụng trong URL
    const createSlug = (text: string): string =>
        text && typeof text === 'string'
            ? text
                .toLowerCase() // Chuyển thành chữ thường
                .normalize('NFD') // Chuẩn hóa Unicode
                .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
                .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
                .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
                .replace(/-+/g, '-') // Xóa nhiều dấu gạch ngang liên tiếp
                .trim() // Xóa khoảng trắng thừa
            : '';

    // Xử lý thay đổi lựa chọn thể loại
    const handleGenreChange = (selectedOptions: any) => {
        try {
            // Lấy danh sách thể loại được chọn
            const selectedGenres = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
            setFilterData({ ...filterData, genre: selectedGenres }); // Cập nhật state
        } catch (error) {
            console.error('Lỗi trong handleGenreChange:', error); // Xử lý lỗi
        }
    };

    // Xử lý thay đổi giá trị của các select input
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterData({ ...filterData, [e.target.name]: e.target.value }); // Cập nhật state tương ứng
    };

    // Xử lý tìm kiếm nâng cao
    const handleAdvancedSearch = (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn hành vi submit mặc định
        const queryParams = new URLSearchParams(); // Tạo query string
        // Thêm các tham số bộ lọc vào query
        if (filterData.genre.length > 0) {
            filterData.genre.forEach((genre) => {
                queryParams.append('genre', createSlug(genre)); // Thêm thể loại dạng slug
            });
        }
        if (filterData.year && !isNaN(Number(filterData.year))) queryParams.append('year', filterData.year); // Thêm năm nếu hợp lệ
        if (filterData.country?.trim()) queryParams.append('country', createSlug(filterData.country)); // Thêm quốc gia dạng slug
        if (['phim-le', 'phim-bo'].includes(filterData.filmType)) queryParams.append('type', filterData.filmType); // Thêm loại phim
        if (['short', 'medium', 'long'].includes(filterData.duration)) queryParams.append('duration', filterData.duration); // Thêm thời lượng
        if (['release_year_desc', 'release_year_asc', 'title_asc', 'title_desc'].includes(filterData.sortBy)) {
            queryParams.append('sort', filterData.sortBy); // Thêm tiêu chí sắp xếp
        }
        // Điều hướng đến trang phim với query string
        navigate(`/films?${queryParams.toString()}`);
        setIsFilterOpen(false); // Đóng form bộ lọc
    };

    // Xóa các bộ lọc và đặt lại giá trị mặc định
    const resetFilters = () => {
        setFilterData({
            genre: [],
            year: '',
            country: '',
            filmType: '',
            duration: '',
            sortBy: 'release_year_desc',
        });
        navigate('/films'); // Điều hướng về trang phim mặc định
        setIsFilterOpen(false); // Đóng form bộ lọc
    };

    // Cấu hình giao diện tùy chỉnh cho react-select
    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: '#1F2937', // Màu nền của dropdown
            borderColor: '#4B5563', // Màu viền
            color: '#fff', // Màu chữ
            padding: '0.5rem', // Padding
            borderRadius: '0.5rem', // Bo góc
            boxShadow: 'none', // Xóa shadow mặc định
            '&:hover': { borderColor: '#ff4c00' }, // Viền khi hover
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: '#1F2937', // Màu nền menu
            borderRadius: '0.5rem', // Bo góc
            maxHeight: '200px', // Chiều cao tối đa
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#ff4c00' : '#1F2937', // Màu nền tùy chọn
            color: '#fff', // Màu chữ
            '&:hover': { backgroundColor: '#374151' }, // Màu khi hover
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: '#ff4c00', // Màu nền của giá trị được chọn
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: '#fff', // Màu chữ của giá trị
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: '#fff', // Màu nút xóa
            '&:hover': { backgroundColor: '#e04300', color: '#fff' }, // Màu khi hover nút xóa
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: '#9CA3AF', // Màu placeholder
        }),
        input: (provided: any) => ({
            ...provided,
            color: '#fff', // Màu chữ input
        }),
    };

    return (
        <>
            {/* Nút mở/đóng form bộ lọc */}
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="fixed z-40 top-20 right-8 bg-[#ff4c00] text-white p-4 rounded-full shadow-lg hover:bg-[#e04300] transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#ff4c00]/30"
                aria-label="Lọc nâng cao"
                style={{ boxShadow: '0 4px 24px 0 rgba(255,76,0,0.25)' }}
            >
                <FiFilter size={28} />
            </button>

            {/* Form bộ lọc nâng cao */}
            <div
                ref={popoverRef}
                className={`fixed z-50 top-36 right-8 w-full max-w-3xl bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-800 transition-all duration-500 ease-in-out ${isFilterOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-8 pointer-events-none'} animate-fade-in`}
                style={{ maxWidth: '420px' }}
            >
                {/* Tiêu đề và nút đóng */}
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white flex items-center gap-2"><FiFilter /> Bộ lọc nâng cao</span>
                    <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-full transition-colors">
                        <FiX size={22} />
                    </button>
                </div>
                {/* Hiển thị trạng thái tải hoặc form bộ lọc */}
                {isLoading ? (
                    <p className="text-white text-center mt-4">Đang tải dữ liệu...</p>
                ) : (
                    <form onSubmit={handleAdvancedSearch} className="space-y-4 mt-2">
                        {/* Lưới các trường bộ lọc */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Trường chọn thể loại */}
                            <div>
                                <label className="flex text-sm text-gray-300 mb-2 items-center gap-1"><FiList /> Thể loại</label>
                                <Select
                                    isMulti // Cho phép chọn nhiều giá trị
                                    isSearchable // Cho phép tìm kiếm
                                    name="genre"
                                    options={genres?.length ? genres.map((genre) => ({ value: genre.genre_name, label: genre.genre_name })) : []} // Danh sách thể loại
                                    value={filterData.genre.map((genre) => ({ value: genre, label: genre }))} // Giá trị đã chọn
                                    onChange={handleGenreChange} // Xử lý thay đổi
                                    styles={customStyles} // Giao diện tùy chỉnh
                                    placeholder="Chọn thể loại..." // Placeholder
                                    classNamePrefix="react-select"
                                    className="w-full"
                                    noOptionsMessage={() => "Không có thể loại nào"} // Thông báo khi không có lựa chọn
                                />
                            </div>
                            {/* Trường chọn năm phát hành */}
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
                            {/* Trường chọn quốc gia */}
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
                            {/* Trường chọn loại phim */}
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
                            {/* Trường chọn thời lượng */}
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
                            {/* Trường chọn tiêu chí sắp xếp */}
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
                        {/* Nút tìm kiếm và xóa bộ lọc */}
                        <div className="flex justify-between mt-6 gap-2">
                            <button
                                type="submit"
                                className="bg-[#ff4c00] text-white p-3 rounded-2xl hover:bg-[#e04300] transition-all font-semibold w-1/2 flex items-center justify-center gap-2 shadow-md"
                            >
                                <FiFilter /> Tìm kiếm
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="bg-gray-700 text-white p-3 rounded-2xl hover:bg-gray-600 transition-all font-semibold w-1/2 flex items-center justify-center gap-2 shadow-md"
                            >
                                <FiX /> Xóa bộ lọc
                            </button>
                        </div>
                    </form>
                )}
            </div>
            {/* CSS tùy chỉnh cho animation */}
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
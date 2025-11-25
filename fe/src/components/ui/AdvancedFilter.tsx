import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Select from 'react-select';
import { FiFilter, FiX, FiChevronDown, FiFilm, FiGlobe, FiCalendar, FiList } from 'react-icons/fi';
import { useGenre } from "@/hooks/useGenre";
import { useYear } from "@/hooks/useYear";
import { useCountry } from "@/hooks/useCountry";

const AdvancedFilter = () => {
    const navigate = useNavigate();

    const genres = useGenre();
    const years = useYear();
    const countries = useCountry();
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Kiểm soát hiển thị/ẩn form bộ lọc
    const [filterData, setFilterData] = useState({
        genre: [] as string[], // Mảng các thể loại được chọn
        year: '', // Năm phát hành
        country: '', // Quốc gia
        filmType: '', // Loại phim (phim lẻ/phim bộ)
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
    // Hàm chuyển đổi chuỗi thành slug để sử dụng trong URL
    const createSlug = (text: string): string => {
        if (!text || typeof text !== 'string') return '';
        return text
            .toLowerCase()
            .replace(/đ/g, 'd') // Thay đ thành d trước khi normalize
            .replace(/Đ/g, 'd') // Thay Đ thành d trước khi normalize  
            .normalize('NFD') // Chuẩn hóa Unicode
            .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
            .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt trừ khoảng trắng và gạch ngang
            .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch ngang
            .replace(/-+/g, '-') // Xóa nhiều gạch ngang liên tiếp
            .replace(/^-+|-+$/g, '') // Xóa gạch ngang ở đầu và cuối
            .trim();
    };

    // Xử lý thay đổi lựa chọn thể loại
    const handleGenreChange = (selectedOptions: any) => {
        const selectedGenres = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
        setFilterData({ ...filterData, genre: selectedGenres });
      
    };

    // Xử lý thay đổi giá trị của các select input
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterData({ ...filterData, [e.target.name]: e.target.value }); 
    };

    // Xử lý tìm kiếm nâng cao
    const handleAdvancedSearch = (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn hành vi submit mặc định
        const queryParams = new URLSearchParams(); // Tạo query string

        // Thêm các tham số bộ lọc vào query
        if (filterData.genre.length > 0) {
            filterData.genre.forEach((genre) => {
                queryParams.append('genres', createSlug(genre)); // Thêm thể loại dạng slug
                console.log('queryParam after append', queryParams.toString());
            });
        }
        if (filterData.year && !isNaN(Number(filterData.year))) queryParams.append('year', filterData.year); // Thêm năm nếu hợp lệ
        if (filterData.country?.trim()) queryParams.append('country', createSlug(filterData.country)); // Thêm quốc gia dạng slug
        if (['phim-le', 'phim-bo'].includes(filterData.filmType)) queryParams.append('film_type', filterData.filmType); // Thêm loại phim
        // Điều hướng đến trang phim với query string
        navigate(`/filter?${queryParams.toString()}`);
        setIsFilterOpen(false); // Đóng form bộ lọc
    };

    // Xóa các bộ lọc và đặt lại giá trị mặc định
    const resetFilters = () => {
        setFilterData({
            genre: [],
            year: '',
            country: '',
            filmType: '',
        });
        navigate('/filter'); // Điều hướng về trang lọc phim
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
                                            <option key={country.id} value={country.slug}>
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

            </div>

        </>
    );
};

export default AdvancedFilter;
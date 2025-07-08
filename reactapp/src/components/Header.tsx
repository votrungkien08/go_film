import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAuthPanel } from '@/utils/auth'; // Updated to use alias @
import { toast } from 'sonner';
import { ModeToggle } from './mode-toggle';
import { useTheme } from './theme-provider'; // Updated to use local theme-provider
import { motion } from 'framer-motion';

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

const Header = () => {
    const { theme } = useTheme();
    const { isPanelOpen, setIsPanelOpen, isLoginForm, setIsLoginForm } = useAuthPanel();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [user, setUser] = useState<{ name: string; points: number; role: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [genres, setGenres] = useState<Genre[]>([]);
    const [showGenreDropdown, setShowGenreDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [years, setYears] = useState<Year[]>([]);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const yearDropdownRef = useRef<HTMLDivElement>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const countryDropdownRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const paymentProcessedRef = useRef(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [pointsToBuy, setPointsToBuy] = useState('');

    const refTab = useRef(null);
    const [hoverPosition, setHoverPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });

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

    const navigate = useNavigate();
    const location = useLocation();

    const handleBuyPoints = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.success('Xử lý thanh toán...');
    };

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/genres`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const genresData = response.data.genres || [];
                const uniqueGenres = genresData.filter(
                    (genre: Genre, index: number, self: Genre[]) =>
                        genre.id != null && self.findIndex((g) => g.id === genre.id) === index
                );
                setGenres(uniqueGenres);
            } catch (err: any) {
                console.error('Lỗi khi lấy danh sách thể loại:', err.response?.data || err.message);
                toast.error('Không thể tải danh sách thể loại');
                setGenres([]);
            }
        };

        const fetchYears = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/years`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const yearsData = response.data.years || [];
                const uniqueYears = yearsData.filter(
                    (year: Year, index: number, self: Year[]) =>
                        year.id != null && self.findIndex((y) => y.id === year.id) === index
                );
                setYears(uniqueYears);
            } catch (err: any) {
                console.error('Lỗi khi lấy danh sách năm:', err.response?.data || err.message);
                toast.error('Không thể tải danh sách năm');
                setYears([]);
            }
        };

        const fetchCountries = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/countries`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const countriesData = response.data.country || [];
                const uniqueCountries = countriesData.filter(
                    (country: Country, index: number, self: Country[]) =>
                        country.id != null && self.findIndex((c) => c.id === country.id) === index
                );
                setCountries(uniqueCountries);
            } catch (err: any) {
                console.error('Lỗi khi lấy danh sách quốc gia:', err.response?.data || err.message);
                toast.error('Không thể tải danh sách quốc gia');
                setCountries([]);
            }
        };

        fetchGenres();
        fetchYears();
        fetchCountries();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowGenreDropdown(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
                setShowYearDropdown(false);
            }
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isPanelOpen && !isLoggedIn) {
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        }
    }, [isPanelOpen, isLoginForm]);

    useEffect(() => {
        if (isPanelOpen && isLoggedIn) {
            const fetchUser = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_URL}/api/user`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data.user);
                } catch (err: any) {
                    toast.error('Không thể tải thông tin người dùng');
                    setUser(null);
                }
            };
            fetchUser();
        }
    }, [isPanelOpen, isLoggedIn]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const paymentStatus = params.get('payment');

        if (paymentStatus && !paymentProcessedRef.current) {
            paymentProcessedRef.current = true;

            if (paymentStatus === 'success') {
                setTimeout(() => {
                    toast.success('Thanh toán thành công! Điểm đã được cộng vào tài khoản.', {
                        duration: 5000,
                        position: 'top-center',
                    });
                }, 500);

                const fetchUser = async () => {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`${API_URL}/api/user`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setUser(response.data.user);
                        setTimeout(() => {
                            navigate(location.pathname, { replace: true });
                        }, 1000);
                    } catch (err: any) {
                        toast.error('Không thể cập nhật thông tin người dùng');
                        setTimeout(() => {
                            navigate(location.pathname, { replace: true });
                        }, 1000);
                    }
                };
                fetchUser();
            } else if (paymentStatus === 'FAILED') {
                setTimeout(() => {
                    toast.error('Thanh toán thất bại. Vui lòng thử lại.', {
                        duration: 5000,
                        position: 'top-center',
                    });
                }, 500);
                setTimeout(() => {
                    navigate(location.pathname, { replace: true });
                }, 1000);
            } else if (paymentStatus === 'ERROR') {
                setTimeout(() => {
                    toast.error('Lỗi thanh toán. Vui lòng liên hệ hỗ trợ.', {
                        duration: 5000,
                        position: 'top-center',
                    });
                }, 500);
                setTimeout(() => {
                    navigate(location.pathname, { replace: true });
                }, 1000);
            }
        }

        if (!paymentStatus) {
            paymentProcessedRef.current = false;
        }
    }, [location.search, navigate]);

    const createSlug = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleGenreSelect = (genre: Genre) => {
        setShowGenreDropdown(false);
        const genreSlug = createSlug(genre.genre_name);
        navigate(`/films?genre=${genreSlug}`);
    };

    const handleYearSelect = (year: Year) => {
        setShowYearDropdown(false);
        navigate(`/films?year=${year.release_year}`);
    };

    const handleCountrySelect = (country: Country) => {
        setShowCountryDropdown(false);
        const countrySlug = createSlug(country.country_name);
        navigate(`/films?country=${countrySlug}`);
    };

    const handleFilmTypeSelect = (filmType: string) => {
        const typeSlug = filmType === 'true' ? 'phim-le' : 'phim-bo';
        navigate(`/films?type=${typeSlug}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/films?search=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate('/films');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/login`, {
                email: formData.email,
                password: formData.password,
            });
            toast.success('Đăng nhập thành công!');
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setIsLoggedIn(true);
            setTimeout(() => {
                setIsPanelOpen(false);
                if (response.data.user.role === 'admin') {
                    navigate('/dashboard');
                }
                window.dispatchEvent(new Event('loginSuccess'));
            }, 1000);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Đăng nhập thất bại';
            toast.error(message);
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.warning('Mật khẩu xác nhận không khớp');
            return;
        }
        if (formData.password.length < 8) {
            toast.warning('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/api/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
            });
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            setIsLoginForm(true);
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Đăng ký thất bại';
            toast.error(message);
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUser(null);
            toast.success('Đăng xuất thành công!');
            setTimeout(() => {
                setIsPanelOpen(false);
                window.dispatchEvent(new Event('logoutSuccess'));
            }, 1000);
        } catch (err: any) {
            toast.error('Đăng xuất thất bại');
        }
    };

    return (
        <div
            className={`h-[60px] w-full fixed top-0 left-0 z-50 px-4 backdrop-blur-lg ${theme === 'light' ? 'shadow shadow-blue-700/20' : ''
                } ${theme === 'dark' ? 'shadow shadow-white/20' : ''} ${theme === 'system' ? 'shadow shadow-orange-500/20' : ''
                }`}
        >
            <div className="grid grid-cols-12 gap-2 h-full items-center">
                <div className="col-span-2 flex items-center cursor-pointer h-full">
                    <Link to="/" className="flex items-center h-full">
                        <img
                            src="/img/gofilm.png"
                            alt="logo"
                            className="mt-[10px] h-[50px] object-contain"
                        />
                    </Link>
                </div>

                <div ref={refTab} className="relative col-span-5 flex items-center justify-center h-full">
                    <div tabIndex={0} className="group relative flex items-center justify-center cursor-pointer" ref={dropdownRef}>
                        <h2
                            className="mr-8 py-4 text-left font-bold group-hover:text-[#ff4c00]"
                            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                            onMouseEnter={handleHover}
                            onMouseLeave={handleMouseLeave}
                        >
                            THỂ LOẠI
                        </h2>
                        {showGenreDropdown && (
                            <div className="absolute top-full left-0 bg-gray-800 rounded-lg shadow-lg w-64 z-[100] p-2 max-h-96 overflow-y-auto">
                                {genres && genres.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {genres.map((genre) => (
                                            <button
                                                key={genre.id ?? `genre-${genres.indexOf(genre)}`}
                                                className="block w-full text-left px-2 py-1 text-white hover:bg-[#ff4c00] rounded-lg text-sm"
                                                onClick={() => handleGenreSelect(genre)}
                                            >
                                                {genre.genre_name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="p-2 text-gray-400">Không có thể loại</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div tabIndex={0} className="group relative flex items-center justify-center cursor-pointer" ref={countryDropdownRef}>
                        <h2
                            className="mr-8 py-4 text-left font-bold group-hover:text-[#ff4c00]"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            onMouseEnter={handleHover}
                            onMouseLeave={handleMouseLeave}
                        >
                            QUỐC GIA
                        </h2>
                        {showCountryDropdown && (
                            <div className="absolute top-full left-0 bg-gray-800 rounded-lg shadow-lg w-64 z-[100] p-2 max-h-96 overflow-y-auto">
                                {countries && countries.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {countries.map((country) => (
                                            <button
                                                key={country.id ?? `country-${countries.indexOf(country)}`}
                                                className="block w-full text-left px-2 py-1 text-white hover:bg-[#ff4c00] rounded-lg text-sm"
                                                onClick={() => handleCountrySelect(country)}
                                            >
                                                {country.country_name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="p-2 text-gray-400">Không có quốc gia</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div tabIndex={0} className="group relative flex items-center justify-center cursor-pointer" ref={yearDropdownRef}>
                        <h2
                            className="mr-8 py-4 text-left font-bold group-hover:text-[#ff4c00]"
                            onClick={() => setShowYearDropdown(!showYearDropdown)}
                            onMouseEnter={handleHover}
                            onMouseLeave={handleMouseLeave}
                        >
                            NĂM
                        </h2>
                        {showYearDropdown && (
                            <div className="absolute top-full left-0 bg-gray-800 rounded-lg shadow-lg w-48 z-[100] p-2 max-h-96 overflow-y-auto">
                                {years && years.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {years.map((year) => (
                                            <button
                                                key={year.id ?? `year-${years.indexOf(year)}`}
                                                className="block w-full text-left px-2 py-1 text-white hover:bg-[#ff4c00] rounded-lg text-sm"
                                                onClick={() => handleYearSelect(year)}
                                            >
                                                {year.release_year}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="p-2 text-gray-400">Không có năm</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div tabIndex={0} className="group h-full flex items-center justify-center cursor-pointer">
                        <h2
                            className="mr-8 py-4 text-left font-bold group-hover:text-[#ff4c00]"
                            onClick={() => handleFilmTypeSelect('true')}
                            onMouseEnter={handleHover}
                            onMouseLeave={handleMouseLeave}
                        >
                            PHIM LẺ
                        </h2>
                    </div>
                    <div tabIndex={0} className="group h-full flex items-center justify-center cursor-pointer">
                        <h2
                            className="mr-8 py-4 text-left font-bold group-hover:text-[#ff4c00]"
                            onClick={() => handleFilmTypeSelect('false')}
                            onMouseEnter={handleHover}
                            onMouseLeave={handleMouseLeave}
                        >
                            PHIM BỘ
                        </h2>
                    </div>

                    <motion.div
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        animate={hoverPosition}
                        className="absolute bottom-0 left-0 h-[4px] bg-[#ff4c00] rounded-full"
                    />
                </div>
                <div tabIndex={0} className="group col-span-3 h-full flex items-center relative cursor-pointer">
                    <form onSubmit={handleSearch} className="w-full">
                        <input
                            type="search"
                            placeholder="Tìm kiếm"
                            className={`h-[30px] w-full pl-2 border rounded-2xl outline-none group-hover:border-[#ff4c00] ${theme === 'light' ? 'placeholder:text-black border-black' : ''
                                } ${theme === 'dark' ? 'placeholder:text-white border-white' : ''} ${theme === 'system' ? 'system-placeholder:text-white' : ''
                                }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-8 h-8 absolute right-0 top-1/2 transform -translate-y-1/2"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                <div className="col-span-1 flex justify-end focus:outline-none focus:ring-0">
                    <ModeToggle />
                </div>
                <div
                    className="col-span-1 flex items-center justify-end cursor-pointer"
                    onClick={() => setIsPanelOpen(true)}
                >
                    <UserCircleIcon
                        className={`h-10 w-10 border rounded-full ${theme === 'dark' ? 'border-white' : ''
                            } ${theme === 'light' ? 'border-black' : ''}`}
                    />
                </div>
            </div>

            {isPanelOpen && (
                <div
                    className="fixed inset-0 h-screen backdrop-blur-3xl z-40"
                    onClick={() => setIsPanelOpen(false)}
                ></div>
            )}

            <div
                className={`fixed top-0 right-0 h-screen w-[400px] bg-[#2c3e50] bg-opacity-100 backdrop-blur-lg border-l p-6 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {isLoggedIn ? 'Thông Tin Người Dùng' : isLoginForm ? 'Đăng Nhập' : 'Đăng Ký'}
                    </h2>
                    <button
                        className="text-gray-400 hover:text-white cursor-pointer text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
                        onClick={() => setIsPanelOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                {isLoggedIn && user ? (
                    showPaymentForm ? (
                        <form onSubmit={handleBuyPoints} className="space-y-4">
                            <div className="relative">
                                <label htmlFor="points" className="block text-sm text-gray-300 mb-2">
                                    Số điểm muốn mua (1 điểm = 1000 VND)
                                </label>
                                <input
                                    type="number"
                                    name="points"
                                    value={pointsToBuy}
                                    onChange={(e) => setPointsToBuy(e.target.value)}
                                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                                    placeholder="Nhập số điểm"
                                    required
                                    min="1"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold"
                            >
                                Thanh Toán Qua VNPay
                            </button>
                            <button
                                type="button"
                                className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer font-semibold mt-2"
                                onClick={() => setShowPaymentForm(false)}
                            >
                                Quay Lại
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="mb-4">
                                <label className="block text-sm text-gray-300 mb-2">Họ và tên</label>
                                <p className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                                    {user.name}
                                </p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm text-gray-300 mb-2">Điểm</label>
                                <p className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
                                    {user.points}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    console.log('🔁 Đã bấm nút Lịch sử phim');
                                    navigate('/histories');
                                    setIsPanelOpen(false);
                                }}
                                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold mb-2"
                            >
                                Lịch Sử Phim
                            </button>
                            <button
                                onClick={() => {
                                    //console.log('🔁 Đã bấm nút Phim Yêu Thích');
                                    navigate('/favorites');
                                    setIsPanelOpen(false);
                                }}
                                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold mb-2"
                            >
                                Phim Yêu Thích
                            </button>
                            <button
                                onClick={() => navigate('/buy-points')}
                                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold mb-2"
                            >
                                Mua Điểm
                            </button>
                            <button onClick={() => navigate('/payment-history')}
                                className='w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold mb-2'>
                                Lịch sử thanh toán
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold"
                            >
                                Đăng Xuất
                            </button>
                        </div>
                    )
                ) : (
                    <form onSubmit={isLoginForm ? handleLogin : handleRegister} className="space-y-4">
                        {!isLoginForm && (
                            <div className="relative">
                                <label htmlFor="name" className="block text-sm text-gray-300 mb-2">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                                    placeholder="Nhập họ tên"
                                    required
                                />
                            </div>
                        )}
                        <div className="relative">
                            <label htmlFor="email" className="block text-sm text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                                placeholder="Nhập email"
                                required
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm text-gray-300 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                                placeholder="Nhập mật khẩu"
                                required
                            />
                        </div>
                        {!isLoginForm && (
                            <div className="relative">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm text-gray-300 mb-2"
                                >
                                    Nhập lại mật khẩu
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold mt-6"
                        >
                            {isLoginForm ? 'Đăng Nhập' : 'Đăng Ký'}
                        </button>
                    </form>
                )}

                {!isLoggedIn && (
                    <div className="mt-6 text-center">
                        <div className="border-t border-gray-700 pt-4">
                            <p className="text-gray-300">
                                {isLoginForm ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                                <button
                                    className="text-[#ff4c00] ml-2 hover:underline cursor-pointer font-semibold hover:text-[#e04300] transition-colors"
                                    onClick={() => {
                                        setIsLoginForm(!isLoginForm);
                                        setFormData({
                                            name: '',
                                            email: '',
                                            password: '',
                                            confirmPassword: '',
                                        });
                                    }}
                                >
                                    {isLoginForm ? 'Đăng ký ngay' : 'Đăng nhập'}
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
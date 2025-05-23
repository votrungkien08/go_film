import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAuthPanel } from '../utils/auth';

const Header = () => {
    const { isPanelOpen, setIsPanelOpen, isLoginForm, setIsLoginForm } = useAuthPanel();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [user, setUser] = useState<{ name: string; points: number; role: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();

    // Đặt lại formData khi panel mở để input luôn trống
    useEffect(() => {
        if (isPanelOpen && !isLoggedIn) {
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        }
    }, [isPanelOpen, isLoggedIn]);

    // Lấy thông tin người dùng khi panel mở và người dùng đã đăng nhập
    useEffect(() => {
        if (isPanelOpen && isLoggedIn) {
            const fetchUser = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:8000/api/user', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data.user);
                } catch (err: any) {
                    window.alert('Không thể tải thông tin người dùng');
                    setUser(null);
                }
            };
            fetchUser();
        }
    }, [isPanelOpen, isLoggedIn]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/login', {
                email: formData.email,
                password: formData.password,
            });
            window.alert('Đăng nhập thành công!');
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setIsLoggedIn(true);
            setTimeout(() => {
                setIsPanelOpen(false);
                if (response.data.user.role === 'admin') {
                    navigate('/admin');
                }
                window.dispatchEvent(new Event('loginSuccess'));
            }, 1000);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Đăng nhập thất bại';
            window.alert(message);
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            window.alert('Mật khẩu xác nhận không khớp');
            return;
        }
        if (formData.password.length < 8) {
            window.alert('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        try {
            const response = await axios.post('http://localhost:8000/api/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
            });
            window.alert('Đăng ký thành công! Vui lòng đăng nhập.');
            setIsLoginForm(true);
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Đăng ký thất bại';
            window.alert(message);
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:8000/api/logout',
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUser(null);
            window.alert('Đăng xuất thành công!');
            setTimeout(() => {
                setIsPanelOpen(false);
                window.dispatchEvent(new Event('logoutSuccess'));
            }, 1000);
        } catch (err: any) {
            window.alert('Đăng xuất thất bại');
        }
    };

    return (
        <div className="bg-[#333333] h-[60px] w-full fixed top-0 left-0 z-50 px-4">
            <div className="grid grid-cols-12 gap-2 h-full items-center">
                <div className="col-span-2 flex items-center cursor-pointer h-full">
                    <Link to="/" className="flex items-center h-full">
                        <img src="/img/gofilm.png" alt="logo" className="mt-[10px] h-[50px] object-contain" />
                    </Link>
                </div>

                <div className="col-span-6 flex items-center justify-start h-full">
                    <div tabIndex={0} className="group flex items-center justify-center cursor-pointer">
                        <h2 className="mr-10 py-4 text-left text-white group-hover:text-[#ff4c00]">THỂ LOẠI</h2>
                    </div>
                    <div tabIndex={0} className="group h-full flex items-center justify-center cursor-pointer">
                        <h2 className="mr-10 py-4 text-left text-white group-hover:text-[#ff4c00]">QUỐC GIA</h2>
                    </div>
                    <div tabIndex={0} className="group h-full flex items-center justify-center cursor-pointer">
                        <h2 className="mr-10 py-4 text-left text-white group-hover:text-[#ff4c00]">NĂM</h2>
                    </div>
                    <div tabIndex={0} className="group h-full flex items-center justify-center cursor-pointer">
                        <h2 className="mr-10 py-4 text-left text-white group-hover:text-[#ff4c00]">PHIM LẺ</h2>
                    </div>
                    <div tabIndex={0} className="group h-full flex items-center justify-center cursor-pointer">
                        <h2 className="mr-10 py-4 text-left text-white group-hover:text-[#ff4c00]">PHIM BỘ</h2>
                    </div>
                </div>
                <div tabIndex={0} className="group col-span-3 h-full flex items-center relative cursor-pointer">
                    <input
                        type="search"
                        placeholder="Tìm Kiếm"
                        className="text-white h-[30px] w-full pl-2 border rounded-2xl outline-none group-hover:border-[#ff4c00]"
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute right-2" />
                </div>
                <div
                    className="col-span-1 flex items-center justify-end cursor-pointer"
                    onClick={() => setIsPanelOpen(true)}
                >
                    <UserCircleIcon className="h-10 w-10 text-white border rounded-3xl border-white" />
                </div>
            </div>

            {/* Slide-in Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-[400px] bg-gray-800 p-6 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {isLoggedIn ? 'Thông Tin Người Dùng' : isLoginForm ? 'Đăng Nhập' : 'Đăng Ký'}
                    </h2>
                    <button
                        onClick={() => setIsPanelOpen(false)}
                        className="text-gray-400 hover:text-white cursor-pointer text-xl"
                    >
                        ✕
                    </button>
                </div>

                {isLoggedIn && user ? (
                    <div className="text-white">
                        <div className="mb-4 relative">
                            <label className="text-sm text-gray-300">Họ và tên</label>
                            <p className="w-full p-2 pl-4 bg-[#3A3A3A] border border-gray-600 rounded text-white">{user.name}</p>
                        </div>
                        <div className="mb-4 relative">
                            <label className="text-sm text-gray-300">Điểm</label>
                            <p className="w-full p-2 pl-4 bg-[#3A3A3A] border border-gray-600 rounded text-white">{user.points}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-[#ff4c00] text-white p-2 rounded hover:bg-[#e04300] transition-colors cursor-pointer"
                        >
                            Đăng Xuất
                        </button>
                    </div>
                ) : (
                    <form onSubmit={isLoginForm ? handleLogin : handleRegister}>
                        {!isLoginForm && (
                            <div className="mb-4 relative">
                                <label htmlFor="name" className="absolute -top-2 left-2 text-sm text-gray-300">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 pl-4 bg-[#3A3A3A] border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00]"
                                    required
                                />
                            </div>
                        )}
                        <div className="mb-4 relative">
                            <label htmlFor="email" className="absolute -top-2 left-2 text-sm text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-2 pl-4 bg-[#3A3A3A] border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00]"
                                required
                            />
                        </div>
                        <div className="mb-4 relative">
                            <label htmlFor="password" className="absolute -top-2 left-2 text-sm text-gray-300">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full p-2 pl-4 bg-[#3A3A3A] border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00]"
                                required
                            />
                        </div>
                        {!isLoginForm && (
                            <div className="mb-4 relative">
                                <label htmlFor="confirmPassword" className="absolute -top-2 left-2 text-sm text-gray-300">
                                    Nhập lại mật khẩu
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full p-2 pl-4 bg-[#3A3A3A] border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#ff4c00]"
                                    required
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-[#ff4c00] text-white p-2 rounded hover:bg-[#e04300] transition-colors cursor-pointer"
                        >
                            {isLoginForm ? 'Đăng Nhập' : 'Đăng Ký'}
                        </button>
                    </form>
                )}

                {!isLoggedIn && (
                    <p className="mt-4 text-center text-gray-300">
                        {isLoginForm ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                        <button
                            className="text-[#ff4c00] ml-1 hover:underline cursor-pointer"
                            onClick={() => {
                                setIsLoginForm(!isLoginForm);
                                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                            }}
                        >
                            {isLoginForm ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Header;
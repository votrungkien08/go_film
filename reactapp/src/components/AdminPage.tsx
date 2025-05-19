import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    PlusCircleIcon,
    CalendarIcon,
    UserIcon,
    CogIcon
} from '@heroicons/react/24/solid';

const AdminPage = () => {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }
                const response = await axios.get('http://localhost:8000/api/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.user.role !== 'admin') {
                    navigate('/');
                    return;
                }
                setUser(response.data.user);
            } catch (err: any) {
                setError('Không thể tải thông tin người dùng');
                navigate('/');
            }
        };
        fetchUser();
    }, [navigate]);

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!user) {
        return <div className="text-white text-center mt-10">Đang tải...</div>;
    }

    const renderDashboard = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Bảng Điều Khiển</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-300">Tổng Số Người Dùng</h3>
                    <p className="text-3xl text-white mt-2">0</p> {/* Giả lập, thay bằng API */}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-300">Tổng Số Phim</h3>
                    <p className="text-3xl text-white mt-2">0</p> {/* Giả lập, thay bằng API */}
                </div>
            </div>
        </div>
    );

    const renderMovies = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Quản Lý Phim</h2>
                <button className="bg-[#ff4c00] text-white px-4 py-2 rounded hover:bg-[#e04300]">
                    Thêm Phim Mới
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-3">Tiêu Đề Phim</th>
                            <th className="p-3">Tên Phim</th>
                            <th className="p-3">Thể Loại</th>
                            <th className="p-3">Năm Phát Hành</th>
                            <th className="p-3">Đạo Diễn</th>
                            <th className="p-3">Diễn Viên</th>
                            <th className="p-3">Nội Dung</th>
                            <th className="p-3">Số Lượt Xem</th>
                            <th className="p-3">Tác Vụ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={9} className="p-3 text-center">Chưa có phim nào</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Quản Lý Người Dùng</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-3">Tên</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={3} className="p-3 text-center">Chưa có người dùng nào</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Cài Đặt</h2>
            <p className="text-gray-300">Chưa có nội dung cài đặt.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar */}
            <div className="w-16 bg-gray-800 flex flex-col items-center py-6 fixed h-full">
                <button
                    onClick={() => setActiveSection('dashboard')}
                    className={`p-3 mb-4 ${activeSection === 'dashboard' ? 'text-[#ff4c00]' : 'text-gray-300'} hover:text-[#ff4c00]`}
                >
                    <PlusCircleIcon className="h-8 w-8" />
                </button>
                <button
                    onClick={() => setActiveSection('movies')}
                    className={`p-3 mb-4 ${activeSection === 'movies' ? 'text-[#ff4c00]' : 'text-gray-300'} hover:text-[#ff4c00]`}
                >
                    <CalendarIcon className="h-8 w-8" />
                </button>
                <button
                    onClick={() => setActiveSection('users')}
                    className={`p-3 mb-4 ${activeSection === 'users' ? 'text-[#ff4c00]' : 'text-gray-300'} hover:text-[#ff4c00]`}
                >
                    <UserIcon className="h-8 w-8" />
                </button>
                <button
                    onClick={() => setActiveSection('settings')}
                    className={`p-3 ${activeSection === 'settings' ? 'text-[#ff4c00]' : 'text-gray-300'} hover:text-[#ff4c00]`}
                >
                    <CogIcon className="h-8 w-8" />
                </button>
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 ml-16">
                {activeSection === 'dashboard' && renderDashboard()}
                {activeSection === 'movies' && renderMovies()}
                {activeSection === 'users' && renderUsers()}
                {activeSection === 'settings' && renderSettings()}
            </div>
        </div>
    );
};

export default AdminPage;
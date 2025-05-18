import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminPage = () => {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/'); // Chuyển hướng nếu chưa đăng nhập
                    return;
                }
                const response = await axios.get('http://localhost:8000/api/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.user.role !== 'admin') {
                    navigate('/'); // Chuyển hướng nếu không phải admin
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

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-white mb-6">Trang Quản Trị</h1>
            <p className="text-lg text-gray-300 mb-4">Chào mừng, {user.name}!</p>
            <p className="text-lg text-gray-300">Đây là trang dành riêng cho admin.</p>
            {/* Bạn có thể thêm các chức năng admin ở đây, ví dụ: quản lý người dùng, phim, ... */}
        </div>
    );
};

export default AdminPage;
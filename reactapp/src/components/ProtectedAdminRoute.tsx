import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedAdminRoute = () => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsAdmin(false);
                    return;
                }
                const response = await axios.get('http://localhost:8000/api/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsAdmin(response.data.user.role === 'admin');
            } catch (err: any) {
                setError('Không thể xác thực');
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, []);

    if (isAdmin === null) {
        return <div className="text-white text-center mt-10">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedAdminRoute;
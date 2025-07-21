import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PointsHistory {
    title: string;
    date: string;
    points: number;
    type: 'deducted' | 'rewarded';
}

const PointsHistory = () => {
    const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPointsHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Vui lòng đăng nhập để xem lịch sử tích/trừ điểm');
                    navigate('/');
                    return;
                }

                const response = await axios.get(`${API_URL}/api/points-history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setPointsHistory(response.data.data);
                setLoading(false);
            } catch (err: any) {
                console.error('Lỗi khi lấy lịch sử tích/trừ điểm:', err.response?.data || err.message);
                toast.error('Không thể tải lịch sử tích/trừ điểm');
                setLoading(false);
            }
        };

        fetchPointsHistory();
    }, [navigate]);

    const handleBack = () => {
        navigate(-1);
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    const getTypeBadge = (type: string) => {
        const typeMap = {
            deducted: {
                text: 'Trừ điểm',
                className: 'bg-red-100 text-red-800 border-red-200',
            },
            rewarded: {
                text: 'Tích điểm',
                className: 'bg-green-100 text-green-800 border-green-200',
            },
        };

        const typeInfo = typeMap[type] || typeMap.deducted;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeInfo.className}`}>
                {typeInfo.text}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={handleBack}
                        className="mr-4 p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">Lịch Sử Tích/Trừ Điểm</h1>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="h-16 bg-gray-700 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : pointsHistory.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <p className="text-gray-400 text-lg">Không có lịch sử tích/trừ điểm.</p>
                    </div>
                ) : (
                    /* Table Container */
                    <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                        {/* Table Wrapper for Responsive */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                {/* Table Header */}
                                <thead className="bg-gradient-to-r from-orange-500 to-red-500">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-2/5">
                                            Tên phim
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-1/4">
                                            Ngày
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-1/6">
                                            Số điểm
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-1/6">
                                            Loại
                                        </th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="divide-y divide-gray-700">
                                    {pointsHistory.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`hover:bg-gray-700 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}
                                        >
                                            {/* Tên phim */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white">{item.title}</div>
                                            </td>

                                            {/* Ngày */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-gray-300">{formatDate(item.date)}</div>
                                            </td>

                                            {/* Số điểm */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className={`text-sm font-semibold ${item.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {item.points > 0 ? `+${item.points}` : item.points}
                                                </div>
                                            </td>

                                            {/* Loại */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {getTypeBadge(item.type)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer */}
                        <div className="bg-gray-750 px-6 py-4 border-t border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                    Tổng cộng {pointsHistory.length} giao dịch điểm
                                </div>
                                <div className="text-sm text-gray-400">
                                    Cập nhật lần cuối: {dayjs().format('DD/MM/YYYY HH:mm')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PointsHistory;
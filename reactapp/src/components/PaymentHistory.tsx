import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Transaction {
    id: number;
    points: number;
    amount: number;
    txn_ref: string;
    status: string;
    created_at: string;
    updated_at: string;
}

const PaymentHistory = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPaymentHistories = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Vui lòng đăng nhập để xem lịch sử thanh toán');
                    navigate('/');
                    return;
                }

                const response = await axios.get(`${API_URL}/api/payment-histories`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setTransactions(response.data.transactions);
                setLoading(false);
            } catch (err: any) {
                console.error('Lỗi khi lấy lịch sử thanh toán:', err.response?.data || err.message);
                toast.error('Không thể tải lịch sử thanh toán');
                setLoading(false);
            }
        };

        fetchPaymentHistories();
    }, [navigate]);

    const handleBack = () => {
        navigate(-1);
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' đ';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            success: {
                text: 'Thành công',
                className: 'bg-green-100 text-green-800 border-green-200'
            },
            pending: {
                text: 'Đang chờ',
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
            },
            failed: {
                text: 'Thất bại',
                className: 'bg-red-100 text-red-800 border-red-200'
            }
        };

        const statusInfo = statusMap[status] || statusMap.failed;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                {statusInfo.text}
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
                    <h1 className="text-3xl font-bold text-white">Lịch Sử Thanh Toán</h1>
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
                ) : transactions.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <p className="text-gray-400 text-lg">Không có giao dịch nào.</p>
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
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-1/5">
                                            Mã giao dịch
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-1/6">
                                            Số điểm
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-white uppercase tracking-wider w-1/5">
                                            Số tiền
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-1/6">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-1/4">
                                            Ngày tạo
                                        </th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody className="divide-y divide-gray-700">
                                    {transactions.map((transaction, index) => (
                                        <tr
                                            key={transaction.id}
                                            className={`hover:bg-gray-700 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'
                                                }`}
                                        >
                                            {/* Mã giao dịch */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white">
                                                    {transaction.txn_ref}
                                                </div>
                                            </td>

                                            {/* Số điểm */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-white font-semibold">
                                                    {transaction.points.toLocaleString('vi-VN')}
                                                </div>
                                            </td>

                                            {/* Số tiền */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm text-white font-semibold">
                                                    {formatCurrency(transaction.amount)}
                                                </div>
                                            </td>

                                            {/* Trạng thái */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {getStatusBadge(transaction.status)}
                                            </td>

                                            {/* Ngày tạo */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-gray-300">
                                                    {formatDate(transaction.created_at)}
                                                </div>
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
                                    Tổng cộng {transactions.length} giao dịch
                                </div>
                                <div className="text-sm text-gray-400">
                                    Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
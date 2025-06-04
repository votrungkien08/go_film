// src/components/ui/BuyPoints.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BuyPoints = () => {
    const navigate = useNavigate();
    const [points, setPoints] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Tự động tính số tiền dựa trên số điểm
    useEffect(() => {
        if (points > 0) {
            setAmount(points * 1000); // 1 điểm = 1000 VND
        } else {
            setAmount(0);
        }
    }, [points]);

    const handleBuyPoints = async () => {
        if (points <= 0) {
            setError('Vui lòng nhập số điểm hợp lệ.');
            toast.warning('Vui lòng nhập số điểm hợp lệ');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Vui lòng đăng nhập để mua điểm');
                navigate('/'); // Chuyển hướng về trang chủ
                setLoading(false);
                return;
            }

            console.log('Sending request to VNPay API...', { points, amount });

            const response = await axios.post(
                `${API_URL}/api/vnpay/create`,
                { points, amount },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('VNPay API response:', response.data);

            if (response.data.url && response.data.url.startsWith('https://sandbox.vnpayment.vn')) {
                console.log('Redirecting to VNPay:', response.data.url);
                setSuccess('Đang chuyển hướng đến trang thanh toán...');
                toast.success('Đang chuyển hướng đến VNPay...');

                // Delay nhỏ để user thấy thông báo
                setTimeout(() => {
                    window.location.href = response.data.url;
                }, 1000);
            } else {
                console.error('Invalid VNPay URL:', response.data.url);
                setError('Không thể tạo giao dịch. URL thanh toán không hợp lệ.');
                toast.error('Không thể tạo giao dịch. Vui lòng thử lại.');
            }
        } catch (err: any) {
            console.error('Error calling VNPay API:', err.response?.data || err.message);

            let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else if (err.response?.status === 500) {
                errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#333333] text-white py-6">
            <div className="container mx-auto px-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-300 hover:text-orange-500 transition-colors duration-300 mb-6"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                </button>

                <h1 className="text-3xl font-bold mb-6 text-orange-500">Mua Điểm Premium</h1>

                <div className="bg-[#444444] rounded-lg p-6 max-w-md mx-auto">
                    {success && (
                        <div className="bg-green-500/20 border border-green-500 rounded p-3 mb-4">
                            <p className="text-green-400 text-center">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 rounded p-3 mb-4">
                            <p className="text-red-400 text-center">{error}</p>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">
                            Số điểm muốn mua (1 điểm = 1,000 VND):
                        </label>
                        <input
                            type="number"
                            value={points || ''}
                            onChange={(e) => setPoints(Number(e.target.value))}
                            className="w-full p-3 bg-[#3A3A3A] text-white border border-gray-600 rounded-md focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            placeholder="Nhập số điểm"
                            min="1"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Tổng tiền (VND):</label>
                        <input
                            type="text"
                            value={amount.toLocaleString('vi-VN')}
                            readOnly
                            className="w-full p-3 bg-[#2A2A2A] text-gray-400 border border-gray-600 rounded-md cursor-not-allowed"
                        />
                    </div>

                    <button
                        onClick={handleBuyPoints}
                        disabled={loading || points <= 0}
                        className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${loading || points <= 0
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg'
                            } text-white`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang xử lý...
                            </div>
                        ) : (
                            'Thanh toán qua VNPay'
                        )}
                    </button>

                    <div className="mt-4 text-center">
                        <p className="text-gray-400 text-sm">
                            💡 Bạn sẽ được chuyển hướng đến trang thanh toán VNPay
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyPoints;
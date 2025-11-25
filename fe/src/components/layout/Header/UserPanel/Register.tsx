import { Link } from 'react-router-dom';
import React, { useState} from 'react';
import { toast } from 'sonner';
import axios from 'axios';
interface RegisterProps {
    isLoginForm:boolean,
    setIsLoginForm:(isLoginForm:boolean) => void
}
export default function Register({
    isLoginForm,
    setIsLoginForm
}:RegisterProps) { 
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            toast.warning('Email không hợp lệ');
            return;
        }
        if (formData.password.length < 8) {
            toast.warning('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!strongPasswordRegex.test(formData.password)) {
            toast.warning('Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.warning('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8000/api/register`, {
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
    return (
        <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
                <label htmlFor="name" className="block text-left text-sm text-gray-300 mb-2">
                    Họ và tên
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                    placeholder="Nhập họ tên"
                    required
                />
            </div>

            <div className="relative">
                <label htmlFor="email" className="block text-left text-sm text-gray-300 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                    placeholder="Nhập email"
                    required
                />
            </div>
            <div className="relative">
                <label htmlFor="password" className="block text-left text-sm text-gray-300 mb-2">
                    Mật khẩu
                </label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                    placeholder="Nhập mật khẩu"
                    required
                />
            </div>
            <div className="relative">
                <label htmlFor="confirmPassword" className="block text-left text-sm text-gray-300 mb-2">
                    Nhập lại mật khẩu
                </label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff4c00] focus:border-transparent transition-all"
                    placeholder="Nhập lại mật khẩu"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold mt-6"
            >
                {isLoginForm ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
            <Link to="/forget-password" className="text-center cursor-pointer hover:underline text-red-600">
                Quên mật khẩu?
            </Link>
        </form>
    )
}
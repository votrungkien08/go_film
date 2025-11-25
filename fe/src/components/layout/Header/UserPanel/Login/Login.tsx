import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
interface LoginProps {
    isLoginForm:boolean,
    setIsPanelOpen: (isOpen: boolean) => void,
}
export default function Login({
    isLoginForm,
    setIsPanelOpen
}:LoginProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:8000/api/login`, {
                email: formData.email,
                password: formData.password,
            });
            toast.success('Đăng nhập thành công!');
            localStorage.setItem('token', response.data.authorisation.token);
            console.log('Login response data:', response.data);
            setTimeout(() => {
                setIsPanelOpen(false);
                if (response.data.role === 'admin') {
                    navigate('/dashboard');
                }
                window.dispatchEvent(new Event('loginSuccess'));
            }, 1000);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Đăng nhập thất bại';
            toast.error(message);
        }
    };
    const handleLoginGoogle = async () => {
    try {
        const response = await axios.get(`http://localhost:8000/api/auth/google/url`);
        const googleURL = response.data.url;

        const popup = window.open(
            googleURL,
            'Google Login',
            'width=500,height=600,top=200,left=200'
        );

        const handleMessage = (event: MessageEvent) => {
        if (event.origin !== "http://localhost:5173") return; 
        if (event.data.token) {
            localStorage.setItem("token", event.data.token);
            toast.success("Đăng nhập Google thành công!");
            popup?.close();
            navigate("/");
            window.dispatchEvent(new Event("loginSuccess"));
            window.removeEventListener("message", handleMessage);
        }
        };

        window.addEventListener("message", handleMessage);
    } catch (err) {
        toast.error("Không thể kết nối với Google");
    }
    };



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData,[e.target.name]:e.target.value})
    }

    return (
        <><form onSubmit={handleLogin} className="space-y-4">


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
                    required />
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
                    required />
            </div>

            <button
                type="submit"
                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold mt-6"
            >
                {isLoginForm ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>



        </form>
            
        <div onClick={handleLoginGoogle} className='flex items-center justify-center rounded-lg p-3 my-4 bg-white cursor-pointer '>
            <div className='w-5 h-5 mr-2'>
                <img className='w-full h-full' src="/img/igoogle.png" alt="" />
            </div>
            <button className='text-black'>Sign in with Google</button>
        </div>
        <Link to="/forget-password" className="text-center cursor-pointer hover:underline text-red-600">
            Quên mật khẩu?
        </Link>
        </>
    )
}
import {  useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuthContext} from '@/context/AuthContext'
import {useAuth} from '@/hooks/useAuth'
export default function UserInfo() {
    const user = useAuth();
    console.log("UserInfo user:", user);
    const navigate = useNavigate();
    const { setIsPanelOpen,setIsLoginForm } = useAuthContext();
    
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:8000/api/logout`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            localStorage.removeItem("token");
            setIsLoginForm(false);
            // setUser(null);
            toast.success("Đăng xuất thành công!");
            setTimeout(() => {
                setIsPanelOpen(false);
                window.dispatchEvent(new Event("logoutSuccess"));
            }, 1000);
        } catch (err: any) {
            toast.error("Đăng xuất thất bại");
        }
    };
    return (
        <div className="">
            <div className="mb-4 relative">
                <label className="block text-sm text-left text-gray-300 mb-2">
                    Họ và tên
                </label>
                <p className="w-full p-3 h-12 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    {user.user?.name}
                </p>
            </div>
            <div className="mb-4 relative">
                <label className="block text-sm text-left text-gray-300 mb-2">
                    Email
                </label>
                <p className="w-full p-3 h-12 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    {user.user?.email}
                </p>
            </div>

            <button
                onClick={() => {
                    navigate("/favorites");
                    setIsPanelOpen(false);
                }}
                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold mb-2"
            >
                Phim Yêu Thích
            </button>

            <button
                onClick={handleLogout}
                className="w-full bg-[#ff4c00] text-white p-3 rounded-lg hover:bg-[#e04300] transition-colors cursor-pointer font-semibold"
            >
                Đăng Xuất
            </button>
        </div>
    )
}
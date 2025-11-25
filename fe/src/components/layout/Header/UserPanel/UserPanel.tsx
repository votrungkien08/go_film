import UserInfo from './UserInfo';
import Login from './Login/Login'
import Register from './Register'
import {useAuth} from '@/hooks/useAuth'
import { useAuthContext} from '@/context/AuthContext'
export default function UserPanel() {
    const {isLogin, user} = useAuth();

    const { isPanelOpen, isLoginForm, setIsPanelOpen, setIsLoginForm } = useAuthContext();
    
    const renderTitle = () => {
        return isLogin ? "Thông Tin Người Dùng" : isLoginForm ? "Đăng Nhập" : "Đăng Ký";
    }

    const renderForm = () => {
        if (isLogin && user) return <UserInfo />
        return isLoginForm ? (
            <Login
                isLoginForm={isLoginForm}
                setIsPanelOpen={setIsPanelOpen}
            />
        ) : (
            <Register
                isLoginForm={isLoginForm}
                setIsLoginForm={setIsLoginForm}
            />
        )
        
    }

    const closePanel = () => {
        if (isPanelOpen) {
            return (
                <div
                    className="fixed inset-0 h-screen backdrop-blur-3xl z-40"
                    onClick={() => setIsPanelOpen(false)}
                ></div>
            )
        }
    }
    // prompt register and login
    const renderTogglePrompt = () => {
        if (!isLogin) {
            return (
                                    <div className="text-center">
                        <div className="border-t border-gray-700 pt-4">
                            <p className="text-gray-300">
                                {isLoginForm
                                    ? "Chưa có tài khoản?"
                                    : "Đã có tài khoản?"}
                                <button
                                    className="text-[#ff4c00] ml-2 hover:underline cursor-pointer font-semibold hover:text-[#e04300] transition-colors"
                                    onClick={() => {
                                        setIsLoginForm(!isLoginForm);
                                    }}
                                >
                                    {isLoginForm ? "Đăng ký ngay" : "Đăng nhập"}
                                </button>
                            </p>
                        </div>
                    </div>
            )
        }
    }

    return (
        <>

            {closePanel()}
            <div
                className={`fixed top-0 right-0 h-screen w-[400px] 
                            bg-gradient-to-br from-gray-900 via-[#2c3e50] to-gray-800 
                            border-l border-gray-700/50 
                            p-6 shadow-2xl  
                            transform transition-transform duration-300 ease-in-out z-50 
                            ${
                                isPanelOpen
                                    ? "translate-x-0"
                                    : "translate-x-full"
                            }`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {renderTitle()}
                    </h2>
                    <button
                        className="text-gray-400 hover:text-white cursor-pointer text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
                        onClick={() => setIsPanelOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                {renderForm()}           
                {renderTogglePrompt()}
            </div>
        </>
    );
}
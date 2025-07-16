import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';
export default function ForgetPasswordResetForm() {
  const navigate = useNavigate();  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const goBack =  () => {
      navigate(-1)
    }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/send-password-reset",
            {email},
            {headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            }}
        )
        if(response.status === 200 ) {
            setIsSuccess(true);
            setIsSubmitting(true)
        } else {
            setError(response.data?.message || "Không thể gửi email.");
        }

    } catch (err) {
        console.error("Lỗi gửi mail:", err);
    if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
    } else {
        setError("Lỗi kết nối đến máy chủ.");
    }
    
    setIsSubmitting(false);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setEmail('');
    }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full opacity-10 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Quên mật khẩu?</h2>
            <p className="text-gray-300 text-sm">
              Đừng lo lắng, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email input */}
            <div className="relative">
              <label htmlFor="email" className="block text-left text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/20"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSuccess}
              className={`cursor-pointer w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent ${
                isSuccess 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-center space-x-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span>Đã gửi thành công!</span>
                  </>
                ) : (
                  <>
                    <span>Gửi yêu cầu</span>
                    <ArrowRight className=" w-5 h-5" />
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Success message */}
          {isSuccess && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="text-green-300 text-sm text-center">
                Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn!
              </p>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-8 text-center">
            <button onClick={() => goBack()} className="text-gray-300 cursor-pointer hover:text-white transition-colors duration-200 text-sm">
              ← Quay lại đăng nhập
            </button>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60 animate-bounce delay-500"></div>
      </div>
    </div>
  );
}
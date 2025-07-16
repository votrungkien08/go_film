import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

export default function ResetPasswordResetForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

      // Kiểm tra bảo mật mật khẩu
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      setIsSubmitting(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Mật khẩu xác nhận không khớp.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/reset-password',
        {
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setIsSuccess(true);
        setPassword('');
        setPasswordConfirmation('');
      } else {
        setError(response.data?.message || 'Không thể đặt lại mật khẩu đã hết thời gian.');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Lỗi kết nối đến máy chủ.');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 relative">
      {/* UI tương tự như bạn đã có */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 space-y-6"
      >
        <h2 className="text-2xl font-bold text-white text-center">Đặt lại mật khẩu</h2>

        {/* Email readonly */}
        <div>
          <label className="text-sm text-left text-gray-300 block mb-2">Email</label>
          <input
            type="email"
            value={email || ''}
            readOnly
            className="w-full pl-4 pr-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-left text-gray-300 block mb-2">Mật khẩu mới</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            required
            className="w-full pl-4 pr-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Confirm password */}
        <div>
          <label className="text-sm text-left text-gray-300 block mb-2">Xác nhận mật khẩu</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            required
            className="w-full pl-4 pr-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
        >
          {isSubmitting ? 'Đang đặt lại...' : 'Xác nhận đặt lại mật khẩu'}
        </button>

        {/* Success or Error */}
        {isSuccess && (
          <p className="text-green-400 text-sm text-center mt-2">
            Mật khẩu đã được thay đổi thành công!
          </p>
        )}
        {error && (
          <p className="text-red-400 text-sm text-center mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}

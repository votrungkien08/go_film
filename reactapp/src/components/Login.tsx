import React, { useState } from 'react';

const LoginForm = ({ onClose }: { onClose: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Xử lý đăng nhập ở đây
    };

    return (
        <form className="p-6" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-white mb-6">Đăng Nhập</h2>
            <input
                type="email"
                placeholder="Email"
                className="w-full mb-4 p-2 rounded"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full mb-4 p-2 rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="bg-[#ff4c00] text-white px-4 py-2 rounded w-full mb-2">
                Đăng Nhập
            </button>
            <button type="button" onClick={onClose} className="w-full text-center text-gray-400 mt-2">
                Đóng
            </button>
        </form>
    );
};

export default LoginForm;
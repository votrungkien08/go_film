import React, { useState, useRef, useEffect } from 'react';

// Định nghĩa component Chatbot
const Chatbot = () => {
    // State lưu trữ danh sách tin nhắn, khởi tạo với một tin nhắn chào hỏi từ bot
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Bạn muốn tìm phim gì?' }
    ]);
    // State lưu trữ nội dung input của người dùng
    const [input, setInput] = useState('');
    // State theo dõi trạng thái tải khi gửi yêu cầu API
    const [loading, setLoading] = useState(false);
    // State kiểm soát việc hiển thị/ẩn giao diện chatbot
    const [open, setOpen] = useState(false);
    // State theo dõi trạng thái ghi âm giọng nói
    const [isRecording, setIsRecording] = useState(false);
    // Tham chiếu đến đối tượng SpeechRecognition
    const recognitionRef = useRef<any>(null);
    // Tham chiếu đến phần tử cuối danh sách tin nhắn để tự động cuộn
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // State lưu trữ thông báo lỗi (nếu có)
    const [error, setError] = useState<string | null>(null);
    // Danh sách gợi ý tìm kiếm cố định
    const [suggestions] = useState([
        'Phim Trung Quốc',
        'Phim Nhật Bản',
        'Phim Việt Nam',
    ]);

    // useEffect để tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); // Cuộn mượt mà
        }
    }, [messages, open]); // Chạy khi messages hoặc trạng thái open thay đổi

    // useEffect để xử lý phím ESC khi đang ghi âm
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isRecording && recognitionRef.current) {
                recognitionRef.current.stop(); // Dừng ghi âm khi nhấn ESC
            }
        };
        window.addEventListener('keydown', handleEsc); // Thêm sự kiện keydown
        return () => window.removeEventListener('keydown', handleEsc); // Cleanup khi component unmount
    }, [isRecording]);

    // Hàm khởi tạo SpeechRecognition cho nhận diện giọng nói
    const initializeSpeechRecognition = () => {
        // Lấy API SpeechRecognition từ trình duyệt
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
            return null;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN'; // Đặt ngôn ngữ là tiếng Việt
        recognition.interimResults = false; // Không trả kết quả tạm thời
        recognition.maxAlternatives = 1; // Chỉ lấy một kết quả tốt nhất

        // Xử lý khi nhận được kết quả từ giọng nói
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript; // Lấy văn bản từ giọng nói
            setInput(transcript); // Cập nhật input
            handleSend({ preventDefault: () => { } }); // Gửi yêu cầu tìm kiếm
        };
        // Xử lý lỗi nhận diện giọng nói
        recognition.onerror = (event: any) => {
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: `Lỗi nhận diện giọng nói: ${event.error}` }
            ]);
            setIsRecording(false); // Dừng ghi âm
        };
        // Khi quá trình ghi âm kết thúc
        recognition.onend = () => {
            setIsRecording(false); // Cập nhật trạng thái ghi âm
        };
        return recognition;
    };

    // Xử lý sự kiện nhấn nút ghi âm
    const handleRecord = () => {
        setError(null); // Xóa lỗi trước đó
        if (!recognitionRef.current) {
            recognitionRef.current = initializeSpeechRecognition(); // Khởi tạo SpeechRecognition
        }
        if (recognitionRef.current) {
            if (isRecording) {
                recognitionRef.current.stop(); // Dừng ghi âm nếu đang ghi
            } else {
                recognitionRef.current.start(); // Bắt đầu ghi âm
                setIsRecording(true);
            }
        } else {
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: 'Trình duyệt không hỗ trợ ghi âm.' }
            ]);
        }
    };

    // Xử lý gửi tin nhắn hoặc yêu cầu tìm kiếm
    const handleSend = async (e: any) => {
        e.preventDefault(); // Ngăn hành vi submit mặc định
        if (!input.trim()) return; // Không xử lý nếu input rỗng
        const userMessage = { sender: 'user', text: input }; // Tạo tin nhắn người dùng
        setMessages((msgs) => [...msgs, userMessage]); // Thêm tin nhắn vào danh sách
        setLoading(true); // Bắt đầu trạng thái tải
        try {
            // Gửi yêu cầu POST đến API chatbot
            const res = await fetch('http://127.0.0.1:8000/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' // Lấy CSRF token
                },
                body: JSON.stringify({ queryText: input }) // Gửi nội dung input
            });
            const data = await res.json(); // Lấy dữ liệu từ API
            let botMessage;
            try {
                const parsedData = JSON.parse(data.fulfillmentText); // Phân tích dữ liệu từ API
                if (parsedData.type === 'film_list') {
                    botMessage = { sender: 'bot', films: parsedData.films }; // Tin nhắn chứa danh sách phim
                } else {
                    botMessage = { sender: 'bot', text: parsedData.message || data.fulfillmentText }; // Tin nhắn văn bản
                }
            } catch {
                botMessage = { sender: 'bot', text: data.fulfillmentText }; // Tin nhắn văn bản mặc định nếu lỗi
            }
            setMessages((msgs) => [...msgs, botMessage]); // Thêm tin nhắn bot vào danh sách
        } catch {
            // Xử lý lỗi khi gọi API
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: 'Có lỗi xảy ra, vui lòng thử lại.' }
            ]);
        }
        setInput(''); // Xóa input sau khi gửi
        setLoading(false); // Kết thúc trạng thái tải
    };

    // Xử lý đóng chatbot
    const handleClose = () => {
        setOpen(false); // Ẩn chatbot
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop(); // Dừng ghi âm nếu đang ghi
        }
    };

    return (
        <>
            {/* Nút mở/đóng chatbot */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    position: 'fixed',
                    bottom: 4,
                    right: 32,
                    zIndex: 1000,
                    background: isRecording ? '#ff4444' : '#4f8cff', // Màu đỏ khi ghi âm, xanh khi không
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    boxShadow: '0 2px 8px #aaa',
                    fontSize: 28,
                    cursor: 'pointer',
                    display: open ? 'none' : 'flex', // Ẩn nút khi chatbot mở
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    animation: isRecording ? 'pulse 1s infinite' : 'none', // Hiệu ứng khi ghi âm
                }}
            >
                {isRecording ? '🎤' : '💬'} {/* Biểu tượng mic hoặc chat */}
            </button>
            {/* Giao diện chatbot khi mở */}
            {open && (
                <div style={{
                    position: 'fixed', bottom: 32, right: 32, zIndex: 1000, maxWidth: 400, width: '90vw', height: 500,
                    border: '1px solid #eee',
                    borderRadius: 12,
                    boxShadow: '0 2px 16px #aaa',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                >
                    {/* Tiêu đề chatbot */}
                    <div style={{ padding: 12, borderBottom: '1px solid #eee', background: '#4f8cff', color: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Chatbot GoFilm</span>
                        <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }} aria-label="Đóng">×</button>
                    </div>
                    {/* Khu vực hiển thị tin nhắn */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: msg.sender === 'user' ? '#4f8cff' : '#f1f1f1', // Màu xanh cho người dùng, xám cho bot
                                        color: msg.sender === 'user' ? '#fff' : '#222',
                                        borderRadius: 16,
                                        padding: '8px 16px',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {msg.films ? (
                                        // Hiển thị danh sách phim nếu có
                                        <div>
                                            <strong style={{ display: 'block', marginBottom: 8, color: '#4f8cff' }}>Danh sách phim gợi ý:</strong>
                                            <ul style={{ paddingLeft: 16, margin: 0 }}>
                                                {msg.films.map((film: any, i: number) => (
                                                    <li key={i} style={{ marginBottom: 16, textAlign: 'left' }}>
                                                        {film.thumb && (
                                                            <img
                                                                src={film.thumb}
                                                                alt={film.title}
                                                                style={{
                                                                    width: '100%',
                                                                    maxHeight: 150,
                                                                    objectFit: 'cover',
                                                                    borderRadius: 8,
                                                                    marginBottom: 8
                                                                }}
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none'; // Ẩn ảnh nếu lỗi
                                                                }}
                                                            />
                                                        )}
                                                        <strong style={{ color: '#4f8cff' }}>{film.title}</strong><br />
                                                        <span style={{ fontSize: 13 }}>{film.description}</span><br />
                                                        <a href={film.link} style={{ color: '#10B981', fontSize: 13 }} target="_blank" rel="noopener noreferrer">Xem chi tiết</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        msg.text // Hiển thị tin nhắn văn bản
                                    )}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} /> {/* Điểm neo để cuộn xuống */}
                        {loading && <div style={{ color: '#888', fontStyle: 'italic' }}>Đang trả lời...</div>}
                        {isRecording && (
                            // Hiển thị trạng thái ghi âm
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ marginRight: 8, color: '#ff4444', fontWeight: 600, fontStyle: 'italic' }}>🎤 Đang ghi âm... (nhấn ESC để dừng)</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', height: 24 }}>
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            style={{
                                                width: 4,
                                                height: 8 + Math.abs((i % 3) - 1) * 8,
                                                margin: '0 2px',
                                                background: '#ff4444',
                                                borderRadius: 2,
                                                animation: `wave 1s ${(i * 0.1)}s infinite ease-in-out`, // Hiệu ứng sóng
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {error && <div style={{ color: '#EF4444', fontWeight: 600 }}>{error}</div>} {/* Hiển thị lỗi nếu có */}
                    </div>
                    {/* Form nhập liệu và nút điều khiển */}
                    <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8 }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Nhập câu hỏi hoặc dùng giọng nói..."
                            style={{ flex: 1, border: 'none', outline: 'none', padding: 8, fontSize: 16, color: '#222', background: '#fff' }}
                            disabled={loading} // Vô hiệu hóa khi đang tải
                            autoFocus // Tự động focus vào input
                        />
                        <button
                            type="button"
                            onClick={handleRecord}
                            disabled={loading}
                            style={{
                                background: isRecording ? '#ff4444' : '#4f8cff', // Màu đỏ khi ghi âm
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '0 16px',
                                marginLeft: 8,
                                fontSize: 16,
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                animation: isRecording ? 'pulse 1s infinite' : 'none',
                            }}
                        >
                            {isRecording ? '⏹ Dừng' : '🎙 Ghi'} {/* Nút ghi âm/dừng */}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !input.trim()} // Vô hiệu hóa nếu đang tải hoặc input rỗng
                            style={{
                                background: '#4f8cff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '0 16px',
                                marginLeft: 8,
                                fontSize: 16,
                                cursor: 'pointer'
                            }}
                        >
                            Gửi
                        </button>
                    </form>
                    {/* Danh sách các gợi ý tìm kiếm */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8 }}>
                        {suggestions.map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setInput(suggestion); // Đặt input là gợi ý
                                    handleSend({ preventDefault: () => { } }); // Gửi yêu cầu
                                }}
                                style={{
                                    background: '#4f8cff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '6px 12px',
                                    cursor: 'pointer'
                                }}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* CSS tùy chỉnh cho hiệu ứng */}
            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 #ff444480; }
                    70% { box-shadow: 0 0 0 10px #ff444400; }
                    100% { box-shadow: 0 0 0 0 #ff444400; }
                }
                @keyframes wave {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(2); }
                }
            `}</style>
        </>
    );
};

export default Chatbot;
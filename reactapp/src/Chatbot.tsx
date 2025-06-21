import React, { useState, useRef, useEffect, use } from 'react';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Bạn muốn tìm phim gì?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [suggestions] = useState([
        'Phim hành động',
        'Phim bộ Hàn Quốc',
        'Phim hoạt hình',
        'Phim Hài hước Việt Nam',
    ]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isRecording && recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isRecording]);

    const initializeSpeechRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
            return null;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend({ preventDefault: () => { } });
        };
        recognition.onerror = (event: any) => {
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: `Lỗi nhận diện giọng nói: ${event.error}` }
            ]);
            setIsRecording(false);
        };
        recognition.onend = () => {
            setIsRecording(false);
        };
        return recognition;
    };

    const handleRecord = () => {
        setError(null);
        if (!recognitionRef.current) {
            recognitionRef.current = initializeSpeechRecognition();
        }
        if (recognitionRef.current) {
            if (isRecording) {
                recognitionRef.current.stop();
            } else {
                recognitionRef.current.start();
                setIsRecording(true);
            }
        } else {
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: 'Trình duyệt không hỗ trợ ghi âm.' }
            ]);
        }
    };

    const handleSend = async (e: any) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage = { sender: 'user', text: input };
        setMessages((msgs) => [...msgs, userMessage]);
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                body: JSON.stringify({ queryText: input })
            });
            const data = await res.json();
            let botMessage;
            try {
                const parsedData = JSON.parse(data.fulfillmentText);
                if (parsedData.type === 'film_list') {
                    botMessage = { sender: 'bot', films: parsedData.films };
                } else {
                    botMessage = { sender: 'bot', text: parsedData.message || data.fulfillmentText };
                }
            } catch {
                botMessage = { sender: 'bot', text: data.fulfillmentText };
            }
            setMessages((msgs) => [...msgs, botMessage]);
        } catch {
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: 'Có lỗi xảy ra, vui lòng thử lại.' }
            ]);
        }
        setInput('');
        setLoading(false);
    };

    const handleClose = () => {
        setOpen(false);
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    zIndex: 1000,
                    background: isRecording ? '#ff4444' : '#4f8cff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    boxShadow: '0 2px 8px #aaa',
                    fontSize: 28,
                    cursor: 'pointer',
                    display: open ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    animation: isRecording ? 'pulse 1s infinite' : 'none',
                }}
                aria-label="Mở chatbot"
            >
                {isRecording ? '🎤' : '💬'}
            </button>
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        zIndex: 1000,
                        maxWidth: 400,
                        width: '90vw',
                        height: 500,
                        border: '1px solid #eee',
                        borderRadius: 12,
                        boxShadow: '0 2px 16px #aaa',
                        background: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ padding: 12, borderBottom: '1px solid #eee', background: '#4f8cff', color: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Chatbot Tìm Phim</span>
                        <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }} aria-label="Đóng">×</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: msg.sender === 'user' ? '#4f8cff' : '#f1f1f1',
                                        color: msg.sender === 'user' ? '#fff' : '#222',
                                        borderRadius: 16,
                                        padding: '8px 16px',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {msg.films ? (
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
                                                                    e.currentTarget.style.display = 'none';
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
                                        msg.text
                                    )}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        {loading && <div style={{ color: '#888', fontStyle: 'italic' }}>Đang trả lời...</div>}
                        {isRecording && (
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
                                                animation: `wave 1s ${(i * 0.1)}s infinite ease-in-out`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {error && <div style={{ color: '#EF4444', fontWeight: 600 }}>{error}</div>}
                    </div>
                    <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8 }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Nhập câu hỏi hoặc dùng giọng nói..."
                            style={{ flex: 1, border: 'none', outline: 'none', padding: 8, fontSize: 16, color: '#222', background: '#fff' }}
                            disabled={loading}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleRecord}
                            disabled={loading}
                            style={{
                                background: isRecording ? '#ff4444' : '#4f8cff',
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
                            {isRecording ? '⏹ Dừng' : '🎙 Ghi'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8 }}>
                        {suggestions.map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setInput(suggestion);
                                    handleSend({ preventDefault: () => { } });
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
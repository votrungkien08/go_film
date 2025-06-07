import React, { useState } from 'react';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Bạn muốn tìm phim gì?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage = { sender: 'user', text: input };
        setMessages((msgs) => [...msgs, userMessage]);
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queryText: input })
            });
            const data = await res.json();
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: data.fulfillmentText }
            ]);
        } catch {
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: 'Có lỗi xảy ra, vui lòng thử lại.' }
            ]);
        }
        setInput('');
        setLoading(false);
    };

    return (
        <>
            {/* Nút nổi để mở/đóng chatbot */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    zIndex: 1000,
                    background: '#4f8cff',
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
                }}
                aria-label="Mở chatbot"
            >
                💬
            </button>
            {/* Hộp chat của chatbot */}
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
                        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }} aria-label="Đóng">×</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: msg.sender === 'user' ? '#4f8cff' : '#f1f1f1',
                                        color: '#222',
                                        borderRadius: 16,
                                        padding: '8px 16px',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {msg.sender === 'bot' && msg.text.startsWith('Danh sách phim gợi ý:') ? (
                                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                                            {msg.text.replace('Danh sách phim gợi ý:\n', '').split('\n').filter(Boolean).map((line, i) => {
                                                const match = line.match(/^- (.*?): (.*) \(Link: (.*)\)$/);
                                                if (match) {
                                                    const [_, title, desc, link] = match;
                                                    return (
                                                        <li key={i} style={{ marginBottom: 8, textAlign: 'left' }}>
                                                            <strong style={{ color: '#4f8cff' }}>{title}</strong><br />
                                                            <span style={{ fontSize: 13 }}>{desc}</span><br />
                                                            <a href={link} style={{ color: '#10B981', fontSize: 13 }} target="_blank" rel="noopener noreferrer">Xem chi tiết</a>
                                                        </li>
                                                    );
                                                }
                                                return <li key={i}>{line}</li>;
                                            })}
                                        </ul>
                                    ) : (
                                        msg.text
                                    )}
                                </span>
                            </div>
                        ))}
                        {loading && <div style={{ color: '#888', fontStyle: 'italic' }}>Đang trả lời...</div>}
                    </div>
                    <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8 }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Nhập câu hỏi..."
                            style={{ flex: 1, border: 'none', outline: 'none', padding: 8, fontSize: 16, color: '#222', background: '#fff' }}
                            disabled={loading}
                            autoFocus
                        />
                        <button type="submit" disabled={loading || !input.trim()} style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', marginLeft: 8, fontSize: 16, cursor: 'pointer' }}>
                            Gửi
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
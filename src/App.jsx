import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const response = await axios.post('/api/chat', {
                messages: [...messages, userMessage]
            });
            setMessages(prev => [...prev, response.data]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                role: 'assistant',
                content: '죄송합니다, 메시지를 처리하는 중 오류가 발생했습니다.'
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>신용카드 추천 챗봇</h1>
            </header>
            <div className="chat-container">
                <div className="message-list">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <p>{msg.content}</p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="message-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                    />
                    <button type="submit">전송</button>
                </form>
            </div>
        </div>
    );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { socket } from '../services/socket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('chatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const maxLength = 50;
    if (input.trim() && input.length <= maxLength) {
      const username = JSON.parse(localStorage.getItem('user')).username;
      socket.emit('chatMessage', { username, text: input });
      setInput('');
    } else if (input.length > maxLength) {
      alert(`Message is too long. Maximum length is ${maxLength} characters.`);
    }
  };

  return (
    <div className="chat-container">
      <h2>Live Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <div className="chat-message-header">
              <FontAwesomeIcon icon={faUser} style={{ color: "#ff5757" }} />
              <span className="chat-username">{msg.username}</span>
            </div>
            <div className="chat-message-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat; 
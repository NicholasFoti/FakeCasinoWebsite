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
    const fetchMessages = async () => {
      const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/chat/messages' : 'http://localhost:3001/api/chat/messages';
      try {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };

    fetchMessages();

    socket.on('chatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [messages]);

  const updateChatDatabase = async (username, text) => {
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://fakecasinowebsite.onrender.com/api/chat/send-message' : 'http://localhost:3001/api/chat/send-message';
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text })
      });

      if (!response.ok) {
        console.error('Failed to save message:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    
    const maxLength = 100;
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      alert('Please login to send a message.');
      return;
    }

    if (input.trim() && input.length <= maxLength) {
      const username = user.username;
      socket.emit('chatMessage', { username, text: input });

      await updateChatDatabase(username, input);

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
              <FontAwesomeIcon icon={faUser} style={{ color: "#ff2538" }} />
              <span className="chat-username">{msg.username}</span>
              <span className="chat-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="chat-message-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-container" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat; 
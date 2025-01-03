import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { socket } from '../services/socket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get('/api/chat/messages');
        if (data) {
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
    try {
      const { data } = await api.post('/api/chat/send-message', {
        username,
        text
      });

      if (!data) {
        console.error('Failed to save message:', data.message);
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
      const timestamp = new Date().toISOString();
      socket.emit('chatMessage', { username, text: input, timestamp });

      try {
        await updateChatDatabase(username, input);
        setInput('');
      } catch (error) {
        console.error('Error saving message:', error);
      }
    } else if (input.length > maxLength) {
      alert(`Message is too long. Maximum length is ${maxLength} characters.`);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
      </div>
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
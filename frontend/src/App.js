import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3030');

function App() {
  const [nick, setNick] = useState('');
  const [tempNick, setTempNick] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  const handleNickSubmit = () => {
    setNick(tempNick);
    socket.emit('newUser', nick);
  };

  const handleMessageSend = () => {
    const message = {
      from: socket.id,
      to: selectedUser.id,
      text: currentMessage,
      timestamp: new Date(),
    };
    socket.emit('sendMessage', message);
    setCurrentMessage('');
  };

  return (
    <div className="App">
      {!nick ? (
        <div>
          <input 
            type="text" 
            placeholder="Ingrese su nick" 
            value={tempNick} 
            onChange={(e) => setTempNick(e.target.value)} 
          />
          <button onClick={handleNickSubmit}>Ingresar</button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="user-list">
            {users.map(user => (
              <div 
                key={user.id} 
                onClick={() => setSelectedUser(user)}
              >
                {user.nick} {messages.some(msg => msg.from === user.id && msg.to === socket.id) ? 'NUEVO MENSAJE' : ''}
              </div>
            ))}
          </div>
          <div className="chat-area">
            {selectedUser && (
              <div>
                <div className="messages">
                  {messages.filter(msg => 
                    (msg.from === socket.id && msg.to === selectedUser.id) ||
                    (msg.to === socket.id && msg.from === selectedUser.id)
                  ).map((msg, index) => (
                    <div key={index} className={msg.from === socket.id ? 'sent' : 'received'}>
                      <span>{msg.text}</span>
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="message-input">
                  <input 
                    type="text" 
                    value={currentMessage} 
                    onChange={(e) => setCurrentMessage(e.target.value)} 
                  />
                  <button onClick={handleMessageSend}>Send</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


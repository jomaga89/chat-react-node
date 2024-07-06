const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const mongoose = require('mongoose');

let users = [];
let messages = [];

mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const messageSchema = new mongoose.Schema({
    from: String,
    to: String,
    text: String,
    timestamp: Date,
  });
  
  const Message = mongoose.model('Message', messageSchema);
  
  io.on('connection', (socket) => {
    console.log('New user connected');
  
    socket.on('newUser', (nick) => {
      users.push({ id: socket.id, nick });
      io.emit('userList', users);
    });
  
    socket.on('sendMessage', async (message) => {
      const newMessage = new Message(message);
      await newMessage.save();
      io.to(message.to).emit('newMessage', message);
      io.to(message.from).emit('newMessage', message);
    });
  
    socket.on('disconnect', () => {
      users = users.filter(user => user.id !== socket.id);
      io.emit('userList', users);
    });
  });

server.listen(3030, () => {
  console.log('server corriendo en puerto 3030');
});

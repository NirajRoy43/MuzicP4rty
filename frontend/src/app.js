const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const io = require('socket.io-client');
const axios = require('axios');

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const server = http.createServer(app);
const socket = io.connect('https://muzicp4rty.onrender.com');

document.getElementById('search-btn').addEventListener('click', async () => {
  const query = document.getElementById('search').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  try {
    const response = await axios.get(`http://localhost:4000/search?q=${query}`);
    response.data.forEach(item => {
      const result = document.createElement('div');
      result.textContent = item.snippet.title;
      result.addEventListener('click', () => {
        socket.emit('play', { song: item.id.videoId, timestamp: Date.now() });
      });
      resultsDiv.appendChild(result);
    });
  } catch (err) {
    console.error(err);
  }
});

const loadSuggestions = async () => {
  const suggestionsDiv = document.getElementById('suggestions');
  suggestionsDiv.innerHTML = '';
  try {
    const response = await axios.get(`http://localhost:4000/suggestions`);
    response.data.forEach(item => {
      const suggestion = document.createElement('div');
      suggestion.textContent = item.snippet.title;
      suggestion.addEventListener('click', () => {
        socket.emit('play', { song: item.id.videoId, timestamp: Date.now() });
      });
      suggestionsDiv.appendChild(suggestion);
    });
  } catch (err) {
    console.error(err);
  }
};

document.getElementById('send-chat').addEventListener('click', () => {
  const message = document.getElementById('chat-input').value;
  socket.emit('chatMessage', message);
  document.getElementById('chat-input').value = '';
});

socket.on('play', (data) => {
  console.log('Play song:', data);
  // Logic to play the song at data.song from data.timestamp
});

socket.on('pause', () => {
  console.log('Pause song');
  // Logic to pause the song
});

socket.on('chatMessage', (message) => {
  const messagesDiv = document.getElementById('messages');
  const newMessage = document.createElement('div');
  newMessage.textContent = message;
  messagesDiv.appendChild(newMessage);
});

loadSuggestions();

server.listen(3000, () => console.log('Frontend running on port 3000'));

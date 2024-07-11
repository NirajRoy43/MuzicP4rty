require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use('/auth', authRoutes);

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

app.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&key=${YOUTUBE_API_KEY}`
    );
    res.json(response.data.items);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/suggestions', async (req, res) => {
  // This is a placeholder. You can enhance this endpoint to suggest songs based on user history or preferences.
  const suggestions = ["lofi", "classical", "pop"].map(q => axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&key=${YOUTUBE_API_KEY}`
  ));
  try {
    const results = await Promise.all(suggestions);
    res.json(results.map(result => result.data.items).flat());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

let songState = {
  song: null,
  timestamp: 0,
  playing: false,
};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('play', (data) => {
    songState = { ...data, playing: true };
    io.emit('play', songState);
  });

  socket.on('pause', () => {
    songState.playing = false;
    io.emit('pause');
  });

  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Server running on port 4000'));

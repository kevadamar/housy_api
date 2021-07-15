require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: 'http://localhost:3000' },
});
require('./src/socket').socketIo(io);

const router = require('./src/router');
const cors = require('cors');

const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/', router);

http.listen(port, () => console.log(`Your server running on port ${port}`));

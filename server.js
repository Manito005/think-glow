'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    store: 'THINK GLOW',
    message: 'Servidor online'
  });
});

app.use('/api/auth', require('./server/routes/auth'));

app.use(express.static(path.join(__dirname, 'public')));

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`THINK GLOW disponível em http://127.0.0.1:${PORT}`);
});

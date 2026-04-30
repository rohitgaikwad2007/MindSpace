'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express   = require('express');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const apiRouter = require('./routes/api');

const app  = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Rate-limit all API routes: 200 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});
app.use('/api', apiLimiter);

// Serve static frontend files (index.html, styles.css, script.js)
app.use(express.static(path.join(__dirname, '..')));

// All REST API routes under /api
app.use('/api', apiRouter);

// Fallback: return index.html for any unmatched path
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MindSpace server running at http://localhost:${PORT}`);
});

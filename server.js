// Simple Express.js server for React Router SPA
// Usage: node server.js

const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Middleware
app.use(compression()); // Enable gzip compression

// Serve static files from dist
app.use(express.static(DIST_DIR, {
  maxAge: '1y', // Cache static assets for 1 year
  etag: false,
  setHeaders: (res, path) => {
    // Don't cache HTML files
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, must-revalidate, max-age=0');
    }
  }
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

// SPA fallback: serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${DIST_DIR}`);
});

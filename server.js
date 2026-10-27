import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app = express();
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(compression());
app.use('/assets', express.static(path.join(dist, 'assets'), { maxAge: '1y', immutable: true }));
app.use(express.static(dist, { maxAge: 0, dotfiles: 'deny' }));
app.get('/{*path}', (req, res) => {
  if (path.extname(req.path)) return res.sendStatus(404);
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(dist, 'index.html'));
});
app.listen(process.env.PORT || 3000, '0.0.0.0');

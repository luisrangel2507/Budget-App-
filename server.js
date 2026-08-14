// Minimal static file server for Railway (or any Node host).
// Serves index.html and falls back to it for unknown paths, since this
// is a single-page app. No dependencies required.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const requestedPath = decodeURIComponent(req.url.split('?')[0]);
  const resolved = path.normalize(path.join(PUBLIC_DIR, requestedPath === '/' ? 'index.html' : requestedPath));

  // Prevent directory traversal outside PUBLIC_DIR
  const safePath = resolved.startsWith(PUBLIC_DIR) ? resolved : path.join(PUBLIC_DIR, 'index.html');

  fs.readFile(safePath, (err, data) => {
    if (err) {
      // Single-page app: fall back to index.html for any unmatched route
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, indexData) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexData);
      });
      return;
    }
    const ext = path.extname(safePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Budget Agent server running on port ${PORT}`);
});

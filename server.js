/**
 * Lightweight Zero-Dependency Local Static Server for PixelCraft Studio
 * Powered by Node.js built-in http & fs modules.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Normalize URL and prevent directory traversal
  let safePath = path.normalize(decodeURI(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.warn('[PixelCraft Stream Warning]:', streamErr.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    });
    req.on('error', () => {});
    res.on('error', () => {});
    stream.pipe(res);
  });
});

server.on('error', (err) => {
  console.error('[PixelCraft Server Error]:', err);
});

process.on('uncaughtException', (err) => {
  console.warn('[PixelCraft Uncaught Exception Ignored]:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[PixelCraft Unhandled Rejection Ignored]:', reason);
});

process.on('exit', (code) => {
  try {
    fs.appendFileSync(path.join(__dirname, 'server_exit.log'), `[${new Date().toISOString()}] Exit code: ${code}\n`);
  } catch (e) {}
});

process.on('SIGINT', () => {
  fs.appendFileSync(path.join(__dirname, 'server_exit.log'), `[${new Date().toISOString()}] Received SIGINT\n`);
});

process.on('SIGTERM', () => {
  fs.appendFileSync(path.join(__dirname, 'server_exit.log'), `[${new Date().toISOString()}] Received SIGTERM\n`);
});

process.on('SIGHUP', () => {
  fs.appendFileSync(path.join(__dirname, 'server_exit.log'), `[${new Date().toISOString()}] Received SIGHUP\n`);
});

// Prevent stdin close from terminating process on Windows
if (process.stdin.isTTY) {
  process.stdin.resume();
}

// Keep process active indefinitely
setInterval(() => {}, 1000 * 60 * 60);

server.listen(PORT, () => {
  console.log(`\n🚀 PixelCraft Studio server is running at: http://localhost:${PORT}\n`);
});

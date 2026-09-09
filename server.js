const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

// In-Memory Active Rooms Registry (code -> metadata)
const activeRooms = new Map();

function cleanStaleRooms() {
  const now = Date.now();
  for (const [code, r] of activeRooms.entries()) {
    if (now - r.lastHeartbeat > 45000) {
      activeRooms.delete(code);
    }
  }
}
setInterval(cleanStaleRooms, 15000);

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let cleanUrl = req.url.split('?')[0];

  // REST API: Active Rooms
  if (cleanUrl === '/api/rooms' || cleanUrl.startsWith('/api/rooms/')) {
    cleanStaleRooms();

    if (req.method === 'GET') {
      const list = [];
      activeRooms.forEach(r => list.push(r));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, rooms: list }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          const code = (data.roomCode || '').trim().toUpperCase();
          if (!code) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Missing roomCode' }));
            return;
          }

          if (data.action === 'delete') {
            activeRooms.delete(code);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, deleted: code }));
            return;
          }

          const existing = activeRooms.get(code);
          const roomObj = {
            roomCode: code,
            createdAt: existing ? existing.createdAt : Date.now(),
            lastHeartbeat: Date.now(),
            playersCount: data.playersCount !== undefined ? data.playersCount : (existing ? existing.playersCount : 0),
            stage: data.stage || (existing ? existing.stage : 'lobby')
          };
          activeRooms.set(code, roomObj);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, room: roomObj }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (req.method === 'DELETE') {
      const parts = cleanUrl.split('/');
      const code = parts[parts.length - 1].toUpperCase();
      activeRooms.delete(code);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, deleted: code }));
      return;
    }
  }

  // Static File Serving
  let filePath = path.join(__dirname, cleanUrl);

  if (cleanUrl === '/' || cleanUrl === '') {
    filePath = path.join(__dirname, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check public folder
      const publicPath = path.join(__dirname, 'public', cleanUrl);
      if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
        filePath = publicPath;
      } else {
        // SPA Fallback to index.html
        filePath = path.join(__dirname, 'index.html');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = server;

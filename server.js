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
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

// In-Memory Active Rooms Registry (code -> metadata)
const activeRooms = new Map();
// In-Memory SSE Subscribers (roomCode -> Set of HTTP response objects)
const roomSubscribers = new Map();
// In-Memory Message Buffer (roomCode -> Array of last 50 messages)
const roomMessageBuffers = new Map();

function cleanStaleRooms() {
  const now = Date.now();
  for (const [code, r] of activeRooms.entries()) {
    if (now - r.lastHeartbeat > 75000) {
      activeRooms.delete(code);
      roomMessageBuffers.delete(code);
      const subs = roomSubscribers.get(code);
      if (subs) {
        subs.forEach(res => {
          try { res.end(); } catch(e) {}
        });
        roomSubscribers.delete(code);
      }
    }
  }
}
setInterval(cleanStaleRooms, 15000);

// SSE Keep-Alive Ping every 12 seconds to prevent NAT/proxy timeout
setInterval(() => {
  roomSubscribers.forEach((subs) => {
    subs.forEach(res => {
      try { res.write(': ping\n\n'); } catch(e) {}
    });
  });
}, 12000);

const server = http.createServer((req, res) => {
  // Universal CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let cleanUrl = req.url.split('?')[0];

  // -------------------------------------------------------------
  // 1. SSE REAL-TIME STREAM: GET /api/rooms/:code/stream
  // -------------------------------------------------------------
  const streamMatch = cleanUrl.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/stream$/i);
  if (streamMatch && req.method === 'GET') {
    const code = streamMatch[1].toUpperCase();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write(': connected\n\n');

    if (!roomSubscribers.has(code)) {
      roomSubscribers.set(code, new Set());
    }
    const subs = roomSubscribers.get(code);
    subs.add(res);

    // Keep active room timestamp fresh
    if (activeRooms.has(code)) {
      activeRooms.get(code).lastHeartbeat = Date.now();
    }

    req.on('close', () => {
      subs.delete(res);
      if (subs.size === 0) {
        roomSubscribers.delete(code);
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // 2. REAL-TIME BROADCAST API: POST /api/rooms/:code/broadcast
  // -------------------------------------------------------------
  const broadcastMatch = cleanUrl.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/broadcast$/i);
  if (broadcastMatch && req.method === 'POST') {
    const code = broadcastMatch[1].toUpperCase();
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const msg = JSON.parse(body || '{}');
        msg._serverTime = Date.now();
        msg._room = code;

        // Buffer recent messages
        if (!roomMessageBuffers.has(code)) {
          roomMessageBuffers.set(code, []);
        }
        const buf = roomMessageBuffers.get(code);
        buf.push(msg);
        if (buf.length > 50) buf.shift();

        // Update room heartbeat & stage
        if (activeRooms.has(code)) {
          const r = activeRooms.get(code);
          r.lastHeartbeat = Date.now();
          if (msg.type === 'set_stage' && msg.stage) r.stage = msg.stage;
        }

        // Instant dispatch to all SSE subscribers in this room
        const subs = roomSubscribers.get(code);
        let dispatchedCount = 0;
        if (subs && subs.size > 0) {
          const payload = `data: ${JSON.stringify(msg)}\n\n`;
          subs.forEach(clientRes => {
            try {
              clientRes.write(payload);
              dispatchedCount++;
            } catch (err) {
              subs.delete(clientRes);
            }
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, dispatchedTo: dispatchedCount }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // 3. GAME STATE SYNC API: GET & POST /api/rooms/:code/state
  // -------------------------------------------------------------
  const stateMatch = cleanUrl.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/state$/i);
  if (stateMatch) {
    const code = stateMatch[1].toUpperCase();
    let room = activeRooms.get(code);
    if (!room) {
      room = { roomCode: code, createdAt: Date.now(), lastHeartbeat: Date.now(), playersCount: 0, stage: 'lobby', state: null };
      activeRooms.set(code, room);
    }

    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, state: room.state }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body || '{}');
          room.state = data.state || data;
          room.lastHeartbeat = Date.now();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  // -------------------------------------------------------------
  // 4. ACTIVE ROOMS REST API: GET, POST, DELETE /api/rooms
  // -------------------------------------------------------------
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
            roomMessageBuffers.delete(code);
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
            stage: data.stage || (existing ? existing.stage : 'lobby'),
            state: existing ? existing.state : null
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
      roomMessageBuffers.delete(code);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, deleted: code }));
      return;
    }
  }

  // -------------------------------------------------------------
  // 5. STATIC FILE SERVING WITH SPA FALLBACK
  // -------------------------------------------------------------
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

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

// Universal safe body parser with 1MB limit (Fixes BUG-04, BUG-12, BUG-15)
function parseBody(req, cb) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') return cb(null, req.body);
    try {
      return cb(null, JSON.parse(req.body || '{}'));
    } catch (err) {
      return cb(err, null);
    }
  }
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 1e6) { // 1MB payload limit
      req.destroy();
      return cb(new Error('Payload too large'), null);
    }
  });
  req.on('end', () => {
    try {
      cb(null, JSON.parse(body || '{}'));
    } catch (err) {
      cb(err, null);
    }
  });
  req.on('error', err => cb(err, null));
}

// Clean stale rooms only if NO active subscribers exist (Fixes BUG-09)
function cleanStaleRooms() {
  const now = Date.now();
  for (const [code, r] of activeRooms.entries()) {
    const subs = roomSubscribers.get(code);
    const hasActiveSubs = subs && subs.size > 0;
    if (now - r.lastHeartbeat > 75000 && !hasActiveSubs) {
      activeRooms.delete(code);
      roomMessageBuffers.delete(code);
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

function requestHandler(req, res) {
  // Universal CORS Headers with preflight caching (Fixes BUG-16)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization, Cache-Control, Last-Event-ID, X-Admin-PIN');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let cleanUrl = (req.url || '/').split('?')[0];
  try {
    const urlObj = new URL(req.url || '/', 'http://localhost');
    const routeParam = urlObj.searchParams.get('__route');
    if (routeParam) {
      cleanUrl = '/api/' + routeParam;
    } else if (req.headers && req.headers['x-matched-path'] && req.headers['x-matched-path'].startsWith('/api')) {
      cleanUrl = req.headers['x-matched-path'];
    } else if (req.headers && req.headers['x-vercel-matched-path'] && req.headers['x-vercel-matched-path'].startsWith('/api')) {
      cleanUrl = req.headers['x-vercel-matched-path'];
    }
  } catch(e) {}

  // -------------------------------------------------------------
  // 1. SSE REAL-TIME STREAM: GET /api/rooms/:code/stream (Fixes BUG-08, BUG-11, BUG-20)
  // -------------------------------------------------------------
  const streamMatch = cleanUrl.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/stream$/i);
  if (streamMatch) {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
      return;
    }

    const code = streamMatch[1].toUpperCase();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write('retry: 3000\n\n');
    res.write(': connected\n\n');

    if (!roomSubscribers.has(code)) {
      roomSubscribers.set(code, new Set());
    }
    const subs = roomSubscribers.get(code);
    subs.add(res);

    // Replay buffered messages to reconnecting client (Fixes BUG-11)
    const buf = roomMessageBuffers.get(code);
    if (buf && buf.length > 0) {
      buf.forEach(m => {
        try { res.write(`data: ${JSON.stringify(m)}\n\n`); } catch(e) {}
      });
    }

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
  // 2. REAL-TIME BROADCAST API: POST /api/rooms/:code/broadcast (Fixes BUG-08)
  // -------------------------------------------------------------
  const broadcastMatch = cleanUrl.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/broadcast$/i);
  if (broadcastMatch) {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
      return;
    }

    const code = broadcastMatch[1].toUpperCase();
    parseBody(req, (err, msg) => {
      if (err || !msg) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
        return;
      }
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
    });
    return;
  }

  // -------------------------------------------------------------
  // 3. GAME STATE SYNC API: GET & POST /api/rooms/:code/state
  // -------------------------------------------------------------
  const stateMatch = cleanUrl.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)\/state$/i);
  if (stateMatch) {
    const code = stateMatch[1].toUpperCase();

    if (req.method === 'GET') {
      const room = activeRooms.get(code);
      if (!room) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Room not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, state: room.state }));
      return;
    }

    if (req.method === 'POST') {
      parseBody(req, (err, data) => {
        if (err || !data) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
          return;
        }
        let room = activeRooms.get(code);
        if (!room) {
          room = { roomCode: code, createdAt: Date.now(), lastHeartbeat: Date.now(), playersCount: 0, stage: 'lobby', state: null };
          activeRooms.set(code, room);
        }
        room.state = data.state || data;
        room.lastHeartbeat = Date.now();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  // -------------------------------------------------------------
  // 4. ACTIVE ROOMS REST API: GET, POST, DELETE /api/rooms (Fixes BUG-10)
  // -------------------------------------------------------------
  if (cleanUrl === '/api/rooms' || cleanUrl === '/api/rooms/') {
    cleanStaleRooms();

    if (req.method === 'GET') {
      const list = [];
      activeRooms.forEach(r => list.push(r));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, rooms: list }));
      return;
    }

    if (req.method === 'POST') {
      parseBody(req, (err, data) => {
        if (err || !data) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
          return;
        }
        const code = (data.roomCode || '').trim().toUpperCase();
        if (!code) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing roomCode' }));
          return;
        }

        if (data.action === 'delete') {
          activeRooms.delete(code);
          roomMessageBuffers.delete(code);
          const subs = roomSubscribers.get(code);
          if (subs) {
            subs.forEach(clientRes => {
              try { clientRes.end('event: room_closed\ndata: {"closed":true}\n\n'); } catch(e) {}
            });
            roomSubscribers.delete(code);
          }
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
      });
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  // DELETE /api/rooms/:code
  const deleteRoomMatch = cleanUrl.match(/^\/api\/rooms\/([A-Za-z0-9_-]+)$/i);
  if (deleteRoomMatch && req.method === 'DELETE') {
    const code = deleteRoomMatch[1].toUpperCase();
    activeRooms.delete(code);
    roomMessageBuffers.delete(code);
    const subs = roomSubscribers.get(code);
    if (subs) {
      subs.forEach(clientRes => {
        try { clientRes.end('event: room_closed\ndata: {"closed":true}\n\n'); } catch(e) {}
      });
      roomSubscribers.delete(code);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deleted: code }));
    return;
  }

  // If request is under /api/ but didn't match any route, return 404 JSON instead of HTML
  if (cleanUrl.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'API route not found' }));
    return;
  }

  // -------------------------------------------------------------
  // 5. STATIC FILE SERVING WITH PATH TRAVERSAL JAIL (Fixes BUG-06)
  // -------------------------------------------------------------
  // Normalize path and ensure it stays inside __dirname
  const safePath = path.normalize(path.join(__dirname, cleanUrl));
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  let filePath = safePath;

  if (cleanUrl === '/' || cleanUrl === '') {
    filePath = path.join(__dirname, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check public folder
      const publicPath = path.normalize(path.join(__dirname, 'public', cleanUrl));
      if (publicPath.startsWith(__dirname) && fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
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
        res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
        res.end(content);
      }
    });
  });
}

const server = http.createServer(requestHandler);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

server.handler = requestHandler;
module.exports = server;
module.exports.handler = requestHandler;

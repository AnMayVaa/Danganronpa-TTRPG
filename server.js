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

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];
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

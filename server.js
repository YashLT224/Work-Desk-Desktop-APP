// WorkDesk local server — zero dependencies, just Node.js.
// Run:  node server.js     then open  http://localhost:4321
// Stores all data in db.json in this same folder.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4321;
const DIR = __dirname;
const DB = path.join(DIR, 'db.json');
const HTML = path.join(DIR, 'WorkDesk.html');

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // --- read db.json ---
  if (req.url === '/api/db' && req.method === 'GET') {
    fs.readFile(DB, 'utf8', (err, data) => {
      if (err) return send(res, 200, '{}');          // no db yet → empty, client uses defaults
      send(res, 200, data);
    });
    return;
  }
  // --- write db.json ---
  if (req.url === '/api/db' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 8e6) req.destroy(); });
    req.on('end', () => {
      try {
        JSON.parse(body);                             // validate
        fs.writeFile(DB, body, 'utf8', err => {
          if (err) return send(res, 500, '{"error":"write failed"}');
          send(res, 200, '{"ok":true}');
        });
      } catch (e) { send(res, 400, '{"error":"invalid json"}'); }
    });
    return;
  }
  // --- serve the app ---
  if (req.url === '/' || req.url === '/index.html' || req.url === '/WorkDesk.html') {
    fs.readFile(HTML, 'utf8', (err, data) => {
      if (err) return send(res, 404, 'WorkDesk.html not found', 'text/plain');
      send(res, 200, data, 'text/html; charset=utf-8');
    });
    return;
  }
  send(res, 404, 'Not found', 'text/plain');
});

server.listen(PORT, () => {
  console.log('\n  WorkDesk is running →  http://localhost:' + PORT + '\n');
  console.log('  Data file: ' + DB);
  console.log('  Stop the server with Ctrl+C\n');
});

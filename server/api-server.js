const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const PROJECTS_FILE = path.join(__dirname, '..', 'src', 'assets', 'kiet-projects.json');

function sendJson(res, status, obj) {
  const str = JSON.stringify(obj, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(str);
}

function handleOptions(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end();
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return handleOptions(req, res);

  if (req.method === 'POST' && req.url === '/api/projects') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let incoming;
      try {
        incoming = JSON.parse(body);
      } catch (err) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }

      fs.readFile(PROJECTS_FILE, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
          return sendJson(res, 500, { error: err.message });
        }

        let projects;
        try {
          projects = err && err.code === 'ENOENT' ? [] : JSON.parse(data || '[]');
          if (!Array.isArray(projects)) projects = [];
        } catch (e) {
          projects = [];
        }

        const maxId = projects.reduce((m, p) => {
          const n = Number(p && p.id) || 0;
          return n > m ? n : m;
        }, 0);

        if (incoming.id == null) {
          incoming.id = maxId + 1;
        } else {
          incoming.id = Number(incoming.id) || (maxId + 1);
        }

        // reformat with consistent field order
        const normalized = {
          id: incoming.id,
          projectTitle: incoming.projectTitle || 'Untitled',
          type: incoming.type || 'Other',
          contact: incoming.contact || 'contact@example.com',
          status: incoming.status || 'open',
          startDate: incoming.startDate || null,
          deadline: incoming.deadline || null,
          studentGroup: incoming.studentGroup || 'Freshers',
          rating: incoming.rating !== undefined ? incoming.rating : 1
        };

        projects.push(normalized);

        fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2) + '\n', 'utf8', (we) => {
          if (we) return sendJson(res, 500, { error: we.message });
          return sendJson(res, 200, { success: true, projects });
        });
      });
    });

    return;
  }

  if (req.method === 'GET' && req.url === '/api/projects') {
    fs.readFile(PROJECTS_FILE, 'utf8', (err, data) => {
      if (err) return sendJson(res, 500, { error: err.message });
      let projects;
      try { projects = JSON.parse(data || '[]'); } catch (e) { projects = []; }
      return sendJson(res, 200, { projects });
    });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log(`Projects file: ${PROJECTS_FILE}`);
});


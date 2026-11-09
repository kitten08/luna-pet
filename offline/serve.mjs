import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = import.meta.dirname;
const types = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
};
const port = Number(process.env.PORT || 4173);

http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const requestPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = path.resolve(root, '.' + decodeURIComponent(requestPath));
    if (!file.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    const data = await fs.readFile(file);
    response.writeHead(200, {
      'content-type': types[path.extname(file)] || 'application/octet-stream',
      'content-length': data.length,
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Luna 离线网页：http://127.0.0.1:${port}`);
});

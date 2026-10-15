// Minimal static server for dist/ (npm run preview), mirroring GitHub Pages paths.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const port = Number(process.env.PORT || 4321);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.ico': 'image/x-icon' };
const host = process.env.HOST || '127.0.0.1';
http.createServer((req, res) => {
  let p;
  try {
    p = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname));
  } catch {
    res.writeHead(400).end();
    return;
  }
  // Serve only files inside root (a prefix check alone would allow /../dist2/).
  const rel = path.relative(root, p);
  if (rel.startsWith('..') || path.isAbsolute(rel)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) {
    res.writeHead(404, { 'content-type': types['.html'] });
    const nf = path.join(root, '404.html');
    res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(port, host, () => console.log(`Serving ${root} at http://${host}:${port}/`));

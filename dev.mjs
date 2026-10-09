// node dev.mjs — builds, serves dist/ on http://localhost:4600 and rebuilds + reloads on
// any change in content/, src/ or public/. Each rebuild runs in a fresh process so
// template edits are picked up without restarting.

import { createServer } from 'node:http';
import { watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, normalize, sep } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const PORT = Number(process.env.PORT ?? 4600);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
const RELOAD = `<script>new EventSource('/__reload').onmessage=()=>location.reload()</script>`;
const clients = new Set();

const rebuild = () =>
  new Promise((resolve) => {
    execFile(process.execPath, [join(root, 'build.mjs'), '--quiet', '--keep'], (err, stdout, stderr) => {
      process.stdout.write(err ? stderr || err.message : stdout);
      if (!err) for (const client of clients) client.write('data: reload\n\n');
      resolve();
    });
  });

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/__reload') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  const file = normalize(join(dist, decodeURIComponent(pathname.endsWith('/') ? `${pathname}index.html` : pathname)));
  if (!file.startsWith(dist + sep)) return res.writeHead(403).end();
  try {
    let body = await readFile(file);
    if (file.endsWith('.html')) body = body.toString().replace('</body>', `${RELOAD}</body>`);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, () => console.log(`Dev server: http://localhost:${PORT}`));

let timer;
for (const dir of ['content', 'src', 'public']) {
  watch(join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 100);
  });
}
await rebuild();

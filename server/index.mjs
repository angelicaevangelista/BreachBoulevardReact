import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './config.mjs';
import { createApiHandler } from './api.mjs';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

export function createAppServer({
  staticDirectory = path.join(projectRoot, 'dist'),
  middleware,
  basePath = '',
  ...apiOptions
} = {}) {
  const handleApi = createApiHandler({ ...apiOptions, basePath });
  const staticRoot = path.resolve(staticDirectory);
  return http.createServer(async (req, res) => {
    try {
      if (await handleApi(req, res)) return;
      if (middleware) {
        middleware(req, res, () => {
          res.writeHead(404);
          res.end('Not found');
        });
        return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405);
        res.end('Method not allowed');
        return;
      }
      let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (basePath) {
        if (pathname !== basePath && !pathname.startsWith(basePath + '/')) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        pathname = pathname.slice(basePath.length) || '/';
      }
      if (pathname.split('/').some((part) => part.startsWith('.') && part !== '')) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      let filename = path.resolve(staticRoot, '.' + pathname);
      if (filename !== staticRoot && !filename.startsWith(staticRoot + path.sep)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      let stats;
      try {
        stats = await fs.stat(filename);
      } catch {}
      if (!stats?.isFile()) {
        if (path.extname(pathname) && !pathname.endsWith('.html')) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        filename = path.join(staticRoot, 'index.html');
      }
      const data = await fs.readFile(filename);
      res.writeHead(200, {
        'Content-Type': contentTypes[path.extname(filename)] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch {
      if (!res.headersSent) res.writeHead(500);
      res.end('Server request failed.');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5173);
  const basePath = (process.env.BASE_PATH || '').replace(/\/$/, '');
  const server = createAppServer({ basePath });
  server.listen(port, '127.0.0.1', () =>
    console.log(
      `Breach Boulevard: http://127.0.0.1:${port}${basePath}/ (React + Node.js + Supabase)`
    )
  );
  const stop = () => server.close();
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

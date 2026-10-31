import path from 'node:path';
import { projectRoot, readServerConfig } from './config.mjs';
import { AdminAuth } from './admin-auth.mjs';
import { DatabaseError, SupabaseAccessCodes } from './supabase.mjs';
import { escapeHtml, simulateFileExecution, UploadStore } from './uploads.mjs';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const json = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
};
const html = (res, body) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
};
const page = (body) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Breach Boulevard Lab</title></head><body>${body}</body></html>`;

async function readBody(req, limit) {
  if (req.body !== undefined) {
    let body = req.body;
    if (!Buffer.isBuffer(body) && typeof body !== 'string')
      body = (req.headers['content-type'] || '').includes('application/x-www-form-urlencoded')
        ? new URLSearchParams(body).toString()
        : JSON.stringify(body);
    const buffer = Buffer.from(body);
    if (buffer.length > limit) throw new HttpError(413, 'Upload exceeds the allowed size.');
    return buffer;
  }
  if (Number(req.headers['content-length'] || 0) > limit) {
    req.resume();
    throw new HttpError(413, 'Upload exceeds the allowed size.');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size <= limit) chunks.push(chunk);
  }
  if (size > limit) throw new HttpError(413, 'Upload exceeds the allowed size.');
  return Buffer.concat(chunks);
}
async function readJson(req) {
  const text = (await readBody(req, 65536)).toString('utf8');
  try {
    const input = text ? JSON.parse(text) : {};
    if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error();
    return input;
  } catch {
    throw new HttpError(400, 'Invalid JSON request.');
  }
}
function requireMethod(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  json(res, 405, { success: false, message: `Only ${methods.join(' or ')} requests are allowed.` });
  return false;
}

export function createApiHandler({
  database,
  uploadStore,
  adminAuth,
  uploadDirectory = path.join(projectRoot, '.data/uploads'),
  maxUploadBytes = 10 * 1024 * 1024,
  basePath = '',
} = {}) {
  const uploads = uploadStore || new UploadStore(uploadDirectory);
  const getDatabase = () => database || SupabaseAccessCodes.fromEnvironment();
  return async function handleApi(req, res) {
    const url = new URL(req.url, 'http://localhost');
    let route = url.pathname;
    if (basePath) {
      if (route !== basePath && !route.startsWith(basePath + '/')) return false;
      route = route.slice(basePath.length) || '/';
    }
    if (!route.startsWith('/api/')) return false;
    try {
      const auth =
        adminAuth === false
          ? new AdminAuth()
          : adminAuth ||
            new AdminAuth({
              password: readServerConfig().adminPassword,
              required: Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production',
            });
      if (route === '/api/admin/session') {
        if (!requireMethod(req, res, ['GET'])) return true;
        json(res, 200, {
          authenticated: auth.authenticated(req),
          configured: !auth.required || Boolean(auth.password),
        });
        return true;
      }
      if (route === '/api/admin/login') {
        if (!requireMethod(req, res, ['POST'])) return true;
        const { password } = await readJson(req);
        const cookie = auth.login(
          password,
          Boolean(process.env.VERCEL) || req.headers['x-forwarded-proto'] === 'https'
        );
        if (!cookie) {
          json(res, auth.password ? 401 : 503, {
            success: false,
            message: auth.password
              ? 'Incorrect admin password.'
              : 'Admin access is not configured.',
          });
          return true;
        }
        res.setHeader('Set-Cookie', cookie);
        json(res, 200, { success: true });
        return true;
      }
      if (route === '/api/admin/logout') {
        if (!requireMethod(req, res, ['POST'])) return true;
        res.setHeader('Set-Cookie', 'bb_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
        json(res, 200, { success: true });
        return true;
      }
      if (
        ['/api/access-codes', '/api/access-codes/cleanup', '/api/access-codes/check'].includes(
          route
        ) &&
        !auth.authenticated(req)
      ) {
        json(res, 401, { success: false, message: 'Admin sign-in required.' });
        return true;
      }
      if (route === '/api/health') {
        if (!requireMethod(req, res, ['GET'])) return true;
        await getDatabase().checkConnection();
        json(res, 200, { success: true, runtime: 'node', database: 'supabase' });
        return true;
      }
      if (route === '/api/access-codes') {
        if (!requireMethod(req, res, ['GET', 'POST'])) return true;
        if (req.method === 'POST') {
          await readJson(req);
          json(res, 200, { success: true, code: await getDatabase().generate() });
        } else json(res, 200, { success: true, codes: await getDatabase().all() });
        return true;
      }
      if (['/api/access-codes/validate', '/api/access-codes/check'].includes(route)) {
        if (!requireMethod(req, res, ['POST'])) return true;
        const { code } = await readJson(req);
        if (typeof code !== 'string' || !code || code.length > 128) {
          json(res, 200, { success: false, message: 'Access code is required.' });
          return true;
        }
        const valid = await getDatabase().validate(code, route.endsWith('/validate'));
        json(res, 200, {
          success: valid,
          message: valid ? 'Access granted.' : 'Invalid or expired access code.',
        });
        return true;
      }
      if (route === '/api/access-codes/cleanup') {
        if (!requireMethod(req, res, ['POST'])) return true;
        await readJson(req);
        await getDatabase().cleanup();
        json(res, 200, { success: true, message: 'Expired codes cleaned up successfully.' });
        return true;
      }
      if (['/api/uploads', '/api/uploads/avatar', '/api/labs/file-upload'].includes(route)) {
        if (!requireMethod(req, res, ['POST'])) return true;
        let form;
        try {
          form = await new Request('http://localhost/upload', {
            method: 'POST',
            headers: { 'Content-Type': req.headers['content-type'] || '' },
            body: await readBody(req, maxUploadBytes + 65536),
          }).formData();
        } catch (error) {
          if (error instanceof HttpError) throw error;
          throw new HttpError(400, 'Invalid multipart request.');
        }
        const file = form.get('avatar') || form.get('uploaded_file') || form.get('file');
        if (!file || typeof file === 'string' || !file.name) {
          html(res, page('<p>No file uploaded.</p>'));
          return true;
        }
        if (file.size > maxUploadBytes)
          throw new HttpError(413, 'Upload exceeds the allowed size.');
        const extension = path.extname(file.name).toLowerCase();
        if (route.endsWith('/avatar') && !['.jpg', '.jpeg', '.png', '.php'].includes(extension)) {
          json(res, 200, { status: 'error', message: 'Unsupported file type.' });
          return true;
        }
        const saved = await uploads.save(file, basePath);
        if (route.endsWith('/avatar') && extension !== '.php') {
          json(res, 200, {
            status: 'success',
            message: 'Avatar updated successfully.',
            filePath: saved.url,
          });
          return true;
        }
        const link = `<p>File uploaded successfully: <a href="${escapeHtml(saved.url)}" target="_blank">${escapeHtml(saved.filename)}</a></p>`;
        const simulation =
          extension === '.php' && route !== '/api/uploads'
            ? simulateFileExecution(saved.contents)
            : '';
        html(res, page(link + simulation));
        return true;
      }
      const uploaded = route.match(/^\/api\/uploads\/([0-9a-f-]+)(?:\/[^/]*)?$/);
      if (uploaded) {
        if (!requireMethod(req, res, ['GET', 'HEAD'])) return true;
        const file = await uploads.read(uploaded[1]);
        if (!file) throw new HttpError(404, 'File not found.');
        const imageTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };
        const image = imageTypes[path.extname(file.filename).toLowerCase()];
        res.writeHead(200, {
          'Content-Type': image || 'application/octet-stream',
          'Content-Length': file.contents.length,
          'X-Content-Type-Options': 'nosniff',
          'Content-Disposition': `${image ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
        });
        res.end(req.method === 'HEAD' ? undefined : file.contents);
        return true;
      }
      if (route === '/api/labs/reflected-xss') {
        if (!requireMethod(req, res, ['POST'])) return true;
        const form = new URLSearchParams((await readBody(req, 65536)).toString());
        // Raw markup is intentional and confined to this reflected-XSS demo.
        html(res, page(`<h1>Hello, ${form.get('name') || ''}!</h1>`));
        return true;
      }
      if (route === '/api/labs/csrf') {
        if (!requireMethod(req, res, ['POST'])) return true;
        await readBody(req, 65536);
        html(res, '');
        return true;
      }
      if (route === '/api/download') {
        if (!requireMethod(req, res, ['GET'])) return true;
        res.writeHead(302, {
          Location:
            'https://drive.google.com/drive/folders/10XaNvFNJ8mTBWMllWmKSWbRus7XYdem5?usp=drive_link/' +
            encodeURIComponent(url.searchParams.get('filename') || ''),
        });
        res.end();
        return true;
      }
      if (['/api/labs/runtime-info', '/api/labs/execution-demo'].includes(route)) {
        if (!requireMethod(req, res, ['GET'])) return true;
        html(
          res,
          page(
            route.endsWith('/runtime-info')
              ? `<h1>JavaScript runtime</h1><p>Node.js ${escapeHtml(process.version)}</p>`
              : simulateFileExecution(
                  Buffer.from(
                    '<?php echo "<h1>PHP File Executed Successfully!</h1>"; phpinfo(); ?>'
                  )
                )
          )
        );
        return true;
      }
      throw new HttpError(404, 'API route not found.');
    } catch (error) {
      const known = error instanceof HttpError || error instanceof DatabaseError;
      json(res, known ? error.status : 500, {
        success: false,
        message: known ? error.message : 'Server request failed.',
      });
      return true;
    }
  };
}

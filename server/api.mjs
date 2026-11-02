import path from 'node:path';
import { projectRoot, readServerConfig } from './config.mjs';
import { AdminAuth } from './admin-auth.mjs';
import { LearnerAuth, AuthError, completedLabs, requireSameOrigin } from './learner-auth.mjs';
import { evaluatePracticeLab } from './practice-labs.mjs';
import { practiceStreak } from './streaks.mjs';
import { createHoneyService } from './honey.mjs';
import {
  CommunityError,
  createCommunityService,
  FileCommunityStore,
  learnerProfile,
} from './community.mjs';
import { DatabaseError, SupabaseAccessCodes } from './supabase.mjs';
import { accessCodeOptions, AccessCodeInputError } from './access-code-options.mjs';
import { escapeHtml, simulateFileExecution, UploadStore } from './uploads.mjs';
import { setSecurityHeaders } from './security-headers.mjs';
import { RequestLimiter, clientFingerprint, requestPolicy } from './request-limits.mjs';

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
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader(
    'Content-Security-Policy',
    "sandbox allow-scripts allow-modals allow-downloads allow-popups; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'"
  );
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
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const cleanup = () => {
      req.off('data', data);
      req.off('end', end);
      req.off('error', error);
      req.off('aborted', aborted);
    };
    const error = () => {
      cleanup();
      reject(new HttpError(400, 'Incomplete request body.'));
    };
    const aborted = error;
    const end = () => {
      cleanup();
      resolve(Buffer.concat(chunks));
    };
    const data = (chunk) => {
      size += chunk.length;
      if (size > limit) {
        cleanup();
        req.resume();
        reject(new HttpError(413, 'Upload exceeds the allowed size.'));
        return;
      }
      chunks.push(chunk);
    };
    req.on('data', data);
    req.once('end', end);
    req.once('error', error);
    req.once('aborted', aborted);
  });
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
  userAuth,
  uploadDirectory = path.join(projectRoot, '.data/uploads'),
  maxUploadBytes = 10 * 1024 * 1024,
  basePath = '',
  honey,
  requestLimiter,
  communityStore,
  communityDirectory = path.join(projectRoot, '.data/community'),
} = {}) {
  const uploads = uploadStore || new UploadStore(uploadDirectory);
  const getDatabase = () => database || SupabaseAccessCodes.fromEnvironment();
  const honeyService = honey || createHoneyService();
  const limiter = requestLimiter || new RequestLimiter();
  const community = createCommunityService({
    store: communityStore || new FileCommunityStore(communityDirectory),
  });
  return async function handleApi(req, res) {
    const url = new URL(req.url, 'http://localhost');
    let route = url.pathname;
    if (basePath) {
      if (route !== basePath && !route.startsWith(basePath + '/')) return false;
      route = route.slice(basePath.length) || '/';
    }
    if (!route.startsWith('/api/')) return false;
    try {
      setSecurityHeaders(res, { api: true, https: Boolean(process.env.VERCEL) });
      const learner =
        userAuth === false
          ? null
          : typeof userAuth === 'function'
            ? userAuth(req, res)
            : new LearnerAuth(req, res, { basePath });
      const policy = requestPolicy(route, req.method);
      if (policy) {
        if (learner) requireSameOrigin(req, learner.origin);
        const allowance = await limiter.consume(clientFingerprint(req), policy);
        if (!allowance?.allowed) {
          res.setHeader('Retry-After', String(Math.max(1, allowance?.retry_after_seconds || 60)));
          throw new HttpError(429, 'Too many requests. Please wait before trying again.');
        }
      }
      if (learner && (await learner.handle(route, { readJson, json, requireMethod }))) return true;
      if (learner && !['GET', 'HEAD', 'OPTIONS'].includes(req.method))
        requireSameOrigin(req, learner.origin);
      const learnerRoute =
        route.startsWith('/api/practice/') ||
        route.startsWith('/api/uploads') ||
        route.startsWith('/api/labs/') ||
        route === '/api/account/progress' ||
        route.startsWith('/api/community/') ||
        route === '/api/access-codes/validate';
      const student = learner && learnerRoute ? await learner.requireUser() : null;
      if (route === '/api/labs/preview') {
        if (!requireMethod(req, res, ['GET'])) return true;
        const markup = url.searchParams.get('html') || '';
        if (markup.length > 12000) throw new HttpError(413, 'Preview is too long.');
        html(
          res,
          page(
            '<style>body{margin:0;color:#d1d5db;background:#1f2937;font:16px/1.5 Arial,sans-serif;overflow-wrap:anywhere}h3{color:#f97316;font-size:18px}</style>' +
              markup
          )
        );
        return true;
      }
      if (route === '/api/account/progress') {
        if (!requireMethod(req, res, ['GET'])) return true;
        json(res, 200, {
          success: true,
          completed: completedLabs(student),
          streak: practiceStreak(student, { timeZoneHint: req.headers['x-learner-timezone'] }),
        });
        return true;
      }
      if (route.startsWith('/api/community/')) {
        const result = await community({
          method: req.method,
          route,
          query: url.searchParams,
          body: req.method === 'POST' ? await readJson(req) : undefined,
          viewer: student ? learnerProfile(student, completedLabs(student).length) : null,
        });
        if (!result) throw new HttpError(404, 'API route not found.');
        json(res, 200, result);
        return true;
      }
      if (route === '/api/honey/chat') {
        if (!requireMethod(req, res, ['POST'])) return true;
        const result = await honeyService.chat({
          client: clientFingerprint(req),
          input: await readJson(req),
        });
        json(res, result.status, result.body);
        return true;
      }
      const practiceRoute = route.match(/^\/api\/practice\/([a-z-]+)$/);
      if (practiceRoute) {
        if (!requireMethod(req, res, ['POST'])) return true;
        const ctfConfig = readServerConfig();
        const result = evaluatePracticeLab(practiceRoute[1], await readJson(req), {
          actorId: student?.id,
          proofKey: ctfConfig.key || ctfConfig.adminPassword,
        });
        if (!result) throw new HttpError(404, 'Practice lab not found.');
        if (result.completed && learner) {
          result.completedLabs = await learner.saveCompletion(practiceRoute[1], student);
          result.streak = learner.savedStreak;
        }
        json(res, 200, result);
        return true;
      }
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
        [
          '/api/access-codes',
          '/api/access-codes/cleanup',
          '/api/access-codes/check',
          '/api/access-codes/extend',
        ].includes(route) &&
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
        if (!requireMethod(req, res, ['GET', 'POST', 'DELETE'])) return true;
        if (req.method === 'DELETE') {
          const { code } = await readJson(req);
          if (
            typeof code !== 'string' ||
            !code ||
            code.length > 128 ||
            /[\u0000-\u001f]/.test(code)
          )
            throw new HttpError(400, 'Choose a valid access code.');
          await getDatabase().remove(code);
          json(res, 200, { success: true, message: 'Access code deleted.' });
          return true;
        }
        if (req.method === 'POST') {
          const options = accessCodeOptions(await readJson(req));
          const code = await getDatabase().generate(options);
          json(res, 200, { success: true, code, expiresAt: options.expiresAt });
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
      if (route === '/api/access-codes/extend') {
        if (!requireMethod(req, res, ['POST'])) return true;
        const input = await readJson(req);
        if (
          typeof input.code !== 'string' ||
          !input.code ||
          input.code.length > 128 ||
          /[\u0000-\u001f]/.test(input.code)
        )
          throw new HttpError(400, 'Choose a valid access code.');
        const accessCode = await getDatabase().extend(input.code, input);
        json(res, 200, { success: true, accessCode, message: 'Access code extended.' });
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
        const saved = await uploads.save(file, basePath, student?.id);
        if (route.endsWith('/avatar') && extension !== '.php') {
          json(res, 200, {
            status: 'success',
            message: 'Avatar updated successfully.',
            filePath: saved.url,
          });
          return true;
        }
        const link = `<p>File uploaded successfully: <a href="${escapeHtml(saved.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(saved.filename)}</a></p>`;
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
        if (!file || (learner && file.ownerId !== student.id))
          throw new HttpError(404, 'File not found.');
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
          'Cache-Control': 'private, no-store',
          'Content-Security-Policy': "sandbox; default-src 'none'",
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
      if (error.status === 413 && !process.env.VERCEL) res.setHeader('Connection', 'close');
      const known =
        error instanceof HttpError ||
        error instanceof DatabaseError ||
        error instanceof AuthError ||
        error instanceof CommunityError ||
        error instanceof AccessCodeInputError;
      json(res, known ? error.status : 500, {
        success: false,
        message: known ? error.message : 'Server request failed.',
      });
      return true;
    }
  };
}

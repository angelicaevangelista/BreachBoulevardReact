import { createHmac, randomBytes } from 'node:crypto';
import { isIP } from 'node:net';
import { readServerConfig } from './config.mjs';
import { SupabaseAccessCodes } from './supabase.mjs';
const localSecret = randomBytes(32).toString('hex');
export function clientFingerprint(
  req,
  { trustedProxy = Boolean(process.env.VERCEL), secret } = {}
) {
  let address = req.socket?.remoteAddress || 'unknown';
  if (trustedProxy) {
    const forwarded = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const candidate = forwarded.split(',')[0].trim();
      if (isIP(candidate)) address = candidate;
    }
  }
  const key = secret || readServerConfig().key || localSecret;
  return createHmac('sha256', key)
    .update('request-client-v1|' + address)
    .digest('hex');
}
export function requestPolicy(route, method) {
  if (method === 'POST') {
    if (route === '/api/admin/login') return { name: 'admin-login', limit: 5, seconds: 300 };
    if (route === '/api/auth/login') return { name: 'account-login', limit: 30, seconds: 300 };
    if (route === '/api/auth/signup') return { name: 'account-signup', limit: 10, seconds: 3600 };
    if (route === '/api/auth/google') return { name: 'google-start', limit: 30, seconds: 300 };
    if (route === '/api/auth/password') return { name: 'password-change', limit: 10, seconds: 300 };
    if (route === '/api/auth/reset-request')
      return { name: 'account-reset', limit: 5, seconds: 900 };
    if (route === '/api/access-codes/validate')
      return { name: 'access-code', limit: 20, seconds: 300 };
    if (route.startsWith('/api/uploads') || route === '/api/labs/file-upload')
      return { name: 'uploads', limit: 20, seconds: 300 };
    if (route.startsWith('/api/practice/')) return { name: 'practice', limit: 120, seconds: 60 };
    if (route.startsWith('/api/community/'))
      return { name: 'community-write', limit: 30, seconds: 60 };
    if (route === '/api/honey/chat') return { name: 'honey', limit: 20, seconds: 60 };
  }
  return null;
}
export class RequestLimiter {
  constructor({ persistent = Boolean(process.env.VERCEL), database, now = Date.now } = {}) {
    this.persistent = persistent;
    this.database = database;
    this.now = now;
    this.buckets = new Map();
  }
  async consume(key, policy) {
    const hash = createHmac('sha256', readServerConfig().key || localSecret)
      .update(policy.name + '|' + key)
      .digest('hex');
    if (this.persistent) {
      this.database ||= SupabaseAccessCodes.fromEnvironment();
      return this.database.request('POST', 'rpc/bb_consume_request_limit', {
        p_key: hash,
        p_limit: policy.limit,
        p_window_seconds: policy.seconds,
      });
    }
    const now = this.now();
    let bucket = this.buckets.get(hash);
    if (!bucket || bucket.expires <= now) {
      if (this.buckets.size >= 5000) {
        for (const [k, v] of this.buckets) if (v.expires <= now) this.buckets.delete(k);
        if (this.buckets.size >= 5000) return { allowed: false, retry_after_seconds: 60 };
      }
      bucket = { hits: 0, expires: now + policy.seconds * 1000 };
      this.buckets.set(hash, bucket);
    }
    if (bucket.hits >= policy.limit)
      return {
        allowed: false,
        retry_after_seconds: Math.max(1, Math.ceil((bucket.expires - now) / 1000)),
      };
    bucket.hits++;
    return { allowed: true, retry_after_seconds: 0 };
  }
}

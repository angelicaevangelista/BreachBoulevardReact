import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export class AdminAuth {
  constructor({ password = '', required = false } = {}) {
    this.password = password;
    this.required = required || Boolean(password);
  }
  authenticated(req) {
    if (!this.required) return true;
    if (!this.password) return false;
    try {
      const token = (req.headers.cookie || '')
        .split(';')
        .map((value) => value.trim())
        .find((value) => value.startsWith('bb_admin='))
        ?.slice(9);
      if (!token || token.length > 1024) return false;
      const [payload, signature, ...extra] = token.split('.');
      if (!payload || !signature || extra.length) return false;
      const expected = createHmac('sha256', this.password).update(payload).digest();
      const actual = Buffer.from(signature, 'base64url');
      return (
        actual.length === expected.length &&
        timingSafeEqual(actual, expected) &&
        JSON.parse(Buffer.from(payload, 'base64url')).expiresAt > Date.now()
      );
    } catch {
      return false;
    }
  }
  login(password, secure) {
    if (!this.password || typeof password !== 'string') return null;
    const expected = createHash('sha256').update(this.password).digest();
    const actual = createHash('sha256').update(password).digest();
    if (!timingSafeEqual(expected, actual)) return null;
    const payload = Buffer.from(
      JSON.stringify({ expiresAt: Date.now() + 28800000, id: randomBytes(12).toString('hex') })
    ).toString('base64url');
    const signature = createHmac('sha256', this.password).update(payload).digest('base64url');
    return `bb_admin=${payload}.${signature}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure ? '; Secure' : ''}`;
  }
}

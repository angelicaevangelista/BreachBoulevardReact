import { randomBytes } from 'node:crypto';
import { readServerConfig } from './config.mjs';

export class DatabaseError extends Error {
  constructor(message, status = 503, upstreamStatus = 0) {
    super(message);
    this.status = status;
    this.upstreamStatus = upstreamStatus;
  }
}

function serviceRoleJwt(key) {
  try {
    const parts = key.split('.');
    return (
      parts.length === 3 &&
      JSON.parse(Buffer.from(parts[1], 'base64url').toString()).role === 'service_role'
    );
  } catch {
    return false;
  }
}

export class SupabaseAccessCodes {
  constructor({ url, key }, { fetch: transport = globalThis.fetch } = {}) {
    if (!url || !key || url.includes('your-project-ref') || key.includes('replace_with')) {
      throw new DatabaseError(
        'Supabase is not configured. Set SUPABASE_URL and a server secret key.'
      );
    }
    let project;
    try {
      project = new URL(url);
    } catch {
      throw new DatabaseError('SUPABASE_URL must be your HTTPS project URL.');
    }
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(project.hostname);
    if (
      project.username ||
      project.password ||
      project.search ||
      project.hash ||
      project.pathname !== '/' ||
      (project.protocol !== 'https:' && !(local && project.protocol === 'http:'))
    ) {
      throw new DatabaseError('SUPABASE_URL must be your HTTPS project URL.');
    }
    if ((!key.startsWith('sb_secret_') && !serviceRoleJwt(key)) || /[\r\n]/.test(key)) {
      throw new DatabaseError(
        'A server Supabase secret key is required. Publishable keys cannot manage access codes.'
      );
    }
    this.url = project.origin;
    this.key = key;
    this.fetch = transport;
  }

  static fromEnvironment(options) {
    return new SupabaseAccessCodes(readServerConfig(options));
  }

  async request(method, endpoint, body, representation = false) {
    const headers = {
      apikey: this.key,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (!this.key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${this.key}`;
    if (representation) headers.Prefer = 'return=representation';
    let response;
    try {
      response = await this.fetch(`${this.url}/rest/v1/${endpoint}`, {
        method,
        headers,
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new DatabaseError('Unable to connect to Supabase.');
    }
    if (!response.ok) {
      throw new DatabaseError(
        'Supabase request failed. Check the project connection and database migration.',
        503,
        response.status
      );
    }
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw new DatabaseError('Supabase returned an invalid response.');
    }
  }

  async generate({ code: customCode, expiresAt } = {}) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = customCode ?? randomBytes(4).toString('hex');
      try {
        const data = await this.request(
          'POST',
          'breach_access_codes?select=code',
          {
            code,
            ...(expiresAt ? { expires_at: expiresAt } : {}),
          },
          true
        );
        if (data?.[0]?.code !== code)
          throw new DatabaseError('Supabase did not confirm the new access code.');
        return code;
      } catch (error) {
        if (customCode && error.upstreamStatus === 409)
          throw new DatabaseError('That access code already exists. Choose a different code.', 409);
        if (error.upstreamStatus !== 409 || attempt === 2) throw error;
      }
    }
  }

  async all() {
    const rows = await this.request(
      'GET',
      'breach_access_codes?select=code,expires_at&order=created_at.desc,id.desc'
    );
    if (!Array.isArray(rows)) throw new DatabaseError('Supabase returned an invalid code list.');
    return rows;
  }

  async validate(code, checkExpiration = true) {
    const valid = await this.request('POST', 'rpc/bb_validate_access_code', {
      p_code: code,
      p_check_expiration: checkExpiration,
    });
    if (typeof valid !== 'boolean')
      throw new DatabaseError('Supabase returned an invalid validation result.');
    return valid;
  }

  async cleanup() {
    await this.request('POST', 'rpc/bb_cleanup_expired_codes', {});
  }
  async checkConnection() {
    await this.request('GET', 'breach_access_codes?select=id&limit=0');
  }
}

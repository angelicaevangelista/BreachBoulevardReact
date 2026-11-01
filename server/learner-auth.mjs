import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { readServerConfig } from './config.mjs';

export class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function applicationOrigin(req, config = readServerConfig()) {
  if (config.siteUrl) return new URL(config.siteUrl).origin;
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.VERCEL || process.env.NODE_ENV === 'production')
    return 'https://breachboulevard.vercel.app';
  const host = req.headers.host || '127.0.0.1:5173';
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host))
    throw new AuthError(400, 'Invalid application host.');
  return `http://${host}`;
}
export function requireSameOrigin(req, origin) {
  if (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site')
    throw new AuthError(
      403,
      'This request must come from the website. Reload the page and try again.'
    );
}
export function publicUser(user) {
  return user
    ? {
        id: user.id,
        email: user.email,
        name:
          typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name.slice(0, 100)
            : '',
      }
    : null;
}
export function completedLabs(user) {
  const ids = ['sql-injection', 'xss', 'authentication', 'idor', 'path-traversal', 'data-exposure'];
  return Array.isArray(user?.user_metadata?.bb_completed_labs)
    ? user.user_metadata.bb_completed_labs.filter((id) => ids.includes(id))
    : [];
}
export class LearnerAuth {
  constructor(
    req,
    res,
    {
      config = readServerConfig(),
      transport = fetch,
      clientFactory = createServerClient,
      basePath = '',
    } = {}
  ) {
    this.req = req;
    this.res = res;
    this.config = config;
    this.transport = transport;
    this.clientFactory = clientFactory;
    this.basePath = basePath;
    this.origin = applicationOrigin(req, config);
  }
  client() {
    if (this.supabase) return this.supabase;
    const { url, key, publishableKey } = this.config;
    if (!url || !(publishableKey || key))
      throw new AuthError(503, 'Account sign-in is not configured. Please try again later.');
    const secure = this.origin.startsWith('https:');
    this.supabase = this.clientFactory(url, publishableKey || key, {
      cookieOptions: {
        name: secure ? '__Host-bb_learner' : 'bb_learner',
        path: '/',
        httpOnly: true,
        secure,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      },
      global: {
        fetch: (url, options) =>
          this.transport(url, { ...options, signal: AbortSignal.timeout(15000) }),
      },
      cookies: {
        getAll: () => parseCookieHeader(this.req.headers.cookie || ''),
        setAll: (cookies) => {
          const existing = this.res.getHeader('Set-Cookie') || [];
          this.res.setHeader('Set-Cookie', [
            ...(Array.isArray(existing) ? existing : [existing]),
            ...cookies.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, {
                ...options,
                httpOnly: true,
                secure,
                sameSite: 'lax',
                path: '/',
                domain: undefined,
              })
            ),
          ]);
        },
      },
    });
    return this.supabase;
  }
  async user() {
    if (this.verified !== undefined) return this.verified;
    if (!this.req.headers.cookie?.includes('bb_learner')) return (this.verified = null);
    const { data, error } = await this.client().auth.getUser();
    if (error && (error.status >= 500 || error.name === 'AuthRetryableFetchError'))
      throw new AuthError(503, 'Unable to verify your session. Please try again.');
    this.verified = !error && data.user?.email_confirmed_at ? data.user : null;
    return this.verified;
  }
  async requireUser() {
    const user = await this.user();
    if (!user) throw new AuthError(401, 'Sign in to continue.');
    return user;
  }
  async settings() {
    const { url, key, publishableKey } = this.config;
    if (!url || !(publishableKey || key))
      throw new AuthError(503, 'Account sign-in is not configured.');
    const response = await this.transport(url + '/auth/v1/settings', {
      headers: { apikey: publishableKey || key },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new AuthError(503, 'Sign-in options are temporarily unavailable.');
    const settings = await response.json();
    return {
      googleEnabled: Boolean(settings.external?.google),
      emailEnabled: Boolean(settings.external?.email),
      signupEnabled: !settings.disable_signup,
    };
  }
  async saveCompletion(id, user) {
    const completed = [...new Set([...completedLabs(user), id])];
    const { error } = await this.client().auth.updateUser({
      data: { bb_completed_labs: completed },
    });
    if (error)
      throw new AuthError(503, 'Lab completed, but progress could not be saved. Please retry.');
    return completed;
  }
  async handle(route, { readJson, json, requireMethod }) {
    const { req, res } = this;
    if (!route.startsWith('/api/auth/')) return false;
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Vary', 'Cookie');
    const send = (data, status = 200) => {
      json(res, status, { success: true, ...data });
      return true;
    };
    const redirect = (path) => {
      res.writeHead(303, { Location: this.basePath + path, 'Referrer-Policy': 'no-referrer' });
      res.end();
      return true;
    };
    if (route === '/api/auth/session') {
      if (!requireMethod(req, res, ['GET'])) return true;
      return send({ user: publicUser(await this.user()) });
    }
    if (route === '/api/auth/options') {
      if (!requireMethod(req, res, ['GET'])) return true;
      return send(await this.settings());
    }
    if (route === '/api/auth/callback') {
      if (!requireMethod(req, res, ['GET'])) return true;
      const url = new URL(req.url, this.origin);
      const code = url.searchParams.get('code');
      if (!code || code.length > 2048 || url.searchParams.has('error'))
        return redirect('/access?auth_error=callback');
      const { error } = await this.client().auth.exchangeCodeForSession(code);
      if (error) return redirect('/access?auth_error=callback');
      const { data, error: verifyError } = await this.client().auth.getUser();
      if (verifyError || !data.user?.email_confirmed_at)
        return redirect('/access?auth_error=callback');
      return redirect(url.searchParams.get('flow') === 'recovery' ? '/reset-password' : '/access');
    }
    if (
      ![
        '/api/auth/login',
        '/api/auth/signup',
        '/api/auth/google',
        '/api/auth/logout',
        '/api/auth/reset-request',
        '/api/auth/password',
      ].includes(route)
    )
      throw new AuthError(404, 'Account endpoint not found.');
    if (!requireMethod(req, res, ['POST'])) return true;
    requireSameOrigin(req, this.origin);
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      throw new AuthError(415, 'Send a JSON request.');
    const input = await readJson(req);
    const callback = this.origin + this.basePath + '/api/auth/callback';
    if (route === '/api/auth/google') {
      if (!(await this.settings()).googleEnabled)
        throw new AuthError(503, 'Google sign-in is currently unavailable. Please use email for now.');
      const { data, error } = await this.client().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callback,
          skipBrowserRedirect: true,
          scopes: 'openid email profile',
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error || !data.url) throw new AuthError(503, 'Google sign-in could not be started.');
      const destination = new URL(data.url);
      if (destination.origin !== new URL(this.config.url).origin)
        throw new AuthError(503, 'Invalid sign-in destination.');
      return send({ url: data.url });
    }
    if (route === '/api/auth/logout') {
      await this.client().auth.signOut({ scope: 'local' });
      return send({});
    }
    if (route === '/api/auth/password') {
      await this.requireUser();
      validatePassword(input.password);
      const { error } = await this.client().auth.updateUser({ password: input.password });
      if (error)
        throw new AuthError(
          400,
          'Password could not be updated. Use a different strong password or request a new reset link.'
        );
      await this.client().auth.signOut({ scope: 'local' });
      return send({ message: 'Password updated. Sign in with your new password.' });
    }
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new AuthError(400, 'Enter a valid email address.');
    if (route === '/api/auth/reset-request') {
      const { error } = await this.client().auth.resetPasswordForEmail(email, {
        redirectTo: callback + '?flow=recovery',
      });
      if (error?.status === 429)
        throw new AuthError(429, 'Too many requests. Please wait before trying again.');
      if (error && error.status !== 400 && error.status !== 422)
        throw new AuthError(503, 'Password reset email could not be sent. Please try again later.');
      return send({
        message:
          'If this email has an account, a password reset link will be sent. Open it in this browser.',
      });
    }
    if (route === '/api/auth/signup') {
      validatePassword(input.password);
      const { data, error } = await this.client().auth.signUp({
        email,
        password: input.password,
        options: { emailRedirectTo: callback },
      });
      if (error && !['user_already_exists', 'email_exists'].includes(error.code))
        throw new AuthError(
          error.status === 429 ? 429 : 400,
          error.status === 429
            ? 'Too many requests. Please wait before trying again.'
            : 'Account could not be created. Try again later or use Google.'
        );
      // Never use an unconfirmed signup session to grant access.
      if (data?.session) await this.client().auth.signOut({ scope: 'local' });
      return send({
        message:
          'Check your email for a confirmation link. If you already have an account, sign in instead. Open the link in this browser.',
      });
    }
    if (typeof input.password !== 'string' || !input.password || input.password.length > 128)
      throw new AuthError(400, 'Enter your email and password.');
    const { data, error } = await this.client().auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error || !data.user?.email_confirmed_at)
      throw new AuthError(
        error?.status === 429 ? 429 : 401,
        error?.status === 429
          ? 'Too many attempts. Please wait before trying again.'
          : 'Unable to sign in. Check your email and password and confirm your email address.'
      );
    return send({ user: publicUser(data.user) });
  }
}
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128)
    throw new AuthError(400, 'Use a password between 12 and 128 characters.');
}

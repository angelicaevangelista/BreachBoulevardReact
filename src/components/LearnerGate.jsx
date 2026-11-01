import GoogleSignInButton from './GoogleSignInButton';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { assetUrl, Link } from '../routing';
const LearnerContext = createContext(null);
export const useLearner = () => useContext(LearnerContext);
const button =
  'w-full rounded-lg px-4 py-3 font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50';
export async function accountRequest(action, body, signal) {
  const response = await fetch(assetUrl(`api/auth/${action}`), {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  const data = await response.json();
  if (!response.ok || !data.success)
    throw new Error(data.message || 'Unable to connect. Please try again.');
  return data;
}
export function SignIn({ onSignedIn }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(() =>
    new URLSearchParams(window.location.search).has('auth_error')
      ? 'The sign-in link expired or could not be verified. Please try signing in again.'
      : new URLSearchParams(window.location.search).has('password_updated')
        ? 'Password updated. Sign in with your new password.'
        : ''
  );
  const [options, setOptions] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    accountRequest('options', undefined, controller.signal)
      .then(setOptions)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  function changeMode(next) {
    setMode(next);
    setPassword('');
    setMessage('');
  }
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage('');
    try {
      const data = await accountRequest(mode === 'reset' ? 'reset-request' : mode, {
        email,
        ...(mode === 'reset' ? {} : { password }),
      });
      setPassword('');
      if (mode === 'login') onSignedIn(data.user);
      else {
        setMode('login');
        setMessage(data.message);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  }
  async function google() {
    if (pending) return;
    setPending(true);
    setMessage('');
    try {
      const data = await accountRequest('google', {});
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error.message);
      setPending(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      <nav className="bg-orange-500 px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="font-bold text-xl">
          Breach Boulevard
        </Link>
        <Link to="/" className="hover:underline">
          Back to home
        </Link>
      </nav>
      <main className="px-5 py-12 flex justify-center">
        <section
          className="bg-[#1b2b3c] rounded-xl shadow-xl border border-gray-700 p-6 md:p-9 w-full max-w-md"
          aria-labelledby="signInTitle"
        >
          <p className="text-orange-400 uppercase tracking-widest text-xs font-semibold">
            Your security journey
          </p>
          <h1 id="signInTitle" className="text-3xl font-bold mt-3">
            {mode === 'signup'
              ? 'Create your account'
              : mode === 'reset'
                ? 'Reset your password'
                : 'Welcome back'}
          </h1>
          <p className="text-gray-300 text-sm mt-3 mb-7">
            {mode === 'signup'
              ? 'Save your lab progress and start learning.'
              : mode === 'reset'
                ? 'We’ll email you a link to choose a new password.'
                : 'Sign in to access courses and practice labs.'}
          </p>
          {mode !== 'reset' && (
            <>
              <GoogleSignInButton
                onClick={google}
                pending={pending}
                googleEnabled={options?.googleEnabled}
              />
              <div className="flex items-center gap-3 text-gray-400 text-xs my-6">
                <span className="h-px bg-gray-600 flex-1" />
                or use your email
                <span className="h-px bg-gray-600 flex-1" />
              </div>
            </>
          )}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="accountEmail" className="block text-sm mb-2">
                Email address
              </label>
              <input
                id="accountEmail"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg bg-[#0d1b2a] border border-gray-600 p-3 text-white focus:outline-orange-500"
              />
            </div>
            {mode !== 'reset' && (
              <div>
                <label htmlFor="accountPassword" className="block text-sm mb-2">
                  Password
                </label>
                <input
                  id="accountPassword"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  minLength={mode === 'signup' ? 12 : undefined}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg bg-[#0d1b2a] border border-gray-600 p-3 text-white focus:outline-orange-500"
                />
                {mode === 'signup' && (
                  <p className="text-gray-400 text-xs mt-2">
                    Use at least 12 characters. A unique passphrase works well.
                  </p>
                )}
              </div>
            )}
            <button disabled={pending} className={button}>
              {pending
                ? 'Please wait…'
                : mode === 'signup'
                  ? 'Create account'
                  : mode === 'reset'
                    ? 'Send reset link'
                    : 'Sign in'}
            </button>
          </form>
          {message && (
            <p role="status" className="mt-5 text-sm text-orange-300 whitespace-pre-wrap">
              {message}
            </p>
          )}
          <div className="mt-6 text-sm text-gray-300 space-y-3">
            {mode === 'login' ? (
              <>
                <p>
                  New to Breach Boulevard?{' '}
                  <button
                    type="button"
                    onClick={() => changeMode('signup')}
                    disabled={pending || options?.signupEnabled === false}
                    className="text-orange-400 hover:underline"
                  >
                    Create an account
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => changeMode('reset')}
                  disabled={pending}
                  className="text-orange-400 hover:underline"
                >
                  Forgot password?
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => changeMode('login')}
                disabled={pending}
                className="text-orange-400 hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 border-t border-gray-600 pt-5 mt-6">
            Email accounts must be confirmed before sign-in. Your course access code is entered
            after signing in.{' '}
            <Link to="/privacy" className="text-orange-400 hover:underline">
              Privacy notice
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
export default function LearnerGate({ children }) {
  const [state, setState] = useState({ loading: true, user: null, error: '' });
  const [signingOut, setSigningOut] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    accountRequest('session', undefined, controller.signal)
      .then((data) => setState({ loading: false, user: data.user, error: '' }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ loading: false, user: null, error: error.message });
      });
    return () => controller.abort();
  }, [retry]);
  async function signOut() {
    setSigningOut(true);
    try {
      await accountRequest('logout', {});
      setState({ loading: false, user: null, error: '' });
    } catch (error) {
      setState((previous) => ({ ...previous, error: error.message }));
    } finally {
      setSigningOut(false);
    }
  }
  if (state.loading)
    return (
      <main className="min-h-screen bg-[#0d1b2a] text-white p-10" role="status">
        Checking your session…
      </main>
    );
  if (!state.user && state.error)
    return (
      <main className="min-h-screen bg-[#0d1b2a] text-white p-10">
        <p role="alert">{state.error}</p>
        <button
          className="text-orange-400 mt-4"
          onClick={() => {
            setState({ loading: true, user: null, error: '' });
            setRetry((value) => value + 1);
          }}
        >
          Try again
        </button>
      </main>
    );
  if (!state.user)
    return <SignIn onSignedIn={(user) => setState({ loading: false, user, error: '' })} />;
  return (
    <LearnerContext.Provider value={{ user: state.user }}>
      <aside
        className="bg-[#0d1b2a] text-gray-300 px-5 py-3 border-b border-gray-700 flex flex-wrap items-center justify-between gap-3 text-sm"
        aria-label="Your account"
      >
        <span>Signed in as {state.user.email}</span>
        <button disabled={signingOut} onClick={signOut} className="text-orange-400 hover:underline">
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
        {state.error && <p role="alert">{state.error}</p>}
      </aside>
      {children}
    </LearnerContext.Provider>
  );
}

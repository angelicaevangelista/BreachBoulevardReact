import React, { useEffect, useState } from 'react';
import { assetUrl } from '../routing';
import { Brand, Mascot, LoadingScreen } from './Interface';
import HoneyAssistant from './HoneyAssistant';

export default function AdminGate({ children }) {
  const [session, setSession] = useState(null),
    [password, setPassword] = useState(''),
    [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(assetUrl('api/admin/session'), { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        if (!controller.signal.aborted) setSession(data);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setSession({ authenticated: false });
          setMessage('Unable to check admin access.');
        }
      });
    return () => controller.abort();
  }, []);
  async function login(event) {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch(assetUrl('api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (data.success) {
        setSession({ authenticated: true });
        setPassword('');
      } else setMessage(data.message || 'Unable to sign in.');
    } catch {
      setMessage('Unable to sign in.');
    }
  }
  if (session?.authenticated)
    return (
      <>
        {children}
        <HoneyAssistant />
        <button
          className="bb-admin-account"
          onClick={async () => {
            await fetch(assetUrl('api/admin/logout'), { method: 'POST' });
            setSession({ authenticated: false });
          }}
        >
          Sign out
        </button>
      </>
    );
  if (session === null) return <LoadingScreen label="Checking admin access…" />;
  return (
    <div className="bb-ui bb-auth" style={{ minHeight: '100vh' }}>
      <header className="bb-public-header">
        <Brand />
      </header>
      <main className="bb-admin-auth">
        <form className="bb-auth-card bb-form" onSubmit={login}>
          <Mascot />
          <span className="bb-eyebrow">YOUR TEACHING TOOLKIT</span>
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">Admin sign-in</h2>
          {session === null ? (
            <p>Checking admin access…</p>
          ) : (
            <>
              <label htmlFor="admin-password" className="block mb-2 bb-muted">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                className="w-full p-3 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded py-3"
                type="submit"
              >
                Sign in
              </button>
            </>
          )}
          <p role="status" className="mt-4 bb-muted">
            {message}
          </p>
        </form>
      </main>
    </div>
  );
}

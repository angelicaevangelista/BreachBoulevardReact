import React, { useEffect, useState } from 'react';
import { assetUrl } from '../routing';

export default function AdminGate({ children }) {
  const [session, setSession] = useState(null),
    [password, setPassword] = useState(''),
    [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(assetUrl('api/admin/session'), { signal: controller.signal })
      .then((response) => response.json())
      .then(setSession)
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
        <button
          className="fixed top-6 right-6 text-white hover:underline"
          onClick={async () => {
            await fetch(assetUrl('api/admin/logout'), { method: 'POST' });
            setSession({ authenticated: false });
          }}
        >
          Sign out
        </button>
      </>
    );
  return (
    <>
      <header className="bg-orange-500 text-white p-6 text-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </header>
      <main className="flex-grow flex items-center justify-center p-6">
        <form className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md" onSubmit={login}>
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">Admin sign-in</h2>
          {session === null ? (
            <p>Checking admin access…</p>
          ) : (
            <>
              <label htmlFor="admin-password" className="block mb-2 text-gray-700">
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
          <p role="status" className="mt-4 text-gray-700">
            {message}
          </p>
        </form>
      </main>
    </>
  );
}

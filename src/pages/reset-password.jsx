import React, { useState } from 'react';
import { accountRequest } from '../components/LearnerGate';
import { assetUrl } from '../routing';
export default function ResetPassword() {
  const [password, setPassword] = useState(''),
    [confirmation, setConfirmation] = useState(''),
    [pending, setPending] = useState(false),
    [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage('Passwords must match.');
      return;
    }
    setPending(true);
    try {
      await accountRequest('password', { password });
      window.location.assign(assetUrl('access?password_updated=true'));
    } catch (error) {
      setMessage(error.message);
      setPending(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#0d1b2a] text-white p-6 flex justify-center">
      <section className="max-w-md w-full bg-[#1b2b3c] p-8 rounded-xl h-fit mt-10">
        <h1 className="text-2xl font-bold text-orange-400">Choose a new password</h1>
        <form onSubmit={submit} className="space-y-5 mt-6">
          {[
            ['newPassword', 'New password', password, setPassword],
            ['confirmPassword', 'Confirm password', confirmation, setConfirmation],
          ].map(([id, label, value, setValue]) => (
            <div key={id}>
              <label htmlFor={id} className="block mb-2">
                {label}
              </label>
              <input
                id={id}
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="w-full bg-[#0d1b2a] border border-gray-600 p-3 rounded-lg"
              />
            </div>
          ))}
          <p className="text-gray-400 text-sm">
            Use 12–128 characters and a password unique to this website.
          </p>
          <button
            disabled={pending}
            className="bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-lg w-full"
          >
            {pending ? 'Saving…' : 'Save password'}
          </button>
        </form>
        <p role="status" className="text-orange-300 mt-4">
          {message}
        </p>
      </section>
    </main>
  );
}

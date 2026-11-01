import { useState } from 'react';
import { assetUrl } from '../routing';
export default function useAdmin() {
  const [codes, setCodes] = useState(null);
  const [duration, setDuration] = useState('1-day');
  const [codeMode, setCodeMode] = useState('random');
  const [customCode, setCustomCode] = useState('');
  const [customExpiry, setCustomExpiry] = useState('');
  const [pending, setPending] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [message, setMessage] = useState('');
  async function request(endpoint, options) {
    const response = await fetch(assetUrl(`api/access-codes${endpoint}`), options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'The request could not be completed.');
    return data;
  }
  async function viewCodes() {
    try {
      const data = await request('', { method: 'GET' });
      if (data.success) setCodes(data.codes);
      else window.alert(data.message || 'Failed to fetch codes.');
    } catch {
      window.alert('An error occurred while fetching the codes.');
    }
  }
  async function generate(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage('');
    setGenerated(null);
    try {
      const expiry = duration === 'custom' ? new Date(customExpiry) : null;
      if (expiry && (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now()))
        throw new Error('Choose an expiration date and time in the future.');
      const data = await request('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          codeMode,
          ...(codeMode === 'custom' ? { code: customCode.trim() } : {}),
          ...(expiry ? { expiresAt: expiry.toISOString() } : {}),
        }),
      });
      if (!data.success) throw new Error(data.message || 'Failed to generate code.');
      setGenerated({ code: data.code, expiresAt: data.expiresAt });
      setCodes((previous) =>
        previous === null ? null : [{ code: data.code, expires_at: data.expiresAt }, ...previous]
      );
    } catch (error) {
      setMessage(error.message || 'An error occurred while generating the code.');
    } finally {
      setPending(false);
    }
  }
  async function cleanup() {
    try {
      const data = await request('/cleanup', { method: 'POST' });
      window.alert(
        data.success
          ? 'Expired codes cleaned up successfully.'
          : data.message || 'Failed to cleanup codes.'
      );
    } catch {
      window.alert('An error occurred while cleaning up codes.');
    }
  }
  return {
    codes,
    viewCodes,
    generate,
    cleanup,
    duration,
    setDuration,
    codeMode,
    setCodeMode,
    customCode,
    setCustomCode,
    customExpiry,
    setCustomExpiry,
    pending,
    generated,
    message,
  };
}

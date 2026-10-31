import { useState } from 'react';
import { assetUrl, navigate } from '../routing';
export default function useAccess() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch(assetUrl('api/access-codes/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (data.success) navigate('/courses');
      else setMessage(data.message || 'Invalid or expired access code.');
    } catch {
      setMessage('An error occurred while validating the access code.');
    } finally {
      setPending(false);
    }
  }
  return { code, setCode, message, pending, submit };
}

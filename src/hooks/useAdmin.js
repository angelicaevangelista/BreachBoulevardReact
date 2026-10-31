import { useState } from 'react';
import { assetUrl } from '../routing';
export default function useAdmin() {
  const [codes, setCodes] = useState(null);
  async function request(endpoint, options) {
    const response = await fetch(assetUrl(`api/access-codes${endpoint}`), options);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
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
    try {
      const data = await request('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      window.alert(
        data.success
          ? `New code generated: ${data.code}`
          : data.message || 'Failed to generate code.'
      );
    } catch {
      window.alert('An error occurred while generating the code.');
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
  return { codes, viewCodes, generate, cleanup };
}

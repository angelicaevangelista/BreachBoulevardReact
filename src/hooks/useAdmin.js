import { useState, useEffect, useCallback, useRef } from 'react';
import { assetUrl } from '../routing';
export default function useAdmin() {
  const [codes, setCodes] = useState(null),
    [loading, setLoading] = useState(true),
    [listError, setListError] = useState('');
  const [duration, setDuration] = useState('1-day'),
    [codeMode, setCodeMode] = useState('random'),
    [customCode, setCustomCode] = useState(''),
    [customExpiry, setCustomExpiry] = useState('');
  const [pending, setPending] = useState(false),
    [generated, setGenerated] = useState(null),
    [message, setMessage] = useState('');
  const [editor, setEditor] = useState(null),
    [actionPending, setActionPending] = useState(false),
    [actionError, setActionError] = useState(''),
    [notice, setNotice] = useState('');
  const loadRequest = useRef(null);
  async function request(endpoint, options) {
    const response = await fetch(assetUrl(`api/access-codes${endpoint}`), {
      credentials: 'same-origin',
      cache: 'no-store',
      ...options,
    });
    const data = await response.json();
    if (!response.ok || !data.success)
      throw new Error(data.message || 'The request could not be completed.');
    return data;
  }
  const viewCodes = useCallback(async () => {
    loadRequest.current?.abort();
    const controller = new AbortController();
    loadRequest.current = controller;
    setLoading(true);
    setListError('');
    try {
      const data = await request('', { method: 'GET', signal: controller.signal });
      if (!Array.isArray(data.codes))
        throw new Error('Your codes could not be loaded. Try refreshing.');
      if (!controller.signal.aborted) setCodes(data.codes);
    } catch (error) {
      if (!controller.signal.aborted) setListError(error.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    viewCodes();
    return () => loadRequest.current?.abort();
  }, [viewCodes]);
  async function generate(event) {
    event.preventDefault();
    if (pending || loading || actionPending) return;
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
      setGenerated({ code: data.code, expiresAt: data.expiresAt });
      setCodes((previous) => [
        { code: data.code, expires_at: data.expiresAt },
        ...(previous || []),
      ]);
    } catch (error) {
      setMessage(error.message || 'An error occurred while generating the code.');
    } finally {
      setPending(false);
    }
  }
  async function cleanup() {
    if (pending || loading || actionPending) return;
    setActionPending(true);
    setNotice('');
    setActionError('');
    try {
      const data = await request('/cleanup', { method: 'POST' });
      setNotice(data.message || 'Expired codes cleaned up successfully.');
      await viewCodes();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActionPending(false);
    }
  }
  function edit(code, type) {
    setEditor({ code, type, duration: '7-days', date: '' });
    setActionError('');
    setNotice('');
  }
  async function saveAction(event) {
    event?.preventDefault();
    if (!editor || actionPending || pending || loading) return;
    setActionPending(true);
    setActionError('');
    try {
      let payload = { code: editor.code };
      if (editor.type === 'extend') {
        payload.duration = editor.duration;
        if (editor.duration === 'custom') {
          const date = new Date(editor.date);
          if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now())
            throw new Error('Choose a valid future date and time.');
          payload.expiresAt = date.toISOString();
        }
      }
      const data = await request(editor.type === 'extend' ? '/extend' : '', {
        method: editor.type === 'extend' ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (editor.type === 'delete') {
        setCodes((previous) => previous.filter((item) => item.code !== editor.code));
        setGenerated((previous) => (previous?.code === editor.code ? null : previous));
      } else {
        setCodes((previous) =>
          previous.map((item) => (item.code === editor.code ? data.accessCode : item))
        );
        setGenerated((previous) =>
          previous?.code === editor.code
            ? { code: editor.code, expiresAt: data.accessCode.expires_at }
            : previous
        );
      }
      setNotice(
        data.message ||
          (editor.type === 'delete' ? 'Access code deleted.' : 'Access code extended.')
      );
      setEditor(null);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setActionPending(false);
    }
  }
  return {
    codes,
    loading,
    listError,
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
    editor,
    setEditor,
    edit,
    saveAction,
    actionPending,
    actionError,
    notice,
  };
}

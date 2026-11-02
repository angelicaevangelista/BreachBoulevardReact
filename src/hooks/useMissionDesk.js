import { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl } from '../routing';
export default function useMissionDesk() {
  const [data, setData] = useState({ cases: [], completed: [] }),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [feedback, setFeedback] = useState(null);
  const latest = useRef(data),
    locked = useRef(false),
    read = useRef(null),
    write = useRef(null);
  const accept = (payload) => {
    latest.current = payload;
    setData(payload);
  };
  const load = useCallback(async () => {
    read.current?.abort();
    const controller = new AbortController();
    read.current = controller;
    setLoading(true);
    try {
      const response = await fetch(assetUrl('api/missions'), {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      });
      const payload = await response.json();
      if (
        !response.ok ||
        !payload.success ||
        !Array.isArray(payload.cases) ||
        !Array.isArray(payload.completed)
      )
        throw Error(payload.message || 'Your case desk could not be loaded.');
      if (!controller.signal.aborted) {
        accept(payload);
        setError('');
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(e.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    return () => {
      read.current?.abort();
      write.current?.abort();
    };
  }, [load]);
  const action = useCallback(
    async (caseId, input) => {
      if (locked.current) return null;
      locked.current = true;
      setBusy(true);
      setError('');
      setFeedback(null);
      const controller = new AbortController();
      write.current = controller;
      const revision = latest.current.cases.find((c) => c.caseId === caseId)?.revision || 0;
      try {
        const response = await fetch(assetUrl('api/missions'), {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...input, caseId, revision }),
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          if (response.status === 409) await load();
          throw Error(payload.message || 'This case action could not be saved.');
        }
        if (controller.signal.aborted) return null;
        const cases = latest.current.cases.some((c) => c.caseId === caseId)
          ? latest.current.cases.map((c) => (c.caseId === caseId ? payload.case : c))
          : [...latest.current.cases, payload.case];
        accept({ ...latest.current, cases });
        setFeedback({ caseId, ...payload });
        return payload;
      } catch (e) {
        if (!controller.signal.aborted) setError(e.message);
        return null;
      } finally {
        locked.current = false;
        if (!controller.signal.aborted) setBusy(false);
      }
    },
    [load]
  );
  return { ...data, loading, busy, error, feedback, reload: load, action };
}

import { useEffect, useState } from 'react';
import { useLearner } from '../components/LearnerGate';
import { assetUrl } from '../routing';
import { practiceLabs } from '../data/practice-labs';
const key = 'breach.practice.progress.v1';
function localProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
export default function useLabProgress() {
  const learner = useLearner();
  const userId = learner?.user?.id;
  const [progress, setProgress] = useState(() => (userId ? {} : localProgress()));
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch(assetUrl('api/account/progress'), {
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'same-origin',
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.completed))
          throw new Error('Your progress couldn’t be loaded. Try again.');
        if (!controller.signal.aborted)
          setProgress((previous) => ({
            ...previous,
            ...Object.fromEntries(data.completed.map((id) => [id, true])),
          }));
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [userId, retry]);
  function recordCompletion(id, saved) {
    setProgress((previous) => {
      const next = {
        ...previous,
        [id]: previous[id] || new Date().toISOString(),
        ...(Array.isArray(saved) ? Object.fromEntries(saved.map((item) => [item, true])) : {}),
      };
      if (!userId)
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
      return next;
    });
  }
  return {
    progress,
    loading,
    error,
    recordCompletion,
    reload: () => setRetry((value) => value + 1),
    completed: practiceLabs.filter((lab) => progress[lab.id]),
  };
}

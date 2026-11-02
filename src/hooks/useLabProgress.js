import { useEffect, useState } from 'react';
import { useLearner } from '../components/LearnerGate';
import { assetUrl } from '../routing';
import { practiceLabs } from '../data/practice-labs';
import { learnerTimeZoneHeaders } from '../data/learner-timezone';
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
  const [streak, setStreak] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!userId || !streak) return;
    function refreshDay() {
      if (document.visibilityState === 'hidden') return;
      const today = new Intl.DateTimeFormat('sv-SE', {
        timeZone: streak.timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      if (today !== streak.today) setRetry((value) => value + 1);
    }
    const timer = setInterval(refreshDay, 60000);
    window.addEventListener('focus', refreshDay);
    window.addEventListener('visibilitychange', refreshDay);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refreshDay);
      window.removeEventListener('visibilitychange', refreshDay);
    };
  }, [userId, streak?.today, streak?.timeZone]);
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch(assetUrl('api/account/progress'), {
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'same-origin',
      headers: learnerTimeZoneHeaders(),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.completed))
          throw new Error('Your progress couldn’t be loaded. Try again.');
        if (!controller.signal.aborted) {
          setStreak(data.streak || null);
          setProgress((previous) => ({
            ...previous,
            ...Object.fromEntries(data.completed.map((id) => [id, true])),
          }));
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [userId, retry]);
  function recordCompletion(id, saved, activity) {
    if (activity) setStreak(activity);
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
    streak,
    loading,
    error,
    recordCompletion,
    reload: () => setRetry((value) => value + 1),
    completed: practiceLabs.filter((lab) => progress[lab.id]),
  };
}

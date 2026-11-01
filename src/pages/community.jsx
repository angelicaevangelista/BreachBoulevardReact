import React, { useEffect, useState } from 'react';
import AppShell, { Icon } from '../components/Interface';
import { assetUrl } from '../routing';
import { communityLimits } from '../data/community';
import BoulevardMap from '../components/BoulevardMap';

async function request(route, options = {}) {
  const hasBody = options.body !== undefined;
  const response = await fetch(assetUrl(`api/community/${route}`), {
    cache: 'no-store',
    credentials: 'same-origin',
    method: options.method || 'GET',
    signal: options.signal,
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success)
    throw new Error(data.message || 'Something went wrong. Try again.');
  return data;
}

function timeAgo(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function RankCard({ rank }) {
  const percent = rank.progress;
  return (
    <aside className="bb-rank-card" aria-label="Your block rank">
      <span className="bb-stat-icon">
        <Icon name="shield" />
      </span>
      <div>
        <small>YOUR BLOCK</small>
        <strong>{rank.title}</strong>
        <p>{rank.note}</p>
        <div className="bb-topic-progress">
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="bb-rank-next">
          {rank.nextTitle
            ? `${rank.labsToNext} more ${rank.labsToNext === 1 ? 'lab' : 'labs'} until ${rank.nextTitle}`
            : 'Top rank reached. Your name is on the lamp posts.'}
        </p>
      </div>
    </aside>
  );
}

function StreetMap({ streets, onOpen }) {
  return <BoulevardMap streets={streets} onOpen={onOpen} />;
}

function Composer({ street, onPosted }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await request('posts', { method: 'POST', body: { street: street.id, title, body } });
      setTitle('');
      setBody('');
      onPosted();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="bb-panel bb-community-composer" onSubmit={submit}>
      <label>
        <span>Title</span>
        <input
          value={title}
          maxLength={communityLimits.title.max}
          placeholder="What did you find, or what are you stuck on?"
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label>
        <span>Details</span>
        <textarea
          rows={4}
          value={body}
          maxLength={communityLimits.post.max}
          placeholder="Share the steps. Describe what you tried and what happened."
          onChange={(event) => setBody(event.target.value)}
        />
      </label>
      <div className="bb-composer-foot">
        <small>
          {body.length}/{communityLimits.post.max}
        </small>
        <button
          className="bb-button bb-button-primary"
          type="submit"
          disabled={busy || !title.trim() || !body.trim()}
        >
          {busy ? 'Posting…' : `Post to ${street.name}`}
        </button>
      </div>
      {error && (
        <p role="alert" className="bb-notice">
          {error}
        </p>
      )}
    </form>
  );
}

function Comments({ postId, count, onCountChange }) {
  const [comments, setComments] = useState(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    request(`posts/${postId}/comments`, { signal: controller.signal })
      .then((data) => setComments(data.comments))
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [postId]);
  async function reply(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await request(`posts/${postId}/comments`, {
        method: 'POST',
        body: { body: draft },
      });
      setComments((previous) => [...(previous || []), data.comment]);
      setDraft('');
      onCountChange(count + 1);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="bb-comments">
      {!comments && !error && (
        <p role="status" className="bb-journey-note">
          Loading replies…
        </p>
      )}
      {comments?.map((comment) => (
        <div className="bb-comment" key={comment.id}>
          <p className="bb-post-meta">
            {comment.author.name} · {comment.author.block} · {timeAgo(comment.createdAt)}
          </p>
          <p className="bb-post-text">{comment.body}</p>
        </div>
      ))}
      {comments && !comments.length && (
        <p className="bb-journey-note">No replies yet. Be the first to help.</p>
      )}
      <form className="bb-comment-form" onSubmit={reply}>
        <input
          aria-label="Write a reply"
          value={draft}
          maxLength={communityLimits.comment.max}
          placeholder="Write a helpful reply"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="bb-button bb-button-soft" type="submit" disabled={busy || !draft.trim()}>
          Reply
        </button>
      </form>
      {error && (
        <p role="alert" className="bb-notice">
          {error}
        </p>
      )}
    </div>
  );
}

function PostCard({ post, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  async function vote() {
    setError('');
    try {
      const data = await request(`posts/${post.id}/vote`, { method: 'POST', body: {} });
      onUpdate({ id: post.id, votes: data.votes, voted: data.voted });
    } catch (failure) {
      setError(failure.message);
    }
  }
  return (
    <li className="bb-post">
      <button
        type="button"
        className="bb-vote"
        aria-pressed={post.voted}
        aria-label={`${post.voted ? 'Remove your vote from' : 'Vote for'} ${post.title}`}
        onClick={vote}
      >
        <Icon name="heart" size={18} />
        <span>{post.votes}</span>
      </button>
      <div className="bb-post-main">
        <h3>{post.title}</h3>
        <p className="bb-post-meta">
          {post.author.name} · {post.author.block} · {timeAgo(post.createdAt)}
        </p>
        <p className="bb-post-text">{post.body}</p>
        <button
          type="button"
          className="bb-post-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {post.comments} {post.comments === 1 ? 'reply' : 'replies'}
        </button>
        {open && (
          <Comments
            postId={post.id}
            count={post.comments}
            onCountChange={(comments) => onUpdate({ id: post.id, comments })}
          />
        )}
        {error && (
          <p role="alert" className="bb-notice">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}

function StreetView({ street, onBack, onChanged }) {
  const [sort, setSort] = useState('new');
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setPosts(null);
    setError('');
    request(`posts?street=${street.id}&sort=${sort}`, { signal: controller.signal })
      .then((data) => setPosts(data.posts))
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [street.id, sort, reloadKey]);
  function updatePost(next) {
    setPosts((previous) =>
      previous.map((post) => (post.id === next.id ? { ...post, ...next } : post))
    );
  }
  return (
    <section className="bb-street">
      <div className="bb-street-head">
        <button type="button" className="bb-button bb-button-secondary" onClick={onBack}>
          <Icon name="back" size={16} /> The map
        </button>
        <div>
          <h2>{street.name}</h2>
          <p>{street.tagline}</p>
        </div>
      </div>
      <Composer
        street={street}
        onPosted={() => {
          setReloadKey((value) => value + 1);
          onChanged();
        }}
      />
      <div className="bb-sort" role="group" aria-label="Sort posts">
        {[
          ['new', 'Newest'],
          ['top', 'Most loved'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={sort === value}
            className={sort === value ? 'bb-tag bb-tag-orange' : 'bb-tag'}
            onClick={() => setSort(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="bb-notice">
          {error}{' '}
          <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
            Try again
          </button>
        </p>
      )}
      {!posts && !error && (
        <p role="status" className="bb-journey-note">
          Loading posts…
        </p>
      )}
      {posts && !posts.length && (
        <p className="bb-journey-note">The street is quiet. Your post could be the first.</p>
      )}
      {posts && posts.length > 0 && (
        <ul className="bb-post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={updatePost} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Rules() {
  return (
    <section className="bb-panel bb-boulevard-rules">
      <div className="bb-panel-heading">
        <h2>Boulevard rules</h2>
        <span>Keep the street friendly</span>
      </div>
      <ul>
        <li>Be kind. Everyone on the boulevard was a beginner once.</li>
        <li>Only test systems you own or that are built for practice, like the labs.</li>
        <li>Never share someone else’s data, passwords or private files.</li>
        <li>Stuck? Ask Honey first, then post in Honeypot Heights and show what you tried.</li>
      </ul>
    </section>
  );
}

export default function Community() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [streetId, setStreetId] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    request('overview', { signal: controller.signal })
      .then((data) => {
        setOverview(data);
        setError('');
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [reloadKey]);
  const street = overview?.streets.find((item) => item.id === streetId);
  return (
    <AppShell active="community" eyebrow="Breach Boulevard" title="Community">
      <section className="bb-hero bb-boulevard-hero">
        <div className="bb-hero-copy">
          <span className="bb-eyebrow">
            <Icon name="heart" size={14} /> THE BOULEVARD IS OPEN
          </span>
          <h1>
            Welcome to the boulevard<span className="bb-orange">.</span>
          </h1>
          <p>
            Walk a street, share what you found, ask for help without fear, and cheer on everyone
            else breaking things safely in the labs.
          </p>
        </div>
        {overview && <RankCard rank={overview.you.rank} />}
      </section>
      {error && (
        <p role="alert" className="bb-notice">
          {error}{' '}
          <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
            Try again
          </button>
        </p>
      )}
      {street ? (
        <StreetView
          key={street.id}
          street={street}
          onBack={() => setStreetId('')}
          onChanged={() => setReloadKey((value) => value + 1)}
        />
      ) : (
        <StreetMap streets={overview?.streets} onOpen={setStreetId} />
      )}
      <Rules />
    </AppShell>
  );
}

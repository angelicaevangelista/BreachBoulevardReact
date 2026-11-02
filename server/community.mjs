import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { communityLimits, communityStreets, rankFor } from '../src/data/community.js';
import { projectRoot, readServerConfig } from './config.mjs';
import { SupabaseAccessCodes } from './supabase.mjs';

const streetIds = new Set(communityStreets.map((street) => street.id));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export class CommunityError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function cleanText(value, { min, max, label, multiline = false }) {
  if (typeof value !== 'string') throw new CommunityError(400, `${label} is required.`);
  const control = multiline
    ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g
    : /[\u0000-\u001f\u007f]/g;
  const text = value.replace(/\r\n?/g, '\n').replace(control, '').trim();
  if (text.length < min) throw new CommunityError(400, `${label} is required.`);
  if (text.length > max)
    throw new CommunityError(400, `${label} must be ${max} characters or fewer.`);
  return text;
}

function displayName(user) {
  const fullName =
    typeof user?.user_metadata?.bb_display_name === 'string'
      ? user.user_metadata.bb_display_name
      : typeof user?.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : '';
  const name = fullName
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 40);
  return (
    name || `Learner-${createHash('sha256').update(String(user.id)).digest('hex').slice(0, 4)}`
  );
}

export function learnerProfile(user, completedCount) {
  return { id: String(user.id), name: displayName(user), rank: rankFor(completedCount) };
}

function publicPost(post, viewerId) {
  return {
    id: post.id,
    street: post.street,
    title: post.title,
    body: post.body,
    author: { name: post.authorName, block: post.authorBlock },
    createdAt: post.createdAt,
    votes: post.voters.length,
    voted: Boolean(viewerId) && post.voters.includes(viewerId),
    comments: post.comments,
  };
}

function publicComment(comment) {
  return {
    id: comment.id,
    body: comment.body,
    author: { name: comment.authorName, block: comment.authorBlock },
    createdAt: comment.createdAt,
  };
}

function sortPosts(posts, sort) {
  return [...posts].sort((a, b) =>
    sort === 'top'
      ? b.votes - a.votes || b.createdAt.localeCompare(a.createdAt)
      : b.createdAt.localeCompare(a.createdAt)
  );
}

export class FileCommunityStore {
  constructor(directory = path.join(projectRoot, '.data/community')) {
    this.directory = directory;
    this.file = path.join(directory, 'community.json');
    this.queue = Promise.resolve();
  }
  async read() {
    try {
      const data = JSON.parse(await fs.readFile(this.file, 'utf8'));
      return { posts: data.posts || [], comments: data.comments || [] };
    } catch (error) {
      if (error.code === 'ENOENT') return { posts: [], comments: [] };
      throw error;
    }
  }
  mutate(change) {
    const run = this.queue.then(async () => {
      const data = await this.read();
      const result = change(data);
      await fs.mkdir(this.directory, { recursive: true });
      const temporary = `${this.file}.${randomUUID()}.tmp`;
      await fs.writeFile(temporary, JSON.stringify(data));
      await fs.rename(temporary, this.file);
      return result;
    });
    this.queue = run.catch(() => {});
    return run;
  }
  present(data, post, viewerId) {
    const comments = data.comments.filter((comment) => comment.postId === post.id).length;
    return publicPost({ ...post, comments }, viewerId);
  }
  async listPosts({ street, sort, viewerId }) {
    const data = await this.read();
    const posts = data.posts.filter((post) => !street || post.street === street);
    return sortPosts(
      posts.map((post) => this.present(data, post, viewerId)),
      sort
    );
  }
  async createPost({ street, title, body, author, viewerId }) {
    return this.mutate((data) => {
      const post = {
        id: randomUUID(),
        street,
        title,
        body,
        authorId: author.id,
        authorName: author.name,
        authorBlock: author.block,
        createdAt: new Date().toISOString(),
        voters: [],
      };
      data.posts.push(post);
      return this.present(data, post, viewerId);
    });
  }
  async toggleVote({ postId, viewerId }) {
    return this.mutate((data) => {
      const post = data.posts.find((item) => item.id === postId);
      if (!post) throw new CommunityError(404, 'That post could not be found.');
      post.voters = post.voters.includes(viewerId)
        ? post.voters.filter((id) => id !== viewerId)
        : [...post.voters, viewerId];
      return { votes: post.voters.length, voted: post.voters.includes(viewerId) };
    });
  }
  async listComments(postId) {
    const data = await this.read();
    if (!data.posts.some((post) => post.id === postId))
      throw new CommunityError(404, 'That post could not be found.');
    return data.comments
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(publicComment);
  }
  async addComment({ postId, body, author }) {
    return this.mutate((data) => {
      if (!data.posts.some((post) => post.id === postId))
        throw new CommunityError(404, 'That post could not be found.');
      const comment = {
        id: randomUUID(),
        postId,
        body,
        authorId: author.id,
        authorName: author.name,
        authorBlock: author.block,
        createdAt: new Date().toISOString(),
      };
      data.comments.push(comment);
      return publicComment(comment);
    });
  }
  async streetCounts() {
    const data = await this.read();
    return data.posts.reduce((counts, post) => {
      counts[post.street] = (counts[post.street] || 0) + 1;
      return counts;
    }, {});
  }
}

export class SupabaseCommunityStore {
  constructor({ config, fetch: transport = globalThis.fetch } = {}) {
    this.config = config;
    this.fetch = transport;
  }
  client() {
    if (!this.supabase)
      this.supabase = new SupabaseAccessCodes(this.config || readServerConfig(), {
        fetch: this.fetch,
      });
    return this.supabase;
  }
  request(method, endpoint, body, representation) {
    return this.client().request(method, endpoint, body, representation);
  }
  async postExists(postId) {
    const rows = await this.request(
      'GET',
      `breach_community_posts?select=id&id=eq.${postId}&limit=1`
    );
    if (!rows?.length) throw new CommunityError(404, 'That post could not be found.');
  }
  async voteMap(postIds) {
    if (!postIds.length) return new Map();
    const rows = await this.request(
      'GET',
      `breach_community_votes?select=post_id,user_id&post_id=in.(${postIds.join(',')})`
    );
    const map = new Map();
    for (const row of rows || []) {
      if (!map.has(row.post_id)) map.set(row.post_id, []);
      map.get(row.post_id).push(row.user_id);
    }
    return map;
  }
  async commentCounts(postIds) {
    if (!postIds.length) return new Map();
    const rows = await this.request(
      'GET',
      `breach_community_comments?select=post_id&post_id=in.(${postIds.join(',')})`
    );
    const map = new Map();
    for (const row of rows || []) map.set(row.post_id, (map.get(row.post_id) || 0) + 1);
    return map;
  }
  toPost(row, voters, comments, viewerId) {
    return publicPost(
      {
        id: row.id,
        street: row.street,
        title: row.title,
        body: row.body,
        authorName: row.author_name,
        authorBlock: row.author_block,
        createdAt: row.created_at,
        voters,
        comments,
      },
      viewerId
    );
  }
  async listPosts({ street, sort, viewerId }) {
    const filter = street ? `&street=eq.${street}` : '';
    const rows =
      (await this.request(
        'GET',
        `breach_community_posts?select=*&order=created_at.desc&limit=100${filter}`
      )) || [];
    const ids = rows.map((row) => row.id);
    const [votes, comments] = await Promise.all([this.voteMap(ids), this.commentCounts(ids)]);
    return sortPosts(
      rows.map((row) =>
        this.toPost(row, votes.get(row.id) || [], comments.get(row.id) || 0, viewerId)
      ),
      sort
    );
  }
  async createPost({ street, title, body, author, viewerId }) {
    const [row] = await this.request(
      'POST',
      'breach_community_posts',
      {
        street,
        title,
        body,
        author_id: author.id,
        author_name: author.name,
        author_block: author.block,
      },
      true
    );
    return this.toPost(row, [], 0, viewerId);
  }
  async toggleVote({ postId, viewerId }) {
    await this.postExists(postId);
    const existing = await this.request(
      'GET',
      `breach_community_votes?select=user_id&post_id=eq.${postId}&user_id=eq.${encodeURIComponent(viewerId)}&limit=1`
    );
    if (existing?.length)
      await this.request(
        'DELETE',
        `breach_community_votes?post_id=eq.${postId}&user_id=eq.${encodeURIComponent(viewerId)}`
      );
    else
      await this.request('POST', 'breach_community_votes', {
        post_id: postId,
        user_id: viewerId,
      });
    const votes = await this.voteMap([postId]);
    const voters = votes.get(postId) || [];
    return { votes: voters.length, voted: voters.includes(viewerId) };
  }
  async listComments(postId) {
    await this.postExists(postId);
    const rows =
      (await this.request(
        'GET',
        `breach_community_comments?select=*&post_id=eq.${postId}&order=created_at.asc&limit=200`
      )) || [];
    return rows.map((row) =>
      publicComment({
        id: row.id,
        body: row.body,
        authorName: row.author_name,
        authorBlock: row.author_block,
        createdAt: row.created_at,
      })
    );
  }
  async addComment({ postId, body, author }) {
    await this.postExists(postId);
    const [row] = await this.request(
      'POST',
      'breach_community_comments',
      {
        post_id: postId,
        body,
        author_id: author.id,
        author_name: author.name,
        author_block: author.block,
      },
      true
    );
    return publicComment({
      id: row.id,
      body: row.body,
      authorName: row.author_name,
      authorBlock: row.author_block,
      createdAt: row.created_at,
    });
  }
  async streetCounts() {
    const rows =
      (await this.request('GET', 'breach_community_posts?select=street&limit=5000')) || [];
    return rows.reduce((counts, row) => {
      counts[row.street] = (counts[row.street] || 0) + 1;
      return counts;
    }, {});
  }
}

export function createCommunityService({ store }) {
  const requireMethod = (method, allowed) => {
    if (!allowed.includes(method))
      throw new CommunityError(405, `Only ${allowed.join(' or ')} requests are allowed.`);
  };
  const requireStreet = (value) => {
    if (typeof value !== 'string' || !streetIds.has(value))
      throw new CommunityError(400, 'Choose a street on the map first.');
    return value;
  };
  const requirePostId = (value) => {
    if (!uuid.test(value)) throw new CommunityError(404, 'That post could not be found.');
    return value;
  };
  const author = (viewer) => ({
    id: viewer.id,
    name: viewer.name,
    block: viewer.rank.title,
  });
  return async function handleCommunity({ method, route, query, body, viewer }) {
    if (!viewer) throw new CommunityError(401, 'Sign in to continue.');
    if (route === '/api/community/overview') {
      requireMethod(method, ['GET']);
      const counts = await store.streetCounts();
      return {
        success: true,
        streets: communityStreets.map((street) => ({ ...street, posts: counts[street.id] || 0 })),
        you: { name: viewer.name, rank: viewer.rank },
      };
    }
    if (route === '/api/community/posts') {
      if (method === 'GET') {
        const street = query.get('street') ? requireStreet(query.get('street')) : '';
        const sort = query.get('sort') === 'top' ? 'top' : 'new';
        return {
          success: true,
          posts: await store.listPosts({ street, sort, viewerId: viewer.id }),
        };
      }
      requireMethod(method, ['POST']);
      const input = body || {};
      const post = await store.createPost({
        street: requireStreet(input.street),
        title: cleanText(input.title, { ...communityLimits.title, label: 'Title' }),
        body: cleanText(input.body, { ...communityLimits.post, label: 'Post', multiline: true }),
        author: author(viewer),
        viewerId: viewer.id,
      });
      return { success: true, post };
    }
    const vote = route.match(/^\/api\/community\/posts\/([^/]+)\/vote$/);
    if (vote) {
      requireMethod(method, ['POST']);
      const result = await store.toggleVote({
        postId: requirePostId(vote[1]),
        viewerId: viewer.id,
      });
      return { success: true, ...result };
    }
    const comments = route.match(/^\/api\/community\/posts\/([^/]+)\/comments$/);
    if (comments) {
      const postId = requirePostId(comments[1]);
      if (method === 'GET') return { success: true, comments: await store.listComments(postId) };
      requireMethod(method, ['POST']);
      const comment = await store.addComment({
        postId,
        body: cleanText((body || {}).body, {
          ...communityLimits.comment,
          label: 'Comment',
          multiline: true,
        }),
        author: author(viewer),
      });
      return { success: true, comment };
    }
    return null;
  };
}

begin;

-- Community posts, comments and votes. Only the server (service role) reads or writes these.
create table if not exists public.breach_community_posts (
  id uuid primary key default gen_random_uuid(),
  street text not null,
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 5 and 2000),
  author_id text not null,
  author_name text not null check (char_length(author_name) between 1 and 40),
  author_block text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.breach_community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.breach_community_posts (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 600),
  author_id text not null,
  author_name text not null check (char_length(author_name) between 1 and 40),
  author_block text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.breach_community_votes (
  post_id uuid not null references public.breach_community_posts (id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists breach_community_posts_street_created_idx
  on public.breach_community_posts (street, created_at desc);
create index if not exists breach_community_comments_post_idx
  on public.breach_community_comments (post_id, created_at);

alter table public.breach_community_posts enable row level security;
alter table public.breach_community_comments enable row level security;
alter table public.breach_community_votes enable row level security;

revoke all on table public.breach_community_posts from public, anon, authenticated;
revoke all on table public.breach_community_comments from public, anon, authenticated;
revoke all on table public.breach_community_votes from public, anon, authenticated;
grant select, insert, update, delete on table public.breach_community_posts to service_role;
grant select, insert, update, delete on table public.breach_community_comments to service_role;
grant select, insert, update, delete on table public.breach_community_votes to service_role;

comment on table public.breach_community_posts is
  'Breach Boulevard community posts; server-only access through the API.';

commit;

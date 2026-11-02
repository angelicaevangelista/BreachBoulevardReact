begin;
create table public.breach_request_limits (
  key_hash text primary key check(key_hash ~ '^[a-f0-9]{64}$'),
  hits integer not null check(hits > 0),
  expires_at timestamptz not null
);
create index breach_request_limits_expiry_idx on public.breach_request_limits(expires_at);
alter table public.breach_request_limits enable row level security;
revoke all on public.breach_request_limits from public, anon, authenticated;
grant select,insert,update,delete on public.breach_request_limits to service_role;

create function public.bb_consume_request_limit(p_key text, p_limit integer, p_window_seconds integer)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  v_hits integer;
  v_expiry timestamptz;
begin
  if p_key !~ '^[a-f0-9]{64}$' or p_limit not between 1 and 5000 or p_window_seconds not between 1 and 86400 then
    raise exception 'Invalid request limit' using errcode='22023';
  end if;
  delete from public.breach_request_limits where expires_at < v_now - interval '1 day';
  insert into public.breach_request_limits(key_hash,hits,expires_at)
  values(p_key,1,v_now+make_interval(secs=>p_window_seconds))
  on conflict(key_hash) do update set
    hits=case when public.breach_request_limits.expires_at <= v_now then 1 else public.breach_request_limits.hits+1 end,
    expires_at=case when public.breach_request_limits.expires_at <= v_now then excluded.expires_at else public.breach_request_limits.expires_at end
  where public.breach_request_limits.expires_at <= v_now or public.breach_request_limits.hits < p_limit
  returning hits,expires_at into v_hits,v_expiry;
  if v_hits is not null then return jsonb_build_object('allowed',true,'retry_after_seconds',0); end if;
  select expires_at into v_expiry from public.breach_request_limits where key_hash=p_key;
  return jsonb_build_object('allowed',false,'retry_after_seconds',greatest(1,ceil(extract(epoch from (v_expiry-v_now)))::integer));
end;
$$;
revoke all on function public.bb_consume_request_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.bb_consume_request_limit(text,integer,integer) to service_role;
comment on table public.breach_request_limits is 'Server-only atomic request counters. Stores keyed hashes, not raw IP addresses. No client access.';
commit;

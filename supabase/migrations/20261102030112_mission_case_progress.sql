begin;
create table public.breach_mission_progress(
 user_id uuid not null references auth.users(id) on delete cascade,
 case_id text not null check(case_id in ('midnight-premiere','honey-jar-heist','last-signal')),
 revision integer not null default 1 check(revision>0),
 state jsonb not null check(jsonb_typeof(state)='object' and octet_length(state::text)<=12000),
 updated_at timestamptz not null default now(),
 primary key(user_id,case_id)
);
alter table public.breach_mission_progress enable row level security;
revoke all on public.breach_mission_progress from public,anon,authenticated;
grant select,insert,update,delete on public.breach_mission_progress to service_role;
create function public.bb_save_mission_progress(p_user_id uuid,p_case_id text,p_revision integer,p_state jsonb)
returns setof public.breach_mission_progress language plpgsql security invoker set search_path='' as $$
begin
 if p_revision=0 then
  return query insert into public.breach_mission_progress(user_id,case_id,revision,state)
   values(p_user_id,p_case_id,1,p_state) on conflict(user_id,case_id) do nothing returning *;
 else
  return query update public.breach_mission_progress set revision=revision+1,state=p_state,updated_at=now()
   where user_id=p_user_id and case_id=p_case_id and revision=p_revision returning *;
 end if;
end;
$$;
revoke all on function public.bb_save_mission_progress(uuid,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.bb_save_mission_progress(uuid,text,integer,jsonb) to service_role;
comment on table public.breach_mission_progress is 'Private story-case notebooks and evidence. Accessed through verified learner APIs only.';
commit;

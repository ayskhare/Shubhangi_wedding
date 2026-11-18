-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.rooms (
  room_no    text primary key,
  guest_name text not null,
  people     int  not null default 1 check (people > 0),
  side       text not null check (side in ('bride','groom')),
  updated_at timestamptz default now()
);
alter table public.rooms enable row level security;
create policy "anyone can view"  on public.rooms for select using (true);
create policy "owner can add"    on public.rooms for insert to authenticated with check (true);
create policy "owner can edit"   on public.rooms for update to authenticated using (true) with check (true);
create policy "owner can delete" on public.rooms for delete to authenticated using (true);

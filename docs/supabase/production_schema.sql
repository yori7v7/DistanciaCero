-- ============================================================
-- Distancia Cero - Production Schema & RLS v1.0
-- Aplicar en SQL Editor del proyecto REAL de producción.
-- ============================================================

-- Extension required for gen_random_uuid()
create extension if not exists pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

-- 1. profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  local_slug text null,
  display_name text not null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_not_empty check (btrim(display_name) <> '')
);

create unique index if not exists profiles_local_slug_idx
  on public.profiles(local_slug) where local_slug is not null;

-- 2. relationship_spaces
create table if not exists public.relationship_spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint relationship_spaces_name_not_empty check (btrim(name) <> '')
);

create unique index if not exists relationship_spaces_slug_idx
  on public.relationship_spaces(slug) where slug is not null;

-- 3. universe_members
create table if not exists public.universe_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  constraint universe_members_role_check check (role in ('owner', 'partner', 'viewer')),
  constraint universe_members_space_user_unique unique (space_id, user_id)
);

create index if not exists universe_members_space_id_idx on public.universe_members(space_id);
create index if not exists universe_members_user_id_idx on public.universe_members(user_id);

-- 4. content_items
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete restrict,
  collection text not null,
  local_id text null,
  base_id text null,
  kind text not null,
  data jsonb not null,
  schema_version integer not null default 1,
  is_hidden boolean not null default false,
  created_by uuid null references public.profiles(id) on delete set null,
  updated_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  source text not null,
  constraint content_items_kind_check check (kind in ('local', 'override', 'hidden')),
  constraint content_items_collection_not_empty check (btrim(collection) <> ''),
  constraint content_items_source_not_empty check (btrim(source) <> ''),
  constraint content_items_identity_matches_kind check (
    (kind = 'local' and local_id is not null and btrim(local_id) <> '' and base_id is null)
    or (kind in ('override', 'hidden') and base_id is not null and btrim(base_id) <> '' and local_id is null)
  ),
  constraint content_items_hidden_flag_matches_kind check (is_hidden = (kind = 'hidden')),
  constraint content_items_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint content_items_schema_version_positive check (schema_version >= 1),
  constraint content_items_id_space_unique unique (id, space_id)
);

create index if not exists content_items_space_collection_idx on public.content_items(space_id, collection);

create unique index if not exists content_items_unique_local_id_idx
  on public.content_items(space_id, collection, local_id)
  where kind = 'local' and local_id is not null;

create unique index if not exists content_items_unique_base_kind_idx
  on public.content_items(space_id, collection, base_id, kind)
  where kind in ('override', 'hidden') and base_id is not null;

-- 5. content_events (audit log - append only)
create table if not exists public.content_events (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete restrict,
  content_item_id uuid null,
  collection text null,
  action text not null,
  actor_id uuid null references public.profiles(id) on delete set null,
  payload jsonb null,
  created_at timestamptz not null default now(),
  constraint content_events_action_not_empty check (btrim(action) <> ''),
  constraint content_events_action_check check (
    action in ('create','update','delete','hide','restore','import','media_attach','role_change')
  ),
  constraint content_events_item_space_fk foreign key (content_item_id, space_id)
    references public.content_items(id, space_id) on delete restrict
);

create index if not exists content_events_space_id_idx on public.content_events(space_id);

-- 6. media_assets
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete restrict,
  content_item_id uuid null,
  bucket text not null,
  path text not null,
  mime_type text null,
  size_bytes integer null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint media_assets_bucket_not_empty check (btrim(bucket) <> ''),
  constraint media_assets_path_not_empty check (btrim(path) <> ''),
  constraint media_assets_size_positive check (size_bytes is null or size_bytes > 0),
  constraint media_assets_item_space_fk foreign key (content_item_id, space_id)
    references public.content_items(id, space_id) on delete restrict
);

create unique index if not exists media_assets_bucket_path_idx on public.media_assets(bucket, path);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists relationship_spaces_set_updated_at on public.relationship_spaces;
create trigger relationship_spaces_set_updated_at
  before update on public.relationship_spaces
  for each row execute function public.set_updated_at();

drop trigger if exists content_items_set_updated_at on public.content_items;
create trigger content_items_set_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS: ENABLE
-- ============================================================
alter table if exists public.profiles enable row level security;
alter table if exists public.relationship_spaces enable row level security;
alter table if exists public.universe_members enable row level security;
alter table if exists public.content_items enable row level security;
alter table if exists public.content_events enable row level security;
alter table if exists public.media_assets enable row level security;

-- ============================================================
-- RLS HELPER FUNCTIONS
-- ============================================================
create or replace function public.is_space_member(space_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
    and exists (
      select 1 from public.universe_members as member
      where member.space_id = space_uuid and member.user_id = auth.uid()
    );
$$;

create or replace function public.has_space_role(space_uuid uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
    and exists (
      select 1 from public.universe_members as member
      where member.space_id = space_uuid
        and member.user_id = auth.uid()
        and member.role = any(allowed_roles)
    );
$$;

create or replace function public.can_read_space(space_uuid uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select public.is_space_member(space_uuid);
$$;

create or replace function public.can_write_space(space_uuid uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select public.has_space_role(space_uuid, array['owner', 'partner']::text[]);
$$;

-- Grant helper functions to authenticated users only
revoke all on function public.is_space_member(uuid) from public, anon;
revoke all on function public.has_space_role(uuid, text[]) from public, anon;
revoke all on function public.can_read_space(uuid) from public, anon;
revoke all on function public.can_write_space(uuid) from public, anon;

grant execute on function public.is_space_member(uuid) to authenticated;
grant execute on function public.has_space_role(uuid, text[]) to authenticated;
grant execute on function public.can_read_space(uuid) to authenticated;
grant execute on function public.can_write_space(uuid) to authenticated;

-- ============================================================
-- TABLE GRANTS
-- ============================================================
revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.relationship_spaces from public, anon, authenticated;
revoke all on table public.universe_members from public, anon, authenticated;
revoke all on table public.content_items from public, anon, authenticated;
revoke all on table public.content_events from public, anon, authenticated;
revoke all on table public.media_assets from public, anon, authenticated;

-- Read access for authenticated users (filtered by RLS)
grant select on table public.profiles to authenticated;
grant select on table public.relationship_spaces to authenticated;
grant select on table public.universe_members to authenticated;
grant select, insert, update on table public.content_items to authenticated;
grant select on table public.content_events to authenticated;
grant select on table public.media_assets to authenticated;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles: can read own profile + profiles of people in same space
create policy "profiles_select_own_or_shared_space"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.universe_members as self_member
    join public.universe_members as other_member
      on other_member.space_id = self_member.space_id
    where self_member.user_id = auth.uid()
      and other_member.user_id = profiles.id
  )
);

-- profiles: can update own display_name and avatar_url only
create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- relationship_spaces: members can read their spaces
create policy "relationship_spaces_select_member"
on public.relationship_spaces for select to authenticated
using (public.can_read_space(id));

-- universe_members: members can read members of their spaces
create policy "universe_members_select_same_space"
on public.universe_members for select to authenticated
using (public.can_read_space(space_id));

-- content_items: members can read their space's content
create policy "content_items_select_member"
on public.content_items for select to authenticated
using (public.can_read_space(space_id));

-- content_items: owner/partner can insert to their space
-- Column-level security: id, created_at, updated_at use defaults;
-- space_id must match a space where user has write access
create policy "content_items_insert_member"
on public.content_items for insert to authenticated
with check (
  public.can_write_space(space_id)
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

-- content_items: owner/partner can update in their space
create policy "content_items_update_member"
on public.content_items for update to authenticated
using (public.can_write_space(space_id))
with check (public.can_write_space(space_id));

-- content_events: members can read audit log
create policy "content_events_select_member"
on public.content_events for select to authenticated
using (public.can_read_space(space_id));

-- media_assets: members can read media metadata
create policy "media_assets_select_member"
on public.media_assets for select to authenticated
using (public.can_read_space(space_id));

-- ============================================================
-- BOOTSTRAP FUNCTION: create space with owner
-- Call this once after creating the first two Auth users.
-- ============================================================
create or replace function public.bootstrap_space(
  space_name text,
  space_slug text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  new_space_id uuid;
begin
  -- Only authenticated users can bootstrap
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  -- Create the space
  insert into public.relationship_spaces (name, slug, created_by)
  values (space_name, space_slug, auth.uid())
  returning id into new_space_id;

  -- Add creator as owner
  insert into public.universe_members (space_id, user_id, role)
  values (new_space_id, auth.uid(), 'owner');

  return new_space_id;
end;
$$;

revoke all on function public.bootstrap_space(text, text) from public, anon;
grant execute on function public.bootstrap_space(text, text) to authenticated;

-- ============================================================
-- BOOTSTRAP FUNCTION: add partner to existing space
-- Only an owner can add a partner.
-- ============================================================
create or replace function public.add_partner_to_space(
  target_space_id uuid,
  partner_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  -- Only space owners can add partners
  if not public.has_space_role(target_space_id, array['owner']::text[]) then
    raise exception 'Only space owners can add partners';
  end if;

  -- Prevent duplicate memberships
  if exists (
    select 1 from public.universe_members
    where space_id = target_space_id and user_id = partner_user_id
  ) then
    raise exception 'User is already a member of this space';
  end if;

  insert into public.universe_members (space_id, user_id, role)
  values (target_space_id, partner_user_id, 'partner');
end;
$$;

revoke all on function public.add_partner_to_space(uuid, uuid) from public, anon;
grant execute on function public.add_partner_to_space(uuid, uuid) to authenticated;

-- ============================================================
-- DONE. Schema + RLS + Bootstrap ready.
-- Next: create Auth users, then call bootstrap_space().
-- ============================================================

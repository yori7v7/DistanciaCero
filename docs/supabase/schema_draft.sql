-- Distancia Cero - Supabase schema draft
-- BORRADOR DOCUMENTAL: no ejecutar todavia.
-- Este archivo no es una migracion real y requiere revision antes de aplicarse.
-- No contiene datos reales, emails reales ni nombres privados.

-- Requerido para gen_random_uuid() en Postgres/Supabase.
create extension if not exists pgcrypto;

-- ============================================================
-- profiles
-- ============================================================
-- Proposito:
--   Perfil de usuario asociado a auth.users.
-- Riesgo:
--   Los ids locales local-yori/local-ale NO son estos UUIDs.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  local_slug text unique null,
  display_name text not null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_display_name_not_empty check (btrim(display_name) <> '')
);

create unique index if not exists profiles_local_slug_idx
  on public.profiles(local_slug)
  where local_slug is not null;

-- ============================================================
-- relationship_spaces
-- ============================================================
-- Proposito:
--   Universo privado compartido. Todo contenido remoto debe tener space_id.

create table if not exists public.relationship_spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint relationship_spaces_name_not_empty check (btrim(name) <> '')
);

create unique index if not exists relationship_spaces_slug_idx
  on public.relationship_spaces(slug)
  where slug is not null;

create index if not exists relationship_spaces_created_by_idx
  on public.relationship_spaces(created_by);

-- ============================================================
-- universe_members
-- ============================================================
-- Proposito:
--   Membership y rol dentro de un relationship_space.
-- Riesgo:
--   Evitar self-owner y evitar borrar el ultimo owner requiere reglas extra.

create table if not exists public.universe_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),

  constraint universe_members_role_check check (role in ('owner', 'partner', 'viewer')),
  constraint universe_members_space_user_unique unique (space_id, user_id)
);

create index if not exists universe_members_space_id_idx
  on public.universe_members(space_id);

create index if not exists universe_members_user_id_idx
  on public.universe_members(user_id);

create unique index if not exists universe_members_space_user_idx
  on public.universe_members(space_id, user_id);

-- ============================================================
-- content_items
-- ============================================================
-- Proposito:
--   Contenido editable remoto: locales, overrides y hidden.
-- Mapping conceptual:
--   content.<collection>   -> kind = 'local'
--   overrides.<collection> -> kind = 'override'
--   hidden.<collection>    -> kind = 'hidden' o tabla separada futura

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete cascade,
  collection text not null,
  local_id text null,
  base_id text null,
  kind text not null,
  data jsonb not null,
  is_hidden boolean not null default false,
  created_by uuid null references public.profiles(id) on delete set null,
  updated_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null,

  constraint content_items_kind_check check (kind in ('local', 'override', 'hidden')),
  constraint content_items_collection_not_empty check (btrim(collection) <> ''),
  constraint content_items_source_not_empty check (btrim(source) <> ''),
  constraint content_items_override_requires_base_id check (
    kind <> 'override' or base_id is not null
  ),
  constraint content_items_hidden_requires_base_id check (
    kind <> 'hidden' or base_id is not null
  )
);

create index if not exists content_items_space_id_idx
  on public.content_items(space_id);

create index if not exists content_items_collection_idx
  on public.content_items(collection);

create index if not exists content_items_kind_idx
  on public.content_items(kind);

create index if not exists content_items_base_id_idx
  on public.content_items(base_id);

create index if not exists content_items_local_id_idx
  on public.content_items(local_id);

create index if not exists content_items_space_collection_idx
  on public.content_items(space_id, collection);

create index if not exists content_items_space_kind_idx
  on public.content_items(space_id, kind);

-- ============================================================
-- content_events
-- ============================================================
-- Proposito:
--   Auditoria conceptual. Puede diferirse si complica el primer MVP remoto.
-- Cuidado:
--   payload no debe guardar secretos ni snapshots sensibles innecesarios.

create table if not exists public.content_events (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete cascade,
  content_item_id uuid null references public.content_items(id) on delete set null,
  collection text null,
  action text not null,
  actor_id uuid null references public.profiles(id) on delete set null,
  payload jsonb null,
  created_at timestamptz not null default now(),

  constraint content_events_action_not_empty check (btrim(action) <> '')
);

create index if not exists content_events_space_id_idx
  on public.content_events(space_id);

create index if not exists content_events_content_item_id_idx
  on public.content_events(content_item_id);

create index if not exists content_events_actor_id_idx
  on public.content_events(actor_id);

create index if not exists content_events_created_at_idx
  on public.content_events(created_at);

-- ============================================================
-- media_assets
-- ============================================================
-- Proposito:
--   Metadata de archivos privados en Supabase Storage.
-- Cuidado:
--   Data URL es compatibilidad local/export, no solucion final en Postgres.

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.relationship_spaces(id) on delete cascade,
  content_item_id uuid null references public.content_items(id) on delete set null,
  bucket text not null,
  path text not null,
  mime_type text null,
  size_bytes integer null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint media_assets_bucket_not_empty check (btrim(bucket) <> ''),
  constraint media_assets_path_not_empty check (btrim(path) <> ''),
  constraint media_assets_size_positive check (size_bytes is null or size_bytes > 0)
);

create index if not exists media_assets_space_id_idx
  on public.media_assets(space_id);

create index if not exists media_assets_content_item_id_idx
  on public.media_assets(content_item_id);

create index if not exists media_assets_created_by_idx
  on public.media_assets(created_by);

create unique index if not exists media_assets_bucket_path_idx
  on public.media_assets(bucket, path);

-- Fin del borrador de schema.
-- Pendiente:
--   - Triggers updated_at.
--   - RLS final.
--   - Storage policies.
--   - Decision hidden kind vs tabla separada.
--   - Versionado de data jsonb.

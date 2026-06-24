-- Distancia Cero - Supabase schema draft
-- BORRADOR DOCUMENTAL REFINADO EN S4.6.2.1: no ejecutar todavia.
-- No ha sido aplicado y NO es una migracion idempotente para schemas existentes.
-- Los IF NOT EXISTS no reconcilian drift ni reemplazan migrations versionadas.
-- Requiere RLS refinado y pruebas en un entorno aislado antes de cualquier uso.
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
  local_slug text null,
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
  slug text null,
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
  space_id uuid not null references public.relationship_spaces(id) on delete restrict,
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

-- ============================================================
-- content_items
-- ============================================================
-- Proposito:
--   Contenido editable remoto: locales, overrides y hidden.
-- Mapping conceptual:
--   content.<collection>   -> kind = 'local'
--   overrides.<collection> -> kind = 'override'
--   hidden.<collection>    -> kind = 'hidden'
-- Recomendacion actual:
--   Usar kind = 'hidden' como ruta principal.
--   is_hidden se conserva como ayuda compatible de query/import y un check
--   impide que diverja de kind. Puede eliminarse en una revision futura.
--   data jsonb es flexible, pero debe versionarse con schema_version.
--   deleted_at implementa soft delete para local/override/hidden.

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
    (
      kind = 'local'
      and local_id is not null
      and btrim(local_id) <> ''
      and base_id is null
    )
    or
    (
      kind in ('override', 'hidden')
      and base_id is not null
      and btrim(base_id) <> ''
      and local_id is null
    )
  ),
  constraint content_items_hidden_flag_matches_kind check (
    is_hidden = (kind = 'hidden')
  ),
  constraint content_items_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint content_items_schema_version_positive check (schema_version >= 1),
  constraint content_items_id_space_unique unique (id, space_id)
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

-- Evitar duplicados conceptuales por tipo de contenido.
create unique index if not exists content_items_unique_local_id_idx
  on public.content_items(space_id, collection, local_id)
  where kind = 'local' and local_id is not null;

create unique index if not exists content_items_unique_base_kind_idx
  on public.content_items(space_id, collection, base_id, kind)
  where kind in ('override', 'hidden') and base_id is not null;

-- ============================================================
-- content_events
-- ============================================================
-- Proposito:
--   Auditoria conceptual. Puede diferirse si complica el primer MVP remoto.
-- Cuidado:
--   payload no debe guardar secretos ni snapshots sensibles innecesarios.
--   Mantener payload minimo/sanitizado. Si se requiere historial completo,
--   evaluar cifrado, retencion y permisos antes de guardar contenido sensible.
--   action podria pasar a enum real; aqui queda como check conceptual.
--   Esta tabla se disena como append-only: no usa updated_at ni deleted_at.
--   RLS/trigger/RPC debe impedir update/delete e insert cliente libre.
--   El draft todavia no garantiza auditoria confiable por si solo.

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
    action in (
      'create',
      'update',
      'delete',
      'hide',
      'restore',
      'import',
      'media_attach',
      'role_change'
    )
  ),
  constraint content_events_item_space_fk foreign key (content_item_id, space_id)
    references public.content_items(id, space_id) on delete restrict
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
--   media_assets.path debe mapear a storage.objects.name en el bucket futuro.
--   Storage real requiere policies separadas; esta tabla no protege objetos sola.
--   Definir cleanup de media huerfana al borrar/reemplazar content_item_id.

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

create index if not exists media_assets_space_id_idx
  on public.media_assets(space_id);

create index if not exists media_assets_content_item_id_idx
  on public.media_assets(content_item_id);

create index if not exists media_assets_created_by_idx
  on public.media_assets(created_by);

create unique index if not exists media_assets_bucket_path_idx
  on public.media_assets(bucket, path);

-- ============================================================
-- updated_at helper conceptual
-- ============================================================
-- BORRADOR:
--   Revisar permisos, owner, search_path y triggers finales antes de ejecutar.
--   Esta funcion existe para documentar que updated_at no debe depender
--   exclusivamente del cliente.
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

-- Fin del borrador de schema.
-- Pendiente:
--   - RLS final.
--   - Storage policies.
--   - Probar FKs compuestas, check is_hidden/kind y RESTRICT en entorno aislado.
--   - Revisar owner/grants del helper updated_at antes de SQL real.
--   - Definir RPC/trigger confiable para content_events append-only.
--   - Definir lifecycle y cleanup de media antes de permitir deletes.
--   - Definir versionado final de data jsonb por collection.
--   - Convertir este draft en migrations versionadas antes de un schema existente.

-- Distancia Cero - Supabase RLS draft
-- BORRADOR DOCUMENTAL: no ejecutar todavia.
-- Este archivo no es SQL final aplicable y requiere revision de seguridad.
-- No crea buckets, no usa service role y no cubre Storage real aun.

-- ============================================================
-- Enable RLS
-- ============================================================

alter table if exists public.profiles enable row level security;
alter table if exists public.relationship_spaces enable row level security;
alter table if exists public.universe_members enable row level security;
alter table if exists public.content_items enable row level security;
alter table if exists public.content_events enable row level security;
alter table if exists public.media_assets enable row level security;

-- ============================================================
-- Helper functions
-- ============================================================
-- BORRADOR:
--   Estas funciones asumen que profiles.id = auth.uid().
--   Deben revisarse para evitar recursion o bypass inesperado con RLS.

create or replace function public.is_space_member(space_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.universe_members
    where universe_members.space_id = space_uuid
      and universe_members.user_id = auth.uid()
  );
$$;

create or replace function public.has_space_role(space_uuid uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.universe_members
    where universe_members.space_id = space_uuid
      and universe_members.user_id = auth.uid()
      and universe_members.role = any(allowed_roles)
  );
$$;

-- ============================================================
-- profiles policies
-- ============================================================
-- Concepto:
--   El usuario lee su profile y perfiles de miembros de sus spaces.
--   El usuario solo actualiza campos permitidos de su propio profile.

create policy "profiles_select_own_or_shared_space"
on public.profiles
for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.universe_members self_member
    join public.universe_members other_member
      on other_member.space_id = self_member.space_id
    where self_member.user_id = auth.uid()
      and other_member.user_id = profiles.id
  )
);

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- ============================================================
-- relationship_spaces policies
-- ============================================================

create policy "relationship_spaces_select_member"
on public.relationship_spaces
for select
using (
  public.is_space_member(id)
);

create policy "relationship_spaces_insert_authenticated"
on public.relationship_spaces
for insert
with check (
  auth.uid() is not null
  and created_by = auth.uid()
);

create policy "relationship_spaces_update_owner_partner"
on public.relationship_spaces
for update
using (
  public.has_space_role(id, array['owner', 'partner'])
)
with check (
  public.has_space_role(id, array['owner', 'partner'])
);

-- No delete policy por ahora.
-- Borrado de spaces requiere plan de backup, cascade y cleanup de media.

-- ============================================================
-- universe_members policies
-- ============================================================

create policy "universe_members_select_same_space"
on public.universe_members
for select
using (
  public.is_space_member(space_id)
);

create policy "universe_members_insert_owner_only"
on public.universe_members
for insert
with check (
  public.has_space_role(space_id, array['owner'])
);

create policy "universe_members_update_owner_only"
on public.universe_members
for update
using (
  public.has_space_role(space_id, array['owner'])
)
with check (
  public.has_space_role(space_id, array['owner'])
);

create policy "universe_members_delete_owner_only"
on public.universe_members
for delete
using (
  public.has_space_role(space_id, array['owner'])
);

-- Pendiente:
--   - Impedir self-owner sin control.
--   - Impedir borrar el ultimo owner.
--   - Definir flujo seguro de invitaciones.

-- ============================================================
-- content_items policies
-- ============================================================
-- Concepto:
--   Nunca abrir acceso por collection sin validar membership.

create policy "content_items_select_member"
on public.content_items
for select
using (
  public.is_space_member(space_id)
);

create policy "content_items_insert_owner_partner"
on public.content_items
for insert
with check (
  public.has_space_role(space_id, array['owner', 'partner'])
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

create policy "content_items_update_owner_partner"
on public.content_items
for update
using (
  public.has_space_role(space_id, array['owner', 'partner'])
)
with check (
  public.has_space_role(space_id, array['owner', 'partner'])
  and updated_by = auth.uid()
);

create policy "content_items_delete_owner_partner"
on public.content_items
for delete
using (
  public.has_space_role(space_id, array['owner', 'partner'])
);

-- Recomendacion:
--   Preferir soft delete o kind='hidden' antes de delete real.

-- ============================================================
-- content_events policies
-- ============================================================
-- Concepto:
--   Audit log debe ser append-only desde cliente normal.

create policy "content_events_select_member"
on public.content_events
for select
using (
  public.is_space_member(space_id)
);

create policy "content_events_insert_owner_partner"
on public.content_events
for insert
with check (
  public.has_space_role(space_id, array['owner', 'partner'])
  and actor_id = auth.uid()
);

-- Sin update/delete policies normales para auditoria confiable.

-- ============================================================
-- media_assets policies
-- ============================================================

create policy "media_assets_select_member"
on public.media_assets
for select
using (
  public.is_space_member(space_id)
);

create policy "media_assets_insert_owner_partner"
on public.media_assets
for insert
with check (
  public.has_space_role(space_id, array['owner', 'partner'])
  and created_by = auth.uid()
);

create policy "media_assets_delete_owner_partner_or_creator"
on public.media_assets
for delete
using (
  public.has_space_role(space_id, array['owner', 'partner'])
  or created_by = auth.uid()
);

-- ============================================================
-- Storage conceptual notes
-- ============================================================
-- BORRADOR:
--   No se crea bucket aqui.
--   No se crean policies sobre storage.objects aqui.
--
-- Reglas futuras:
--   - Bucket privado.
--   - Path con space_id o referencia segura:
--       relationship-media/{space_id}/{media_asset_id}/{filename}
--   - Validar membership por space_id antes de leer/subir/borrar.
--   - No usar URLs publicas permanentes para fotos privadas.
--
-- Fin del borrador RLS.

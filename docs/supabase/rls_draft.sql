-- Distancia Cero - Supabase RLS draft
-- BORRADOR CANDIDATO PARA APLICACION MANUAL EN LABORATORIO DESECHABLE.
-- No ha sido aplicado ni probado como RLS draft y no es una migration final.
-- Requiere laboratorio desechable, schema aplicado, aprobacion humana y
-- evidencia sanitizada antes de cualquier ejecucion manual.
-- No ejecutar contra produccion. No contiene secretos ni datos reales.
-- No crea buckets, no usa service-role y no conecta la app al backend.
-- La ejecucion manual desde SQL Editor ocurre con rol privilegiado/owner del
-- laboratorio. Eso no valida acceso de usuarios autenticados ni reemplaza
-- pruebas con Auth, memberships y fixtures sinteticos en una fase posterior.

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
--   profiles.id debe corresponder a auth.uid() mediante mapping verificado.
--   Solo los dos helpers que consultan universe_members usan SECURITY DEFINER
--   para evitar recursion RLS. Los wrappers permanecen SECURITY INVOKER.
--   En aplicacion manual de laboratorio, el SQL Editor puede crear funciones
--   con owner privilegiado. Eso es aceptable solo para instalar el candidato,
--   pero no prueba el comportamiento del rol authenticated.
--   Antes de conectar runtime o datos reales, revisar owner, BYPASSRLS, grants
--   y recursion de helpers en el entorno aislado.
--   search_path limitado a pg_catalog y nombres calificados evitan que public
--   participe en la resolucion de objetos del SECURITY DEFINER.
--   Ningun helper escribe datos ni sustituye policies de tabla.

create or replace function public.is_space_member(space_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.universe_members as member
      where member.space_id = space_uuid
        and member.user_id = auth.uid()
    );
$$;

create or replace function public.has_space_role(
  space_uuid uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.universe_members as member
      where member.space_id = space_uuid
        and member.user_id = auth.uid()
        and member.role = any(allowed_roles)
    );
$$;

create or replace function public.is_space_owner(space_uuid uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select public.has_space_role(space_uuid, array['owner']::text[]);
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

create or replace function public.can_modify_space(space_uuid uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select public.has_space_role(space_uuid, array['owner', 'partner']::text[]);
$$;

-- Las funciones reciben EXECUTE de PUBLIC por defecto en PostgreSQL.
-- Revocar primero y conceder solo el minimo necesario al rol autenticado.
revoke all on function public.is_space_member(uuid) from public;
revoke all on function public.has_space_role(uuid, text[]) from public;
revoke all on function public.is_space_owner(uuid) from public;
revoke all on function public.can_read_space(uuid) from public;
revoke all on function public.can_modify_space(uuid) from public;

revoke all on function public.is_space_member(uuid) from anon;
revoke all on function public.has_space_role(uuid, text[]) from anon;
revoke all on function public.is_space_owner(uuid) from anon;
revoke all on function public.can_read_space(uuid) from anon;
revoke all on function public.can_modify_space(uuid) from anon;

grant execute on function public.is_space_member(uuid) to authenticated;
grant execute on function public.has_space_role(uuid, text[]) to authenticated;
grant execute on function public.is_space_owner(uuid) to authenticated;
grant execute on function public.can_read_space(uuid) to authenticated;
grant execute on function public.can_modify_space(uuid) to authenticated;

-- ============================================================
-- Table grants: deny by default
-- ============================================================
-- RLS no reemplaza grants. Se revoca acceso directo y se concede solo lo que
-- las policies documentales de esta fase permiten. RPCs futuras deben tener
-- grants propios, owner controlado y validacion transaccional.

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.relationship_spaces from public, anon, authenticated;
revoke all on table public.universe_members from public, anon, authenticated;
revoke all on table public.content_items from public, anon, authenticated;
revoke all on table public.content_events from public, anon, authenticated;
revoke all on table public.media_assets from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.relationship_spaces to authenticated;
grant select on table public.universe_members to authenticated;
grant select on table public.content_items to authenticated;
grant select on table public.content_events to authenticated;
grant select on table public.media_assets to authenticated;

-- NO-GO para writes directos:
-- No se concede escritura directa sobre public.content_items en este draft.
-- Una policy WITH CHECK no basta si los permisos SQL permiten insertar filas
-- completas: el cliente podria enviar id, timestamps, schema_version, source
-- u otras columnas sensibles antes de definir RPC/triggers/permisos por
-- columnas. Esto no bloquea aplicar el candidato RLS de lectura en laboratorio,
-- pero si bloquea cualquier escritura directa. La escritura real queda
-- pendiente de una fase futura con:
--   1. RPC/admin/trigger controlado y transaccional; o
--   2. permisos por columnas minimos revisados y probados.

-- ============================================================
-- profiles policies
-- ============================================================
-- Creacion: solo trigger/RPC/admin futuro vinculado a auth.users.
-- Update: bloqueado directamente hasta definir column-level grants o RPC que
-- limite display_name/avatar_url. RLS sola no impide cambiar local_slug.

create policy "profiles_select_own_or_shared_space"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.universe_members as self_member
    join public.universe_members as other_member
      on other_member.space_id = self_member.space_id
    where self_member.user_id = auth.uid()
      and other_member.user_id = profiles.id
  )
);

-- Sin INSERT/UPDATE/DELETE policy o grant directo para authenticated.

-- ============================================================
-- relationship_spaces policies
-- ============================================================

create policy "relationship_spaces_select_member"
on public.relationship_spaces
for select
to authenticated
using (
  public.can_read_space(id)
);

-- Sin INSERT directo: evita spaces huerfanos.
-- Sin UPDATE directo: protege created_by y otras columnas sensibles.
-- Sin DELETE directo: schema usa RESTRICT y falta backup/cleanup aprobado.
-- Bootstrap futuro debe ser una transaccion RPC/admin controlada que cree:
--   1. relationship_space;
--   2. primer universe_member owner;
--   3. partner opcional validado.
-- Nunca permitir self-owner mediante inserts libres del cliente.

-- ============================================================
-- universe_members policies
-- ============================================================

create policy "universe_members_select_same_space"
on public.universe_members
for select
to authenticated
using (
  public.can_read_space(space_id)
);

-- Sin INSERT/UPDATE/DELETE policy o grant directo para authenticated.
-- Alta, baja y cambio de role/user_id/space_id requieren RPC/admin futuro.
-- Ese flujo debe bloquear self-owner, operar de forma transaccional, auditar
-- cambios y rechazar degradar/eliminar al ultimo owner del space.

-- ============================================================
-- content_items policies
-- ============================================================

create policy "content_items_select_member"
on public.content_items
for select
to authenticated
using (
  public.can_read_space(space_id)
);

-- NO-GO: no hay policy activa de INSERT para content_items en este draft.
-- La creacion normal, imports legacy y escrituras administrativas requieren
-- mapping verificado y un RPC/admin/trigger flow que separe autor original de
-- actor importador y bloquee columnas sensibles.
-- Alternativa futura: permisos por columnas minimos, nunca permisos de fila
-- completa, revisados junto con triggers y matriz multiusuario.

-- Sin UPDATE directo hasta implementar trigger/RPC que preserve o valide:
--   space_id, kind, local_id, base_id, created_by, created_at, schema_version.
-- El mismo flujo debe fijar updated_by = auth.uid() y updated_at server-side.
-- Soft delete/restore se hara por UPDATE controlado de deleted_at.
-- Sin DELETE policy o grant: hard delete directo queda denegado.
-- No inventar created_by/updated_by para contenido legacy sin mapping.

-- ============================================================
-- content_events / audit policies
-- ============================================================
-- content_events es el audit log conceptual append-only de este schema.

create policy "content_events_select_member"
on public.content_events
for select
to authenticated
using (
  public.can_read_space(space_id)
);

-- Sin INSERT/UPDATE/DELETE policy o grant directo para authenticated.
-- Eventos confiables deben venir de trigger/RPC/admin, con payload minimo y
-- space_id derivado del recurso. La FK compuesta impide item cross-space.
-- Si aparece una tabla audit_log separada, debe heredar este mismo NO-GO.

-- ============================================================
-- media_assets policies
-- ============================================================

create policy "media_assets_select_member"
on public.media_assets
for select
to authenticated
using (
  public.can_read_space(space_id)
);

-- Sin INSERT/UPDATE/DELETE policy o grant directo hasta disenar el flujo
-- transaccional DB + Storage. La FK compuesta impide item cross-space.
-- Delete requiere membership actual, autorizacion, cleanup del objeto privado
-- y audit; no basta created_by historico.

-- ============================================================
-- Storage conceptual: NO-GO
-- ============================================================
-- No se crea bucket ni policy sobre storage.objects en este archivo.
-- media_assets NO protege por si sola los objetos de Storage.
-- Antes de habilitar media se requiere:
--   - bucket privado;
--   - path validado con space_id o relacion segura;
--   - SELECT/INSERT/UPDATE/DELETE de storage.objects por membership/role;
--   - URLs firmadas de vida corta;
--   - cleanup transaccional o compensatorio de objetos huerfanos;
--   - pruebas multiusuario en entorno aislado.
-- Hasta entonces, acceso DB a media_assets es solo lectura de metadata.

-- ============================================================
-- Condiciones para aplicacion manual del candidato
-- ============================================================
--   - Laboratorio Supabase desechable confirmado.
--   - docs/supabase/schema_draft.sql aplicado previamente en ese laboratorio.
--   - Cero datos reales, cero usuarios reales y cero media real.
--   - App/CRUD desconectado.
--   - No fixtures, reset ni Storage en la misma fase.
--   - Aprobacion humana explicita y evidencia sin secrets/project ref.

-- ============================================================
-- Limitaciones que bloquean runtime, writes y pruebas completas
-- ============================================================
--   - Auditar owner/BYPASSRLS de helpers SECURITY DEFINER con usuarios Auth.
--   - Implementar y revisar RPC bootstrap owner/partner transaccional.
--   - Proteger ultimo owner mediante RPC/trigger transaccional.
--   - Definir profile create/update con columnas permitidas.
--   - Definir content update, soft delete/restore e import administrativo.
--   - Generar content_events desde trigger/RPC confiable.
--   - Disenar policies reales de storage.objects y lifecycle de media.
--   - Preparar fixtures/reset sinteticos y matriz multiusuario.
--   - Convertir drafts en migrations versionadas y revisadas.

-- Fin del borrador RLS candidato. No ha sido aplicado ni probado todavia.

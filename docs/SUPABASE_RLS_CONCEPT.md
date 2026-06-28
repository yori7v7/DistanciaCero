# Distancia Cero - Supabase RLS Concept

## 1. Resumen

Este documento disena la Row Level Security futura para Supabase/Postgres de Distancia Cero. S4.6.2.2 refino el draft documental, pero no lo aplico ni lo probo en Supabase.

No aplica policies reales, no crea migraciones y no cambia runtime. Su objetivo es fijar reglas conceptuales antes de convertir los drafts en SQL aplicable y probarlo en un entorno aislado.

## 2. Principios de seguridad

- No confiar en filtros del cliente.
- Todo acceso debe validarse por membership en `relationship_space`.
- `auth.uid()` debe mapearse a `profiles.id`.
- El contenido privado no debe poder leerse fuera del universe/space.
- Storage/fotos deben protegerse igual que contenido.
- La app local sigue siendo fallback.
- Las policies no deben depender solo de `collection`.
- Las policies deben validar siempre `space_id`.
- RLS no sustituye permisos SQL: revocar acceso por defecto, conceder lectura
  solo donde exista policy de membership y dejar escrituras de contenido en
  NO-GO hasta RPC/trigger o permisos por columnas revisados.

## 3. Tablas protegidas

Tablas futuras que deben tener RLS:

- `profiles`
- `relationship_spaces`
- `universe_members`
- `content_items`
- `content_events` / `audit_log`
- `media_assets`
- Storage objects futuros

Tambien debe revisarse cualquier tabla auxiliar que contenga mapping local -> remoto, imports o manifests de media.

## 4. Membership como regla base

Regla conceptual:

Un usuario puede leer o escribir recursos de un space solo si existe una fila en `universe_members` donde:

```txt
universe_members.space_id = recurso.space_id
universe_members.user_id = auth.uid()
```

Para acciones de escritura debe validarse tambien rol:

```txt
universe_members.role in ('owner', 'partner')
```

El rol `viewer` solo debe leer si se decide permitirlo.

Solo los helpers que consultan `universe_members`, como `is_space_member` y `has_space_role`, necesitan `security definer` para evitar recursion RLS. Wrappers como `is_space_owner`, `can_read_space` y `can_modify_space` pueden permanecer `security invoker`. Esto requiere cuidado especial:

- owner controlado;
- grants minimos;
- `set search_path = pg_catalog` y nombres calificados, sin resolver objetos
  mediante el schema `public`;
- revision de recursion RLS;
- evitar que los helpers expongan membership de forma indirecta.
- revocar EXECUTE de `PUBLIC`/`anon` y conceder solo a `authenticated`;
- no usar service-role en frontend.

## 5. `profiles`

Reglas conceptuales:

- Cada usuario puede leer su propio profile.
- Miembros de un mismo `relationship_space` pueden leer perfiles de otros miembros del mismo space.
- La creacion debe ocurrir mediante trigger/RPC/admin controlado y vinculado a `auth.users`.
- El update directo queda bloqueado hasta limitar columnas mediante grants, RPC o trigger.
- Updates reales deben limitarse a columnas permitidas, por ejemplo `display_name` y `avatar_url`.
- No permitir que un usuario cambie su role global de forma arbitraria.
- No permitir que el cliente cambie `id`, `local_slug` ni columnas sensibles.
- No usar `profiles.role` como unica fuente de autorizacion para contenido del universe; usar membership.

Lectura conceptual:

```txt
profile.id = auth.uid()
or exists membership compartido entre auth.uid() y profile.id
```

Update futuro controlado:

```txt
profile.id = auth.uid()
and campos actualizables limitados a display_name/avatar_url
```

RLS no compara por si sola todas las columnas anteriores y nuevas. Hasta tener
column-level grants o RPC revisada, no debe existir grant/policy directa de
`insert`, `update` o `delete` para `authenticated`.

Riesgos:

- Exponer perfiles de usuarios externos.
- Permitir escalamiento de rol desde cliente.
- Confundir rol global con rol en `universe_members`.

## 6. `relationship_spaces`

Reglas:

- Leer solo spaces donde el usuario es miembro.
- No crear spaces mediante insert libre del cliente.
- No actualizar spaces directamente hasta limitar columnas sensibles.
- Updates reales deben limitar columnas permitidas, por ejemplo `name` y quiza `slug`.
- No permitir que `owner`/`partner` cambie campos sensibles como `created_by`.
- No borrar space sin plan.
- No permitir descubrir spaces por slug si el usuario no es miembro.

Bootstrap del primer owner:

- Crear `relationship_space` + primer `universe_member owner` no debe depender de una policy que ya exige owner.
- Flujo futuro recomendado: RPC controlada, Edge Function o migration/admin server-side.
- No permitir self-owner arbitrario desde cliente normal.

Select conceptual:

```txt
exists universe_members
where universe_members.space_id = relationship_spaces.id
and universe_members.user_id = auth.uid()
```

Bootstrap conceptual:

```txt
RPC/admin transaccional crea space + owner membership + partner opcional
```

Update futuro controlado:

```txt
has_space_role(relationship_spaces.id, ['owner', 'partner'])
and solo cambia columnas permitidas como name/slug
```

Delete conceptual:

- Bloqueado por defecto.
- Solo considerar despues de definir backups, cascade y cleanup de media.

## 7. `universe_members`

Reglas:

- Miembros pueden ver membresias del mismo space.
- No permitir insert/update/delete directo de memberships desde cliente.
- Solo un RPC/admin transaccional autorizado por `owner` puede agregar, cambiar o quitar miembros.
- Impedir que alguien se asigne role `owner` a si mismo desde cliente.
- Impedir borrar el ultimo owner.
- Cambios de role deben auditarse o pasar por RPC controlada.
- Mantener `unique(space_id, user_id)`.
- Cambios de roles deben auditarse.

Select conceptual:

```txt
is_space_member(universe_members.space_id)
```

Insert/update/delete futuro:

```txt
RPC/admin transaccional
and actor es owner actual
and no self-owner escalation
and no owner lockout
```

Riesgos:

- Self-owner.
- Expulsar al ultimo owner.
- Invitar usuarios al space incorrecto.

## 8. `content_items`

Reglas:

- `select` solo miembros del space.
- `insert` directo queda NO-GO en el draft actual.
- Escritura futura solo mediante RPC/trigger controlado o permisos por columnas
  minimos revisados; nunca permisos de fila completa sobre `content_items`.
- `update` directo queda bloqueado hasta proteger columnas sensibles.
- Hard delete directo queda denegado; soft delete/restore requiere RPC/update controlado.
- Validar `space_id` contra membership.
- No permitir leer por `collection` sin membership.
- Validar que `created_by`/`updated_by` correspondan al usuario actual o sean asignados por servidor/trigger.

Select conceptual:

```txt
is_space_member(content_items.space_id)
```

Insert futuro conceptual:

```txt
NO-GO para cliente directo en el draft actual.
has_space_role(content_items.space_id, ['owner', 'partner'])
and content_items.created_by = auth.uid()
and content_items.updated_by = auth.uid()
and columnas sensibles quedan fuera del input cliente o protegidas server-side
```

Update futuro controlado:

```txt
has_space_role(content_items.space_id, ['owner', 'partner'])
and updated_by = auth.uid()
and no cambia space_id/kind/local_id/base_id/created_by/created_at/schema_version
```

Delete conceptual:

- Preferir soft delete o `kind = hidden` segun decision de schema.
- Hard delete queda no recomendado/no final.
- No crear policy/grant de hard delete para cliente normal.
- Cualquier delete real futuro exige RPC/admin y audit obligatorio.

Riesgos:

- Policy abierta por `collection`.
- Permitir insertar contenido en `space_id` ajeno.
- Permitir falsificar `created_by` o `updated_by`.
- Borrar contenido sin audit log.

## 9. `content_events` / `audit_log`

Reglas:

- `select` solo miembros del space.
- No aceptar inserts arbitrarios desde cliente si se quiere auditoria confiable.
- Preferir trigger, RPC o server-side para construir eventos sanitizados.
- No permitir `update` normal.
- No permitir `delete` normal si se quiere auditoria confiable.
- Cuidar `payload` sensible.

Select conceptual:

```txt
is_space_member(content_events.space_id)
```

Insert futuro confiable:

```txt
RPC/trigger/admin construye evento sanitizado y deriva actor/space
```

Update/delete conceptual:

```txt
false
```

Riesgos:

- Guardar cartas completas o fotos en `payload`.
- Permitir que cliente edite o borre auditoria.
- Crecimiento rapido de eventos.

## 10. `media_assets` y Storage

Reglas para `media_assets`:

- `select` solo miembros del space.
- Insert/update/delete quedan bloqueados hasta disenar el flujo DB + Storage.
- Delete futuro exige membership actual, autorizacion y cleanup del objeto.
- `space_id` obligatorio.
- `created_by` debe ser `auth.uid()` o asignarse por servidor.

Reglas para Storage:

- Bucket privado recomendado.
- El path debe incluir `space_id` o una referencia segura.
- No usar URLs publicas permanentes para fotos privadas.
- Storage debe validar acceso por membership del space.
- No confiar solo en que el path sea dificil de adivinar.
- No confiar solo en prefijos del path sin validar membership.
- Policies futuras de `storage.objects` deben resolver `space_id` por path validado o join contra `media_assets`.

Path conceptual:

```txt
relationship-media/{space_id}/{media_asset_id}/{filename}
```

Select conceptual de `media_assets`:

```txt
is_space_member(media_assets.space_id)
```

Upload futuro controlado:

```txt
RPC/flujo Storage valida has_space_role(space_id, ['owner', 'partner'])
and mantiene metadata/objeto consistentes
```

Delete conceptual:

```txt
RPC/flujo Storage valida membership actual, role y cleanup
```

Riesgos:

- Bucket publico por error.
- URLs firmadas tratadas como permanentes.
- Archivos huerfanos.
- Mismatch entre `storage.objects.path` y `media_assets.space_id`.
- Borrar media solo por `created_by` aunque el usuario ya no sea miembro.

## 11. Politicas conceptuales tipo SQL

Estas pseudopolicies no son SQL final aplicable. Son una guia conceptual.

### Helper: `is_space_member(space_id)`

BORRADOR: si se implementa con `security definer`, revisar owner, grants, `search_path` y recursion RLS antes de aplicar SQL real.

```sql
exists (
  select 1
  from universe_members
  where universe_members.space_id = target_space_id
    and universe_members.user_id = auth.uid()
)
```

### Helper: `has_space_role(space_id, roles)`

BORRADOR: no debe exponer roles fuera del contexto de policies y debe validar siempre membership del usuario actual.

```sql
exists (
  select 1
  from universe_members
  where universe_members.space_id = target_space_id
    and universe_members.user_id = auth.uid()
    and universe_members.role = any(target_roles)
)
```

### SELECT `content_items`

```sql
using (
  is_space_member(content_items.space_id)
)
```

### Escritura `content_items` futura

```sql
-- NO-GO en el draft actual: no hay policy activa ni permiso SQL para escritura
-- directa de filas en content_items.
-- Futuro: RPC/admin/trigger o permisos por columnas minimos revisados.
```

### UPDATE `content_items` futuro

```sql
-- Sin policy/grant directo en el draft refinado.
-- Requiere RPC/trigger para columnas inmutables, updated_by y soft delete.
```

### SELECT `media_assets`

```sql
using (
  is_space_member(media_assets.space_id)
)
```

## 12. Riesgos

### Policy demasiado abierta por collection

Una policy como `collection = 'reasons'` no protege nada si no valida membership.

### Exponer fotos/cartas

Cartas y fotos son privadas. RLS y Storage deben tratarse como frontera real de seguridad.

### Permitir self-owner

Un usuario no debe poder asignarse `owner` desde el cliente.

### Roles mal definidos

Roles globales y roles por space no deben mezclarse sin reglas claras.

### Payload jsonb con datos sensibles

`payload` de audit log puede filtrar contenido privado si guarda snapshots completos.

### Storage publico por error

Un bucket publico anula buena parte de la seguridad de DB.

### Mismatch local IDs vs UUIDs reales

`local-yori`, `local-ale` y `distancia-cero-local-space` deben mapearse antes de migrar.

### Async y cache cliente

Cache local puede mostrar datos viejos si no se disena hidratacion/sync.

## 13. Validacion futura

Pruebas futuras obligatorias:

- Usuario externo no lee nada.
- Yori lee su space.
- Yori crea y edita contenido de su space.
- Ale lee su space.
- Ale crea y edita contenido de su space.
- Usuario de otro space no lee cartas.
- Usuario de otro space no lee fotos.
- Storage bloquea acceso no autorizado.
- `audit_log` no se puede alterar desde cliente normal.
- Un usuario no puede hacerse owner a si mismo.
- No se puede insertar contenido en un `space_id` ajeno.
- No se puede leer contenido solo por `collection`.

## 14. Veredicto

El RLS draft puede evolucionar a candidato de aplicacion manual solo para un
laboratorio Supabase desechable. No es produccion, no fue probado y no conecta
la app.

S4.6.2.1 refino el schema draft y S4.6.3.2.2 registro que ese schema fue
aplicado manualmente en laboratorio desechable. S4.6.3.3.0b prepara este RLS
draft como candidato para una subfase futura, manteniendo fuera de alcance
fixtures, reset, Storage y runtime.

Siguiente paso recomendado: una auditoria go/no-go para S4.6.3.3.1 antes de
cualquier aplicacion manual de RLS, con aprobacion humana separada.
`hidden` sigue recomendado como `kind = 'hidden'`.

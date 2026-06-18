# Distancia Cero - Supabase Schema Concept

## 1. Resumen

Este documento define el schema conceptual futuro para Supabase/Postgres de Distancia Cero.

No aplica migraciones reales, no instala Supabase y no cambia runtime. Su objetivo es servir como contrato previo para disenar SQL, RLS y migracion local -> remoto sin romper la app local actual.

## 2. Principios

- Los IDs locales no son UUIDs reales.
- `local-yori`, `local-ale` y `distancia-cero-local-space` requieren mapping explicito.
- Todo contenido remoto debe pertenecer a un `relationship_space`.
- Todo acceso futuro debe validarse por membership.
- El JSON base local sigue siendo fallback.
- Export/import v2 sigue siendo backup offline.
- Supabase no debe entrar directo en componentes.
- RLS debe disenarse antes de aplicar SQL real.

## 3. Tablas conceptuales

Tablas futuras propuestas:

- `profiles`
- `relationship_spaces`
- `universe_members`
- `content_items`
- `content_events` o `audit_log`
- `media_assets`

Estas tablas son conceptuales. Los nombres finales, constraints exactos y policies RLS deben confirmarse en una fase posterior.

## 4. `profiles`

### Proposito

Representar perfiles de usuario asociados a Supabase Auth y resolver nombre visible, avatar y datos publicos internos del universo.

### Columnas y tipos sugeridos

```sql
id uuid primary key references auth.users(id)
local_slug text unique null
display_name text not null
avatar_url text null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### Primary key

- `id`

### Foreign keys

- `id` referencia `auth.users(id)`.

### Indices sugeridos

```sql
create unique index profiles_local_slug_idx on profiles(local_slug) where local_slug is not null;
```

### Constraints/checks

- `display_name` no debe ser vacio.
- `local_slug` debe ser unico si existe.

### Riesgos

- Confundir `local-yori` / `local-ale` con UUIDs reales.
- Crear perfiles sin usuario Auth.
- Exponer perfiles fuera del relationship space si RLS se disena mal.

## 5. `relationship_spaces`

### Proposito

Representar el universo privado compartido donde viven contenido, miembros y media.

### Columnas y tipos sugeridos

```sql
id uuid primary key
name text not null
slug text unique null
created_by uuid references profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### Primary key

- `id`

### Foreign keys

- `created_by` referencia `profiles(id)`.

### Indices sugeridos

```sql
create unique index relationship_spaces_slug_idx on relationship_spaces(slug) where slug is not null;
create index relationship_spaces_created_by_idx on relationship_spaces(created_by);
```

### Constraints/checks

- `name` no debe ser vacio.
- `slug` debe ser unico si existe.

### Riesgos

- Crear contenido sin `space_id`.
- Usar un space global accidentalmente.
- Permitir lectura de contenido entre universos.

## 6. `universe_members`

### Proposito

Definir usuarios miembros de un `relationship_space` y sus permisos dentro del universo.

### Columnas y tipos sugeridos

```sql
id uuid primary key
space_id uuid not null references relationship_spaces(id)
user_id uuid not null references profiles(id)
role text not null check (role in ('owner', 'partner', 'viewer'))
created_at timestamptz not null default now()
unique(space_id, user_id)
```

### Primary key

- `id`

### Foreign keys

- `space_id` referencia `relationship_spaces(id)`.
- `user_id` referencia `profiles(id)`.

### Indices sugeridos

```sql
create index universe_members_space_id_idx on universe_members(space_id);
create index universe_members_user_id_idx on universe_members(user_id);
create unique index universe_members_space_user_idx on universe_members(space_id, user_id);
```

### Constraints/checks

- `role` limitado a `owner`, `partner`, `viewer`.
- Un usuario no puede repetirse dentro del mismo space.

### Riesgos

- RLS incompleta si solo valida `user_id` y no `space_id`.
- Roles demasiado amplios.
- Duplicar membresias por falta de constraint unico.

## 7. `content_items`

### Proposito

Guardar contenido editable remoto de forma generica, incluyendo contenido local migrado, overrides e hidden.

### Columnas y tipos sugeridos

```sql
id uuid primary key
space_id uuid not null references relationship_spaces(id)
collection text not null
local_id text null
base_id text null
kind text not null check (kind in ('local', 'override', 'hidden'))
data jsonb not null
is_hidden boolean not null default false
created_by uuid references profiles(id)
updated_by uuid references profiles(id)
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
source text not null
```

### Primary key

- `id`

### Foreign keys

- `space_id` referencia `relationship_spaces(id)`.
- `created_by` referencia `profiles(id)`.
- `updated_by` referencia `profiles(id)`.

### Indices sugeridos

```sql
create index content_items_space_id_idx on content_items(space_id);
create index content_items_collection_idx on content_items(collection);
create index content_items_kind_idx on content_items(kind);
create index content_items_base_id_idx on content_items(base_id);
create index content_items_local_id_idx on content_items(local_id);
create index content_items_space_collection_idx on content_items(space_id, collection);
create index content_items_space_kind_idx on content_items(space_id, kind);
```

### Constraints/checks

- `kind` limitado a `local`, `override`, `hidden`.
- `collection` no debe ser vacio.
- `source` no debe ser vacio.
- Para `kind = 'local'`, `data` debe contener el contenido editable.
- Para `kind = 'override'`, `base_id` deberia existir.
- Para `kind = 'hidden'`, `base_id` deberia existir.

### Mapping local

```txt
content.<collection> -> content_items kind local
overrides.<collection> -> content_items kind override
hidden.<collection> -> content_items kind hidden o tabla separada
```

`content.<collection>`:

- `collection` = nombre de coleccion (`reasons`, `promises`, `timeline`, etc.).
- `kind` = `local`.
- `local_id` = id local original si existe.
- `data` = item local.
- `created_by` / `updated_by` = UUID real mapeado desde metadata local si existe.

`overrides.<collection>`:

- `collection` = nombre de coleccion.
- `kind` = `override`.
- `base_id` = id del item base JSON.
- `data` = patch del override.

`hidden.<collection>`:

- Opcion A: `kind` = `hidden`, `base_id` = id base.
- Opcion B: tabla separada para hidden.

### Riesgos

- `jsonb` flexible puede permitir shapes inconsistentes.
- `hidden` como `kind` puede ser demasiado generico.
- Sin versionado de schema de `data`, migraciones futuras pueden ser dificiles.
- Conflictos si Ale/Yori editan el mismo item.
- RLS mal aplicada puede exponer contenido privado.

## 8. `content_events` / `audit_log`

### Opcion recomendada

Recomendacion: preparar `content_events` desde el diseno, pero no hacerlo obligatorio para el primer MVP remoto si complica demasiado.

Si se implementa desde el inicio, debe registrar acciones esenciales:

- `create`
- `update`
- `delete`
- `hide`
- `restore`
- `import`
- `media_attach`

### Proposito

Registrar historial y auditoria de cambios relevantes sin depender solo del estado final de `content_items`.

### Columnas y tipos sugeridos

```sql
id uuid primary key
space_id uuid not null references relationship_spaces(id)
content_item_id uuid null references content_items(id)
collection text null
action text not null
actor_id uuid references profiles(id)
payload jsonb null
created_at timestamptz not null default now()
```

### Primary key

- `id`

### Foreign keys

- `space_id` referencia `relationship_spaces(id)`.
- `content_item_id` referencia `content_items(id)`.
- `actor_id` referencia `profiles(id)`.

### Indices sugeridos

```sql
create index content_events_space_id_idx on content_events(space_id);
create index content_events_content_item_id_idx on content_events(content_item_id);
create index content_events_actor_id_idx on content_events(actor_id);
create index content_events_created_at_idx on content_events(created_at);
```

### Constraints/checks

- `action` no debe ser vacio.
- `payload` no debe guardar secretos ni contenido sensible innecesario.

### Riesgos

- Puede crecer rapidamente.
- Puede duplicar contenido sensible si `payload` guarda snapshots completos.
- RLS debe proteger audit log igual que contenido.

## 9. `media_assets`

### Proposito

Guardar metadata de archivos en Supabase Storage, especialmente fotos de Galeria/Agujero negro.

La galeria/fotos debe usar Storage + metadata. Data URL queda solo como compatibilidad local/export, no como solucion final en Postgres.

### Columnas y tipos sugeridos

```sql
id uuid primary key
space_id uuid not null references relationship_spaces(id)
content_item_id uuid null references content_items(id)
bucket text not null
path text not null
mime_type text null
size_bytes integer null
created_by uuid references profiles(id)
created_at timestamptz not null default now()
```

### Primary key

- `id`

### Foreign keys

- `space_id` referencia `relationship_spaces(id)`.
- `content_item_id` referencia `content_items(id)`.
- `created_by` referencia `profiles(id)`.

### Indices sugeridos

```sql
create index media_assets_space_id_idx on media_assets(space_id);
create index media_assets_content_item_id_idx on media_assets(content_item_id);
create index media_assets_created_by_idx on media_assets(created_by);
create unique index media_assets_bucket_path_idx on media_assets(bucket, path);
```

### Constraints/checks

- `bucket` no debe ser vacio.
- `path` no debe ser vacio.
- `size_bytes` debe ser positivo si existe.

### Riesgos

- Bucket publico expondria fotos privadas.
- Archivos huerfanos si se elimina contenido sin cleanup.
- URLs firmadas no deben tratarse como permanentes.
- Data URL en Postgres inflaria DB y backups.

## 10. Indices recomendados

Resumen de indices importantes:

```sql
create unique index profiles_local_slug_idx on profiles(local_slug) where local_slug is not null;

create index universe_members_space_id_idx on universe_members(space_id);
create index universe_members_user_id_idx on universe_members(user_id);
create unique index universe_members_space_user_idx on universe_members(space_id, user_id);

create index content_items_space_id_idx on content_items(space_id);
create index content_items_collection_idx on content_items(collection);
create index content_items_kind_idx on content_items(kind);
create index content_items_base_id_idx on content_items(base_id);
create index content_items_local_id_idx on content_items(local_id);
create index content_items_space_collection_idx on content_items(space_id, collection);
create index content_items_space_kind_idx on content_items(space_id, kind);

create index media_assets_space_id_idx on media_assets(space_id);
create index media_assets_content_item_id_idx on media_assets(content_item_id);
```

## 11. Decisiones pendientes

- Si `hidden` vive como `kind` en `content_items` o como tabla separada.
- Si `audit_log` / `content_events` es obligatorio desde el inicio o posterior.
- Si `content_items.data` guarda todo el item o solo fields editables.
- Si `local_id` se mantiene despues de migracion.
- Como resolver conflictos Ale/Yori.
- Como versionar schema.
- Cuando crear export/import v3.
- Si `source` debe limitarse con check (`local-dev`, `imported-local`, `remote`, etc.).
- Si media se referencia desde `content_items.data` o con tabla puente.

## 12. Riesgos

### RLS mal disenada

Es el riesgo principal. Toda policy debe validar membership por `space_id`.

### Data URL en DB

No guardar Data URL como solucion final en Postgres. Usar Storage + `media_assets`.

### Async futuro

Supabase sera async y la API actual del CRUD es sync. La migracion requiere cache, hooks o una estrategia gradual.

### Conflictos Ale/Yori

Si ambos editan el mismo item, se requiere una regla de resolucion: ultimo write gana, historial, bloqueo optimista o resolucion manual.

### Romper export/import

Export/import v2 debe seguir como backup offline. No crear v3 sin necesidad clara.

### Migracion de IDs locales a UUIDs reales

`local-yori`, `local-ale` y `distancia-cero-local-space` deben mapearse explicitamente a UUIDs reales.

## 13. Veredicto

No aplicar SQL todavia.

Siguiente fase recomendada:

1. Crear docs de RLS conceptual.
2. Revisar membership y policies por `space_id`.
3. Solo despues preparar migraciones SQL documentales.
4. No instalar Supabase hasta tener schema y RLS revisados.

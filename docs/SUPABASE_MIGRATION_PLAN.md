# Distancia Cero - Supabase Migration Plan

## 1. Resumen

Distancia Cero sigue siendo una app local por ahora. El runtime actual no usa Supabase, backend, Auth real ni Router para contenido editable.

Supabase queda como una fase futura para:

- Auth real.
- Postgres.
- Storage privado para fotos.
- Realtime opcional.

Este documento fija un plan tecnico antes de instalar dependencias o cambiar runtime.

## 2. Estado actual

### CRUD

La ruta actual de contenido editable es:

```txt
Componentes -> contentService -> contentRepository -> localContentRepository -> localContentStore -> LocalStorage
```

Reglas actuales:

- `contentService` es la fachada estable para componentes.
- `contentRepository` re-exporta la implementacion local.
- `localContentRepository` contiene comportamiento local.
- `localContentStore` es el acceso bajo nivel a LocalStorage.
- Export/import v2 sigue funcionando como backup offline.

### Identity

La identidad local fake/dev actual sigue esta ruta:

```txt
LocalIdentitySelector -> auth/profile/universe services -> localIdentityStore/localUsers
```

Estado:

- Hay usuarios locales fake/dev: Yori / Diego y Ale / Alecita.
- No hay login real.
- No hay Supabase Auth.
- No hay RLS.
- No hay backend.

### Metadata

La metadata local/dev ya existe para items locales genericos:

- Al crear: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`, `source`, `spaceId`.
- Al editar: se actualizan `updatedBy` y `updatedAt`.
- `createdBy` y `createdAt` se preservan si ya existen.
- `LocalContentMeta` muestra autoria opcional en listas locales genericas del Centro del Universo.

No aplica todavia a:

- JSON base.
- Overrides.
- Hidden.
- Cartas legacy monthly/openWhen.
- Opened/read.
- Simulation unlocked.
- Contenido local existente no migrado.

## 3. Principio clave

Los IDs locales actuales no son UUIDs reales de Supabase:

- `local-yori`
- `local-ale`
- `distancia-cero-local-space`

Estos IDs deben mapearse explicitamente a IDs reales cuando exista Supabase Auth/Postgres.

No se debe asumir que:

- `local-yori` equivale a `auth.users.id`.
- `local-ale` equivale a `auth.users.id`.
- `distancia-cero-local-space` equivale a `relationship_spaces.id`.

## 4. Schema conceptual

### `profiles`

Proposito:

- Representar perfiles de usuario asociados a Supabase Auth.
- Resolver nombre visible, rol base y avatar.

Campos principales:

```txt
id uuid primary key references auth.users(id)
local_slug text unique null
display_name text not null
avatar_url text null
created_at timestamptz not null
updated_at timestamptz not null
```

Relaciones:

- `profiles.id` referencia `auth.users.id`.
- `universe_members.user_id` referencia `profiles.id`.
- `content_items.created_by` y `content_items.updated_by` referencian `profiles.id`.

Riesgos:

- Confundir IDs fake/dev con UUIDs reales.
- Crear perfiles sin usuario Auth correspondiente.
- Exponer perfiles fuera del relationship space si las policies son laxas.

### `relationship_spaces`

Proposito:

- Representar el universo privado compartido.
- Agrupar contenido, miembros y media.

Campos principales:

```txt
id uuid primary key
name text not null
slug text unique null
created_by uuid references profiles(id)
created_at timestamptz not null
updated_at timestamptz not null
```

Relaciones:

- `universe_members.space_id` referencia `relationship_spaces.id`.
- `content_items.space_id` referencia `relationship_spaces.id`.
- `media_assets.space_id` referencia `relationship_spaces.id`.

Riesgos:

- Usar un space global accidentalmente.
- Permitir lectura de contenido de otros spaces.
- Crear contenido sin `space_id`.

### `universe_members`

Proposito:

- Definir quienes pertenecen a un relationship space.
- Controlar roles dentro del universo.

Campos principales:

```txt
id uuid primary key
space_id uuid references relationship_spaces(id)
user_id uuid references profiles(id)
role text not null
created_at timestamptz not null
unique(space_id, user_id)
```

Roles conceptuales:

- `owner`
- `partner`
- `viewer`

Relaciones:

- Une `profiles` con `relationship_spaces`.
- Es la base para RLS de contenido y media.

Riesgos:

- Permitir duplicados de membership.
- Policies que validen usuario pero no `space_id`.
- Roles demasiado amplios.

### `content_items`

Proposito:

- Guardar contenido editable remoto.
- Representar locales, overrides y hidden de manera migrable.

Campos principales:

```txt
id uuid primary key
space_id uuid references relationship_spaces(id)
collection text not null
kind text not null
local_id text null
base_id text null
data jsonb not null
is_hidden boolean not null default false
created_by uuid references profiles(id)
updated_by uuid references profiles(id)
created_at timestamptz not null
updated_at timestamptz not null
source text not null
```

Kinds conceptuales:

- `local`
- `override`
- `hidden`

Relaciones:

- Pertenece a un `relationship_space`.
- Puede referenciar media mediante `data.mediaAssetId` o una tabla puente futura.
- Puede tener eventos en `content_events`.

Riesgos:

- `data jsonb` flexible puede esconder schema inconsistente.
- `kind = hidden` queda como ruta recomendada actual.
- Tabla separada para hidden queda como decision secundaria si hidden crece en complejidad.
- Conflictos si Ale/Yori editan el mismo item.

### `content_events` / `audit_log`

Proposito:

- Registrar historial de cambios.
- Auditar creaciones, ediciones, ocultamientos, restauraciones e imports.

Campos principales:

```txt
id uuid primary key
space_id uuid references relationship_spaces(id)
content_item_id uuid references content_items(id) null
collection text null
action text not null
actor_id uuid references profiles(id)
payload jsonb null
created_at timestamptz not null
```

Relaciones:

- Pertenece a un `relationship_space`.
- Puede apuntar a un `content_item`.
- `actor_id` indica quien disparo el evento.

Riesgos:

- Crecer rapido si se registra demasiado detalle.
- Guardar contenido sensible completo en `payload`.
- RLS debe proteger eventos igual que contenido.

### `media_assets`

Proposito:

- Guardar metadata de archivos subidos a Supabase Storage.
- Evitar guardar Data URL como solucion final en Postgres.

Campos principales:

```txt
id uuid primary key
space_id uuid references relationship_spaces(id)
content_item_id uuid references content_items(id) null
bucket text not null
path text not null
mime_type text null
size_bytes integer null
created_by uuid references profiles(id)
created_at timestamptz not null
```

Relaciones:

- Pertenece a un `relationship_space`.
- Puede asociarse a un `content_item`.

Riesgos:

- Archivos huerfanos si se borra contenido sin limpiar Storage.
- Exponer fotos privadas con buckets publicos.
- Guardar URLs firmadas permanentes dentro de JSON.

## 5. Mapping local -> remoto

### Usuarios

```txt
local-yori -> profiles.id real de Yori/Diego
local-ale -> profiles.id real de Ale/Alecita
```

Reglas:

- El mapping debe ser manual y explicito.
- Los IDs locales pueden guardarse como `profiles.local_slug` o en una tabla de migracion.
- No se deben usar IDs locales como UUIDs remotos.

### Space

```txt
DEFAULT_SPACE_ID -> relationship_spaces.id real
LOCAL_RELATIONSHIP_SPACE.members -> universe_members
```

Reglas:

- `distancia-cero-local-space` puede conservarse como slug o referencia de migracion.
- El ID remoto debe ser UUID.
- Todo contenido remoto debe tener `space_id`.

### Contenido

```txt
content.<collection> -> content_items kind local
overrides.<collection> -> content_items kind override
hidden.<collection> -> content_items kind hidden
```

Mapping de metadata:

```txt
createdBy local -> profiles.id real mediante mapping
updatedBy local -> profiles.id real mediante mapping
source local-dev -> imported-local o equivalente
spaceId local -> relationship_spaces.id real
```

Reglas:

- Items sin metadata siguen siendo validos.
- No inventar autor retroactivo.
- JSON base no se modifica desde la app.
- Overrides e hidden requieren validar schema antes de migrar; hidden queda recomendado como `kind = hidden`.

## 6. Storage

La Data URL actual es solo compatibilidad local/export.

Solucion futura:

- Supabase Storage para fotos.
- Bucket privado recomendado, por ejemplo `relationship-media`.
- Metadata en `media_assets`.
- Acceso controlado por membership del space.
- No guardar Data URL como solucion final en Postgres.

Ruta conceptual de migracion:

1. Detectar items de galeria con `image` en Data URL.
2. Convertir Data URL a archivo.
3. Subir archivo a Storage privado.
4. Crear fila en `media_assets`.
5. Actualizar `content_items.data` con referencia a `mediaAssetId` o path controlado.
6. Mantener Data URL solo en backup local si hace falta compatibilidad.

Riesgos:

- LocalStorage y backups pueden inflarse con Data URL.
- Storage necesita cleanup de archivos no usados.
- RLS de DB no protege automaticamente Storage si no se configuran policies correctas.

## 7. RLS conceptual

Principios:

- Solo miembros del mismo relationship space pueden leer contenido.
- Solo miembros autorizados pueden crear/editar.
- Storage debe validar acceso por `space_id`.
- No confiar en filtros del cliente.
- No hacer policies por `collection` sin validar membership.

Policy conceptual para lectura de contenido:

```sql
exists (
  select 1
  from universe_members
  where universe_members.space_id = content_items.space_id
    and universe_members.user_id = auth.uid()
)
```

Policy conceptual para escritura:

```sql
exists (
  select 1
  from universe_members
  where universe_members.space_id = content_items.space_id
    and universe_members.user_id = auth.uid()
    and universe_members.role in ('owner', 'partner')
)
```

Storage:

- El path deberia incluir `space_id`.
- Las policies deben validar que el usuario pertenece al space del archivo.
- No usar bucket publico para cartas/fotos privadas.

## 8. Export/import

Mantener export/import v2 por ahora.

Reglas:

- Backups viejos sin metadata siguen funcionando.
- Metadata sigue siendo opcional.
- No crear v3 todavia.
- Export/import v2 sigue siendo backup offline.
- Import remoto futuro debe ser manual, confirmado y reversible.

Considerar v3 solo si hacen falta:

- IDs remotos.
- Manifest de media.
- Mapping de usuarios.
- Mapping de spaces.
- Resolucion de conflictos.
- Estado de migracion remoto.

## 9. Async futuro

Supabase sera async y la API actual de `contentService` es sync.

Reglas:

- No convertir `contentService` a promises de golpe.
- Mantener modo local.
- Disenar `remoteContentRepository` despues de schema/RLS.
- Considerar cache/hydration o hooks futuros.
- No cambiar componentes masivamente.

Opciones futuras:

- Repository remoto async con capa de cache local.
- Hooks tipo `useCollection(collectionName)`.
- Hidratacion inicial desde LocalStorage y sync remoto posterior.
- Modo local como fallback cuando Supabase no este disponible.

## 10. Fases futuras

### S0: este documento

Objetivo:

- Fijar el plan conceptual sin cambiar runtime.

Archivos probables:

- `docs/SUPABASE_MIGRATION_PLAN.md`

Que NO tocar:

- `src`
- `package.json`
- Supabase

Validacion:

- `git status`
- `npm.cmd run build`

Rollback:

- Eliminar este documento.

Nivel Codex:

- Bajo.

### S1: schema SQL conceptual

Objetivo:

- Documentar SQL conceptual para tablas futuras.

Archivos probables:

- `docs/supabase/schema.sql`
- `docs/SUPABASE_MIGRATION_PLAN.md`

Que NO tocar:

- Runtime.
- Supabase real.
- `package.json`.

Validacion:

- Revision del SQL.
- Build para confirmar que no se toco runtime.

Rollback:

- Revertir docs.

Nivel Codex:

- Bajo/Medio.

### S2: RLS conceptual

Objetivo:

- Documentar policies de lectura/escritura por membership.

Archivos probables:

- `docs/supabase/rls.sql`

Que NO tocar:

- Supabase real.
- Runtime.

Validacion:

- Revision manual de policies.
- Confirmar que toda policy valida `space_id`.

Rollback:

- Revertir docs.

Nivel Codex:

- Medio.

### S3: migrations SQL documentales sin aplicar

Objetivo:

- Preparar migraciones versionadas como documentos, sin ejecutarlas.

Archivos probables:

- `docs/supabase/migrations/*.sql`

Que NO tocar:

- Supabase real.
- Runtime.
- `package.json`.

Validacion:

- Revision de orden de migraciones.
- Build local.

Rollback:

- Revertir docs.

Nivel Codex:

- Medio.

### S4: mapping local -> remoto

Objetivo:

- Definir mapping de usuarios, space, contenido y media.

Archivos probables:

- `docs/SUPABASE_MIGRATION_PLAN.md`
- `docs/supabase/local-to-remote-mapping.md`

Que NO tocar:

- Runtime.
- LocalStorage.
- Export/import.

Validacion:

- Revisar que no se inventen autores retroactivos.
- Revisar mapping de `local-yori`, `local-ale` y `distancia-cero-local-space`.

Rollback:

- Revertir docs.

Nivel Codex:

- Medio.

### S5: `remoteContentRepository` stub sin usar

Objetivo:

- Crear una interfaz futura sin conectarla.

Archivos probables:

- `src/repositories/remoteContentRepository.js`

Que NO tocar:

- Selector activo `contentRepository.js`, salvo que la tarea lo permita explicitamente.
- Componentes.
- `contentService` publico.

Validacion:

- Build.
- Confirmar que el stub no se importa ni se ejecuta.

Rollback:

- Eliminar stub.

Nivel Codex:

- Medio.

### S6: instalar Supabase client

Objetivo:

- Agregar dependencia oficial solo cuando schema/RLS esten claros.

Archivos probables:

- `package.json`
- lockfile si existe.
- `src/services/supabaseClient.js` futuro.

Que NO tocar:

- Componentes.
- CRUD activo.
- Auth real todavia, salvo tarea separada.

Validacion:

- Install limpio.
- Build.
- Confirmar que no se llama Supabase en runtime activo.

Rollback:

- Quitar dependencia y archivos nuevos.

Nivel Codex:

- Medio/Alto.

### S7: Auth real

Objetivo:

- Conectar Supabase Auth y profiles sin migrar contenido todavia.

Archivos probables:

- `src/services/authService.js`
- `src/services/profileService.js`
- `src/services/universeService.js`

Que NO tocar:

- CRUD remoto.
- Storage.
- Export/import.

Validacion:

- Login/logout.
- Profile actual.
- Membership del relationship space.
- Modo local fallback.

Rollback:

- Volver a servicios fake/dev.

Nivel Codex:

- Alto.

### S8: migracion manual export/import -> remoto

Objetivo:

- Convertir backup local v2 en datos remotos.

Archivos probables:

- Herramienta o panel de migracion.
- Repository remoto.
- Docs de mapping.

Que NO tocar:

- JSON base.
- Backups locales existentes.
- Import v1/v2 offline.

Validacion:

- Backup previo.
- Migracion en entorno de prueba.
- Comparar conteos por coleccion.
- Confirmar autores y space.

Rollback:

- Borrar datos remotos de prueba.
- Restaurar backup local.

Nivel Codex:

- Alto.

### S9: Storage fotos

Objetivo:

- Migrar Data URL/rutas de galeria a Supabase Storage privado.

Archivos probables:

- `mediaService`.
- `remoteContentRepository`.
- Docs de media.

Que NO tocar:

- Audio.
- SceneMusicController.
- Backups offline sin plan.

Validacion:

- Upload.
- Lectura privada.
- URLs firmadas.
- Cleanup de assets.

Rollback:

- Mantener Data URL local.
- Borrar assets remotos de prueba.

Nivel Codex:

- Alto.

### S10: Realtime opcional

Objetivo:

- Sincronizar cambios Ale/Yori en vivo.

Archivos probables:

- Repository remoto.
- Hooks de subscriptions.
- Centro del Universo.

Que NO tocar:

- Hasta tener conflictos definidos.

Validacion:

- Dos sesiones.
- Conflictos.
- Offline/online.

Rollback:

- Desactivar subscriptions.

Nivel Codex:

- Alto.

## 11. Decisiones pendientes

- Nombres finales de tablas.
- `hidden` queda recomendado como `kind` en `content_items`; tabla separada queda como decision secundaria.
- `audit_log` obligatorio o diferido.
- Regla de conflictos Ale/Yori.
- Migracion de Data URL.
- Si `content_items.data` debe guardar `mediaAssetId` o paths.
- Cuando activar React Router.
- Cuando proteger rutas.
- Como mantener modo local junto a Auth real.
- Si export/import v3 sera necesario para media y IDs remotos.

## 12. Veredicto

No instalar Supabase todavia.

Primero:

1. Schema conceptual.
2. RLS conceptual.
3. Documentacion de mapping local -> remoto.
4. Plan de Storage.

La app local debe seguir funcionando como fallback, backup offline y entorno de desarrollo.

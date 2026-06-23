# Distancia Cero - Supabase Migration Plan

## 1. Resumen

Distancia Cero sigue siendo una app local por ahora. El runtime actual no usa Supabase, backend, Auth real ni Router para contenido editable.

Supabase queda como una fase futura para:

- Auth real.
- Postgres.
- Storage privado para fotos.
- Realtime opcional.

Este documento fija un plan tecnico para aislar cada dependencia antes de cambiar runtime.

Gate operativo obligatorio: `docs/SUPABASE_READINESS_CHECKLIST.md`.

Ese checklist debe revisarse y emitir un veredicto go/no-go antes de:

- instalar o actualizar dependencias Supabase;
- crear, modificar o conectar un cliente/factory Supabase;
- aplicar SQL, migrations o RLS;
- conectar cualquier repository remoto al CRUD activo.

El gate protege el runtime local/sync, LocalStorage, export/import v2 y los
controladores delicados de escenas y musica. Ninguna fase futura debe asumir
que documentar o instalar una pieza autoriza automaticamente la siguiente.

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

## 10. Fases documentales y flujo operativo actual

La base documental se completo como trabajo S3.x. La implementacion futura se
rige por el flujo operativo S4.0-S4.9 y por el gate obligatorio de
`docs/SUPABASE_READINESS_CHECKLIST.md`. Completar una fase no autoriza la
siguiente automaticamente.

### S3.x: base documental

Incluye:

- plan de migracion conceptual;
- schema y RLS conceptuales;
- drafts SQL/RLS sin aplicar;
- mapping local -> remoto;
- contrato de contenido e identidad;
- checklist operativo y reglas de entorno.

Resultado historico al cerrar S3.x:

- Supabase aun no estaba instalado;
- no existe cliente Supabase activo;
- no se aplico SQL;
- el runtime local/sync y export/import v2 permanecen intactos.

### S4.0: auditoria tecnica del cliente sin instalar

Objetivo:

- Fijar responsabilidades, errores, env y limites antes de agregar una
  dependencia.

Validacion y rollback:

- Revision documental, busqueda de imports y build local.
- Revertir solo documentacion.

Nivel Codex:

- Medio.

### S4.1: documentacion de entorno y `.env.example`

Objetivo:

- Documentar variables permitidas sin secretos y mantener
  `VITE_REMOTE_CONTENT_ENABLED=false`.

Que NO tocar:

- Runtime, `package.json`, cliente Supabase o CRUD activo.

Validacion y rollback:

- Escaneo de secretos, build y revision de `.env.example`.
- Revertir solo documentacion/env de ejemplo.

Nivel Codex:

- Bajo/Medio.

### S4.2: contrato y skeleton remoto inactivo

Esta fase se divide en pasos pequenos y reversibles:

- **S4.2.0:** auditoria y diseno del contrato remoto, sin crear runtime.
- **S4.2.1:** crear `contentRepositoryContract.js` y
  `remoteContentRepository.js` import-safe/fail-fast, sin conectarlos al CRUD.
- **S4.2.2:** armonizar la numeracion documental Supabase.

Que NO tocar:

- `contentRepository.js`, `contentService.js`, componentes, LocalStorage o
  export/import v2.

Validacion y rollback:

- Build, smoke test de import, contrato estructural y cero imports runtime.
- Eliminar el skeleton o revertir docs sin cambiar el repository local activo.

Nivel Codex:

- Medio/Alto.

### S4.3: instalar `@supabase/supabase-js` de forma aislada [COMPLETADA]

Objetivo:

- Agregar solo la dependencia oficial tras aprobacion explicita, sin usarla en
  runtime.

Que NO tocar:

- Componentes, CRUD activo, Auth, Router o selector de repository.

Validacion y rollback:

- Install reproducible, build y cero imports de Supabase en `src`.
- Revertir `package.json` y lockfile.

Resultado de S4.3/S4.3.1, antes de S4.4:

- `@supabase/supabase-js@2.108.2` esta instalado sin imports runtime.
- S4.3.1 actualizo Vite a `8.0.16`; `npm audit` esta limpio.
- No existe cliente Supabase ni conexion al CRUD.

Nivel Codex:

- Medio/Alto.

### S4.4: cliente/factory Supabase aislado [COMPLETADA]

Objetivo:

- Crear un cliente encapsulado con validacion segura de env, sin conectarlo al
  CRUD.

Que NO tocar:

- `contentRepository.js`, componentes, export/import o Router.

Validacion y rollback:

- Import aislado, ausencia de `service_role`, flag remoto apagado y build.
- Eliminar el cliente/factory aislado.

Resultado actual:

- El factory existe en `src/integrations/supabase/client.js`.
- Importarlo no crea cliente, no hace queries y no toca Auth, Storage o
  Realtime.
- Solo una llamada explicita y validada puede crear una instancia.
- Ningun runtime activo o repository importa el factory.
- El CRUD sigue local/sync y el skeleton remoto sigue fail-fast.

Nivel Codex:

- Alto.

### S4.5: tests y contratos de repository

Objetivo:

- Probar equivalencia semantica, errores y fallback antes de cualquier conexion
  remota.

Validacion y rollback:

- Fixtures sinteticos sin datos privados, pruebas online/offline y build.
- Retirar tests/skeleton remoto sin cambiar el repository local.

Nivel Codex:

- Alto.

### S4.6: entorno Supabase aislado con schema/RLS revisados

Objetivo:

- Aplicar y probar schema/RLS solo en un entorno aislado, sin datos privados
  reales ni conexion al CRUD productivo.

Validacion y rollback:

- Matriz multi-space, policies deny-by-default y rollback SQL probado.
- Destruir el entorno de prueba o revertir migrations de prueba.

Nivel Codex:

- Alto.

### S4.7: bootstrap owner/partner controlado

Objetivo:

- Resolver Auth, profiles, mapping UUID y primer membership mediante un flujo
  controlado; nunca self-owner desde el cliente normal.

Validacion y rollback:

- Probar owner/partner, usuario externo, ultimo owner y fallback local.
- Desactivar Auth remoto y volver a identidad fake/dev.

Nivel Codex:

- Alto.

### S4.8: piloto read-only con fixtures sinteticos

Objetivo:

- Leer una coleccion piloto con fixtures sinteticos y sin datos privados
  reales, manteniendo cache/fallback local.

Que NO tocar:

- Escritura remota, migration, export/import v2, JSON base o Router.

Validacion y rollback:

- Pruebas online/offline/error con feature flag apagado por defecto.
- Desactivar el piloto y conservar el repository local.

Nivel Codex:

- Alto.

### S4.9: escritura y migracion controlada

Objetivo:

- Habilitar escritura o migracion manual solo cuando RLS, rollback,
  idempotencia y conflictos Ale/Yori esten resueltos.

Validacion y rollback:

- Backup v2 previo, dry run, conteos por coleccion, autoria/space verificados y
  audit confiable.
- Desactivar escritura remota, retirar datos de prueba y restaurar backup local.

Nivel Codex:

- Muy alto.

### Trabajo posterior sin numeracion asignada

Estos trabajos siguen separados y requieren planes y aprobaciones propias; no
quedan activados por completar S4.9:

- **Auth ampliado:** extender el bootstrap controlado hacia login/logout y
  perfiles reales, conservando identidad fake/dev como rollback.
- **Storage privado para fotos:** migrar Data URL/rutas de galeria con
  `mediaService`, acceso privado, URLs firmadas y cleanup de assets. No incluye
  audio ni autoriza romper backups offline.
- **Realtime opcional:** sincronizar cambios Ale/Yori solo despues de definir
  conflictos; validar dos sesiones y escenarios offline/online, con rollback
  mediante desactivacion de subscriptions.

React Router tambien permanece fuera de alcance hasta una decision explicita.

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

La dependencia y el factory Supabase ya existen de forma aislada. El siguiente
paso, S4.5, requiere aprobacion independiente y un veredicto go/no-go del
readiness checklist antes de agregar tests/contratos o conectar nuevas capas.

La app local debe seguir funcionando como fallback, backup offline y entorno de desarrollo.

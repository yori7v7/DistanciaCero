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

### S4.5: tests y contratos de repository [S4.5.1 DISPONIBLE]

Objetivo:

- Probar equivalencia semantica, errores y fallback antes de cualquier conexion
  remota.

Resultado de S4.5.1:

- Existe `scripts/verify-supabase-isolation.mjs` como verificador manual sin
  framework ni dependencia nueva.
- Valida contrato remoto fail-fast, factory import-safe/lazy, cero fetch y
  aislamiento del runtime local.
- No prueba RLS, backend o Storage reales y no conecta el CRUD.
- `docs/SUPABASE_CONTRACT_TESTS.md` documenta comando, alcance y limites.

Validacion y rollback:

- Fixtures sinteticos sin datos privados, pruebas online/offline y build.
- Retirar tests/skeleton remoto sin cambiar el repository local.

Nivel Codex:

- Alto.

### S4.6: entorno Supabase aislado [S4.6.1 CHECKLIST DISPONIBLE]

Objetivo:

- Aplicar y probar schema/RLS solo en un entorno aislado, sin datos privados
  reales ni conexion al CRUD productivo.

Estado de S4.6.1:

- `docs/SUPABASE_ISOLATED_ENVIRONMENT.md` documenta bloqueantes, diseno del
  laboratorio, matriz futura y gates de rollback.
- S4.6.3.2.2 registra evidencia humana de un laboratorio Supabase desechable
  donde se aplico manualmente solo `docs/supabase/schema_draft.sql`, sin datos
  reales, sin usuarios reales, sin media real y sin conexion al CRUD.
- S4.6.2.1 refino el schema draft sin ejecutarlo: invariantes por kind, JSONB
  object, soft delete, FKs cross-space, RESTRICT y audit append-only conceptual.
- S4.6.2.2 refino RLS sin ejecutarla: helpers/grants minimos, bootstrap y
  memberships bloqueados, escritura directa de `content_items` en NO-GO,
  hard delete denegado y Storage en NO-GO.
- S4.6.2.3 audito/diseno fixtures/reset sinteticos.
- S4.6.2.4 crea documentacion conceptual de fixtures/matriz en
  `docs/supabase/fixtures/README.md`.
- S4.6.2.5.1 crea `docs/supabase/fixtures/synthetic_fixture_plan.sql` como
  draft documental no aplicado, con plantillas comentadas y sin reset.
- S4.6.2.6.1 crea `docs/supabase/fixtures/synthetic_reset_draft.sql` como
  draft documental no aplicado, separado del fixture y sin rollback garantizado.
- S4.6.3.0 crea `docs/SUPABASE_MANUAL_APPLICATION_RUNBOOK.md` como runbook
  operativo documental. No aplica SQL, no crea proyecto Supabase y no conecta
  la app.
- S4.6.3.1 crea `docs/SUPABASE_DISPOSABLE_PROJECT_CHECKLIST.md` como checklist
  documental para decidir si un proyecto manual puede considerarse desechable.
  No crea proyecto Supabase y no aplica SQL.
- S4.6.3.2.2 crea `docs/SUPABASE_POST_SCHEMA_LAB_RESULT.md` como registro
  documental post-schema. Las tablas reportadas fueron `content_events`,
  `content_items`, `media_assets`, `profiles`, `relationship_spaces` y
  `universe_members`, todas con `0 rows`.
- S4.6.3.3.0b prepara `docs/supabase/rls_draft.sql` como candidato de
  aplicacion manual en laboratorio desechable. En esa subfase todavia no se
  habia aplicado en laboratorio; fixtures, reset, Storage y conexion de la app
  seguian fuera de alcance.
- S4.6.3.3.2 crea `docs/SUPABASE_POST_RLS_LAB_RESULT.md` como registro
  documental de evidencia humana post-RLS. El usuario reporto `Success. No rows
  returned` tras aplicar manualmente solo `docs/supabase/rls_draft.sql` en el
  laboratorio desechable. Esto no verifica acceso con usuarios, no aplica
  fixtures/reset, no toca Storage y no conecta la app.
- S4.6.4.1 actualiza la documentacion/preflight de fixtures sinteticos
  controlados. El fixture sigue sin aplicarse, el reset sigue separado y
  cualquier aplicacion manual futura requiere otro GO explicito.
- S4.6.4.3 crea `docs/supabase/fixtures/synthetic_fixture_apply_draft.sql`
  como draft separado para una aplicacion manual futura de fixtures. No aplica
  SQL, no crea Auth users, no toca Storage, no aplica reset y no conecta la app.
- S4.6.4.4 crea `docs/supabase/fixtures/SYNTHETIC_AUTH_USERS_PLAN.md`
  como preflight documental de usuarios Auth sinteticos. No crea usuarios, no
  guarda UUIDs reales, no aplica fixtures y no prueba RLS end-to-end.
- S4.6.4.33 registra en `docs/supabase/RLS_E2E_SECURITY_GATE_RESULT.md` el
  PASS sanitizado del private RLS E2E security gate en laboratorio desechable:
  usuarios con membership leen lo permitido, cross-space/external_user quedan
  bloqueados y anon/no-session queda bloqueado antes de acceder a datos
  protegidos.
- S4.6.4.34 crea `docs/supabase/BACKEND_READINESS_GAP.md` para dejar claro que
  el PASS del laboratorio no equivale a app/backend listo. Auth real, mapping,
  migracion, Storage, fallback/offline, sincronizacion, rollback, env segura,
  performance, CRUD remoto y pruebas multiperfil siguen como gaps antes de
  conectar la app.
- S4.6.4.35 crea `docs/supabase/REMOTE_REPOSITORY_CONTRACT.md` como contrato
  documental futuro para `remoteContentRepository` y estrategia de feature flag.
  Mantiene `contentService` como fachada, LocalStorage como default/fallback y
  prohibe acceso directo a Supabase desde componentes o escenas.
- S4.6.4.36 crea `docs/supabase/LOCAL_TO_REMOTE_CONTENT_MAPPING.md` como
  mapping documental desde fuentes locales JSON/LocalStorage hacia tablas
  remotas futuras. No ejecuta migracion, no toca SQL, no toca Storage y no
  conecta la app.
- S4.6.4.37 crea `docs/supabase/MIGRATION_DRY_RUN_PLAN.md` como plan documental
  para un dry-run futuro. No crea scripts, no ejecuta migracion, no toca
  Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- S4.6.4.38 crea `docs/supabase/LOCAL_SNAPSHOT_EXPORT_FORMAT.md` como formato
  documental futuro para snapshot/export local. No crea scripts, no genera
  snapshot real, no exporta datos reales, no lee LocalStorage real, no toca
  Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- S4.6.4.39 crea `docs/supabase/LOCAL_SNAPSHOT_VALIDATION_RULES.md` como reglas
  documentales futuras de validacion para snapshot/export local antes del
  dry-run. No crea scripts, no genera snapshot real, no lee LocalStorage real,
  no exporta datos reales, no toca Supabase/CLI/Dashboard, no toca runtime y no
  conecta la app.
- S4.6.4.40 crea `docs/supabase/MIGRATION_DRY_RUN_REPORT_FORMAT.md` como
  formato documental futuro para el reporte de migration dry-run. No crea
  scripts, no ejecuta dry-run real, no genera snapshot real, no lee datos
  reales, no toca Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- S4.6.4.41 crea `docs/supabase/MIGRATION_INSERT_GATE_CHECKLIST.md` como
  checklist/gate documental futuro previo a cualquier insert controlado de
  contenido migrado. No crea scripts, no inserta datos, no ejecuta dry-run real,
  no toca Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- S4.6.4.42 crea `docs/supabase/CONTROLLED_LAB_INSERT_PLAN.md` como plan
  documental futuro para insert controlado en laboratorio desechable. No crea
  scripts, no inserta datos, no ejecuta dry-run real, no toca
  Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- S4.6.4.43 audita en modo read-only la consistencia global de docs Supabase
  antes de scripts. Resultado: NO-GO por referencias next-phase obsoletas, sin
  secretos y sin cambios runtime.
- S4.6.4.44 repara referencias next-phase obsoletas y registra
  `docs/supabase/GLOBAL_DOCS_CONSISTENCY_AUDIT_RESULT.md`. No crea scripts, no
  genera snapshot real, no ejecuta dry-run real, no inserta datos, no toca
  Supabase/CLI/Dashboard, no toca runtime y no conecta la app.

Validacion y rollback:

- S4.6.3.1+ debe seguir el runbook y el checklist de proyecto desechable,
  mantener evidencia sin secretos y obtener aprobacion humana explicita antes
  de cualquier SQL.
- S4.6.3.3.1 debe tener aprobacion humana separada antes de cualquier
  aplicacion manual del candidato RLS.
- S4.6.3.3.2 solo registra el resultado post-RLS del laboratorio; cualquier
  fixture, reset, Auth user, Storage o conexion de CRUD requiere fase separada.
- El rollback principal del laboratorio sigue siendo destruir el proyecto
  desechable; cualquier reset SQL requiere subfase separada.

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
- Mapping local JSON/LocalStorage -> tablas remotas documentado.
- Dry-run de migracion documentado.
- Formato snapshot/export documental definido.
- Reglas de validacion de snapshot/export documentadas.
- Formato de reporte del dry-run documentado.
- Checklist de gate para insert documentado.
- Plan de insert controlado en lab documentado.
- Auditoria global de docs Supabase y reparacion next-phase documentadas;
  falta diseno docs-only de snapshot/dry-run script.
- Si `content_items.data` debe guardar `mediaAssetId` o paths.
- Cuando activar React Router.
- Cuando proteger rutas.
- Como mantener modo local junto a Auth real.
- Si export/import v3 sera necesario para media y IDs remotos.

## 12. Veredicto

La dependencia, el factory Supabase, el verificador manual S4.5.1 y el
checklist documental S4.6.1 existen de forma aislada. En el laboratorio
desechable se aplicaron schema/RLS, se crearon usuarios Auth sinteticos, se
aplicaron fixtures sinteticos, paso la verificacion read-only y paso el private
RLS E2E security gate.

Ese PASS valida seguridad base en el laboratorio, pero no conecta la app ni
demuestra readiness de backend productivo. El entorno remoto no esta conectado
al runtime, no tiene reset aplicado, no toca Storage y no ha probado CRUD remoto
real desde la app. `docs/supabase/BACKEND_READINESS_GAP.md` documenta los gaps
que deben resolverse antes de cualquier conexion.
`docs/supabase/REMOTE_REPOSITORY_CONTRACT.md` documenta el contrato logico
futuro y una estrategia de feature flag, pero no implementa repository ni activa
Supabase en runtime.
`docs/supabase/LOCAL_TO_REMOTE_CONTENT_MAPPING.md` documenta como se mapearian
colecciones, overrides, hidden, legacy letters, opened/read, simulation state,
identidad local y media hacia tablas remotas futuras, sin migrar nada.
`docs/supabase/MIGRATION_DRY_RUN_PLAN.md` documenta como validar un futuro
dry-run local sin red antes de cualquier insercion, sin crear scripts en esta
fase.
`docs/supabase/LOCAL_SNAPSHOT_EXPORT_FORMAT.md` documenta el formato futuro de
snapshot/export local que alimentaria ese dry-run, sin crear scripts ni generar
snapshot real.
`docs/supabase/LOCAL_SNAPSHOT_VALIDATION_RULES.md` documenta reglas futuras
para validar ese snapshot antes del dry-run, sin crear scripts, leer datos
reales ni conectar runtime.
`docs/supabase/MIGRATION_DRY_RUN_REPORT_FORMAT.md` documenta el formato futuro
del reporte del dry-run para revisar conteos, warnings, conflictos, duplicados,
media pendiente y NO-GO reasons antes de cualquier insert.
`docs/supabase/MIGRATION_INSERT_GATE_CHECKLIST.md` documenta el gate que debe
cumplirse antes de planear cualquier insert controlado en laboratorio.
`docs/supabase/CONTROLLED_LAB_INSERT_PLAN.md` documenta como se planearia un
insert controlado en el laboratorio desechable sin ejecutar inserts ni crear
scripts en esta fase.
`docs/supabase/GLOBAL_DOCS_CONSISTENCY_AUDIT_RESULT.md` registra la auditoria
read-only S4.6.4.43 y la necesidad de reparacion S4.6.4.44.

La app local debe seguir funcionando como fallback, backup offline y entorno de
desarrollo. Si S4.6.4.44 queda limpio, la siguiente fase recomendada es
disenar snapshot/dry-run script como docs-only work, sin crear script
ejecutable, sin snapshot real, sin dry-run real, sin insert real y sin tocar
runtime.

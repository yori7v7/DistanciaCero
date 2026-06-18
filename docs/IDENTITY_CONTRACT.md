# Distancia Cero - Identity Contract

## 1. Resumen

Este documento define el contrato de identidad local fake/dev para Distancia Cero antes de introducir Supabase Auth, Postgres, RLS o backend real.

La arquitectura actual de contenido sigue siendo:

```txt
Componentes -> src/services/contentService.js -> src/repositories/contentRepository.js -> src/repositories/localContentRepository.js -> src/utils/localContentStore.js -> LocalStorage
```

La identidad local fake/dev debe servir para simular quienes son Yori/Diego y Ale/Alecita, sin cambiar todavia el runtime del CRUD.

## 2. Objetivos

- Preparar un concepto de `currentUser`.
- Preparar `role` y `displayName`.
- Preparar `spaceId` / `universeId`.
- Preparar metadata futura: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`.
- Preparar un mapping futuro hacia Supabase Auth.
- Mantener compatibilidad con el modo local actual.
- Evitar reescribir componentes cuando exista identidad real.

## 3. No objetivos

- No implementar login real.
- No integrar Supabase Auth.
- No implementar RLS.
- No crear backend.
- No crear selector UI todavia.
- No agregar metadata real al CRUD todavia.
- No migrar contenido existente.
- No cambiar export/import v2.
- No cambiar la API publica de `contentService`.

## 4. Modelo de usuarios locales

Propuesta futura para `src/constants/localUsers.js`:

```js
export const LOCAL_USERS = [
  {
    id: 'local-yori',
    slug: 'yori',
    displayName: 'Yori Diego',
    role: 'owner',
    avatar: null
  },
  {
    id: 'local-ale',
    slug: 'ale',
    displayName: 'Ale Alecita',
    role: 'partner',
    avatar: null
  }
]
```

Reglas:

- `local-yori` identifica a Yori / Diego en modo local.
- `local-ale` identifica a Ale / Alecita en modo local.
- Los ids locales no equivalen a UUIDs de Supabase.
- Los ids locales no deben asumirse como ids definitivos de Auth.
- El mapping futuro a Supabase debe ser explicito.

## 5. Modelo relationship space / universe

Propuesta futura:

```js
export const LOCAL_RELATIONSHIP_SPACE = {
  id: 'distancia-cero-local-space',
  name: 'Distancia Cero',
  members: ['local-yori', 'local-ale'],
  createdAt: '2026-01-01T00:00:00.000Z'
}
```

Conceptos:

- `spaceId` o `universeId` representa el universo compartido.
- Todo contenido remoto futuro deberia pertenecer a un space.
- `members` define quienes pueden ver o editar ese universo.
- En Supabase, este concepto sera clave para RLS.

Uso futuro:

- Separar contenido privado por universo.
- Permitir ownership compartido.
- Evitar que una cuenta lea contenido de otro universo.

## 6. Metadata actual opcional

Metadata actual para items locales genericos y conceptual para contenido remoto futuro:

```js
{
  createdBy: 'local-yori',
  updatedBy: 'local-ale',
  createdAt: '2026-05-17T00:00:00.000Z',
  updatedAt: '2026-05-18T00:00:00.000Z',
  source: 'local-dev',
  spaceId: 'distancia-cero-local-space'
}
```

Reglas:

- La metadata debe ser opcional.
- Backups viejos sin metadata deben seguir funcionando.
- No se debe tocar JSON base.
- No se debe migrar contenido existente automaticamente.
- No se debe inventar autor retroactivo.
- Si un item no tiene autor, la UI futura debe tolerarlo.
- `source` puede distinguir `base-json`, `local`, `imported`, `remote` o valores futuros.

Implementacion actual:

- `src/services/contentMetadataService.js` construye metadata de autoria en modo local/dev.
- `localContentRepository.addCollectionItem` aplica metadata de creacion a nuevos items locales genericos.
- `localContentRepository.updateCollectionItem` aplica metadata de actualizacion a items locales genericos editados.
- La metadata no esta conectada a export/import como formato nuevo; viaja solo como campos extra opcionales dentro de items locales.

Campos actuales:

- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`
- `source`
- `spaceId`

Al crear un item local generico:

- `createdBy` = usuario local actual.
- `updatedBy` = usuario local actual.
- `createdAt` = timestamp actual.
- `updatedAt` = timestamp actual.
- `source` = `local-dev`.
- `spaceId` = space local actual.

Al editar un item local generico:

- `createdBy` y `createdAt` se preservan si existen.
- `updatedBy` se actualiza con el usuario local actual.
- `updatedAt` se actualiza.
- `source` y `spaceId` se preservan si ya existian.
- No se agrega `createdBy` ni `createdAt` durante update.

No aplica todavia a:

- JSON base.
- Overrides.
- Hidden ids.
- Cartas legacy monthly/openWhen si no pasan por `addCollectionItem`.
- Opened/read.
- Simulation unlocked.
- Contenido local existente que no se edite.

## 7. Compatibilidad

El contenido viejo sin metadata debe seguir funcionando.

Reglas de compatibilidad:

- `contentService` no debe exigir `createdBy` ni `updatedBy`.
- `localContentRepository` no debe romper items sin metadata.
- `mergeCollectionWithLocal` debe seguir funcionando con items antiguos.
- Export/import v2 no debe romperse.
- La UI futura debe tratar autor ausente como estado valido.
- No se debe modificar contenido base JSON para agregar autores.

Reglas de migracion:

- Nuevos items locales genericos reciben metadata mediante `addCollectionItem`.
- Items locales genericos editados actualizan metadata mediante `updateCollectionItem`.
- Items existentes pueden quedarse sin metadata.
- Si algun dia se migra contenido local, debe hacerse con backup previo y confirmacion.

## 8. Export/import

La metadata de autor puede viajar como campos opcionales dentro de items locales.

Reglas:

- Backups sin `createdBy` / `updatedBy` importan normal.
- Backups con metadata deben preservar esos campos si son validos.
- No crear `version: 3` todavia.
- Considerar `version: 3` solo si el cambio futuro rompe compatibilidad o necesita validacion estricta.
- Importar metadata no debe crear usuarios automaticamente sin una politica definida.
- Import v2 debe tolerar items con o sin metadata.
- Export/import debe seguir funcionando como respaldo offline.

## 9. Servicios futuros

### `src/constants/localUsers.js`

Responsabilidad:

- Definir usuarios locales fake/dev.
- Definir el space local por defecto si conviene.

No debe:

- Leer LocalStorage.
- Guardar contenido.
- Importar Supabase.

### `src/utils/localIdentityStore.js`

Responsabilidad:

- Persistir identidad local fake/dev.
- Leer y escribir el usuario local seleccionado.
- Leer y escribir el space local seleccionado si hace falta.

Funciones posibles:

- `getLocalCurrentUserId()`
- `setLocalCurrentUserId(userId)`
- `getLocalSpaceId()`
- `setLocalSpaceId(spaceId)`
- `clearLocalIdentity()`

No debe:

- Manejar CRUD de contenido.
- Conocer campos de cartas, razones o modulos.
- Importar Supabase.

### `src/services/authService.js`

Responsabilidad:

- Exponer identidad actual para el resto de la app.
- Mantener una API preparada para Auth futura.

Funciones posibles:

- `getCurrentUser()`
- `getCurrentUserId()`
- `setCurrentUser(userId)` para modo local/dev.
- `isAuthenticated()`
- Futuro: `signIn()`, `signOut()`, `getSession()`.

No debe:

- Guardar contenido editable.
- Modificar JSON base.
- Importar Supabase antes de la fase correspondiente.

### `src/services/profileService.js`

Responsabilidad:

- Resolver perfiles visibles.
- Resolver nombres, slugs, roles y avatars.

Funciones posibles:

- `getProfiles()`
- `getProfileById(id)`
- `getDisplayName(userId)`
- `getRole(userId)`

No debe:

- Manejar sesion.
- Manejar CRUD de contenido.

### `src/services/universeService.js`

Responsabilidad:

- Resolver el relationship space actual.
- Resolver miembros del universo.

Funciones posibles:

- `getCurrentSpace()`
- `getCurrentSpaceId()`
- `getSpaceMembers()`

No debe:

- Manejar Supabase directo al principio.
- Escribir contenido editable.
- Aplicar RLS en cliente como sustituto de RLS real.

## 10. Fases

### Fase 2.0: documentar identity contract

Objetivo:

- Crear este contrato sin tocar runtime.

Validacion:

- `git status`
- `npm.cmd run build`
- revisar diff documental.

Rollback:

- Eliminar `docs/IDENTITY_CONTRACT.md`.

### Fase 2.1: authService fake/dev sin CRUD

Objetivo:

- Crear identidad fake local sin conectarla al CRUD.

Archivos probables:

- `src/constants/localUsers.js`
- `src/utils/localIdentityStore.js`
- `src/services/authService.js`
- opcional `src/services/profileService.js`
- opcional `src/services/universeService.js`

No tocar:

- Componentes visibles.
- CRUD.
- Export/import.
- JSON base.

Validacion:

- Build.
- Pruebas unitarias manuales mediante imports simples si aplica.

Rollback:

- Eliminar archivos nuevos.

### Fase 2.2: selector local Yori/Ale

Objetivo:

- Permitir cambiar usuario local fake/dev.

Archivos probables:

- `src/components/CentroUniversoSection.jsx`
- estilos solo si es necesario.

No tocar:

- Persistencia de contenido.
- Shapes de items.

Validacion:

- Cambiar usuario y refrescar sin romper CRUD.

Rollback:

- Quitar selector y volver al default local.

### Fase 2.3: metadata solo nuevos items

Objetivo:

- Agregar metadata a nuevos items locales genericos y a ediciones de esos items, no a contenido existente sin editar.

Archivos probables:

- `src/repositories/localContentRepository.js`

No tocar:

- JSON base.
- Items existentes.
- Import v1.
- Overrides.
- Hidden.
- Cartas legacy monthly/openWhen.

Validacion:

- Crear item nuevo y confirmar metadata.
- Editar item local y confirmar `updatedBy` / `updatedAt`.
- Importar backup viejo sin metadata.
- Exportar backup v2.

Rollback:

- Dejar de agregar metadata en create/update generico.

### Fase 2.4: mostrar autor opcional en Centro

Objetivo:

- Mostrar autor solo si existe metadata.

Archivos probables:

- `src/components/CentroUniversoSection.jsx`.

No tocar:

- Componentes visibles publicos.
- Persistencia.

Validacion:

- Items con autor muestran autor.
- Items sin autor no rompen UI.

Rollback:

- Quitar labels visuales.

### Fase 2.5: mapping futuro a Supabase

Objetivo:

- Definir como se mapean ids locales a usuarios Auth reales.

Archivos probables:

- `docs/IDENTITY_CONTRACT.md`
- `docs/CONTENT_CONTRACT.md`
- futuro `authService`.

No tocar:

- Supabase real hasta tener schema y RLS.

Validacion:

- Revision tecnica del contrato.

Rollback:

- Revertir docs.

## 11. Riesgos

### IDs fake vs Supabase UUID

Los ids `local-yori` y `local-ale` no son UUIDs de Supabase. Mezclarlos sin mapping puede romper ownership y RLS futura.

### Contaminar export/import

Agregar metadata sin reglas claras puede hacer que backups v2 transporten autores incorrectos o innecesarios.

### Cambiar shape muy pronto

Si los componentes empiezan a depender de `createdBy`, items antiguos podrian romperse.

### Autores incorrectos

No se debe inferir autor retroactivo. Un item sin metadata debe permanecer sin autor conocido.

### Conflictos Ale/Yori

Cuando exista sincronizacion remota, ambos podrian editar el mismo contenido. La resolucion de conflictos debe definirse antes de realtime.

### RLS futura

`spaceId` debe existir para separar universos. El cliente no reemplaza RLS real.

### Async futuro

Auth y Supabase seran async. La API actual del CRUD es sync. Cambiarla requiere plan de compatibilidad.

### LocalStorage

La identidad fake/dev local no debe borrar ni reescribir keys de contenido actual.

## 12. Reglas de oro

- No meter Supabase directo en componentes.
- No meter Supabase directo en `CentroUniversoSection.jsx`.
- No cambiar la API de `contentService` sin plan.
- No volver async el CRUD sin compatibilidad.
- No modificar JSON base.
- No inferir autor retroactivo.
- No exigir metadata para leer contenido existente.
- No romper export/import v2.
- Mantener modo local como fallback.

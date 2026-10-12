# Distancia Cero - Identity Contract

Contrato local contrastado con la fuente el 7 de octubre de 2026. Resultados y alcance de verificación en [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md); las fases históricas se conservan como antecedentes.

## 1. Resumen

Este documento describe la identidad local fake/dev implementada en Distancia Cero y conserva las reglas para una identidad remota futura. En esta etapa se valida y utiliza el modo local; los adaptadores remotos preparados permanecen desactivados y su funcionamiento remoto no se acredita aqui.

La arquitectura actual de contenido sigue siendo:

```txt
Componentes -> src/services/contentService.ts -> src/repositories/localContentRepository.ts -> src/utils/localContentStore.ts -> LocalStorage
```

La identidad local fake/dev simula quienes son Usuario 1 y Usuario 2. Ya se puede seleccionar desde el Centro del Universo y se utiliza al crear o editar items locales mediante la API generica del CRUD. No es login real ni control de acceso: ambos usuarios comparten el contenido del navegador.

## 2. Objetivos

- Mantener `currentUser`, `role` y `displayName` locales.
- Mantener `spaceId` / `universeId` local.
- Mantener metadata opcional: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`.
- Preparar un mapping futuro hacia Supabase Auth.
- Mantener compatibilidad con el modo local actual.
- Evitar reescribir componentes cuando exista identidad real.

## 3. No objetivos

- No implementar login real.
- No integrar Supabase Auth.
- No implementar RLS.
- No crear backend.
- No usar el selector local como login real ni como barrera de permisos.
- No agregar Auth, Supabase, RLS ni metadata remota real al CRUD.
- No asignar autoria automaticamente a JSON base, overrides, hidden, legacy monthly/openWhen, opened/read, simulation unlocked ni contenido existente sin editar.
- No migrar contenido existente.
- No cambiar export/import v2.
- No cambiar la API publica de `contentService`.

## 4. Modelo de usuarios locales

Modelo actual en `src/constants/localUsers.ts`:

```js
export const LOCAL_USERS = [
  {
    id: 'local-user1',
    slug: 'user1',
    displayName: 'Usuario 1',
    role: 'owner',
    avatar: null
  },
  {
    id: 'local-user2',
    slug: 'user2',
    displayName: 'Usuario 2',
    role: 'partner',
    avatar: null
  }
]
```

Reglas:

- `local-user1` identifica al Usuario 1 (owner) en modo local.
- `local-user2` identifica al Usuario 2 (partner) en modo local.
- Los ids locales no equivalen a UUIDs de Supabase.
- Los ids locales no deben asumirse como ids definitivos de Auth.
- El mapping futuro a Supabase debe ser explicito.

## 5. Modelo relationship space / universe

Modelo local actual, tambien definido en `src/constants/localUsers.ts`:

```js
export const LOCAL_RELATIONSHIP_SPACE = {
  id: 'distancia-cero-local-space',
  name: 'Distancia Cero',
  members: ['local-user1', 'local-user2'],
  createdAt: '2026-01-01T00:00:00.000Z'
}
```

Conceptos:

- `spaceId` o `universeId` representa el universo compartido.
- Todo contenido remoto futuro deberia pertenecer a un space.
- En el modelo remoto propuesto, `members` define quienes pueden ver o editar ese universo. En modo local, esta lista es informativa y no aplica permisos.
- En Supabase, este concepto sera clave para RLS.

Uso futuro:

- Separar contenido privado por universo.
- Permitir ownership compartido.
- Evitar que una cuenta lea contenido de otro universo.

## 6. Metadata actual opcional

Metadata actual para items locales genericos y conceptual para contenido remoto futuro:

```js
{
  createdBy: 'local-user1',
  updatedBy: 'local-user2',
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

- `src/services/contentMetadataService.ts` construye metadata de autoria en modo local/dev.
- `localContentRepository.addCollectionItem` aplica metadata de creacion a nuevos items locales genericos.
- `localContentRepository.updateCollectionItem` aplica metadata de actualizacion a items locales genericos editados.
- `LocalContentMeta` muestra autoria opcional en listas locales genericas del Centro del Universo.
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

Los helpers de autoria no agregan metadata a:

- JSON base.
- Overrides.
- Hidden ids.
- Cartas legacy monthly/openWhen si no pasan por `addCollectionItem`.
- Opened/read.
- Simulation unlocked.
- Contenido local existente que no se edite.

Los overrides guardados desde el formulario del CMS pueden incluir `updatedAt`, pero no reciben autoria del helper. El JSON base permanece intacto.

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

## 9. Servicios locales actuales

Las rutas siguientes ya existen en TypeScript. Describen el comportamiento local vigente; las funciones remotas preparadas no sustituyen el mapping de IDs ni acreditan autenticacion, autorizacion o RLS real.

### `src/constants/localUsers.ts`

Responsabilidad:

- Definir usuarios locales fake/dev.
- Definir `DEFAULT_LOCAL_USER_ID`, `DEFAULT_SPACE_ID`, los dos usuarios locales y el space local por defecto.

No debe:

- Leer LocalStorage.
- Guardar contenido.
- Importar Supabase.

### `src/utils/localIdentityStore.ts`

Responsabilidad:

- Persistir identidad local fake/dev.
- Leer y escribir el usuario local seleccionado.
- Leer y escribir el ID del space local.

Funciones actuales:

- `getLocalCurrentUserId()`
- `setLocalCurrentUserId(userId)`
- `getLocalSpaceId()`
- `setLocalSpaceId(spaceId)`
- `clearLocalIdentity()`

Usa las claves `distancia-cero-local-current-user` y `distancia-cero-local-current-space`. Las lecturas devuelven los valores por defecto si falta un valor util o falla localStorage; las escrituras y el borrado toleran fallos sin lanzar. `clearLocalIdentity()` solo elimina esas dos claves, sin borrar contenido.

No debe:

- Manejar CRUD de contenido.
- Conocer campos de cartas, razones o modulos.
- Importar Supabase.

### `src/services/authService.ts`

Responsabilidad:

- Exponer identidad actual para el resto de la app.
- Mantener una API preparada para Auth futura.

Funciones actuales:

- `getCurrentUser()`
- `getCurrentUserId()`
- `setCurrentUser(userId)` para modo local/dev.
- `isAuthenticated()`
- `getSession()`

En modo local, `isAuthenticated()` devuelve `true` y `getSession()` devuelve `{ mode: 'local-dev', user: getCurrentUser() }`. `getCurrentUserId()` resuelve el ID guardado mediante `getProfileById()` y vuelve a `local-user1` si no reconoce ese ID. `setCurrentUser()` acepta un perfil que pueda resolver ese servicio y devuelve el usuario resultante; no borra ni separa el contenido por usuario.

No debe:

- Guardar contenido editable.
- Modificar JSON base.
- Activar o validar la integracion remota como parte del pulido local. El servicio ya contiene adaptadores condicionales para una sesion remota futura; ese modo queda fuera de esta etapa.

### `src/services/profileService.ts`

Responsabilidad:

- Resolver perfiles visibles.
- Resolver nombres, slugs, roles y avatars.

Funciones actuales:

- `getProfiles()`
- `getProfileById(id)`
- `getDisplayName(userId)`

`getProfiles()` devuelve los dos perfiles locales. El rol se consulta en el perfil; no existe un export `getRole()`. Un ID de autor desconocido conserva un texto de fallback sin crear un usuario nuevo.

No debe:

- Manejar sesion.
- Manejar CRUD de contenido.

### `src/services/universeService.ts`

Responsabilidad:

- Resolver el relationship space actual.
- Resolver miembros del universo.

Funciones actuales:

- `getCurrentSpace()`
- `getCurrentSpaceId()`
- `getSpaceMembers()`

`getCurrentSpaceId()` usa el ID local almacenado; `getCurrentSpace()` conserva el modelo del space por defecto con ese ID. `getSpaceMembers()` resuelve los dos miembros del modelo local por defecto. Cambiar el ID almacenado no crea otro universo ni modifica sus miembros o permisos.

No debe:

- Manejar Supabase directo al principio.
- Escribir contenido editable.
- Aplicar RLS en cliente como sustituto de RLS real.

## 10. Historial local y propuesta remota

Las fases 2.0 a 2.4 ya estan reflejadas en el codigo local actual. Los objetivos, restricciones y rollback siguientes conservan el contexto del plan original; no son pendientes ni instrucciones para eliminar hoy los servicios o este contrato. La fase 2.5 mantiene una propuesta futura sin activacion remota.

### Fase 2.0: documentar identity contract (historica)

Objetivo:

- Crear este contrato sin tocar runtime.

Validacion:

- `git status`
- `npm.cmd run build`
- revisar diff documental.

Rollback:

- Eliminar `docs/IDENTITY_CONTRACT.md`.

### Fase 2.1: authService fake/dev sin CRUD (historica)

Objetivo:

- Crear identidad fake local sin conectarla al CRUD.

Archivos probables:

- `src/constants/localUsers.ts`
- `src/utils/localIdentityStore.ts`
- `src/services/authService.ts`
- `src/services/profileService.ts`
- `src/services/universeService.ts`

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

### Fase 2.2: selector local de usuarios (historica)

Objetivo:

- Permitir cambiar usuario local fake/dev.

Archivos probables:

- `src/components/LocalIdentitySelector.tsx`
- `src/components/CentroUniversoSection.tsx`
- estilos solo si es necesario.

No tocar:

- Persistencia de contenido.
- Shapes de items.

Validacion:

- Cambiar usuario y refrescar sin romper CRUD.

Rollback:

- Quitar selector y volver al default local.

### Fase 2.3: metadata solo nuevos items y ediciones locales (historica)

Objetivo:

- Agregar metadata a nuevos items locales genericos y a ediciones de esos items, no a contenido existente sin editar.

Archivos probables:

- `src/repositories/localContentRepository.ts`

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

### Fase 2.4: mostrar autor opcional en Centro (historica)

Objetivo:

- Mostrar autor solo si existe metadata.

Archivos probables:

- `src/components/LocalContentMeta.tsx`.
- `src/components/centro-universo/CrudEditorPanel.tsx`.

No tocar:

- Componentes visibles publicos.
- Persistencia.

Validacion:

- Items con autor muestran autor.
- Items sin autor no rompen UI.

Rollback:

- Quitar labels visuales.

### Fase 2.5: mapping futuro a Supabase (propuesta pendiente)

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

Los ids `local-user1` y `local-user2` no son UUIDs de Supabase. Mezclarlos sin mapping puede romper ownership y RLS futura.

### Contaminar export/import

Agregar metadata sin reglas claras puede hacer que backups v2 transporten autores incorrectos o innecesarios.

### Cambiar shape muy pronto

Si los componentes empiezan a depender de `createdBy`, items antiguos podrian romperse.

### Autores incorrectos

No se debe inferir autor retroactivo. Un item sin metadata debe permanecer sin autor conocido.

### Conflictos entre usuarios

Cuando exista sincronizacion remota, ambos podrian editar el mismo contenido. La resolucion de conflictos debe definirse antes de realtime.

### RLS futura

`spaceId` debe existir para separar universos. El cliente no reemplaza RLS real.

### Async futuro

Auth y Supabase seran async. La API actual del CRUD es sync. Cambiarla requiere plan de compatibilidad.

### LocalStorage

La identidad fake/dev local no debe borrar ni reescribir keys de contenido actual.

## 12. Reglas de oro

- No meter Supabase directo en componentes.
- No meter Supabase directo en `CentroUniversoSection.tsx`.
- No cambiar la API de `contentService` sin plan.
- No volver async el CRUD sin compatibilidad.
- No modificar JSON base.
- No inferir autor retroactivo.
- No exigir metadata para leer contenido existente.
- No romper export/import v2.
- Mantener modo local como fallback.

# Distancia Cero - Content Contract

## 1. Resumen

El CRUD editable actual de Distancia Cero esta centralizado con esta ruta:

```txt
Componentes visibles -> src/services/contentService.js -> src/repositories/contentRepository.js -> src/repositories/localContentRepository.js -> src/utils/localContentStore.js -> LocalStorage
```

Los componentes no deben leer ni escribir `src/utils/localContentStore.js` directamente. La fachada publica para contenido editable es `src/services/contentService.js`.

El comportamiento actual es local, sin backend, sin Supabase y sin Auth. Este documento fija el contrato para poder preparar una implementacion remota futura sin reescribir componentes.

## 2. Capas repository actuales

### `src/services/contentService.js`

`contentService.js` es la fachada publica estable para componentes visibles y para el Centro del Universo.

Reglas:

- Conserva la API publica sync.
- No debe importar `src/utils/localContentStore.js` directamente.
- Debe mantener nombres, firmas y return types mientras sea posible.
- Debe mantener el evento `distancia-cero-content-updated`.

### `src/repositories/contentRepository.js`

`contentRepository.js` es el selector/fachada de repository.

Estado actual:

- Por ahora re-exporta la implementacion local.
- No contiene Supabase.
- No contiene logica async.

Rol futuro:

- Puede convertirse en el punto de entrada para elegir repository local o remoto.
- Permite cambiar la implementacion debajo de `contentService` sin tocar componentes.

### `src/repositories/localContentRepository.js`

`localContentRepository.js` contiene la implementacion local actual.

Reglas:

- Es el unico archivo que debe importar `src/utils/localContentStore.js`.
- Mantiene CRUD, overrides, hidden, legacy letters, opened/read y simulation unlocked.
- Debe conservar comportamiento local actual mientras exista modo local.

### Regla futura para Supabase

- No meter Supabase directo en componentes.
- No meter Supabase directo en `contentService.js` si puede evitarse.
- Supabase futuro deberia entrar mediante un repository remoto o selector de repository.
- No cambiar la API sync a async sin un plan de compatibilidad.

## 3. API publica de contentService

### CRUD generico

Estas funciones trabajan con una `collectionName` y delegan hoy en `contentRepository`.

- `getCollectionItems(collectionName)`
- `saveCollectionItems(collectionName, items)`
- `addCollectionItem(collectionName, item)`
- `updateCollectionItem(collectionName, id, patch)`
- `deleteCollectionItem(collectionName, id)`

Contrato actual:

- Devuelven arrays para contenido local.
- Los items locales deben conservar `isLocal: true`.
- Las comparaciones de ids deben tolerar strings y numeros usando equivalencia por `String(id)`.
- `addCollectionItem` puede asignar `displayLabel` tipo `Local N` si falta.

### Overrides

Los overrides representan ediciones locales sobre contenido base JSON.

- `getCollectionOverrides(collectionName)`
- `saveCollectionOverrides(collectionName, overrides)`
- `setCollectionOverride(collectionName, id, patch)`
- `deleteCollectionOverride(collectionName, id)`

Contrato actual:

- Devuelven objetos planos.
- La llave de cada override es `String(id)` del item base.
- El JSON base no se modifica.
- Restaurar un item base editado significa eliminar su override.

### Hidden

Hidden representa items base JSON ocultos localmente.

- `getCollectionHiddenIds(collectionName)`
- `saveCollectionHiddenIds(collectionName, ids)`
- `hideCollectionItem(collectionName, id)`
- `restoreCollectionItem(collectionName, id)`

Contrato actual:

- Devuelven arrays de ids como strings.
- Ocultar un item base no borra el JSON base.
- Restaurar un item base oculto elimina su id del array hidden.

### Merge y eventos

- `mergeCollectionWithLocal(defaultItems, collectionName)`
- `notifyContentUpdated(collectionName)`
- `notifyAllContentUpdated()`

Contrato actual de merge:

- Combina contenido base JSON, overrides, hidden y locales.
- Excluye items base cuyo id este en hidden.
- Aplica overrides sobre items base.
- Conserva ids originales de items base.
- Marca items base con `isLocal: false`.
- Marca items base editados con `isOverridden: true`.
- Agrega items locales al final.

Contrato actual de eventos:

- `notifyContentUpdated(collectionName)` dispara `distancia-cero-content-updated`.
- El evento incluye `detail.collection` y `detail.collectionName`.
- `notifyAllContentUpdated()` usa la coleccion `all`.

### Cartas legacy monthly/openWhen

Estas funciones centralizan keys historicas que deben mantenerse por compatibilidad:

- `getLegacyMonthlyLetters()`
- `saveLegacyMonthlyLetters(items)`
- `getLegacyOpenWhenLetters()`
- `saveLegacyOpenWhenLetters(items)`

Contrato actual:

- Leen y guardan arrays.
- Si LocalStorage falla o el JSON esta corrupto, la lectura debe devolver `[]`.
- No deben cambiar las keys existentes.

### Opened/read

Estas funciones guardan progreso de cartas abiertas/leidas.

- `isMonthlyLetterOpened(id)`
- `setMonthlyLetterOpened(id, value = true)`
- `isOpenWhenLetterOpened(id)`
- `setOpenWhenLetterOpened(id, value = true)`

Contrato actual:

- `is*Opened(id)` devuelve `true` solo si el valor guardado es `"opened"`.
- `set*Opened(id, true)` guarda `"opened"`.
- `set*Opened(id, false)` elimina la key.
- Nunca se debe guardar `"false"`.
- Si `id` es null, undefined o vacio, no debe romper.

### Simulation unlocked

Estas funciones guardan el modo prueba local.

- `getSimulationUnlocked()`
- `setSimulationUnlocked(value)`

Contrato actual:

- `getSimulationUnlocked()` devuelve `true` solo si la key vale `"1"`.
- `setSimulationUnlocked(true)` guarda `"1"`.
- `setSimulationUnlocked(false)` elimina la key.
- Nunca se debe guardar `"false"`.

## 4. Colecciones soportadas

El contrato actual reconoce estas colecciones:

- `monthlyLetters`
- `openWhenLetters`
- `reasons`
- `promises`
- `importantDates`
- `futureDreams`
- `timeline`
- `blackHoleGallery`
- `playlist`

Notas:

- `monthlyLetters` y `openWhenLetters` tienen contenido local legacy en keys antiguas, pero sus overrides y hidden ya usan el sistema generico.
- `reasons`, `promises`, `importantDates`, `futureDreams`, `timeline`, `blackHoleGallery` y `playlist` usan el sistema generico para contenido local, overrides y hidden.

## 5. Shapes conceptuales

### Contenido base JSON

Es el contenido importado desde `src/data/*.json`. La app puede mostrarlo, editarlo por override u ocultarlo localmente, pero no debe modificar esos archivos JSON desde runtime.

### `content.<collection>`

Representa items locales nuevos creados por el usuario.

Forma conceptual:

```js
{
  id: 'local-id',
  isLocal: true,
  displayLabel: 'Local 1',
  ...fields
}
```

Los campos reales dependen de la coleccion.

### `overrides.<collection>`

Representa cambios locales sobre items base.

Forma conceptual:

```js
{
  [baseId]: {
    id: baseId,
    ...patch
  }
}
```

### `hidden.<collection>`

Representa ids de items base ocultos.

Forma conceptual:

```js
['base-id-1', 'base-id-2']
```

### Contenido local

Es contenido creado desde Centro del Universo. Puede editarse y eliminarse localmente.

### Contenido editado

Es contenido base JSON con override local. Restaurar significa borrar el override.

### Contenido oculto/restaurado

Ocultar agrega el id base a hidden. Restaurar elimina el id de hidden.

## 6. Eventos

### `distancia-cero-content-updated`

Evento global usado para que componentes visibles refresquen contenido local sin recargar toda la app.

Detail actual esperado:

```js
{
  collection: 'reasons',
  collectionName: 'reasons'
}
```

Valores usados:

- una coleccion especifica, por ejemplo `reasons`, `playlist`, `timeline`;
- `monthlyLetters`;
- `openWhenLetters`;
- `letters`;
- `all`.

Reglas:

- No romper el nombre del evento.
- No eliminar `detail.collection`.
- No eliminar `detail.collectionName` mientras existan listeners que puedan usarlo.
- Si se agrega backend, el evento sigue siendo necesario para sincronizar UI local despues de guardar.

## 7. Legacy keys

Estas keys existen por compatibilidad y no deben borrarse sin migracion explicita.

### Cartas mensuales locales

```txt
distancia-cero-local-monthly-letters
```

Usada por:

- `getLegacyMonthlyLetters()`
- `saveLegacyMonthlyLetters(items)`

### Cartas "Abrir cuando" locales

```txt
distancia-cero-local-open-when
```

Usada por:

- `getLegacyOpenWhenLetters()`
- `saveLegacyOpenWhenLetters(items)`

### Opened/read mensual

```txt
distancia-cero-monthly-letter-${id}
```

Valor abierto:

```txt
opened
```

### Opened/read abrir-cuando

```txt
distancia-cero-open-when-${id}
```

Valor abierto:

```txt
opened
```

### Simulation unlocked

```txt
distancia-cero-sim-unlocked
```

Valor activo:

```txt
1
```

## 8. Export/import v2

El respaldo local v2 mantiene este shape conceptual:

```js
{
  version: 2,
  exportedAt: 'fecha ISO',
  source: 'Distancia Cero - Centro del Universo',
  content: {
    monthlyLetters: [],
    openWhenLetters: [],
    reasons: [],
    promises: [],
    importantDates: [],
    futureDreams: [],
    timeline: [],
    blackHoleGallery: [],
    playlist: []
  },
  overrides: {
    monthlyLetters: {},
    openWhenLetters: {},
    reasons: {},
    promises: {},
    importantDates: {},
    futureDreams: {},
    timeline: {},
    blackHoleGallery: {},
    playlist: {}
  },
  hidden: {
    monthlyLetters: [],
    openWhenLetters: [],
    reasons: [],
    promises: [],
    importantDates: [],
    futureDreams: [],
    timeline: [],
    blackHoleGallery: [],
    playlist: []
  }
}
```

Reglas de compatibilidad:

- Import v1 solo debe reemplazar cartas locales legacy.
- Import v1 no debe borrar razones, promesas, fechas, wishlist, timeline, galeria, playlist, overrides ni hidden.
- Import v2 incompleto no debe borrar datos existentes de colecciones que no vengan en el archivo.
- Si la validacion falla, no se debe borrar ni reemplazar nada.
- Export/import debe seguir sirviendo como backup offline incluso cuando exista backend.

## 9. Reglas para futura migracion

- `contentService` debe conservar su API publica mientras sea posible.
- No meter Supabase directo en componentes visibles.
- No meter Supabase directo en `CentroUniversoSection.jsx`.
- No meter Supabase directo en `contentService.js` si puede evitarse.
- Un repository remoto futuro debe vivir debajo de `contentService`.
- La implementacion local del repository debe seguir disponible y no cambiar comportamiento.
- Supabase debe entrar despues de fijar Auth, ownership y RLS.
- Fotos Data URL son compatibilidad local, no solucion final.
- La solucion final para fotos debe ser Storage + metadata en base de datos.
- JSON base no debe modificarse desde la app.
- El modo local debe seguir existiendo como fallback y herramienta de desarrollo.
- Si se introduce async, debe planearse sin romper componentes que hoy esperan funciones sync.

### Metadata de autoria local actual

`src/services/contentMetadataService.js` existe como helper sync de metadata local/dev.

La metadata actual aplica solo a items locales genericos creados o editados por:

- `localContentRepository.addCollectionItem`
- `localContentRepository.updateCollectionItem`

Campos actuales:

- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`
- `source`
- `spaceId`

Al crear un item local generico:

- `createdBy` usa el usuario local actual.
- `updatedBy` usa el usuario local actual.
- `createdAt` usa el timestamp actual.
- `updatedAt` usa el timestamp actual.
- `source` usa `local-dev`.
- `spaceId` usa el space local actual.

Al editar un item local generico:

- `createdBy` y `createdAt` se preservan si existen.
- `updatedBy` usa el usuario local actual.
- `updatedAt` usa el timestamp actual.
- `source` y `spaceId` se preservan si ya existian.
- No se agrega `createdBy` ni `createdAt` durante update.

La metadata no aplica a:

- Contenido existente que no se edite.
- JSON base.
- Overrides.
- Hidden ids.
- Cartas legacy monthly/openWhen si no pasan por `addCollectionItem`.
- Opened/read.
- Simulation unlocked.

Export/import v2 no cambia de version. La metadata viaja como campos extra opcionales dentro de items locales; backups viejos sin metadata siguen funcionando e import v2 debe tolerar items con o sin metadata.

## 10. Riesgos anotados

### Async futuro

La API actual es sync. Supabase sera async. Cambiar las funciones publicas a promises de golpe romperia componentes. Antes debe existir una estrategia gradual: cache local, hooks, hydration o repository async con capa compatible.

### Auth

Sin Auth no hay identidad real de autor. Con Auth se debe definir sesion, perfiles, roles y acceso compartido entre usuarios.

### `createdBy` / `updatedBy`

Los nuevos items locales genericos ya registran `createdBy` / `updatedBy` en modo local/dev. El contenido existente, JSON base, overrides, hidden, cartas legacy, opened/read y simulation unlocked no reciben metadata automaticamente.

### RLS

RLS es el riesgo mas alto. Una policy incorrecta puede exponer cartas, fotos o contenido privado entre universos.

### Conflictos entre usuarios

Si ambos editan el mismo item, se necesita una regla: ultimo write gana, historial/audit log, bloqueo optimista o resolucion manual.

### Fotos

Data URL puede inflar LocalStorage y backups. Futuro correcto: Supabase Storage, limites de peso, metadata, ownership y cleanup de archivos no usados.

### Compatibilidad con modo local

El modo local debe seguir funcionando para desarrollo, backup offline y rollback. Supabase no debe ser requisito para abrir la app.

## 11. Validacion para cambios futuros

Antes y despues de cambios sobre esta capa:

```txt
git status
npm.cmd run build
git diff --stat
```

Pruebas manuales recomendadas:

- Crear, editar y eliminar contenido local.
- Editar, restaurar, ocultar y restaurar contenido base.
- Exportar backup v2.
- Importar backup v1 sin borrar colecciones nuevas.
- Importar backup v2 incompleto sin borrar datos ausentes.
- Abrir cartas y confirmar progreso opened/read.
- Activar/desactivar modo prueba.

## 7. Patrón useCrudCollection (Refactor 2026-07-23)

### Propósito

`useCrudCollection` es un hook genérico que encapsula todo el estado, handlers y datos derivados para una colección CRUD. Reemplaza ~30 useState y ~20 handlers por colección.

### Ubicación

`src/components/centro-universo/useCrudCollection.ts`

### API

```ts
function useCrudCollection(
  collectionName: string,
  defaultData: ContentItem[],
  fieldSchema: CrudFieldSchema,
  options?: CrudOptions
): CrudCollectionAPI
```

### CrudFieldSchema

```ts
interface CrudFieldSchema {
  fields?: CrudField[]      // Definición de campos del formulario
  idPrefix?: string          // Prefijo para IDs locales (default: `local-{name}-`)
  validate?: (form) => string | null  // Validación custom
}

interface CrudField {
  name: string               // Nombre del campo (key en ContentItem)
  label: string              // Etiqueta visible
  required?: boolean         // Campo requerido
  type?: 'text' | 'textarea' | 'date' | 'select'
  rows?: number              // Filas para textarea
  placeholder?: string
  options?: { value: string; label: string }[]  // Para tipo select
}
```

### CrudOptions

```ts
interface CrudOptions {
  transformForStorage?: (item: ContentItem) => ContentItem  // Form → Storage
  transformForEdit?: (item: ContentItem) => ContentItem      // Storage → Form
}
```

### CrudCollectionAPI (retorno del hook)

```ts
interface CrudCollectionAPI {
  // Datos
  localItems, visibleBaseItems: ContentItem[]
  overrides: OverrideMap
  hiddenIds: string[]
  // Stats
  editedBaseCount, hiddenBaseCount, localCount, totalCount: number
  // Form state (local)
  form, getFormValue, setFormValue, editingId
  // Form state (base)
  baseForm, getBaseFormValue, setBaseFormValue, editingBaseId
  // Handlers
  handleSubmit, handleEdit, handleDelete
  handleBaseEdit, handleBaseSubmit, handleBaseRestore, handleBaseHide, handleBaseUnhide
  resetForm, resetBaseForm
  // Lifecycle
  loadData, dispatchContentUpdate
}
```

### CrudEditorPanel

Componente que renderiza ambos paneles (local + base) para un `useCrudCollection`. Props adicionales:

- `localFormExtras?: ReactNode` — JSX insertado antes de los botones del formulario local
- `baseFormExtras?: ReactNode` — JSX insertado antes de los botones del formulario base

### Migración legacy

`migrateLegacyLettersIfNeeded()` en `localContentRepository.ts`:
- Lee cartas de llaves legacy (`distancia-cero-local-monthly-letters`, `distancia-cero-local-open-when`)
- Escribe en llaves estándar de colección
- Marca flag `distancia-cero-legacy-migrated-v1` para no repetir
- Se llama UNA vez al iniciar el CMS desde el `useEffect` de inicialización

### Colecciones migradas

Las 9 colecciones usan `useCrudCollection`:

| Colección | Campos destacados | Transform |
|---|---|---|
| reasons | title, text | — |
| promises | title, text, tag | — |
| importantDates | date, title, description, tag | — |
| futureDreams | category, title, description | — |
| playlist | title, artist, description, sourceType, src, link, tag | — |
| timeline | chapter, date, title, subtitle, description, quote, details, mood | date ↔ normalize/parse, details ↔ array/text |
| blackHoleGallery | date, title, description, image, alt, tag, videoUrl | image upload vía localFormExtras |
| monthlyLetters | month, title, preview, content, tag, locked | content ↔ array/text, locked ↔ boolean/select |
| openWhenLetters | mood, title, preview, content, tag, locked | content ↔ array/text, locked ↔ boolean/select |
- Validar que los componentes visibles refrescan con `distancia-cero-content-updated`.

# Distancia Cero - Content Contract

Contrato local contrastado con la fuente el 7 de octubre de 2026; ajustes generales y ampliación del respaldo actualizados el 26 de octubre. Resultados y alcance de verificación en [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md); la preparación remota descrita aquí no acredita una integración activa.

## 1. Resumen

El CRUD editable actual de Distancia Cero esta centralizado con esta ruta:

```txt
Componentes visibles -> src/services/contentService.ts -> src/repositories/localContentRepository.ts -> src/utils/localContentStore.ts -> LocalStorage
```

Los componentes no deben leer ni escribir `src/utils/localContentStore.ts` directamente. La fachada publica para contenido editable es `src/services/contentService.ts`.

El modo validado en esta etapa es local, sin backend ni autenticacion real. El repositorio contiene adaptadores remotos preparados, pero la integracion esta desactivada y no se ha validado en esta etapa. La identidad fake/dev ya aporta autoria opcional al CRUD local. Este documento fija el contrato actual y conserva las reglas para una implementacion remota futura sin reescribir componentes.

## 2. Capas repository actuales

### `src/services/contentService.ts`

`contentService.ts` es la fachada publica estable para componentes visibles y para el Centro del Universo.

Reglas:

- Conserva la API publica sync.
- No debe importar `src/utils/localContentStore.ts` directamente.
- Debe mantener nombres, firmas y return types mientras sea posible.
- Debe mantener el evento `distancia-cero-content-updated`.

### Import del repositorio local

El refactor local elimina `src/repositories/contentRepository.ts`, que solo re-exportaba el repositorio local. `contentService.ts` importa ahora directamente `localContentRepository.ts`; los componentes siguen usando la fachada publica del servicio. No cambian las claves de almacenamiento ni la API sincronica por esta simplificacion. Un selector remoto futuro requiere su propia etapa.

### `src/repositories/localContentRepository.ts`

`localContentRepository.ts` contiene la implementacion local actual.

Reglas:

- Es el unico archivo que debe importar `src/utils/localContentStore.ts`.
- Mantiene CRUD, overrides, hidden, legacy letters, opened/read y simulation unlocked.
- Debe conservar comportamiento local actual mientras exista modo local.

### Regla futura para Supabase

- No meter Supabase directo en componentes.
- No meter Supabase directo en `contentService.ts` si puede evitarse.
- Supabase futuro deberia entrar mediante un repository remoto o selector de repository.
- No cambiar la API sync a async sin un plan de compatibilidad.

## 3. API publica de contentService

### CRUD generico

Estas funciones trabajan con una `collectionName` y delegan hoy en `localContentRepository`.

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
- Los lectores de cartas notifican su coleccion despues de guardar progreso de lectura. El CMS notifica `letters` al alternar simulacion o reiniciar progreso; ambos lectores y las estadisticas actualizan su estado sin recargar la pagina ni remontar el formulario del CMS.
- `notifyAllContentUpdated()` usa la coleccion `all`.

### Cartas legacy monthly/openWhen

Estas funciones centralizan keys historicas que deben mantenerse por compatibilidad:

- `getLegacyMonthlyLetters()`
- `saveLegacyMonthlyLetters(items)`
- `getLegacyOpenWhenLetters()`
- `saveLegacyOpenWhenLetters(items)`

Contrato actual:

- Conservan sus nombres públicos, pero ahora leen y guardan en las colecciones estándar de cartas.
- Antes del marcador `distancia-cero-legacy-migrated-v2`, la lectura combina estándar y legacy por `String(id)`: gana estándar y se conservan las cartas exclusivas de legacy. La migración preserva IDs, etiquetas y metadata, y marca los elementos como locales.
- El marcador v1 no demuestra que legacy esté obsoleto: las versiones anteriores aún importaban ahí. Se conserva la unión visible al migrar; no se puede deducir cuáles ausencias fueron borrados históricos.
- Tras v2, las claves legacy permanecen como archivo, pero ya no se mezclan. Borrar o reemplazar cartas en estándar no recupera copias antiguas.
- El CMS intenta migrar al montar. Las escrituras de cartas también preparan la migración; una restauración incluye migración y contenido en la misma operación recuperable.
- Las lecturas habituales conservan sus valores vacíos de fallback cuando falla el acceso/JSON. La migración, exportación y mutaciones que necesitan leer el estado previo usan lecturas estrictas para no sustituirlo por un vacío ante un fallo.

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

- Las nueve colecciones usan claves estándar `distancia-cero-content-<collection>` y sus sufijos `-overrides` y `-hidden`. Las cartas también pueden leerse desde legacy antes de completar la migración v2.
- Las nueve colecciones usan el sistema generico para contenido local, overrides y hidden. Los helpers legacy de cartas conservan compatibilidad sobre sus colecciones estandar.

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

Leída por compatibilidad antes de v2; después queda archivada. El helper `saveLegacyMonthlyLetters` escribe en la colección estándar.

### Cartas "Abrir cuando" locales

```txt
distancia-cero-local-open-when
```

Leída por compatibilidad antes de v2; después queda archivada. El helper `saveLegacyOpenWhenLetters` escribe en la colección estándar.

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

## Ajustes generales locales

`SiteSettings` (`src/types/siteSettings.ts`) contiene overrides de siete campos de `src/data/siteConfig.json`:

```ts
interface SiteSettings {
  couple?: { yourName?: string; herName?: string; mainPairName?: string }
  dates?: { metDate?: string; relationshipStartDate?: string; nextMeetingDate?: string }
  hero?: { titleName?: string }
}
```

La clave es `distancia-cero-site-settings`. Los campos ausentes usan la plantilla; un título efectivo vacío usa el nombre de la pareja, sin reemplazar un título explícito. Son ajustes de presentación, separados de `CONTENT_COLLECTIONS`: no cambian identidades, autoría, audio, escenas ni claves narrativas.

`validateSiteSettings(input)` valida y copia sin escribir. Solo admite objetos planos y los campos string anteriores; rechaza grupos/campos desconocidos y prototipos ajenos. Los nombres se recortan y admiten hasta 80 caracteres; `mainPairName`, si se incluye, no puede quedar vacío. Las fechas son días reales `YYYY-MM-DD`, años `0001`–`9999`; se permiten fechas futuras y no se impone orden entre ellas. No desbloquean cartas.

La API síncrona `siteSettingsService` expone `getSiteSettings()`, `saveSiteSettings(input: unknown)` y `resetSiteSettings()`. Guardar reemplaza el documento completo de overrides; omitir un campo vuelve a la plantilla. Reset guarda `{}`. La escritura pasa por el repositorio y `writeStorageTransaction`, sin sincronización remota. Solo un guardado satisfactorio emite `distancia-cero-settings-updated`; los fallos de persistencia lanzan `ContentStorageError` y el formulario conserva el borrador.

La lectura de la experiencia devuelve `{}` si los ajustes son inaccesibles o están dañados, sin reescribirlos. La exportación usa lectura estricta y falla para evitar omitirlos silenciosamente. Los hooks `useSiteSettings`/`useSiteConfig` reciben el evento propio, `storage` de esa clave o vaciado del origen y contenido `all` al importar. Portada, landing, introducción y contadores usan la configuración resuelta. Un borrador se conserva ante cambios externos detectados y requiere cargar los ajustes actuales antes de guardar; no es un bloqueo de escrituras concurrentes.

`SetupGuide` ofrece una guía opcional dentro del CMS con Nombres, Fechas y Revisar. Comparte campos y conversión con `GeneralSettingsPanel` mediante `siteSettingsForm`; no añade claves de almacenamiento. Valida cada paso y guarda todos los ajustes únicamente al confirmar la revisión con el mismo servicio. Volver conserva el borrador; cancelar confirma si cambió y no escribe. Los ajustes existentes se precargan; cambios externos bloquean continuar hasta cargar los actuales. Un fallo al guardar conserva revisión y borrador. El estado del recorrido es temporal y no se incluye en respaldos.

## 8. Export/import v2

El respaldo local v2 mantiene este shape conceptual:

```js
{
  version: 2,
  exportedAt: 'fecha ISO',
  source: 'Distancia Cero - Centro del Universo',
  settings: {}, // Overrides generales; no la configuración completa resuelta
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

- Import v1 reemplaza las cartas locales incluidas en `monthlyLetters` y/o `openWhenLetters` en la raíz del documento. Escribe en estándar, incluso si ya existe un elemento con el mismo ID.
- Import v1 no debe borrar razones, promesas, fechas, wishlist, timeline, galeria, playlist, overrides, hidden ni ajustes generales; ignora `settings` en v1.
- Import v2 incompleto conserva los apartados ausentes de `content`, `overrides` y `hidden`, por colección. Un `[]` o `{}` explícito reemplaza ese apartado por vacío; no elimina los JSON base.
- En v2, `settings` ausente conserva los ajustes actuales; si está presente reemplaza los overrides generales tras validarlos. `settings: {}` restaura la plantilla; sus campos ausentes toman valores base, sin mezclar con los overrides anteriores. Las exportaciones nuevas siempre incluyen `settings`, vacío si no hay personalización.
- Debe existir al menos un apartado de una colección reconocida o `settings` en v2. Se acepta un respaldo solo de ajustes, incluso `{ version: 2, settings: {} }`. Se rechazan versiones desconocidas, contenedores incorrectos, elementos sin ID válido, IDs duplicados por `String(id)`, overrides cuyo ID no coincide con su clave, tipos incorrectos en campos renderizados y claves de prototipo peligrosas. Los campos extra compatibles y la metadata opcional se preservan.
- Lectores anteriores de v2 pueden restaurar las colecciones de un respaldo completo e ignorar estos ajustes. Un respaldo solo de ajustes necesita esta versión; no se garantiza recuperar nombres/fechas en una app antigua.
- `validateContentBackup(input)` valida sin escribir; `restoreContentBackup(input)` vuelve a validar, restaura y notifica `all` solo al tener éxito. `exportContentBackup()` devuelve un documento v2 completo y comprueba que sea restaurable.
- La restauración conserva IDs/metadata, normaliza `isLocal: true` en creaciones y los IDs ocultos a strings. No regenera autoría ni fechas.
- Si la validacion falla, no se debe borrar ni reemplazar nada.
- Export/import debe seguir sirviendo como backup offline incluso cuando exista backend.

Alcance del archivo:

- Incluye creaciones de las nueve colecciones, overrides, ocultos y los siete ajustes generales; enlaces/rutas multimedia y fotos pegadas como Data URL viajan dentro de esos elementos.
- No incluye los JSON base, progreso de cartas/misiones, simulación, identidad, configuración de escenas/audio ni otros ajustes fuera de esos siete campos.
- No contiene los archivos físicos de audio/video ni imágenes referenciadas por URL/ruta. Esas referencias siguen necesitando el archivo o servicio de origen.

Errores de persistencia:

- Las escrituras de contenido ya no devuelven un éxito aparente cuando localStorage falla: lanzan `ContentStorageError`, que los formularios y BackupPanel muestran al usuario. El borrador y la selección se conservan si guardar falla.
- Se serializan los valores y se captura el estado anterior de todas las claves antes de escribir. Ante una escritura fallida, se eliminan las nuevas escrituras y se recuperan los valores anteriores, incluida la ausencia original de una clave. Las claves ajenas a la operación permanecen intactas.
- Contenido, overrides, ocultos, ajustes y migración pendiente participan en la misma llamada a `writeStorageTransaction`. Ajustes inválidos impiden todas las escrituras; un fallo capturado intenta recuperar juntos los apartados anteriores. No se notifica `all` si falla.
- Si también falla la recuperación, el error indica recuperación incompleta. localStorage no ofrece transacciones: este rollback cubre errores capturados durante la operación, no un cierre abrupto del navegador ni escrituras concurrentes de otra pestaña.
- Los helpers históricos de progreso/simulación conservan su tolerancia previa a fallos; el cambio de errores afecta contenido, migración y respaldos.
- Cada hook CRUD escucha su colección, `all` y (para cartas) `letters`, refrescando datos sin borrar borradores ni remontar formularios.

## 9. Reglas para futura migracion

- `contentService` debe conservar su API publica mientras sea posible.
- No meter Supabase directo en componentes visibles.
- No meter Supabase directo en `CentroUniversoSection.tsx`.
- No meter Supabase directo en `contentService.ts` si puede evitarse.
- Un repository remoto futuro debe vivir debajo de `contentService`.
- La implementacion local del repository debe seguir disponible y no cambiar comportamiento.
- Supabase debe entrar despues de fijar Auth, ownership y RLS.
- Fotos Data URL son compatibilidad local, no solucion final.
- La solucion final para fotos debe ser Storage + metadata en base de datos.
- JSON base no debe modificarse desde la app.
- El modo local debe seguir existiendo como fallback y herramienta de desarrollo.
- Si se introduce async, debe planearse sin romper componentes que hoy esperan funciones sync.

### Metadata de autoria local actual

`src/services/contentMetadataService.ts` existe como helper sync de metadata local/dev.

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

Los helpers de autoria no agregan metadata a:

- Contenido existente que no se edite.
- JSON base.
- Overrides.
- Hidden ids.
- Cartas legacy monthly/openWhen si no pasan por `addCollectionItem`.
- Opened/read.
- Simulation unlocked.

Los overrides creados desde el CMS pueden incluir `updatedAt`, generado por el formulario. Esto no asigna `createdBy`, `updatedBy`, `source` ni `spaceId` al contenido base ni cambia el JSON original.

Export/import v2 no cambia de version. La metadata viaja como campos extra opcionales dentro de items locales; backups viejos sin metadata siguen funcionando e import v2 debe tolerar items con o sin metadata.

## 10. Riesgos anotados

### Async futuro

La API actual es sync. Supabase sera async. Cambiar las funciones publicas a promises de golpe romperia componentes. Antes debe existir una estrategia gradual: cache local, hooks, hydration o repository async con capa compatible.

### Auth

Sin Auth no hay identidad real de autor. Con Auth se debe definir sesion, perfiles, roles y acceso compartido entre usuarios.

### `createdBy` / `updatedBy`

Los nuevos items locales genericos ya registran `createdBy` / `updatedBy` en modo local/dev. El contenido existente sin editar, JSON base, overrides, hidden, cartas legacy, opened/read y simulation unlocked no reciben autoria automaticamente.

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
npm.cmd run verify:local
git diff --stat
```

`verify:local` comprueba tipos, unitarias y build con la integracion remota desactivada. Los recorridos de navegador se ejecutan por separado con `npm.cmd run test:e2e`; la comprobacion de preview/PWA usa `npm.cmd run test:e2e:preview` despues del build. No editar fuentes, configuracion, pruebas ni documentacion mientras se ejecutan recorridos contra el servidor de desarrollo: Tailwind observa documentos y puede provocar una recarga que invalide las comprobaciones de persistencia del documento.

Pruebas manuales recomendadas:

- Crear, editar y eliminar contenido local.
- Editar, restaurar, ocultar y restaurar contenido base.
- Exportar backup v2.
- Importar backup v1 sin borrar colecciones nuevas.
- Importar backup v2 incompleto sin borrar datos ausentes.
- Abrir cartas y confirmar progreso opened/read.
- Activar/desactivar modo prueba.

## 12. Patrón useCrudCollection (Refactor 2026-07-23)

### Propósito

`useCrudCollection` es un hook genérico que encapsula todo el estado, handlers y datos derivados para una colección CRUD. Reemplaza ~30 useState y ~20 handlers por colección.

### Ubicación

`src/components/centro-universo/useCrudCollection.ts`

### API

```ts
function useCrudCollection(
  collectionName: string,
  defaultData: ContentItem[],
  fieldSchema?: CrudFieldSchema,
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
  notice: { type: 'success' | 'error'; message: string } | null
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
- Combina con las cartas estándar por ID, con prioridad estándar, y escribe la unión conservando metadata.
- Marca `distancia-cero-legacy-migrated-v2` solo dentro de la operación completada; v1 queda como referencia histórica.
- Se intenta al iniciar el CMS; las escrituras de cartas y los respaldos también cubren la migración pendiente. Es idempotente tras v2.

### Colecciones migradas

Las 9 colecciones usan `useCrudCollection`:

`src/components/centro-universo/cmsCollections.ts` contiene sus campos, prefijos de ID, validaciones y transformaciones. `CentroUniversoSection.tsx` mantiene los nueve hooks explicitos y renderiza los paneles con esa configuracion.

| Colección | Campos destacados | Transform |
|---|---|---|
| reasons | title, text | — |
| promises | title, text, tag | — |
| importantDates | date, title, description, tag | — |
| futureDreams | category, title, description | — |
| playlist | title, artist, description, sourceType, src, link, tag | — |
| timeline | chapter, date, title, subtitle, description, quote, details, mood | date ↔ normalize/parse, details ↔ array/text |
| blackHoleGallery | date, title, description, image, alt, tag, videoUrl | image upload vía localFormExtras y baseFormExtras |
| monthlyLetters | month, title, preview, content, tag, locked | content ↔ array/text, locked ↔ boolean/select |
| openWhenLetters | mood, title, preview, content, tag, locked | content ↔ array/text, locked ↔ boolean/select |
- Validar que los componentes visibles refrescan con `distancia-cero-content-updated`.

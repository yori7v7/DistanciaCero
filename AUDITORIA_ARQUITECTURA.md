# 🔍 Auditoría Técnica y Arquitectónica — Distancia Cero

> **Documento histórico.** Conserva el análisis de agosto de 2026; sus rutas, conteos, hallazgos y recomendaciones no describen automáticamente el working tree actual. El repositorio pass-through citado se eliminó, el lector de cartas se comparte y el CMS se refactorizó durante el pulido local. Consultar [AVANCE_PULIDO_LOCAL.md](docs/AVANCE_PULIDO_LOCAL.md) para el estado comprobado y [CLAUDE.md](CLAUDE.md) para arquitectura y comandos vigentes. Este informe no autoriza activar remoto ni publicar.

> **Fecha**: 2026-08-07
> **Alcance**: Análisis completo del proyecto (85 archivos fuente, ~10,686 líneas de código)
> **Estado**: Reporte Fase 1 — Sin modificaciones aplicadas

---

## 1. RESUMEN EJECUTIVO

**Distancia Cero** es una SPA romántica interactiva construida con React 19, Vite 8, Three.js y Tailwind CSS v4. El proyecto tiene **~10,686 líneas de código** distribuido en 85 archivos fuente, con 11 archivos de test (162 tests).

### Valoración general: **BUENA** (7/10)

El proyecto tiene **buenas bases arquitectónicas** y decisiones acertadas para su escala actual. La capa de datos está bien diseñada con un patrón Repository claro y un hook CRUD genérico reutilizable. Sin embargo, hay **problemas de acoplamiento en la capa de presentación** y algunas **capas intermedias innecesarias** que añaden complejidad sin aportar valor.

### Lo más importante

- ✅ La arquitectura de datos (localStorage → Store → Repository → Service → Hook → UI) es **sólida y bien encapsulada**
- ✅ El patrón `useCrudCollection` es una **excelente abstracción** que elimina duplicación
- ❌ Hay **capas pass-through innecesarias** (`contentRepository.ts` es 1 línea)
- ❌ `App.tsx` y `CentroUniversoSection.tsx` son **puntos de acoplamiento** que crecerán con cada nueva feature
- ❌ La integración Supabase está **bien aislada pero sobre-diseñada** para estar inactiva

---

## 2. ARQUITECTURA ACTUAL

### 2.1 Estructura de capas

```
┌──────────────────────────────────────────────┐
│  COMPONENTES (React)                         │
│  App.tsx → 27 componentes + lazy loading     │
├──────────────────────────────────────────────┤
│  HOOKS (useCrudCollection)                   │
│  Hook genérico CRUD para 9 colecciones        │
├──────────────────────────────────────────────┤
│  SERVICES (contentService, authService, ...) │
│  Fachada sync + sync hooks a Supabase        │
├──────────────────────────────────────────────┤
│  REPOSITORIES                                │
│  contentRepository → localContentRepository  │
│  (remoteContentRepository: skeleton)         │
├──────────────────────────────────────────────┤
│  STORE (localContentStore)                   │
│  Acceso directo a localStorage               │
├──────────────────────────────────────────────┤
│  DATA (JSON files)                           │
│  15 archivos JSON con contenido              │
└──────────────────────────────────────────────┘
```

### 2.2 Flujo de datos actual

```
Componente → contentService → contentRepository (1 línea) → localContentRepository → localContentStore → localStorage
                                                              ↑
                              Supabase (fire-and-forget) ────┘ (inactivo)
```

### 2.3 Estructura de archivos actual

```
src/
├── App.tsx                    # 95 líneas — Orquesta todas las secciones
├── main.tsx                   # 53 líneas — Entry point, router, reset
├── components/                # 27 componentes React
│   ├── centro-universo/       # 5 archivos — CMS genérico
│   ├── [20 secciones].tsx     # 1 componente por sección
│   └── [utilidades]           # AuthGate, ErrorBoundary, etc.
├── context/                   # 1 archivo — AudioContext (198 líneas)
├── data/                      # 15 archivos JSON
├── services/                  # 8 archivos de servicio
├── repositories/              # 4 archivos (1 línea, contract, local, remote)
├── integrations/supabase/     # 1 archivo — Factory de cliente
├── utils/                     # 3 archivos (helpers, store, identity store)
├── types/                     # 4 archivos de tipos
├── constants/                 # 1 archivo — Usuarios locales fake
├── __tests__/                 # 11 archivos de test
└── styles/                    # 1 archivo CSS (~6,444 líneas)
```

### 2.4 Estadísticas

| Métrica | Valor |
|---|---|
| Total archivos fuente | 85 |
| Total líneas de código | ~10,686 |
| Componentes React | 27 |
| Servicios | 8 |
| Repositorios | 4 |
| Tipos | 4 archivos |
| Tests | 11 archivos / 162 tests |
| Archivos de datos JSON | 15 |
| Dependencias runtime | 7 |
| Dependencias dev | 13 |

---

## 3. COSAS QUE YA ESTÁN BIEN ✅

### 3.1 Arquitectura de datos sólida

La cadena `localContentStore → localContentRepository → contentService → useCrudCollection → Componentes` está **muy bien diseñada**:

- **`localContentStore.ts`** (243 líneas): Acceso puro a localStorage con manejo de errores (QuotaExceededError, private browsing). Bien encapsulado. Es la ÚNICA capa que toca localStorage directamente.
- **`localContentRepository.ts`** (248 líneas): Añade metadata (createdBy, updatedAt) y lógica de legacy migration. Correctamente ubicado sobre el store.
- **`useCrudCollection.ts`** (275 líneas): Hook genérico que encapsula TODO el estado y handlers CRUD para cualquier colección. Excelente abstracción.

### 3.2 Patrón CRUD reutilizable

El hook `useCrudCollection` + `CrudEditorPanel` es una **decisión arquitectónica excelente**:

- 9 colecciones usan exactamente el mismo patrón
- Elimina ~200 líneas de código duplicado por colección
- Tipado completo con `CrudCollectionAPI`
- Soporte para transformForStorage/transformForEdit
- Consistente en todas las colecciones

### 3.3 Aislamiento de Supabase

La integración con Supabase está **impecablemente aislada**:

- `integrations/supabase/client.ts`: Factory con validación estricta de variables de entorno
- Feature flag `VITE_REMOTE_CONTENT_ENABLED` que controla TODO
- Sync hooks fire-and-forget que **nunca bloquean el flujo local**
- `remoteContentRepository.ts`: Skeleton que lanza errores explícitos si se usa sin implementar
- `contentRepositoryContract.ts`: Validación estructural del contrato

### 3.4 Documentación (CLAUDE.md)

El `CLAUDE.md` es **excelente**: cubre stack, rutas, estructura, arquitectura de datos, comandos, reglas, y plan de migración. Es una de las mejores documentaciones de proyecto que he visto.

### 3.5 Lazy loading inteligente

`App.tsx` usa `React.lazy()` + `Suspense` + `ErrorBoundary` para secciones pesadas (3D, galería). Esto es correcto y bien implementado. Cada sección tiene su propio ErrorBoundary con fallback label.

### 3.6 Diseño de tipos

Los tipos en `src/types/` son concisos y bien definidos:
- `ContentItem` con index signature para flexibilidad
- `ContentRepository` como contrato
- Tipos de audio e identidad separados

### 3.7 Manejo del reset

El patrón `?reset=1` en `main.tsx` con confirmación es limpio y seguro.

### 3.8 CLI de tests bien definido

Comandos claros para correr tests individuales o la suite completa.

### 3.9 CI/CD funcional con E2E

El workflow `.github/workflows/ci.yml` tiene 2 jobs encadenados: `verify` (tsc + build + vitest) → `e2e` (Playwright en chromium). Bien estructurado con Node 22, caché, y upload de reportes en failure.

### 3.10 Suite de tests sólida (162 tests, 0 fallos)

Los tests cubren bien la capa de datos: contentService, contentMetadataService, localContentRepository, localContentStore, useCrudCollection, helpers. Los tests son limpios, bien organizados con `describe`/`it`, y usan `beforeEach(() => localStorage.clear())` consistentemente.

---
---

## 4a. HALLAZGOS ADICIONALES (Skill `/code-review`)

Estos problemas fueron encontrados aplicando la metodología sistemática de la skill de code-review (checklists de React 19, TypeScript, y Security). No fueron detectados en el análisis manual inicial.

### 🔴 CRITICAL (Skill)

#### CS1. `window.open` con URL controlable por usuario — riesgo de stored XSS

- **Archivo**: `src/context/AudioContext.tsx` (línea 163)
- **Problema**: `window.open(item.link, '_blank', 'noopener,noreferrer')` abre una URL que proviene de items de playlist editables vía CMS. Un usuario con acceso al CMS podría inyectar `javascript:void(document.cookie)` u otras URLs maliciosas. Si bien `noopener` protege contra tab-napping, **no previene** URLs `javascript:` que ejecutan código en el contexto de la página actual.
- **Riesgo**: Stored XSS ejecutable por cualquier persona con la contraseña del CMS (que es `"contraseña"` por defecto en `siteConfig.json`).
- **Solución**: Validar que `item.link` comience con `https://` antes de pasarlo a `window.open`. Rechazar explícitamente protocolos `javascript:`, `data:`, `vbscript:`.

### 🟠 HIGH (Skill)

#### HS1. `delete (item as any).createdAt` — mutación de objeto con pérdida de tipo

- **Archivo**: `src/components/centro-universo/useCrudCollection.ts` (línea 177)
- **Problema**: `if (editingId) delete (item as any).createdAt` muta el objeto item para quitar createdAt antes del update. Usa `as any` para evadir el type system. Si el item tiene otros campos con restricciones de tipo, esta mutación silenciosa puede causar bugs.
- **Riesgo**: Type safety bypass. Si se agregan validaciones al tipo ContentItem, este `delete` las rompe en runtime sin warning de compilación.
- **Solución**: Usar destructuring: `const { createdAt, ...updateData } = item`. No mutar el original.

#### HS2. `AuthGate.tsx` — RPC `bootstrap_space` con Promise rejection suprimido

- **Archivo**: `src/components/AuthGate.tsx` (línea 25-28)
- **Problema**: `(client.rpc('bootstrap_space', {...}) as any).catch(() => {})` suprime cualquier error silenciosamente. Si el RPC falla (schema desactualizado, permisos, red), el usuario procede sin space creado y todas las operaciones de sync posteriores fallarán con errores oscuros.
- **Riesgo**: Estados inconsistentes difíciles de diagnosticar. El usuario cree que está syncado pero nada funciona.
- **Solución**: Mínimo: `console.warn` con el error. Ideal: guardar el error en estado para que la UI pueda advertir.

### 🟡 MEDIUM (Skill)

#### MS1. `supabaseSyncService.ts` — `lastSyncError` nunca se muestra al usuario

- **Archivo**: `src/services/supabaseSyncService.ts`
- **Problema**: La variable `lastSyncError` y su getter `getLastSyncError()` fueron diseñados para que la UI mostrara "tus cambios están solo locales". Pero ningún componente lee este valor ni lo muestra. Es infraestructura muerta: existe pero no se usa.
- **Solución**: Conectar `getLastSyncError()` a un indicador visual en la UI (ej. un banner en `CentroUniversoSection`).

### 🟢 LOW (Skill)

#### LS1. Subcomponentes 3D definidos en mismo archivo sin exportar

- **Archivos**: `BlackHoleGallerySection.tsx` (6 subcomponentes), `UniverseSection.tsx` (7 subcomponentes), `EntrelazadosSection.tsx` (3 subcomponentes)
- **Problema**: La guía de React recomienda que cada componente esté en su propio archivo para testabilidad y reusabilidad. Estos 16 subcomponentes están a nivel de módulo (correcto), pero no se exportan, no pueden testearse independientemente, y contribuyen al tamaño excesivo de los archivos (652, 443, 277 líneas).
- **Solución**: Mover a archivos separados dentro del feature folder.

---

## 4. PROBLEMAS ENCONTRADOS (continuación)

### 🔴 CRITICAL

#### C0. Vulnerabilidad de seguridad en react-router-dom (HIGH)

- **Archivo**: `package.json` → `react-router-dom: ^7.15.1`
- **Problema**: La versión 7.15.1 está en rango vulnerable (CVE-2025-68470 bypass, GHSA-wrjc-x8rr-h8h6). Vulnerabilidades: open redirect vía backslash en `<Link>`/`useNavigate`, RSC XSS, `deserializeErrors()` constructor injection, DoS vía route matching. El fix está en ≥ 7.18.2.
- **Riesgo**: **REAL**. La app usa `react-router-dom` activamente con `useNavigate`, `<Link>`, y `<BrowserRouter>`. Un atacante podría explotar el open redirect para phishing.
- **Solución**: Ejecutar `npm install react-router-dom@^7.18.2` inmediatamente. Es un one-liner sin cambios en código.
- **Auditoría completa**: `npm audit` reporta 6 vulnerabilidades (5 HIGH, 1 MODERATE), todas con fix disponible.

#### C1. `contentRepository.ts` es una capa innecesaria (1 línea)

- **Archivo**: `src/repositories/contentRepository.ts`
- **Contenido**: `export * from './localContentRepository'`
- **Por qué es un problema**: Es una indirección que no aporta valor. No hay selección dinámica entre repositorio local y remoto. Cualquier componente que importe de `contentRepository` recibe exactamente lo mismo que si importara de `localContentRepository`.
- **Riesgo**: Confunde a nuevos desarrolladores. Añade un archivo sin propósito. Viola YAGNI.
- **Solución**: Eliminar el archivo y hacer que `contentService.ts` importe directamente de `localContentRepository.ts`. Si en el futuro se necesita switchear entre local/remoto, se podrá añadir un factory en ese momento.

#### C2. `window.location.reload()` usado como state reset — anti-patrón React

- **Archivos**: `CentroUniversoSection.tsx` (líneas 304, 341), `SceneModeController.tsx` (línea 247)
- **Problema**: Usar `window.location.reload()` para resetear estado es un anti-patrón documentado en las guías de React. Destruye el árbol de componentes, pierde TODO el estado en memoria, causa un flash blanco, y es terrible UX. La simulación toggle y el cambio de identidad no deberían requerir recargar la página completa.
- **Riesgo**: Mala experiencia de usuario. Si en el futuro se agrega estado complejo (ej. formularios a medio llenar), la recarga lo destruirá.
- **Solución**: Usar React state + context para propagar cambios de identidad/simulación. Un `key` en un provider puede forzar re-render sin recargar la página.

#### C3. `contentService.ts` es mayoritariamente pass-through sin valor añadido

- **Archivo**: `src/services/contentService.ts` (197 líneas)
- **Problema**: De 20 funciones exportadas, 13 son wrappers directos del repositorio sin lógica adicional:
  ```ts
  export function getCollectionItems(collectionName: string): ContentItem[] {
    return contentRepository.getCollectionItems(collectionName)
  }
  ```
  Solo 6 funciones añaden sync a Supabase (que está inactivo).
- **Riesgo**: Mantener sincronizadas las firmas entre service y repository. Cambios en el repository requieren cambios mecánicos en el service.
- **Solución**: Consolidar. Mover la lógica de sync hooks al repository directamente, o eliminar el service y llamar al repository desde los hooks.

### 🟠 HIGH

#### H0. `MonthlyLetters.tsx` y `OpenWhenSection.tsx` — 95% duplicadas (gemelas)

- **Archivos**: `src/components/MonthlyLetters.tsx` (186 líneas) y `src/components/OpenWhenSection.tsx` (196 líneas)
- **Problema**: Son casi idénticas. Comparten: misma estructura de 4 estados, mismos listeners, misma lógica de merge, misma vista de lector de cartas, mismo grid de tarjetas con 6 ramas de status badge, mismos handlers de open/back/scrollIntoView. Solo difieren en: nombre de colección, campo `month` vs `mood`, y section id.
- **Riesgo**: Cualquier cambio en el comportamiento de cartas requiere modificar DOS archivos. Bug fix en uno = probablemente también necesario en el otro.
- **Solución**: Crear un componente parametrizado `LetterCollectionSection` que reciba `collectionName`, `moodField`, `sectionId`, etc. Las 382 líneas combinadas se reducirían a ~200.

#### H1. `App.tsx` — Punto central de acoplamiento para datos

- **Archivo**: `src/App.tsx` (95 líneas)
- **Problema**: `App.tsx` importa **10 archivos JSON** y los pasa como props a cada sección. Agregar una nueva sección requiere:
  1. Crear el componente
  2. Crear/importar el JSON
  3. Modificar `App.tsx` para añadir la importación y el JSX
  4. Posiblemente añadir lazy loading
- **Riesgo**: `App.tsx` crecerá linealmente con cada feature nueva. Viola Open/Closed Principle.
- **Solución**: Cada sección debería importar sus propios datos. `App.tsx` debería ser solo un orchestrator de layout, no un distribuidor de datos.

#### H2. `CentroUniversoSection.tsx` — Componente Dios (641 líneas)

- **Archivo**: `src/components/CentroUniversoSection.tsx` (641 líneas)
- **Problema**: Este componente:
  - Instancia **9 hooks** `useCrudCollection` (uno por colección)
  - Define inline **9 schemas de campos** (cada uno de 3-8 líneas)
  - Importa **14 iconos** de lucide-react
  - Importa **9 archivos JSON**
  - Maneja estado de simulación, progreso de cartas, notificaciones
  - Renderiza 9 paneles CRUD condicionalmente
  - Contiene lógica de navegación entre módulos CMS
- **Riesgo**: Imposible de testear unitariamente. Cualquier cambio en una colección requiere tocar este archivo. Difícil de entender.
- **Solución**: Extraer cada módulo CRUD a su propio componente (ej. `ReasonsCrudModule`, `PromisesCrudModule`). `CentroUniversoSection` debería ser solo un shell con tabs/navegación.

#### H3. Datos JSON importados en múltiples lugares sin fuente única de verdad

- **Archivos**: `App.tsx`, `CentroUniversoSection.tsx`, varios componentes de sección
- **Problema**: Algunos datos JSON se importan tanto en `App.tsx` (para pasar como props) como en los componentes mismos (como fallback o para el CMS). Ejemplo: `monthlyLetters.json` se importa en `App.tsx` Y en `CentroUniversoSection.tsx` y potencialmente en `MonthlyLetters.tsx`.
- **Riesgo**: Fuente de verdad ambigua. Si un componente usa sus props y otro usa el import directo, el comportamiento puede divergir.
- **Solución**: Estandarizar: o bien cada componente importa sus datos, o bien todos reciben props. Recomiendo que cada componente sea autosuficiente.

#### H4. Tres copias del patrón safe-localStorage + acceso directo en componentes

- **Archivos**: `localContentRepository.ts` (líneas 24-78), `localContentStore.ts`, `localIdentityStore.ts`, `SceneMusicController.tsx`, `SceneModeController.tsx`, `ProposalSection.tsx`
- **Problema**: El wrapper `canUseLocalStorage()`/`safeGetItem()`/`safeSetItem()` está **triplicado** en store, repository, e identity store con semánticas divergentes (silent vs `console.warn`). Además, 4 componentes acceden a localStorage **directamente** (bypasseando la arquitectura de capas): `SceneMusicController` (UNLOCK_KEY, VOLUME_KEY), `SceneModeController` (SCENE_STORAGE_KEY, CENTRO_VISIBLE_KEY), `ProposalSection` (propuesta-answer), y `LoadingIntro` (sessionStorage).
- **Riesgo**: Cambiar la estrategia de storage requiere buscar en TODO el código. La regla de CLAUDE.md "no importar localContentStore desde componentes" se cumple, pero los componentes acceden a localStorage directamente de todas formas.
- **Solución**: Unificar wrappers en un solo lugar. Exponer acceso a estas keys específicas a través de contentService.

#### H5. Listener `distancia-cero-content-updated` repetido 10 veces

- **Archivos**: 10 componentes (BlackHoleGallerySection, CentroUniversoSection, ImportantDatesSection, FutureDreamsSection, MonthlyLetters, PlaylistSection, OpenWhenSection, ReasonsSection, PromisesSection, StoryTimeline)
- **Problema**: Cada componente implementa su propio `useEffect` con `addEventListener`/`removeEventListener` para el mismo evento custom, con dos estrategias divergentes de refresh (version-bump vs direct refetch).
- **Riesgo**: Duplicación masiva. Si el evento cambia de nombre o forma, hay que modificar 10 archivos.
- **Solución**: Crear un hook `useContentRefresh(collectionName, callback)` que encapsule esta suscripción.

#### H6. `mergeCollectionWithLocal` llamada directamente en 8 componentes

- **Archivos**: BlackHoleGallerySection, ImportantDatesSection, FutureDreamsSection, PlaylistSection, PromisesSection, ReasonsSection, StoryTimeline, MonthlyLetters, OpenWhenSection
- **Problema**: Es la misma llamada con el mismo patrón en todos. Podría ser parte del hook de suscripción de contenido.
- **Solución**: Hook `useCollectionData(collectionName, defaultData)` que haga merge + suscripción en una sola llamada.

- **Archivos**: `localContentRepository.ts` (líneas 24-78) y `localContentStore.ts` (líneas 53-55)
- **Problema**: Ambos archivos definen sus propias funciones `canUseLocalStorage()`, `safeGetItem()`, `safeSetItem()`. El repositorio duplica lo que ya existe en el store.
- **Riesgo**: Si cambia la lógica de safe access, hay que cambiarla en dos lugares. La duplicación ya existe.
- **Solución**: `localContentRepository.ts` debería usar las funciones del store en lugar de reimplementarlas.

### 🟡 MEDIUM

#### M0. Dependencia circular: authService ↔ supabaseAuthService ↔ profileService

- **Archivos**: `authService.ts`, `supabaseAuthService.ts`, `profileService.ts`
- **Problema**: `authService` importa de `supabaseAuthService` y `profileService`. `supabaseAuthService` importa de `authService` y `profileService`. `profileService` importa de `supabaseAuthService`. Ciclo de 3 nodos. Funciona en runtime solo porque todos los usos son dentro de funciones (no top-level), pero es frágil.
- **Riesgo**: Cualquier refactor que mueva una llamada al nivel de módulo romperá la app con un error de inicialización circular difícil de diagnosticar.
- **Solución**: Extraer la lógica compartida a un módulo sin dependencias circulares (ej. `sessionStore.ts`).

#### M1. Funciones sync duplicadas en contentService.ts

- **Archivo**: `src/services/contentService.ts` (líneas 25-58)
- **Problema**: `syncCreate`, `syncUpdate`, `syncDelete`, `syncOverrideUpdate`, `syncOverrideDelete` son casi idénticas:
  ```ts
  async function syncX(...args) {
    const hooks = await getSyncHooks()
    if (hooks) { hooks.pushXToSupabase(...args).catch(() => {}) }
  }
  ```
- **Solución**: Una única función `syncToSupabase(action, ...args)` que despache por tipo.

#### M2. helpers.ts — Fecha acoplada a locale español

- **Archivo**: `src/utils/helpers.ts` (91 líneas)
- **Problema**: Las funciones de fecha (`formatTimelineDateForDisplay`, `parseTimelineDateForInput`) están hardcodeadas para español. Los nombres de meses, el formato "d de mes de YYYY", y la constante `TIMELINE_MONTH_NAMES` están en español.
- **Riesgo**: Si el proyecto necesitara i18n, habría que reescribir estas funciones. Actualmente es aceptable porque el proyecto es monolingüe.
- **Solución**: No es urgente. Si se necesita i18n, extraer a un módulo de localización.

#### M3. ContentRepository interface no se usa como contrato en runtime

- **Archivo**: `src/types/content.ts` (línea 64-77)
- **Problema**: La interfaz `ContentRepository` está definida pero `contentService.ts` no la usa para hacer dependency injection. Importa directamente de `contentRepository.ts` que es un re-export de `localContentRepository`. La interfaz solo se usa en `contentRepositoryContract.ts` para validación estructural (que es buen uso, pero limitado).
- **Solución**: Documentar que la interfaz es un contrato para FUTURA implementación remote, no para uso actual. O implementar DI real si se necesita.

#### M4. Error handling inconsistente

- **Archivos**: Todo el proyecto
- **Problema**: No hay una estrategia unificada de manejo de errores:
  - `supabaseSyncService.ts`: `console.warn` + `lastSyncError`
  - `localContentStore.ts`: `console.warn` + return safe default
  - `AudioContext.tsx`: try/catch con mensajes en español
  - `authService.ts`: throw Error
  - `storageService.ts`: return `{ error: string | null }`
- **Riesgo**: Un nuevo desarrollador no sabe qué patrón seguir. Diferentes capas manejan errores de forma incompatible.
- **Solución**: Definir un patrón consistente. Recomiendo:
  - **Infraestructura** (store, repository): return safe defaults + console.warn
  - **Servicios**: return `{ data, error }` tipo Result
  - **UI**: ErrorBoundary + try/catch en handlers

#### M5. `lucide-react: "latest"` en package.json

- **Archivo**: `package.json`
- **Problema**: Usar `"latest"` como versión es frágil. Un `npm install` en diferente momento puede instalar versiones diferentes, rompiendo la reproducibilidad del build. También `react` y `react-dom` como `"latest"`.
- **Riesgo**: Builds no determinísticos. CI puede fallar de un día para otro sin cambios en el código. Una actualización mayor de React podría romper el proyecto.
- **Solución**: Fijar a versiones concretas (`"react": "^19.0.0"`, `"lucide-react": "^0.x.x"`).

#### M6. `resolveSpaceId` duplicada entre storageService y supabaseSyncService

- **Archivos**: `storageService.ts` (líneas 43-57) y `supabaseSyncService.ts` (líneas 65-86)
- **Problema**: Ambos consultan `universe_members` para obtener el space UUID con la misma lógica y el mismo fallback.
- **Riesgo**: Si cambia la query o la tabla, hay que actualizar dos lugares.
- **Solución**: Mover a un servicio compartido.

#### M7. `ContentRepository` interface divergente del contrato

- **Archivos**: `types/content.ts` (12 métodos), `contentRepositoryContract.ts` (13 requeridos), `remoteContentRepository.ts` (14 implementados)
- **Problema**: Tres fuentes de verdad distintas sobre qué métodos debe tener un repositorio. La interfaz está desactualizada (le falta `saveCollectionOverrides` y `saveCollectionHiddenIds`).
- **Riesgo**: Una futura implementación remota siguiendo la interfaz fallará en runtime en métodos que el contrato declara requeridos.
- **Solución**: Unificar. La interfaz `ContentRepository` debe ser la fuente canónica. El contrato debe leer de ella.

### 🟢 LOW

#### L1. `SceneMusicController.tsx` (498 líneas) — Lógica de audio + UI mezcladas

- **Archivo**: `src/components/SceneMusicController.tsx`
- **Problema**: Contiene un motor de audio completo (crossfade vía rAF, detección de viewport con scoring, resolución de aliases de secciones, manejo de singletons de audio, unlock/volume persistence) junto con UI (botones, slider, seek). Además accede a localStorage directamente para UNLOCK_KEY/VOLUME_KEY.
- **Solución**: Extraer la lógica de audio a un hook `useSceneMusic()`. Mover el acceso a localStorage a través del servicio.

#### L2. `BlackHoleGallerySection.tsx` (652 líneas) — Componente más grande del proyecto

- **Archivo**: `src/components/BlackHoleGallerySection.tsx`
- **Problema**: Shaders GLSL inline (65 líneas), polvo de partículas, halos de lente, cartas orbitantes con Html overlays, secuencia de transición "enter the black hole", lightbox. 6 subcomponentes internos.
- **Solución**: Mover shaders a constantes/archivos separados. Extraer subcomponentes a files propios (ej. `BlackHoleCore3D.tsx`, `MemoryOrbit3D.tsx`).

#### L3. `ReasonsSection.tsx` (390 líneas) — Motor de física 2D en componente

- **Archivo**: `src/components/ReasonsSection.tsx`
- **Problema**: ~250 líneas de engine de física (grid-celled random placement, velocity/jitter, collision resolution con momentum swap, wall bouncing, z-depth scaling, rAF loop). Está en el componente cuando podría ser un hook `useChaosPhysics`.
- **Solución**: Extraer a hook `useChaosPhysics`.

#### L4. `DistanceMapSection.tsx` — Contenido hardcodeado

- **Archivo**: `src/components/DistanceMapSection.tsx` (67 líneas)
- **Problema**: `location1 = '#'`, `location2 = '#'`, km = `'---'`. Viola la convención de que "todo el contenido editable está en src/data/".
- **Solución**: Mover a un archivo JSON en `src/data/` o completar la feature.

#### L5. `FileUploader.tsx` — Prop muerto

- **Archivo**: `src/components/FileUploader.tsx` (167 líneas)
- **Problema**: Declara `onDelete` en sus props pero nunca lo usa. Dead prop.
- **Solución**: Eliminar `onDelete` de la interfaz de props o implementarlo.

### 🔵 NICE TO HAVE

#### N1. Código muerto — 6 exports/types sin uso

- **Archivos**: Varios
- **Exports muertos identificados**:
  - `SyncOperation` en `types/content.ts` (línea 80)
  - `SupabaseAuthState` en `types/identity.ts` (línea 30)
  - `SceneMusicConfig` en `types/audio.ts` (línea 17)
  - `getSession()` en `authService.ts`
  - `getSpaceMembers()` en `universeService.ts`
  - `parseImportantDateForInput` y `normalizeImportantDateForStorage` en `helpers.ts`
  - `getProfiles()` en `profileService.ts` (pass-through trivial de `LOCAL_USERS`)
- **Solución**: Eliminar exports no utilizados.

#### N2. `isAuthenticated()` — Rama muerta

- **Archivo**: `authService.ts` (línea 57-60)
- **Problema**: `if (isSupabaseAuthenticated()) return true; return true` — Siempre retorna `true`. El `if` es código muerto.
- **Solución**: Simplificar a `return true` con comentario.

#### N3. `main.tsx` — UX bug en `?reset=1`

- **Archivo**: `main.tsx` (líneas 12-22)
- **Problema**: Si el usuario hace clic en **Cancelar** en el diálogo de confirmación, el else-branch igualmente quita el parámetro y recarga la página. El cancel no debería recargar.
- **Solución**: En el else-branch, solo quitar el parámetro de la URL sin recargar.

#### N4. ESLint configurado pero inactivo

- **Archivo**: `eslint.config.js` (21 líneas)
- **Problema**: Solo reglas JS `recommended` + react-hooks + react-refresh. Sin `typescript-eslint`, sin type-aware linting. No hay script `lint` en package.json. ESLint está efectivamente muerto en el workflow.
- **Solución**: Agregar `typescript-eslint`, script `"lint": "eslint src/"`, y ejecutar en CI.

#### N5. CLAUDE.md y README.md desactualizados

- **Problema**: Referencian `docs/supabase/` con "~50 documentos" pero el directorio fue vaciado en commit `73279f6`. CLAUDE.md dice "86 commits" pero el repo tiene ~308. README.md referencia "Aplica el schema de `docs/supabase/`" (directorio vacío).
- **Solución**: Actualizar referencias y conteo de commits.

#### N6. PWA: solo icono SVG puede fallar installabilidad

- **Archivo**: `vite.config.ts`
- **Problema**: El manifiesto PWA solo tiene un icono SVG con `sizes: 'any'`. Chrome históricamente requiere PNGs de 192px y 512px para el criterio de installabilidad. Sin apple-touch-icon.
- **Solución**: Agregar íconos PNG de 192px y 512px.

#### N7. `index.html` y `404.html` hardcodean `/DistanciaCero/`

- **Archivos**: `index.html`, `public/404.html`
- **Problema**: Paths hardcodeados para GitHub Pages. Si se migra a Vercel (`VITE_BASE=/`), estos paths quedan rotos.
- **Solución**: Usar rutas relativas o templates con variable de entorno.

#### N4. Sin ARCHITECTURE.md

- **Problema**: No hay documentación arquitectónica para nuevos desarrolladores.
- **Solución**: Crear `ARCHITECTURE.md` (ver Fase 13 del plan).

#### N8. Sin tests de integración para UI

- **Problema**: 162 tests existentes cubren bien la capa de datos. Pero solo 4 tests de renderizado de componentes (CounterSection, CrudStatButton, ProposalSection, SectionTitle). No hay tests de integración para flujos de usuario reales.
- **Solución**: Añadir tests de integración para flujos críticos CRUD.

#### N9. `AudioContext.tsx` — Strings de UI en español hardcodeados en el contexto

- **Archivo**: `src/context/AudioContext.tsx`
- **Problema**: Todos los `infoMessage` están hardcodeados en español dentro del contexto. Si se necesita i18n o cambiar copy, hay que tocar el contexto.
- **Solución**: Mover strings a constantes o aceptar que el proyecto es monolingüe.

#### N10. `randomPhrases.json` vacío + `Hero.tsx` con código unreachable

- **Archivos**: `randomPhrases.json` (array vacío), `Hero.tsx`
- **Problema**: El JSON está vacío y el código en Hero que lo consumiría nunca se ejecuta (protegido por guard `if (!randomPhrases.length) return null`).
- **Solución**: Poblar el JSON o eliminar el código unreachable.

#### N9. PWA manifest hardcodeado en vite.config.ts

- **Solución**: Mover a archivo separado.

---

## 5. ARQUITECTURA PROPUESTA

### 5.1 Principios

La arquitectura propuesta sigue estos principios:

1. **Cada componente es dueño de sus datos** — importa sus propios JSON
2. **App.tsx es solo un orchestrator de layout** — no distribuye datos
3. **Una capa de servicio ya es suficiente** — eliminar passthrough innecesarios
4. **Módulos CMS independientes** — cada colección es un feature module
5. **Hooks para lógica reutilizable** — extraer lógica de componentes grandes

### 5.2 Estructura propuesta

```
src/
├── main.tsx                          # Entry point + Router
├── App.tsx                           # Layout orchestrator (limpio, sin imports de datos)
│
├── components/                       # Componentes de UI (solo presentación)
│   ├── ui/                           # Componentes genéricos reutilizables
│   │   ├── SectionTitle.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingIntro.tsx
│   │   ├── BackToTop.tsx
│   │   ├── Footer.tsx
│   │   ├── AuthGate.tsx
│   │   ├── LocalIdentitySelector.tsx
│   │   ├── LocalContentMeta.tsx
│   │   └── FileUploader.tsx
│   │
│   ├── landing/                      # Feature: Landing page
│   │   └── PublicLanding.tsx
│   │
│   ├── hero/                         # Feature: Hero + Proposal + Counter
│   │   ├── Hero.tsx
│   │   ├── ProposalSection.tsx
│   │   └── CounterSection.tsx
│   │
│   ├── story/                        # Feature: Story timeline + Main letter
│   │   ├── StoryTimeline.tsx
│   │   └── MainLetter.tsx
│   │
│   ├── universe/                     # Feature: 3D Universe
│   │   └── UniverseSection.tsx
│   │
│   ├── letters/                      # Feature: Monthly + OpenWhen letters
│   │   ├── MonthlyLetters.tsx
│   │   └── OpenWhenSection.tsx
│   │
│   ├── gallery/                      # Feature: Black hole gallery
│   │   └── BlackHoleGallerySection.tsx
│   │
│   ├── playlist/                     # Feature: Music playlist
│   │   └── PlaylistSection.tsx
│   │
│   ├── content/                      # Feature: Content sections
│   │   ├── ReasonsSection.tsx
│   │   ├── PromisesSection.tsx
│   │   ├── ImportantDatesSection.tsx
│   │   ├── FutureDreamsSection.tsx
│   │   └── DistanceMapSection.tsx
│   │
│   ├── entrelazados/                 # Feature: Entrelazados
│   │   └── EntrelazadosSection.tsx
│   │
│   ├── cms/                          # Feature: CMS (Centro del Universo)
│   │   ├── CentroUniversoSection.tsx  # Shell: solo tabs + navegación
│   │   ├── modules/                   # Un módulo por colección
│   │   │   ├── ReasonsCrudModule.tsx
│   │   │   ├── PromisesCrudModule.tsx
│   │   │   ├── ImportantDatesCrudModule.tsx
│   │   │   ├── FutureDreamsCrudModule.tsx
│   │   │   ├── TimelineCrudModule.tsx
│   │   │   ├── BlackHoleGalleryCrudModule.tsx
│   │   │   ├── PlaylistCrudModule.tsx
│   │   │   ├── MonthlyLettersCrudModule.tsx
│   │   │   └── OpenWhenCrudModule.tsx
│   │   ├── shared/                   # Componentes compartidos del CMS
│   │   │   ├── CrudEditorPanel.tsx
│   │   │   ├── CrudStatButton.tsx
│   │   │   ├── LetterStatsPanel.tsx
│   │   │   ├── SimulationBanner.tsx
│   │   │   ├── BackupPanel.tsx
│   │   │   └── useCrudCollection.ts
│   │   └── cmsConfig.ts              # Configuración centralizada de módulos
│   │
│   └── scene/                        # Feature: Scene mode + music
│       ├── SceneModeController.tsx
│       └── SceneMusicController.tsx
│
├── hooks/                            # Hooks globales reutilizables
│   ├── useSceneMusic.ts              # Extraído de SceneMusicController
│   ├── useSceneDetection.ts          # Extraído de SceneModeController
│   └── useAudio.ts                   # Re-export de AudioContext
│
├── context/                          # Contextos React
│   └── AudioContext.tsx
│
├── services/                         # Lógica de negocio
│   ├── contentService.ts             # Simplificado (ver nota abajo)
│   ├── authService.ts
│   ├── profileService.ts
│   ├── contentMetadataService.ts
│   ├── storageService.ts
│   ├── universeService.ts
│   ├── supabaseAuthService.ts
│   └── supabaseSyncService.ts
│
├── repositories/                     # Acceso a datos
│   ├── contentRepository.ts          # ÚNICO repositorio activo (local)
│   └── contentRepositoryContract.ts  # Contrato para futuro remote
│
├── integrations/
│   └── supabase/
│       └── client.ts
│
├── data/                             # Archivos JSON (sin cambios)
│   └── ...
│
├── utils/                            # Utilidades
│   ├── localContentStore.ts
│   ├── localIdentityStore.ts
│   └── helpers.ts
│
├── types/                            # Tipos (sin cambios)
│   └── ...
│
├── constants/
│   └── localUsers.ts
│
├── __tests__/                        # Tests
│   └── ...
│
└── styles/
    └── tailwind.css
```

### 5.3 Cambios clave propuestos

#### A. Simplificar la cadena de data access

```
ACTUAL:
  Componente → contentService → contentRepository (1 línea) → localContentRepository → localContentStore → localStorage

PROPUESTO:
  Componente → contentService → localContentStore → localStorage
                   ↑
            (metadatos + sync hooks aquí)
```

- **Eliminar** `repositories/contentRepository.ts` (1 línea, no aporta valor)
- **Eliminar** `repositories/remoteContentRepository.ts` (mover a `integrations/supabase/` cuando se implemente)
- **Mover** lógica de `localContentRepository.ts` a `contentService.ts` o renombrar `localContentRepository.ts` → `contentRepository.ts`

**Por qué**: Menos archivos, menos indirección, mismo comportamiento. La separación repository/service solo tiene sentido cuando hay MÚLTIPLES implementaciones de repository (local vs remote). Como remote no existe, la separación es prematura.

#### B. App.tsx como orchestrator puro

```tsx
// App.tsx PROPUESTO (sin imports de datos)
function App() {
  return (
    <AuthGate>
    <div className="app">
      <LoadingIntro />
      <div className="background-orbs">...</div>
      <main>
        <Hero />
        <ProposalSection />
        <CounterSection />
        <MainLetter />
        <ErrorBoundary><Suspense><StoryTimeline /></Suspense></ErrorBoundary>
        <ErrorBoundary><Suspense><UniverseSection /></Suspense></ErrorBoundary>
        <ErrorBoundary><Suspense><EntrelazadosSection /></Suspense></ErrorBoundary>
        <ErrorBoundary><Suspense><MonthlyLetters /></Suspense></ErrorBoundary>
        {/* ... cada componente importa sus propios datos */}
      </main>
      <SceneModeController />
      <SceneMusicController />
      <BackToTop />
      <Footer />
    </div>
    </AuthGate>
  )
}
```

#### C. Módulos CMS independientes

Cada colección CMS se convierte en un componente independiente:

```tsx
// components/cms/modules/ReasonsCrudModule.tsx
function ReasonsCrudModule({ activeCrudAction, activeCrudFilter, onFilterClick }) {
  const reasonsCrud = useCrudCollection('reasons', reasonsData, {
    fields: REASONS_FIELDS,
    idPrefix: 'local-reason-'
  })

  return (
    <CrudEditorPanel
      collectionLabel="Razones"
      collectionName="reasons"
      crud={reasonsCrud}
      fields={REASONS_FIELDS}
      // ...
    />
  )
}
```

Y `CentroUniversoSection.tsx` se convierte en un shell:

```tsx
function CentroUniversoSection() {
  const [activeModule, setActiveModule] = useState('monthlyLetters')
  const [activeAction, setActiveAction] = useState('originals')
  // ...

  return (
    <section>
      <SectionTitle />
      <nav>{/* tabs de navegación */}</nav>
      {activeModule === 'reasons' && <ReasonsCrudModule />}
      {activeModule === 'promises' && <PromisesCrudModule />}
      {/* ... */}
      <BackupPanel />
      <SimulationBanner />
    </section>
  )
}
```

#### D. Extraer hooks de componentes grandes

- `SceneMusicController.tsx` → hook `useSceneMusic.ts`
- `SceneModeController.tsx` → hook `useSceneDetection.ts`

### 5.4 Lo que NO cambia

- ✅ `useCrudCollection` + `CrudEditorPanel` — se mantienen exactamente igual
- ✅ `localContentStore.ts` — se mantiene exactamente igual
- ✅ Capa de tipos — se mantiene exactamente igual
- ✅ `integrations/supabase/client.ts` — se mantiene exactamente igual
- ✅ `supabaseSyncService.ts` — se mantiene exactamente igual
- ✅ `supabaseAuthService.ts` — se mantiene exactamente igual
- ✅ Todos los archivos JSON de datos — sin cambios
- ✅ Tests — se actualizan imports pero la lógica de test se mantiene

---

## 6. PLAN DE REFACTORIZACIÓN

### Etapa 1: Eliminar indirecciones innecesarias (CRITICAL)
**Archivos a modificar**: 3 | **Riesgo**: Bajo | **Tests afectados**: imports solamente

1. Eliminar `src/repositories/contentRepository.ts`
2. Mover el contenido de `localContentRepository.ts` a `src/repositories/contentRepository.ts`
3. Actualizar imports en `contentService.ts`
4. Eliminar `remoteContentRepository.ts` (o mover a `integrations/supabase/remoteContentRepository.ts`)
5. Correr tests para verificar

**Validación**: `npm test` pasa sin cambios

### Etapa 2: Desacoplar App.tsx de los datos (HIGH)
**Archivos a modificar**: ~12 | **Riesgo**: Medio | **Tests afectados**: Tests de componentes

1. Mover imports de JSON de `App.tsx` a cada componente de sección
2. Actualizar cada sección para que importe sus propios datos
3. Eliminar props de datos de `App.tsx`
4. Verificar que la app funciona igual en `npm run dev`

**Validación**: La app renderiza exactamente igual. `npm test` pasa.

### Etapa 3: Modularizar CentroUniversoSection (HIGH)
**Archivos a modificar**: ~12 (9 nuevos + 1 modificado) | **Riesgo**: Medio

1. Crear `src/components/cms/modules/` con un archivo por colección
2. Extraer cada bloque CRUD a su propio componente
3. Crear `cmsConfig.ts` con la configuración centralizada
4. Simplificar `CentroUniversoSection.tsx` a un shell de navegación
5. Verificar que todas las operaciones CRUD funcionan

**Validación**: Cada operación CRUD (crear, editar, eliminar, ocultar, override) funciona en cada colección.

### Etapa 4: Extraer hooks de componentes grandes (LOW)
**Archivos a modificar**: 2-3 | **Riesgo**: Bajo

1. Extraer `useSceneMusic` de `SceneMusicController.tsx`
2. Extraer `useSceneDetection` de `SceneModeController.tsx`
3. Verificar comportamiento de música y detección de escenas

**Validación**: La música cambia correctamente al hacer scroll. Los modos de escena funcionan.

### Etapa 5: Estandarizar manejo de errores (MEDIUM)
**Archivos a modificar**: ~5 | **Riesgo**: Bajo

1. Definir tipos de error comunes en `types/errors.ts`
2. Unificar manejo en servicios (usar `{ data, error }` pattern)
3. Documentar el patrón en ARCHITECTURE.md

**Validación**: Los errores se manejan de forma consistente. No hay errores silenciosos nuevos.

### Etapa 6: Mejorar testing (NICE TO HAVE)
**Archivos a modificar**: ~5 nuevos | **Riesgo**: Ninguno

1. Añadir tests de integración para flujos CRUD completos
2. Añadir tests de componentes para los nuevos módulos CMS
3. Añadir tests para hooks extraídos

**Validación**: `npm test` coverage aumenta. Los tests protegen comportamiento real.

### Etapa 7: Documentar (NICE TO HAVE)
**Archivos a crear**: 2 | **Riesgo**: Ninguno

1. Crear `ARCHITECTURE.md`
2. Crear `CONTRIBUTING.md`
3. Actualizar `CLAUDE.md` con nueva estructura

### Etapa 8: Limpieza final (NICE TO HAVE)
**Archivos a modificar**: 3-5 | **Riesgo**: Bajo

1. Fijar versiones en `package.json` (`lucide-react`, `react`, `react-dom`)
2. Mover PWA manifest a archivo separado
3. Verificar CI/CD (GitHub Actions)

---

## 7. QUICK WINS (Alto impacto, bajo riesgo)

| # | Mejora | Impacto | Riesgo | Esfuerzo |
|---|---|---|---|---|
| 1 | **⚠️ Actualizar `react-router-dom` a ≥ 7.18.2** | **Seguridad: fix HIGH vulnerability** | Ninguno | 1 min |
| 2 | Eliminar `contentRepository.ts` (1 línea) | Simplifica arquitectura | Ninguno | 2 min |
| 3 | Fijar `"latest"` en `package.json` (4 paquetes) | Builds determinísticos | Ninguno | 1 min |
| 4 | `npm audit fix` (6 vulnerabilidades) | Seguridad | Bajo | 1 min |
| 5 | Mover imports de JSON de App.tsx a cada sección | Desacopla App.tsx | Bajo | 30 min |
| 6 | Eliminar safe wrappers duplicados en `localContentRepository.ts` | Reduce duplicación | Bajo | 15 min |
| 7 | Unificar funciones sync en `contentService.ts` | Reduce duplicación | Ninguno | 10 min |
| 8 | Romper ciclo de dependencias auth | Previene bugs futuros | Medio | 30 min |
| 9 | Crear `LetterCollectionSection` parametrizado | Elimina 200 líneas duplicadas | Bajo | 45 min |
| 10 | Crear `ARCHITECTURE.md` | Documentación | Ninguno | 45 min |

---

## 8. RIESGOS

### Riesgos identificados al refactorizar

| Riesgo | Severidad | Mitigación |
|---|---|---|
| **Romper compatibilidad con Supabase** al simplificar capas | Medio | La integración Supabase está inactiva y aislada. No tocar `integrations/supabase/` ni `supabaseSyncService.ts` |
| **Romper tests** al cambiar imports | Bajo | Los tests usan imports relativos. Actualizar imports debería ser suficiente |
| **Regresiones en CMS** al modularizar | Medio | Avanzar colección por colección, verificando cada una |
| **Problemas de lazy loading** al cambiar imports | Bajo | Mantener los `lazy()` bounds existentes |
| **Perder datos de usuarios** | Nulo | Solo cambiamos estructura de archivos, no localStorage keys |

### Archivos más delicados (NO tocar sin cuidado extremo)

1. `src/utils/localContentStore.ts` — **intocable**. Es el core del storage.
2. `src/utils/localIdentityStore.ts` — **intocable**. Identidad de usuario.
3. `src/components/centro-universo/useCrudCollection.ts` — **mínimo cambio**. Es usado por 9 colecciones.
4. `src/integrations/supabase/client.ts` — **intocable**. Validación de seguridad.
5. `src/services/supabaseSyncService.ts` — **intocable**. Lógica de sync compleja.

---

## 9. PRIORIDADES

### Orden recomendado de implementación

1. **AHORA MISMO** (5 minutos): Quick Win #1 — Actualizar `react-router-dom` (vulnerabilidad HIGH)
   - `npm install react-router-dom@^7.18.2`
   - `npm audit fix`
   - Verificar que la app funciona

2. **PRIMERO** (semana 1): Quick Wins 2-7 + Etapa 1 (eliminar indirecciones)
   - Bajo riesgo, alta ganancia de claridad
   - Tiempo estimado: 1-2 horas

2. **SEGUNDO** (semana 1-2): Etapa 2 (desacoplar App.tsx)
   - Reduce acoplamiento significativamente
   - Tiempo estimado: 1-2 horas

3. **TERCERO** (semana 2): Etapa 3 (modularizar CMS)
   - Mayor ganancia de mantenibilidad
   - Tiempo estimado: 3-4 horas

4. **CUARTO** (semana 2-3): Etapa 4 (extraer hooks)
   - Mejora testabilidad
   - Tiempo estimado: 2-3 horas

5. **QUINTO** (cuando convenga): Etapas 5-8
   - Mejoras incrementales sin urgencia
   - Tiempo estimado: 4-6 horas total

### Lo que puede esperar

- Estandarización completa de manejo de errores
- Implementación real de Supabase
- Tests E2E adicionales
- PWA manifest refactor
- i18n

---

## 10. EXTENSIBILIDAD — Análisis "Nueva Feature"

Para evaluar qué tan fácil es agregar features, simulemos tres escenarios:

### Escenario A: Agregar una nueva colección de contenido (ej. "poemas")

**Archivos a modificar HOY**: 4-5
1. `src/data/poems.json` — nuevo
2. `src/types/content.ts` — añadir al union type `CollectionName`
3. `src/components/CentroUniversoSection.tsx` — añadir hook + schema
4. `src/App.tsx` — añadir import + lazy + JSX (si tiene sección propia)
5. `src/components/PoemsSection.tsx` — nuevo componente

**Archivos a modificar CON LA REFACTORIZACIÓN**: 3
1. `src/data/poems.json` — nuevo
2. `src/types/content.ts` — añadir al union type
3. `src/components/cms/modules/PoemsCrudModule.tsx` — nuevo
4. `src/components/cms/cmsConfig.ts` — añadir entrada

### Escenario B: Agregar una nueva página/ruta

**Archivos a modificar HOY**: 2
1. `src/main.tsx` — añadir Route
2. `src/components/NuevaPagina.tsx` — nuevo

**Archivos a modificar CON LA REFACTORIZACIÓN**: 2 (igual)

### Escenario C: Activar Supabase

**Archivos a modificar HOY**: 3-4
1. Implementar `remoteContentRepository.ts`
2. Modificar `contentRepository.ts` para switchear
3. Posiblemente modificar `contentService.ts`
4. Variables de entorno

**Archivos a modificar CON LA REFACTORIZACIÓN**: 2-3
1. Implementar `integrations/supabase/remoteContentRepository.ts`
2. Activar feature flag
3. Variables de entorno

---

## 11. CONCLUSIÓN

El proyecto DistanciaCero tiene una **arquitectura sorprendentemente buena para su escala**. Las decisiones clave (store → repository → service → hook → UI, CRUD genérico, Supabase aislado, lazy loading) son acertadas.

Los problemas principales son de **sobre-indirección** en la capa de acceso a datos (archivos que no añaden valor) y de **sobre-carga de responsabilidades** en componentes específicos (`App.tsx`, `CentroUniversoSection.tsx`).

La refactorización propuesta es **conservadora**: elimina lo innecesario, reorganiza lo existente, y no reescribe nada fundamental. El comportamiento observable no cambia en absoluto.

### Métricas post-refactorización esperadas

| Métrica | Actual | Esperado |
|---|---|---|
| Archivos totales | 85 | ~95 (más archivos, más pequeños, mejor organizados) |
| Archivo más grande | 652 líneas | <300 líneas |
| Componente más complejo | 641 líneas (CentroUniversoSection) | <100 líneas (shell) |
| Archivos pass-through | 1 | 0 |
| Duplicación safe wrappers | 2 lugares | 1 lugar |
| Imports de JSON en App.tsx | 10 | 0 |
| Tests de componentes | 4 | ~13 (uno por módulo CMS) |

---

> **Nota**: Este reporte es la Fase 1 (Análisis). No se ha modificado ningún archivo.
> La Fase 2 (Implementación) comenzará cuando apruebes el plan.

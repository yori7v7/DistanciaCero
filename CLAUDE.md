# CLAUDE.md

Contexto y reglas compartidas para Claude Code y Codex. El plan local cerró el 10 de octubre de 2026; las etapas posteriores de compatibilidad (100/100 E2E Firefox/WebKit) y actualización PWA A→B local cerraron el 23. Los resultados conservan sus fechas y alcances en [AVANCE_PULIDO_LOCAL.md](docs/AVANCE_PULIDO_LOCAL.md). Antes de continuar, consultar también [AGENTS.md](AGENTS.md) y el [punto de continuación entre equipos](docs/TRABAJO_ENTRE_EQUIPOS.md).

## ¿Qué es?

**Distancia Cero** es una SPA romántica personalizable con cartas, recuerdos, música y escenas 3D. Los pasos 1–7 del pulido local están cerrados, con validación final completa. El usuario autorizó después avanzar por ajustes generales, primera configuración guiada y contenido/recursos. Los dos primeros bloques cerraron el 26 de octubre y contenido/recursos el 27. Se conserva una plantilla reutilizable sin datos personales. Supabase y publicación permanecen fuera del alcance. Los archivos de publicación existentes no acreditan un despliegue vigente.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 (TSX) |
| Build | Vite 8 (`vite.config.ts`, base configurable vía `VITE_BASE`) |
| Router | react-router-dom v7 (`/` landing, `/app` experiencia) |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Backend | Supabase (preparado, sync engine implementado en `supabaseSyncService.ts`, **NO activado** — feature flag off) |
| Datos locales | JSON (`src/data/`) + localStorage |
| Estilos | Tailwind CSS v4 (1 archivo: `src/styles/tailwind.css`) |
| Publicación | Script heredado de GitHub Pages y configuración Vercel; fuera de la etapa local |
| PWA | vite-plugin-pwa (manifest, autoUpdate) + cliente virtual `registerSW` en `main.tsx` |
| Iconos | lucide-react |
| Tests | Vitest + @testing-library/react (29 archivos, 411 tests; comprobados al cerrar contenido/recursos el 27 de octubre; el paso 7 cerró con 338) |
| CI | GitHub Actions: tipos, build, unitarias y job E2E (Node 22, Ubuntu); no ejecutado desde esta etapa local |

## Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `PublicLanding` | Landing pública con botón "Entrar" |
| `/app` | `App` | Experiencia principal (envuelta en `AudioProvider`) |

`BrowserRouter` usa `basename` de `VITE_BASE` (por defecto `/`, en GitHub Pages `/DistanciaCero/`).

**Reset**: `?reset=1` pide confirmación antes de limpiar `localStorage` y `sessionStorage` del origen. Tanto aceptar como cancelar retira el parámetro y recarga; cancelar conserva los datos. Las pruebas usan perfiles aislados, nunca el almacenamiento real del usuario.

## Comandos

```bash
npm run dev              # Desarrollo en localhost:5173
npm run build            # Build producción
npm run preview          # Preview del build
npm run typecheck        # Comprobación TypeScript
npm run verify:local     # Tipos → recursos → unitarias → build; fuerza remoto desactivado
npm test                 # Todos los tests; threads, un worker, archivos secuenciales
npm run test:watch       # Tests en modo watch
npm test -- src/__tests__/FileName.test.ts     # Un solo archivo de tests
npm run test:e2e         # Recorridos de desarrollo, Chromium
npm run test:e2e:preview # Preview/PWA después del build
npm run test:e2e:cross-browser # Desarrollo, Firefox y WebKit; puerto 5174
npm run test:e2e:pwa-update # Chromium, dos builds propios A→B; puerto 4175
```

Instalar con `npm ci` conserva las versiones del lockfile. React, React DOM, lucide-react y el plugin React tienen versiones exactas alineadas con ese archivo; ya no usan `latest`. `check:resources` revisa referencias locales sin acceder a Internet. `verify:local` utiliza los ejecutables instalados, funciona en Windows y otros sistemas, y se detiene en el primer fallo. Los recorridos de navegador se ejecutan por separado.

Requisito instalado de Vite: Node `^20.19.0 || >=22.12.0`; jsdom 29.1.1 del lockfile declara `^20.19.0 || ^22.13.0 || >=24.0.0`. Para seguir la preparación entre equipos, utilizar Node 22.13 o posterior de la rama 22, o Node 24 o posterior; para reproducir CI, la rama 22. En un checkout nuevo, `npx playwright install chromium` prepara Chromium y `npx playwright install firefox webkit` los otros motores. La laptop instaló dependencias y motores el 20 de octubre sin cambiar el lockfile; no se ejecutó CI desde este trabajo local.

Congelar todos los archivos observados mientras corren E2E de desarrollo, incluida la documentación: Tailwind puede enviar `full-reload` al cambiar Markdown. Guardar notas provisionales en `.git/codex-checkpoints` y actualizar los documentos al terminar. Evitar ejecutar suites simultáneas en este equipo.

El verificador antiguo `scripts/verify-supabase-isolation.mjs` se retiró en el paso 4: asumía extensiones `.js` y un selector de repositorio que ya no existen. Sus resultados históricos no acreditan el runtime actual. La comprobación vigente de esta etapa es local; no se ha validado ni activado la infraestructura remota.

## Estructura clave

```
src/
├── App.tsx                  # Componente raíz, lazy loading + Suspense
├── main.tsx                 # Entry point, BrowserRouter + AudioProvider + StrictMode
├── components/              # Escenas, controladores y componentes compartidos
│   ├── centro-universo/     # CMS genérico (patrón useCrudCollection)
│   │   ├── useCrudCollection.ts    # Hook CRUD genérico — 9 colecciones
│   │   ├── cmsCollections.ts       # Campos, IDs y transformaciones del CMS
│   │   ├── CrudEditorPanel.tsx     # Panel editor unificado (local + base)
│   │   ├── CrudStatButton.tsx      # Botón de filtro de stats
│   │   ├── BackupPanel.tsx         # Export/import respaldo v2
│   │   ├── GeneralSettingsPanel.tsx # Siete ajustes locales de nombres/fechas
│   │   ├── LetterStatsPanel.tsx    # Estadísticas de cartas
│   │   └── SimulationBanner.tsx    # Banner modo simulación
│   ├── LoadingIntro.tsx     # Pantalla de carga
│   ├── Hero.tsx             # Portada principal
│   ├── UniverseSection.tsx  # Universo 3D interactivo (Three.js)
│   ├── LetterCollectionSection.tsx # Lector compartido de cartas mensuales y Abrir cuando
│   └── ...                  # Cartas, galería, playlist, CMS, etc.
├── context/
│   └── AudioContext.tsx     # Proveedor de música de fondo global
├── data/                    # 15 JSON de configuración y contenido base
│   ├── siteConfig.json      # Config principal (nombres, fechas, contraseñas, audio)
│   ├── universe.json        # Planetas del universo 3D
│   ├── timeline.json        # Línea de tiempo de la relación
│   └── ...                  # Cartas, canciones, razones, propuesta y frases
├── hooks/                   # Actividad de escenas y manejo de foco
├── services/                # Lógica de negocio (fachada sync)
│   ├── contentService.ts    # CRUD genérico — API pública estable (NO async)
│   ├── authService.ts       # Auth local fake (local-user1 / local-user2)
│   ├── supabaseSyncService.ts # Hooks de sync fire-and-forget a Supabase
│   └── ...
├── repositories/            # Acceso a datos
│   ├── localContentRepository.ts # localStorage (ACTIVO)
│   ├── remoteContentRepository.ts # Skeleton Supabase (INACTIVO)
│   └── contentRepositoryContract.ts
├── integrations/
│   └── supabase/client.ts   # Factory aislado (validación estricta de env)
├── utils/
│   ├── helpers.ts           # isPlainObject, dateUtils, textUtils
│   ├── localContentStore.ts # Bajo nivel localStorage
│   └── localIdentityStore.ts
├── constants/
│   └── localUsers.ts        # local-user1 (owner), local-user2 (partner)
├── types/                   # TypeScript type definitions
│   ├── content.ts           # ContentItem, CollectionName, ContentRepository, etc.
│   ├── identity.ts          # LocalUser, RelationshipSpace
│   ├── audio.ts
│   ├── sections.ts           # Contratos de datos base recibidos por los lectores
│   └── env.d.ts
├── __tests__/               # 29 archivos de test
└── styles/
    └── tailwind.css         # Design tokens y estilos de la experiencia
```

## Arquitectura de datos

```
Componentes → contentService → localContentRepository → localContentStore → localStorage
```

**Regla**: Los componentes NUNCA importan `localContentStore` directamente. Solo `localContentRepository` puede importarlo.

**9 colecciones** soportadas por el CRUD (`CollectionName` en `types/content.ts`):
`reasons`, `promises`, `importantDates`, `futureDreams`, `timeline`, `blackHoleGallery`, `playlist`, `monthlyLetters`, `openWhenLetters`

### API pública de contentService (sync, estable)

```ts
// CRUD básico
getCollectionItems(collectionName: string): ContentItem[]
saveCollectionItems(collectionName: string, items: ContentItem[]): ContentItem[]
addCollectionItem(collectionName: string, item: ContentItem): ContentItem[]
updateCollectionItem(collectionName: string, id: string, patch: Partial<ContentItem>): ContentItem[]
deleteCollectionItem(collectionName: string, id: string): ContentItem[]

// Overrides (personalizaciones sobre datos base)
getCollectionOverrides(collectionName: string): OverrideMap
saveCollectionOverrides(collectionName: string, overrides: OverrideMap): OverrideMap
setCollectionOverride(collectionName: string, id: string, patch: Partial<ContentItem>): OverrideMap
deleteCollectionOverride(collectionName: string, id: string): OverrideMap

// Hidden (ocultar/mostrar items)
getCollectionHiddenIds(collectionName: string): string[]
saveCollectionHiddenIds(collectionName: string, ids: string[]): string[]
hideCollectionItem(collectionName: string, id: string): string[]
restoreCollectionItem(collectionName: string, id: string): string[]

// Merge (combina datos base + overrides + items locales)
mergeCollectionWithLocal(defaultItems: ContentItem[], collectionName: string): ContentItem[]
```

`exportContentBackup()`, `validateContentBackup(input)` y `restoreContentBackup(input)` mantienen el formato y la validación en la fachada. La semántica de apartados ausentes/vacíos y el rollback se documentan en [CONTENT_CONTRACT.md](docs/CONTENT_CONTRACT.md).

### Ajustes generales locales

`GeneralSettingsPanel` usa `siteSettingsService` → `localContentRepository` → transacción de almacenamiento. `SiteSettings` contiene siete overrides de nombres/fechas, separados de las nueve colecciones. `useSiteConfig` resuelve plantilla y overrides para portada, landing, introducción y contadores; `useSiteSettings` suscribe guardado, cambios de pestaña e importación `all`. Los nombres no cambian identidades ni autoría. El respaldo v2 exporta `settings`; si falta al importar conserva los ajustes, y `{}` restaura la plantilla. No se sincronizan con el backend. Contrato completo en el documento anterior.

### Sync hooks a Supabase (lazy, fire-and-forget)

`contentService.ts` importa `supabaseSyncService` dinámicamente con `import()`. Un fallo de import devuelve `null`; con el flag remoto desactivado, los hooks no realizan sincronización. Las escrituras locales siguen siendo síncronas; los errores de persistencia local se comunican a la UI. La presencia de hooks no acredita compatibilidad del backend ni una sincronización operativa.

### ContentItem

```ts
interface ContentItem {
  id: string | number
  displayLabel?: string
  isLocal?: boolean      // true = creado por el usuario
  isOverridden?: boolean  // true = tiene override sobre dato base
  [key: string]: any      // campos dinámicos (title, text, date, image, etc.)
}
```

## Patrón CRUD — `useCrudCollection`

Hook genérico en `src/components/centro-universo/useCrudCollection.ts`. Las 9 colecciones lo usan:

```tsx
const crud = useCrudCollection('collectionName', defaultData, {
  fields: [{ name: 'title', label: 'Título', required: true }, ...],
  idPrefix: 'local-col-'
}, {
  transformForStorage: (item) => ({ ...item, date: normalizeDate(item.date) }),
  transformForEdit: (item) => ({ ...item, date: parseDateForInput(item.date) }),
})

// En JSX:
<CrudEditorPanel
  collectionLabel="Mi Colección"
  collectionName="collectionName"
  activeCrudModule={activeCrudModule}
  activeCrudAction={activeCrudAction}
  activeCrudFilter={activeCrudFilter}
  onCrudFilterClick={handleCrudFilterClick}
  crud={crud}
  fields={fields}
  listFields={['title', 'date']}
  localFormExtras={...}   // opcional: JSX extra en formulario local
  baseFormExtras={...}    // opcional: JSX extra en formulario base
/>
```

- **fields**: Definen el formulario (name, label, type: text|textarea|select|date, rows, placeholder)
- **transformForStorage**: Transforma datos del formulario → storage (ej. texto→array, normalizar fecha)
- **transformForEdit**: Transforma datos del storage → formulario (ej. array→texto, formatear fecha)
- **CrudEditorPanel**: Renderiza ambos paneles (local + base) con estadísticas, filtros, y CRUD completo

`cmsCollections.ts` reúne la configuración estática de las nueve colecciones. Los hooks permanecen explícitos en el CMS y todos los paneles siguen montados, con IDs y orden estables. Las dos clases de cartas comparten sus transformaciones de párrafos/bloqueo; las conversiones de Historia también viven en esa configuración. El desplazamiento desde estadísticas se cancela al cambiar de destino, módulo, acción o filtro y al desmontar el CMS.

## Migración legacy → estándar

Las cartas mensuales y "Abrir cuando" usaban llaves legacy de localStorage. La migración v2 es automática e idempotente; también se cubre al escribir cartas o importar respaldos:

```ts
// Se intenta al iniciar el CMS; tras completar v2 las siguientes llamadas no hacen cambios:
migrateLegacyLettersIfNeeded()
// Combina legacy + estándar por ID; gana estándar y se conserva metadata
// Marca distancia-cero-legacy-migrated-v2; legacy queda archivado sin leerse de nuevo
```

## Flujo de identidad local

```
LocalIdentitySelector → authService → localIdentityStore → localStorage
```

Usuarios locales fake: `local-user1` (owner), `local-user2` (partner).
`authService.isAuthenticated()` siempre retorna `true` en modo local.

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `VITE_BASE` | `/` | Base path (GitHub Pages: `/DistanciaCero/`) |
| `VITE_SUPABASE_URL` | (vacío) | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (vacío) | Publishable key de Supabase |
| `VITE_SUPABASE_ANON_KEY` | (vacío) | Alias legacy (preferir PUBLISHABLE_KEY) |
| `VITE_REMOTE_CONTENT_ENABLED` | `false` | Feature flag para activar modo remoto |

Template seguro en `.env.example`. Valores reales van en `.env.local` (no commiteado).

## Reglas de desarrollo

### No hacer NUNCA
- ❌ No importar `localContentStore` directamente desde componentes
- ❌ No usar `service_role` o secretos en frontend/Git
- ❌ No convertir `contentService` a async sin plan de compatibilidad
- ❌ No habilitar infraestructura remota durante este refactor/pulido local
- ❌ No mezclar cambios de escenas/música con infraestructura remota
- ❌ No borrar localStorage automáticamente
- ❌ No tratar `local-user1`/`local-user2` como UUIDs reales
- ❌ No usar handlers artesanales para colecciones CRUD — usar `useCrudCollection`

### Principios
- ✅ Modo local funcional siempre (fallback offline)
- ✅ Export/import v2 disponible como backup
- ✅ Feature flag para activar remoto gradualmente
- ✅ Clean Architecture: componentes no conocen la fuente de datos
- ✅ Commits atómicos con mensajes descriptivos
- ✅ Configuración y contenido base en `src/data/`; ediciones del CMS en localStorage. Algunos textos, como la carta principal, permanecen en componentes.
- ✅ Usar `useCrudCollection` + `CrudEditorPanel` para toda colección CRUD

### TypeScript
- TypeScript 7.0.2 con `strict: false`
- La librería instalada declara `JSON.parse()` como `any`; no asumir que eso valida el contenido. Tratar entradas externas como `unknown` y comprobar su estructura antes de usarlas.
- Preferir tipos y validación del contrato. `ContentItem` mantiene campos dinámicos deliberadamente; algunas secciones conservan casts históricos al importar JSON, sin convertirlos en un patrón para código nuevo.
- Las escrituras de contenido y respaldos lanzan errores de persistencia que la UI captura. La restauración valida antes de escribir e intenta revertir errores; ver `docs/CONTENT_CONTRACT.md`. Los helpers de progreso conservan su tolerancia histórica.
- Utilidades compartidas en `src/utils/helpers.ts`
- `isPlainObject()` está en `helpers.ts` (no duplicar en componentes)

### Tests
- 29 archivos en `src/__tests__/` con extensión `.test.ts`, `.test.tsx` o `.test.js`
- Entorno: jsdom, setup: `src/test-setup.ts` (importa `@testing-library/jest-dom/vitest`), globals: true
- Los tests de almacenamiento limpian localStorage entre casos; Vitest excluye E2E, node_modules, dist y copias de recuperación dentro de `.git`.
- Usar `describe`/`it`/`expect` de vitest (importados explícitamente)
- Correr un archivo: `npm test -- src/__tests__/contentService.test.ts`
- El lector compartido tiene tipos `LetterContent`; sus pruebas cubren ambas colecciones, simulación, lectura y reset. El CMS conserva sus formularios al actualizar progreso mediante eventos, sin cambiar su key ni recargar la página.
- Navegación deriva la escena del hash; el router usa `useTransitions={false}` para actualizar pronto la visibilidad. Audio coordina escena/ambiente/playlist, permite cancelar cargas y muestra errores. Reglas y límites de PWA en `docs/RECORRIDOS_LOCALES.md`.
- El paso 7 aprobó el 10 de octubre los 50 E2E en una única corrida y un preview/offline, con cero omitidas, inestables o reintentos. Incluye los diez casos UI en cinco tamaños; las 338 unitarias y el build también pasaron. El cierre documental es del 10 de octubre. Consultar el avance para evidencia y límites; los fallos anteriores siguen registrados como históricos.
- La corrección posterior de foco durante gestos de puntero (`904203f`) añadió dos regresiones. El 16 de octubre se aprobaron 340 unitarias/22 archivos, tipos/build/PWA y 16 Chromium afectados; el 19, cuatro Chromium de audio/reset con los fixtures finales. No presentar estas comprobaciones como ejecutadas el 23.
- Compatibilidad cerrada el 23 de octubre: `desktop-awake-20261023`, **100/100 en una sola corrida**, 50 WebKit y 50 Firefox, 67,82 min, cero omitidas/inestables/reintentos/errores externos y 272 archivos congelados. Ambos respaldos conservaron documento y CMS real. Motores Playwright en Windows, WebKit densidad 1; no acredita Safari/iPhone reales ni actualización PWA entre releases. Configuración, presupuestos, recurso HTTP de audio y límites en [RECORRIDOS_LOCALES.md](docs/RECORRIDOS_LOCALES.md).
- PWA local cerrada después, el 23: caso separado A→B **1/1 Chromium/Windows**, preview/offline **1/1**, tipos, **340 unitarias/22 archivos** y build/PWA. `main.tsx` utiliza `registerSW({ immediate: true })` de `virtual:pwa-register`, con tipos `vite-plugin-pwa/client`. Tras detectar la actualización, ese cliente coordina el refresco del documento; la configuración del worker por sí sola no lo acreditaba. El caso genera dos builds propios sin modificar `src`/`dist`, conserva datos guardados y comprueba B offline. No cubre formularios sin guardar ni la primera actualización de una pestaña legacy sin ese cliente; alcance y límites centralizados en los recorridos.

### Escenas y lectores

- Las nueve secciones pesadas se montan en su primera visita y permanecen montadas; el CMS sigue la misma regla tras habilitarlo. Ocultar una escena aplica `aria-hidden` e `inert`.
- `useSceneActivity` y `CanvasActivityController` pausan Canvas/animaciones cuando no están activos y respetan movimiento reducido. El modo reducido conserva interacción manual en 3D y ofrece las razones como controles estáticos.
- La banda sonora ocupa espacio en el documento; se alcanza desde la navegación. Los selectores HTML del universo abren los mismos mundos que los objetos 3D.
- Las cartas se bloquean con `locked`, no mediante fechas automáticas. Modo Prueba permite previsualizarlas sin cambiar ese valor; progresos y simulación se notifican sin recargar ni remontar el CMS.

### CSS
- **1 archivo de estilos de aplicación**: `src/styles/tailwind.css`; no mantener recuentos de líneas como garantía de estado.
- Tailwind CSS v4 con plugin `@tailwindcss/vite`
- Design tokens en bloque `@theme` (colores, sombras, radios, fuentes)
- **⚠️ CSS custom DEBE ir en `@layer components` o `@layer utilities`**: CSS unlayered gana contra Tailwind utilities y rompe estilos de componentes
- **⚠️ Siempre incluir `-webkit-backdrop-filter`** junto con `backdrop-filter` (Safari < 18)
- Nuevas clases de componente deben usar Tailwind utilities cuando sea posible
- Al modificar estilos, comprobar consumidores con `rg` y validar los tamaños/interacciones afectados.

## Infraestructura remota y antecedentes

El código incluye un cliente, servicios de Auth/sync y un repositorio remoto skeleton. No se ha activado ni validado su operación de producción en esta etapa. El checkout actual no contiene documentación en `docs/supabase/` ni los antiguos scripts de migración mock; los tags y notas de laboratorio son antecedentes, no comprobaciones del estado actual.

Una etapa remota posterior requerirá revisar contratos/schema, identidad real, aislamiento, sincronización y archivos, antes de habilitar el flag. Este documento no autoriza esa activación.

## Contexto para continuar

- [GUIA_PARA_EDITAR.md](GUIA_PARA_EDITAR.md): alcance real del CMS, personalización y respaldo.
- [CONTENT_CONTRACT.md](docs/CONTENT_CONTRACT.md) e [IDENTITY_CONTRACT.md](docs/IDENTITY_CONTRACT.md): contratos locales vigentes.
- [AVANCE_PULIDO_LOCAL.md](docs/AVANCE_PULIDO_LOCAL.md): estado, resultados exactos, límites y recuperación.
- [CONTEXTO_PROYECTO_CODEX.md](docs/CONTEXTO_PROYECTO_CODEX.md) e [HISTORIAL_GIT_CODEX.md](docs/HISTORIAL_GIT_CODEX.md): instantáneas del 13 de septiembre; no sustituir el estado vigente por sus recuentos.
- La memoria de `.claude/memory/` es contexto opcional histórico; comprobar los archivos pertinentes. Sus permisos/hooks pertenecen a Claude Code y no configuran Codex.
- Leer solo las skills pertinentes en `.agents/skills/` y contrastar instrucciones/documentación con la fuente actual.

### Mantenimiento local posterior — 23 de octubre

Los grupos React/Three de Vite conservan chunks bajo el umbral original de 500 kB. AuthGate carga el motor de sincronización dinámicamente; auth y sync comparten `remoteSpaceCache`, sin un import estático circular. El reset de espacio sigue siendo síncrono y la API anterior se reexporta. Verificados tipos, 343 unitarias/23 archivos, build/PWA y un caso PWA A→B más Universo compilado. Clock sigue siendo una deprecación de Fiber (también presente en el paquete estable 9.8.2 consultado, sin instalar); no parchear ni filtrar avisos. Esta comprobación no activa ni valida el backend remoto.

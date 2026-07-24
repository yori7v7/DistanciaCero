# CLAUDE.md — Distancia Cero

## ¿Qué es?

**Distancia Cero** es una SPA romántica interactiva (plantilla reusable). Un "universo digital vivo" con cartas, recuerdos, música 3D, misiones y secretos. Desplegado en GitHub Pages.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 (TSX) |
| Build | Vite 8 (`vite.config.js`, base: `/DistanciaCero/`) |
| Router | react-router-dom v7 (activado: `/` landing, `/app` experiencia, hash scenes) |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Backend | Supabase (preparado, **NO activado**) |
| Datos locales | JSON (`src/data/`) + localStorage |
| Estilos | Tailwind CSS v4 (1 archivo: `src/styles/tailwind.css`) |
| Deploy | GitHub Pages (`gh-pages -d dist`) |
| Iconos | lucide-react |
| Tests | Vitest + @testing-library/react (154 tests, 10 archivos) |
| CI/CD | GitHub Actions (tsc + build + test) |

## Estructura clave

```
src/
├── App.tsx                  # Componente raíz, lazy loading + Suspense
├── main.tsx                 # Entry point, AudioProvider + StrictMode
├── components/              # ~27 componentes React
│   ├── centro-universo/     # CMS genérico (patrón useCrudCollection)
│   │   ├── useCrudCollection.ts    # Hook CRUD genérico — 9 colecciones
│   │   ├── CrudEditorPanel.tsx     # Panel editor unificado (local + base)
│   │   ├── CrudStatButton.tsx      # Botón de filtro de stats
│   │   ├── BackupPanel.tsx         # Export/import respaldo v2
│   │   ├── LetterStatsPanel.tsx    # Estadísticas de cartas
│   │   └── SimulationBanner.tsx    # Banner modo simulación
│   ├── LoadingIntro.tsx     # Pantalla de carga
│   ├── Hero.tsx             # Portada principal
│   ├── UniverseSection.tsx  # Universo 3D interactivo (Three.js)
│   └── ...                  # Cartas, galería, playlist, CMS, etc.
├── context/
│   └── AudioContext.tsx     # Proveedor de música de fondo global
├── data/                    # ~15 archivos JSON con TODO el contenido
│   ├── siteConfig.json      # Config principal (nombres, fechas, contraseñas, audio)
│   ├── universe.json        # Planetas del universo 3D
│   ├── timeline.json        # Línea de tiempo de la relación
│   └── ...                  # Cartas, canciones, razones, misiones, etc.
├── services/                # Lógica de negocio (fachada sync)
│   ├── contentService.js    # CRUD genérico (API pública estable)
│   ├── authService.js       # Auth local fake (local-user1 / local-user2)
│   └── ...
├── repositories/            # Acceso a datos
│   ├── contentRepository.ts      # Re-export de localContentRepository
│   ├── localContentRepository.ts # localStorage (ACTIVO)
│   ├── remoteContentRepository.ts # Skeleton Supabase (INACTIVO)
│   └── contentRepositoryContract.ts
├── integrations/
│   └── supabase/client.js   # Factory aislado (validación estricta de env)
├── utils/
│   ├── helpers.ts           # isPlainObject, dateUtils, textUtils
│   ├── localContentStore.ts # Bajo nivel localStorage
│   └── localIdentityStore.ts
├── constants/
│   └── localUsers.ts        # local-user1, local-user2
├── types/                   # TypeScript type definitions
└── styles/
    └── tailwind.css         # Único archivo CSS (8,507 líneas, 96 !important)
```

## Arquitectura de datos

```
Componentes → contentService → contentRepository → localContentRepository → localContentStore → localStorage
```

**Regla**: Los componentes NUNCA importan `localContentStore` directamente.
**Feature flag**: `VITE_REMOTE_CONTENT_ENABLED=false` (el skeleton remoto está aislado)

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

## Migración legacy → estándar

Las cartas mensuales y "Abrir cuando" usaban llaves legacy de localStorage. La migración es automática:

```ts
// Se llama UNA vez al iniciar el CMS:
migrateLegacyLettersIfNeeded()
// Lee datos de llaves legacy → escribe en llaves estándar
// Marca un flag para no repetir la migración
```

## Flujo de identidad local

```
LocalIdentitySelector → authService → localIdentityStore → localStorage
```

Usuarios locales fake: `local-user1` (owner), `local-user2` (partner).
`authService.isAuthenticated()` siempre retorna `true` en modo local.

## Comandos

```bash
npm run dev              # Desarrollo en localhost:5173
npm run build            # Build producción
npm run preview          # Preview del build
npm run deploy           # Deploy a GitHub Pages
npm test                 # 154 tests (vitest run)
npm run test:watch       # Tests en modo watch
```

## Reglas de desarrollo

### No hacer NUNCA
- ❌ No importar `localContentStore` directamente desde componentes
- ❌ No usar `service_role` o secretos en frontend/Git
- ❌ No convertir `contentService` a async sin plan de compatibilidad
- ❌ No activar Supabase, Router y Auth en una misma fase
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
- ✅ Todo el contenido editable está en `src/data/` y localStorage
- ✅ Usar `useCrudCollection` + `CrudEditorPanel` para toda colección CRUD

### Estilo de código
- TypeScript con TSX (strict: false)
- Componentes funcionales con hooks
- Tailwind CSS v4 + 1 archivo CSS para estilos custom
- Comentarios en español
- Nombres de variables en camelCase

### TypeScript
- TypeScript 7.0.2 con `strict: false`
- `JSON.parse()` devuelve `unknown` (cambio en TS 7.0)
- Usar `as any` o interfaces tipadas para datos parseados de JSON
- Evitar `?.` + `??` encadenados en datos `unknown` (problemas de inferencia en TS 7.0)
- `localContentRepository.ts` usa safe wrappers para localStorage
- Utilidades compartidas en `src/utils/helpers.ts`
- `isPlainObject()` está en `helpers.ts` (no duplicar en componentes)

## CSS

- **1 archivo**: `src/styles/tailwind.css` (8,507 líneas, 96 `!important`)
- Tailwind CSS v4 con plugin `@tailwindcss/vite`
- Design tokens en bloque `@theme` (colores, sombras, radios, fuentes)
- Secciones merged: `clay-3d.css`, `global.css`, `blackhole-gallery.css`, etc.
- Los `!important` restantes (96) son en su mayoría legítimos (cascada de secciones merged)
- Nuevas clases de componente deben usar Tailwind utilities cuando sea posible
- Al modificar estilos, verificar visualmente con `npm run dev`

## Plan de migración a Supabase (Fase S5)

El proyecto tiene **~50 documentos** detallando la migración a Supabase. Ya completado:
- ✅ S4.4: Factory Supabase aislado (`integrations/supabase/client.js`)
- ✅ S4.5.1: Scripts de verificación de aislamiento
- ✅ S4.6.3.2.2: Schema aplicado manualmente en lab desechable (6 tablas)
- ✅ S4.6.3.3.2: RLS aplicado manualmente en lab desechable
- ✅ S4.6.4.7: 4 Auth users sintéticos creados en lab
- ✅ S4.6.4.15: Fixtures sintéticos aplicados y verificados
- ✅ S4.6.4.33: RLS E2E security gate PASS
- ✅ S4.6.5.x: Scripts de migración mock-only creados

**Pendiente (S5 - Producción)**:
- Crear proyecto Supabase REAL (no desechable)
- Bootstrap owner/partner con Auth real
- Mapping de UUIDs locales → reales
- Implementar `remoteContentRepository` con llamadas reales
- Activar feature flag y modo híbrido local/remoto
- Storage para media
- Migración de contenido real

**Gate actual**: Supabase NO activo — se reiniciará desde cero en fase futura.

## Notas para Claude Code

- El proyecto está en `C:\Users\dycs1\Downloads\DistanciaCero\`
- `siteConfig.json` tiene las contraseñas, nombres, fechas y config de audio
- La `GUIA_PARA_EDITAR.md` explica cómo editar cada sección sin tocar código
- Los docs en `docs/` y `docs/supabase/` son la fuente de verdad para el plan de migración
- La rama activa es `arquitectura-content-service` (14 commits de refactor)
- Memoria del proyecto en `C:\Users\dycs1\.claude\projects\C--Users-dycs1-Downloads-DistanciaCero\memory\`

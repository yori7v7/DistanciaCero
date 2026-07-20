---
name: project-state
description: Estado actual del proyecto DistanciaCero — qué se hizo, qué falta, bitácora
metadata:
  type: project
---

# Estado actual de DistanciaCero

**Última actualización**: 2026-07-20 (sesión completa — limpieza + refactor + diseño + bug fixes)

## Commits de la sesión anterior (Julio 14)

| Commit | Descripción |
|---|---|
| `02fdca2` | Plantilla genérica — sanitización completa (~99 archivos) |
| `4d71f80` | fix: desactivar proposal gate en modo plantilla |
| `9301b24` | fix: Hero crasheaba con randomPhrases.json vacío |
| `765564b` | feat: 100 razones genéricas para visualización |

## Commits de limpieza (Julio 20)

| Commit | Descripción |
|---|---|
| `ca14a99` | chore: remove dead space-3d-upgrade.css |
| `359a693` | chore: remove QuickIndex placeholder (returns null) |
| `91e53e5` | chore: remove counter-final.css (overridden by final-adjustments.css) |
| `fd11fd5` | chore: remove 16 orphan components + 11 empty JSONs (1,114 lines) |
| `80d042c` | chore: remove backups/ directory (73 files, 23,309 lines) |
| `1448d33` | docs: update Claude memory files after cleanup |
| `51ee625` | refactor: CSS cleanup — remove dead fix/polish, merge chaotic-reasons |
| `aa67ed7` | refactor: extract CrudStatButton, create useCrudCollection hook + CrudEditorPanel |
| `beb63e4` | refactor: remove dead rules from relationship-refactor.css |
| `eea8edc` | refactor: integrate useCrudCollection hooks for 5 collections, replace reasons JSX |
| `3ee9938` | chore: remove temp migration scripts |
| `d47bccc` | refactor: migrate 4 collections to CrudEditorPanel (5,092 → 3,947 lines) |
| `e13b140` | refactor: remove ~50 handlers + ~55 state vars (→ 3,276 lines, -36%) |
| `dd3a1b5` | fix: lazy-loaded sections flashing visible (CSS default hide + scene-visible) |
| `f3a13ff` | perf: lazy-load 3 heavy components (initial JS 1,554→552 kB) |
| `ea85129` | test: 17 tests for contentService |
| `94e8c12` | content: populate timeline, playlist, promises, dates, dreams |
| `0d2eb23` | feat: Claymorphism 3D + animated nebula background |
| `9792e94` | feat: MAXIMUM 3D Flutter-style + monthlyLetters/openWhen populated |
| `779db7f` | feat: 3D v2 vibrant colors + visible background |
| `813d3ac` | design: clay-3d v3 + vibrant colors on stable base |
| `b0b0e39` | fix: BlackHole gate CSS override for scene-mode |
| `70fb03d` | fix: BlackHole entered state visibility |
| `dde0d4a` | fix: BlackHole direct import + remove manual visibility hack |
| `48a5b87` | fix: BlackHole overflow visible |
| `2683068` | fix: BlackHole min-height + promises placeholder |
| `7e50ba5` | fix: BlackHole entering animation CSS override |
| `1b2ba25` | fix: BlackHole remove sessionStorage + CSS hacks |
| `981aeb4` | fix: BlackHole inline style during entering |
| `d476832` | fix: BlackHole final — inline entering+entered + scene reset |

## Estado final del proyecto

### Diseño
- **Glassmorphism + Claymorphism + Space UI**: fondos translúcidos, sombras 3D, bordes rosa brillantes
- **Colores vibrantes**: rosa #ff8ad4, rojo #ff2d55
- **Fondo animado**: nebulosas + estrellas visibles + anillos de energía
- **Tipografía**: Inter (body) + Playfair Display (headings)
- **3D**: todos los botones, cards, nav, inputs con extrusión clay
- **Impeccable skill**: instalado con reglas de diseño

### Arquitectura
- **CentroUniversoSection**: 5,092 → ~3,200 líneas (-37%)
- **useCrudCollection hook**: genérico para 5 colecciones
- **CrudEditorPanel**: panel CRUD reutilizable
- **Lazy loading**: UniverseSection + CentroUniversoSection
- **17 tests**: contentService (Vitest)

### Datos
- 15 JSONs poblados (3 items c/u + 100 razones)
- Cartas mensuales: 3 | Abrir cuando: 3 | Promesas: 3+1

### Bugs conocidos resueltos
- ✅ BlackHole: animación wormhole + contenido post-entrada
- ✅ BlackHole: no aparece en otras secciones
- ✅ Cartas mensuales: ya no 0/0
- ✅ Flash de secciones lazy-loaded
- ✅ SceneModeController estable

- ✅ **Login roto**: `VITE_REMOTE_CONTENT_ENABLED=true` → `false`
- ✅ **Proposal gate bloqueaba todo**: `display:none` en todas las secciones
- ✅ **Hero crasheaba**: `% 0` = NaN con `randomPhrases.json` vacío
- ✅ **ThemeSwitcher**: migración automática de temas viejos
- ✅ **CLAUDE.md**: referencias stale a docs/pages eliminados
- ✅ **IDENTITY_CONTRACT.md**: IDs actualizados
- ✅ **final-adjustments.css**: no estaba trackeado en git
- ✅ **hooks PreCommit**: removido (evento inválido en settings.json)

## Fase actual: Plantilla vacía (template mode)

El proyecto fue sanitizado completamente. Todo el contenido personal fue removido y reemplazado por placeholders genéricos.

## Lo que se completó

### Sanitización (Fase 1)
- ✅ Login arreglado: `VITE_REMOTE_CONTENT_ENABLED=false` en `.env.local`
- ✅ IDs locales renombrados: `local-yori`/`local-ale` → `local-user1`/`local-user2`
- ✅ Fechas personales específicas eliminadas de CounterSection, ProposalSection
- ✅ Distancia personal (90.3 km) y variables `yoriLocation`/`aleLocation` → genéricos
- ✅ Iniciales "Y"/"A" → "1"/"2" en DistanceMapSection
- ✅ `ale-yori-core` → `center-core` en UniverseSection
- ✅ PWA manifest: "Ale & Yori" → "Distancia Cero"
- ✅ sceneMusic.json: todos los paths de audio en blanco
- ✅ Fotos personales borradas (foto-01.jpg, foto-02.jpg)
- ✅ Audios personales borrados (wonderwall.mp3 + 8 scene MP3s)
- ✅ Credenciales Supabase limpiadas de .env.local
- ✅ Nombres reales eliminados de docs (IDENTITY_CONTRACT.md, SUPABASE_RLS_CONCEPT.md)
- ✅ GUIA_PARA_EDITAR.md sanitizada (contraseñas, URLs, usuario GitHub)
- ✅ "Ale" eliminado de placeholders, títulos y defaults en 6 componentes
- ✅ CLAUDE.md y memory files actualizados

### Correcciones (Fase 2)
- ✅ 9 páginas rotas eliminadas (src/pages/*.jsx importaban LegacyAppContent inexistente)
- ✅ .gitkeep creados en directorios de media vacíos
- ✅ Build compila sin errores

### Mejoras (Fase 3)
- ✅ README.md reescrito como template genérico
- ✅ Placeholders genéricos en todo el contenido

### Limpieza adicional
- ✅ backups/ eliminado (~72 archivos con datos personales)
- ✅ docs/SUPABASE_*.md eliminados (4 archivos — se empezará de cero)
- ✅ space-3d-upgrade.css eliminado (archivo muerto, 1 línea de comentario)
- ✅ QuickIndex.jsx eliminado (placeholder que retornaba null)
- ✅ counter-final.css eliminado (pisado por final-adjustments.css con !important)
- ✅ 16 componentes huérfanos eliminados (0 referencias entrantes desde código activo)
- ✅ 11 JSONs de datos vacíos eliminados (asociados a componentes huérfanos)
- ✅ CLAUDE.md actualizado con conteos post-limpieza

## Lo que queda pendiente

### Para cuando se active Supabase (desde cero)
- Crear nuevo proyecto Supabase
- Nuevo schema, RLS, Auth
- Implementar remoteContentRepository
- Activar VITE_REMOTE_CONTENT_ENABLED=true

### Mejoras futuras
- CentroUniversoSection: Refactor completado. 5,092 → 3,276 líneas (-36%). 5 hooks registrados, 5 paneles migrados, ~50 handlers eliminados. JS bundle: 1,592 → 1,557 kB (-35 kB)
- CSS: limpieza mayor completada (z-final-fixes.css eliminado, fix/polish podados, chaotic-reasons mergeado). Quedan ~150 !important en final-adjustments.css y relationship-refactor.css
- 0 tests en el proyecto

## Para personalizar (cuando haya destinataria)

1. `src/data/siteConfig.json` — nombres, fechas, contraseñas
2. `src/data/timeline.json` — línea de tiempo
3. `src/data/playlist.json` — canciones
4. `src/data/reasons.json` — razones
5. `public/audio/` — agregar MP3s
6. `public/images/` — agregar fotos
7. `vite.config.js` — nombre PWA puede personalizarse

## Datos técnicos
- **Usuarios locales**: `local-user1` (owner), `local-user2` (partner)
- **Modo**: local (sin backend)
- **Build**: exitoso, zero errores
- **Deploy anterior**: Vercel + GitHub Pages (desconectado)

**Why**: Documentar el estado actual para continuidad entre sesiones de Claude.
**How to apply**: Leer este archivo al inicio de una nueva sesión para entender qué se hizo y qué falta.

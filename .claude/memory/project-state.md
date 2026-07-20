---
name: project-state
description: Estado actual del proyecto DistanciaCero — qué se hizo, qué falta, bitácora
metadata:
  type: project
---

# Estado actual de DistanciaCero

**Última actualización**: 2026-07-20 (limpieza + CSS cleanup + inicio refactor CentroUniverso)

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

## Bugs corregidos

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
- CentroUniversoSection: Step 1 + 2 completados. 5 hooks registrados (reasons, promises, importantDates, futureDreams, playlist). Reasons JSX migrado a CrudEditorPanel. Paso 3: migrar JSX de las 4 colecciones restantes y eliminar ~68 handlers legacy (~1,500 líneas pendientes de eliminar)
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

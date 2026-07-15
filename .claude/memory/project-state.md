---
name: project-state
description: Estado actual del proyecto DistanciaCero — qué se hizo, qué falta, bitácora
metadata:
  type: project
---

# Estado actual de DistanciaCero

**Última actualización**: 2026-07-14 (sesión final — todo funcional)

## Commits de esta sesión

| Commit | Descripción |
|---|---|
| `02fdca2` | Plantilla genérica — sanitización completa (~99 archivos) |
| `4d71f80` | fix: desactivar proposal gate en modo plantilla |
| `9301b24` | fix: Hero crasheaba con randomPhrases.json vacío |
| `765564b` | feat: 100 razones genéricas para visualización |

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

## Lo que queda pendiente

### Para cuando se active Supabase (desde cero)
- Crear nuevo proyecto Supabase
- Nuevo schema, RLS, Auth
- Implementar remoteContentRepository
- Activar VITE_REMOTE_CONTENT_ENABLED=true

### Mejoras futuras
- 15 componentes no renderizados en App.jsx (posiblemente útiles: Navbar, MusicDock, GallerySection, etc.)
- CentroUniversoSection tiene 5000+ líneas — candidato a refactor
- 6 componentes usan localStorage directamente (violación arquitectura pero funcional)
- SceneMusicController necesita audio real en public/audio/

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

# CLAUDE.md — Distancia Cero

## ¿Qué es?

**Distancia Cero** es una SPA romántica interactiva (plantilla reusable). Un "universo digital vivo" con cartas, recuerdos, música 3D, misiones y secretos. Desplegado en GitHub Pages.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 (JSX, sin TypeScript) |
| Build | Vite 8 (`vite.config.js`, base: `/DistanciaCero/`) |
| Router | react-router-dom v7 (instalado, sin activar aún) |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Backend | Supabase (preparado, **NO activado** aún) |
| Datos locales | JSON (`src/data/`) + localStorage |
| Estilos | CSS puro (~20 archivos en `src/styles/`) |
| Deploy | GitHub Pages (`gh-pages -d dist`) |
| Iconos | lucide-react |

## Estructura clave

```
src/
├── App.jsx                  # Componente raíz, renderiza ~24 secciones en orden
├── main.jsx                 # Entry point, AudioProvider + StrictMode
├── components/              # ~40 componentes React
│   ├── LoadingIntro.jsx     # Pantalla de carga
│   ├── Hero.jsx             # Portada principal
│   ├── UniverseSection.jsx  # Universo 3D interactivo (Three.js)
│   ├── SecretSection.jsx    # Sección protegida por contraseña
│   ├── EmergencyButton.jsx  # Botón "Necesito un abrazo"
│   └── ...                  # Cartas, galería, playlist, misiones, etc.
├── context/
│   └── AudioContext.jsx     # Proveedor de música de fondo global
├── data/                    # ~25 archivos JSON con TODO el contenido
│   ├── siteConfig.json      # Config principal (nombres, fechas, contraseñas, audio)
│   ├── universe.json        # Planetas del universo 3D
│   ├── timeline.json        # Línea de tiempo de la relación
│   └── ...                  # Cartas, canciones, razones, misiones, etc.
├── services/                # Lógica de negocio (fachada sync)
│   ├── contentService.js    # CRUD genérico (API pública estable)
│   ├── authService.js       # Auth local fake (local-user1 / local-user2)
│   ├── profileService.js    # Perfiles de usuario
│   └── contentMetadataService.js
├── repositories/            # Acceso a datos
│   ├── contentRepository.js      # Selector (actualmente → local)
│   ├── localContentRepository.js  # Implementación localStorage (ACTIVA)
│   ├── remoteContentRepository.js # Skeleton Supabase (INACTIVO, fail-fast)
│   └── contentRepositoryContract.js
├── integrations/
│   └── supabase/client.js   # Factory aislado (validación estricta de env)
├── utils/
│   ├── localContentStore.js # Bajo nivel localStorage
│   └── localIdentityStore.js
├── constants/
│   └── localUsers.js        # local-user1, local-user2
└── styles/                  # ~20 archivos CSS temáticos
```

## Arquitectura de datos

```
Componentes → contentService → contentRepository → localContentRepository → localContentStore → localStorage
```

**Regla**: Los componentes NUNCA importan `localContentStore` directamente.
**Feature flag**: `VITE_REMOTE_CONTENT_ENABLED=false` (el skeleton remoto está aislado)

## Flujo de identidad local

```
LocalIdentitySelector → authService → localIdentityStore → localStorage
```

Usuarios locales fake: `local-user1` (owner), `local-user2` (partner).
`authService.isAuthenticated()` siempre retorna `true` en modo local.

## Plan de migración a Supabase (Fase S4)

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
- Crear nuevo proyecto Supabase desde cero
- Aplicar schema, RLS, Auth, Storage

**Gate actual**: Supabase NO activo — se reiniciará desde cero en fase futura.

## Comandos

```bash
npm run dev              # Desarrollo en localhost:5173
npm run build            # Build producción
npm run preview          # Preview del build
npm run deploy           # Deploy a GitHub Pages
npm run migration:mock   # Verificar scripts de migración mock
```

## Reglas de desarrollo

### No hacer NUNCA
- No importar `localContentStore` directamente desde componentes
- No usar `service_role` o secretos en frontend/Git
- No convertir `contentService` a async sin plan de compatibilidad
- No activar Supabase, Router y Auth en una misma fase
- No mezclar cambios de escenas/música con infraestructura remota
- No borrar localStorage automáticamente
- No tratar `local-user1`/`local-user2` como UUIDs reales

### Principios
- Mantener modo local funcional siempre (fallback offline)
- Export/import v2 disponible como backup
- Feature flag para activar remoto gradualmente
- Clean Architecture: componentes no conocen la fuente de datos
- Commits atómicos con mensajes descriptivos
- Todo el contenido editable está en `src/data/` y localStorage

### Estilo de código
- JavaScript con JSX (sin TypeScript)
- Componentes funcionales con hooks
- CSS puro por archivo (no CSS-in-JS)
- Comentarios en español
- Nombres de variables en camelCase

## Notas para Claude Code

- El proyecto está en `C:\Users\dycs1\Downloads\DistanciaCero\`
- GitHub Pages: ``
- `siteConfig.json` tiene las contraseñas, nombres, fechas y config de audio
- La `GUIA_PARA_EDITAR.md` explica cómo editar cada sección sin tocar código
- Los docs en `docs/` y `docs/supabase/` son la fuente de verdad para el plan de migración

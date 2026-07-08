---
name: architecture-rules
description: Clean Architecture rules, data flow, no-go rules for Distancia Cero
metadata:
  type: project
---

# Architecture Rules

## Data Flow

```
Componentes → contentService → contentRepository → localContentRepository → localContentStore → localStorage
```

**Rules**:
- Components NEVER import `localContentStore` directly
- `contentService.js` is the stable public API (sync for now)
- `contentRepository.js` re-exports local implementation (will become selector)
- `remoteContentRepository.js` is a skeleton (fail-fast, NOT connected)

## No-Go Rules (NEVER)

- No importar `localContentStore` directamente desde componentes
- No usar `service_role` o secretos en frontend/Git
- No convertir `contentService` a async sin plan de compatibilidad
- No activar Supabase, Router y Auth en una misma fase
- No mezclar cambios de escenas/música con infraestructura remota
- No borrar localStorage automáticamente
- No tratar `local-yori`/`local-ale` como UUIDs reales de Supabase
- No hard delete como comportamiento remoto por defecto

## Identity

- Local users: `local-yori` (owner), `local-ale` (partner)
- `authService.isAuthenticated()` always returns `true` in local mode
- Future: Supabase Auth with real UUIDs

## Feature Flags

- `VITE_REMOTE_CONTENT_ENABLED=false` — Remote content disabled
- `VITE_SUPABASE_URL` — Not set (only in `.env.local` when ready)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Not set

**Why**: Clean separation between layers allows swapping local for remote without rewriting components. Feature flags prevent accidental activation.
**How to apply**: Before any change, verify which layer you're modifying. Components → services, not components → localStorage.

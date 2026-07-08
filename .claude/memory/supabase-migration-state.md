---
name: supabase-migration-state
description: Current Supabase migration phase, completed steps, and pending critical gates
metadata:
  type: project
---

# Supabase Migration State

**Phase**: S4 (Documentation & Lab) → S5 (Production implementation) pending.

## Completed (S4.x)

- S4.4: Supabase client factory isolated in `src/integrations/supabase/client.js`
- S4.5.1: Verification scripts (`scripts/verify-supabase-isolation.mjs`)
- S4.6.3.2.2: Schema (6 tables) applied manually in disposable lab
- S4.6.3.3.2: RLS policies applied manually in disposable lab
- S4.6.4.7: 4 synthetic Auth users created in disposable lab
- S4.6.4.15: Synthetic fixtures applied and verified
- S4.6.4.33: RLS E2E security gate → PASS
- S4.6.5.x: Mock migration scripts built and tested

## Pending (Critical Gates for GO)

All gates marked `[ ] Pendiente` in `docs/SUPABASE_READINESS_CHECKLIST.md`:
- Bootstrap owner/partner seguro
- Mapping UUID verificado (local → real)
- RLS final revisada
- Proyecto Supabase desechable confirmado
- Variables de entorno seguras
- Estrategia sync local vs async remoto
- Fallback local funcional
- Repository remoto no activo
- Pruebas mínimas
- Media/Data URL plan
- Export/import v2 funcional
- Autoría legacy controlada
- Rollback Storage + DB
- Conflictos offline/online
- Audit log confiable

**Current gate verdict**: NO-GO (gates críticos pendientes).

**Feature flag**: `VITE_REMOTE_CONTENT_ENABLED=false`

**Why**: The disposable lab proved the schema and RLS work. The production Supabase project, real Auth users, and remote content repository are the next steps.
**How to apply**: Before any Supabase change, review `docs/SUPABASE_READINESS_CHECKLIST.md`. Never skip gates.

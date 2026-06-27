# Distancia Cero - Supabase SQL Drafts

Estos archivos son borradores documentales para una migracion futura a Supabase.

## Estado

- No deben ejecutarse todavia.
- `@supabase/supabase-js` esta instalado de forma aislada.
- Existe un factory aislado en `src/integrations/supabase/client.js`.
- Ningun runtime activo lo importa; no crea cliente durante import ni hace
  queries.
- No hay migraciones reales.
- No existe todavia un proyecto Supabase aislado aprobado para ejecutar estos
  drafts.
- No hay backend.
- No hay Router asociado a Auth.
- La app local sigue siendo el runtime estable y fallback.

## Archivos

- `schema_draft.sql`: borrador conceptual refinado en S4.6.2.1; sigue sin
  aplicarse y no es una migration idempotente para schemas existentes.
- `rls_draft.sql`: borrador conceptual refinado en S4.6.2.2; sigue sin
  aplicarse ni probarse en Supabase y mantiene escritura de contenido,
  RPC/Storage como gates futuros.
- `fixtures/README.md`: plan conceptual S4.6.2.4 de fixtures sinteticos,
  matriz futura y rollback; no contiene SQL ejecutable.
- `fixtures/synthetic_fixture_plan.sql`: draft documental S4.6.2.5.1 de
  fixtures sinteticos, no aplicado, con plantillas comentadas por defecto. No
  es migration, no es reset y no demuestra ejecucion real.
- `fixtures/synthetic_reset_draft.sql`: draft documental S4.6.2.6.1 de
  reset/cleanup sintetico, no aplicado, con plantillas comentadas por defecto.
  No es migration ni rollback ejecutado.
- `../SUPABASE_CONTRACT_TESTS.md`: alcance y comando del verificador manual de
  aislamiento; no es una prueba de RLS/backend real.
- `../SUPABASE_ISOLATED_ENVIRONMENT.md`: checklist S4.6.1, bloqueantes y matriz
  futura del laboratorio desechable; no crea proyecto ni aplica SQL.
- `../SUPABASE_MANUAL_APPLICATION_RUNBOOK.md`: runbook S4.6.3.0 para una
  futura aplicacion manual en laboratorio desechable; no crea proyecto, no
  aplica SQL y no conecta la app.
- `../SUPABASE_READINESS_CHECKLIST.md`: gate go/no-go obligatorio antes de
  conectar el factory, aplicar SQL o conectar repositories remotos.

## Antes de ejecutar cualquier SQL real

Primero deben revisarse:

- Schema final.
- RLS final.
- Storage y buckets privados.
- Mapping local -> remoto.
- Mapping de `local-yori` y `local-ale` a usuarios Auth reales.
- Mapping de `distancia-cero-local-space` a un `relationship_spaces.id` real.
- Plan de migracion de Data URL a Storage.
- Estrategia de rollback.

## Regla de oro

No ejecutar estos SQL tal cual contra Supabase sin revision. Estan escritos como base de discusion tecnica, no como migraciones listas para produccion.

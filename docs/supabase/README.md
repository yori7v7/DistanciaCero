# Distancia Cero - Supabase SQL Drafts

Estos archivos son borradores documentales para una migracion futura a Supabase.
S4.6.3.2.2 registro una aplicacion manual de `schema_draft.sql` en un
laboratorio Supabase desechable, con alcance limitado y sin conectar la app.

## Estado

- No deben ejecutarse de nuevo, ni en otros entornos, sin una subfase y una
  aprobacion separadas.
- `@supabase/supabase-js` esta instalado de forma aislada.
- Existe un factory aislado en `src/integrations/supabase/client.js`.
- Ningun runtime activo lo importa; no crea cliente durante import ni hace
  queries.
- No hay migraciones reales conectadas al runtime.
- Existe evidencia humana de laboratorio desechable para S4.6.3.2.2, sin
  project ref real en Git ni secrets en documentos.
- No hay backend.
- No hay Router asociado a Auth.
- La app local sigue siendo el runtime estable y fallback.

## Archivos

- `schema_draft.sql`: borrador conceptual refinado en S4.6.2.1; fue aplicado
  manualmente en S4.6.3.2.2 dentro de un laboratorio desechable, con `0 rows`
  reportados en las seis tablas esperadas. No es una migration idempotente
  para schemas existentes.
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
- `../SUPABASE_DISPOSABLE_PROJECT_CHECKLIST.md`: checklist S4.6.3.1 para
  evaluar un proyecto Supabase desechable futuro; no crea proyecto, no aplica
  SQL y no contiene project ref real.
- `../SUPABASE_POST_SCHEMA_LAB_RESULT.md`: registro S4.6.3.2.2 de evidencia
  post-schema en laboratorio desechable; no prueba RLS, Auth, Storage,
  fixtures, reset ni conexion del CRUD.
- `../SUPABASE_READINESS_CHECKLIST.md`: gate go/no-go obligatorio antes de
  conectar el factory, aplicar SQL o conectar repositories remotos.

## Antes de ejecutar cualquier SQL adicional

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

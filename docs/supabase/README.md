# Distancia Cero - Supabase SQL Drafts

Estos archivos son borradores documentales para una migracion futura a Supabase.
S4.6.3.2.2 registro una aplicacion manual de `schema_draft.sql` en un
laboratorio Supabase desechable, con alcance limitado y sin conectar la app.
S4.6.3.3.2 registro una aplicacion manual de `rls_draft.sql` en el mismo tipo
de laboratorio, tambien con alcance limitado y sin conectar la app.

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
- Existe evidencia humana de laboratorio desechable para S4.6.3.3.2: el RLS
  draft fue aceptado con `Success. No rows returned`, sin fixtures/reset,
  Storage, Auth users ni conexion de la app.
- S4.6.4.7 registra que 4 Auth users sinteticos fueron creados manualmente en
  el laboratorio desechable, sin valores sensibles en Git y sin conectar la app.
- S4.6.4.8 documenta el preflight de mapping privado para fixtures futuros, sin
  guardar UUIDs reales y sin aplicar SQL.
- S4.6.4.9 documenta una dry-review de fixture apply, sin ejecutar SQL, sin
  modificar SQL y sin aplicar fixtures.
- S4.6.4.10 documenta el preflight manual de fixture apply futuro, sin ejecutar
  SQL, sin usar CLI y sin conectar la app.
- S4.6.4.13 convierte los drafts apply/reset en plantillas SQL candidatas con
  placeholders fail-fast. Siguen sin aplicarse y solo pueden usarse en una copia
  privada fuera de Git tras un GO explicito futuro.
- RLS end-to-end, memberships, fixtures, reset, Storage, backend readiness y
  production readiness siguen pendientes.
- No hay backend.
- No hay Router asociado a Auth.
- La app local sigue siendo el runtime estable y fallback.

## Archivos

- `schema_draft.sql`: borrador conceptual refinado en S4.6.2.1; fue aplicado
  manualmente en S4.6.3.2.2 dentro de un laboratorio desechable, con `0 rows`
  reportados en las seis tablas esperadas. No es una migration idempotente
  para schemas existentes.
- `rls_draft.sql`: borrador conceptual refinado en S4.6.2.2 y preparado en
  S4.6.3.3.0b como candidato de aplicacion manual solo para laboratorio
  desechable. Fue aplicado manualmente en S4.6.3.3.2 con alcance limitado;
  mantiene escritura de contenido, RPC/Storage y pruebas con usuarios como
  gates futuros.
- `fixtures/README.md`: plan conceptual S4.6.2.4 y preflight S4.6.4.1 de
  fixtures sinteticos, matriz futura T01-T20 y rollback; no contiene SQL
  ejecutable.
- `fixtures/synthetic_fixture_plan.sql`: candidato futuro documentado de
  fixtures sinteticos, no aplicado, con plantillas comentadas por defecto y
  casos EXPECT PASS/EXPECT FAIL. No es migration, no es reset y no demuestra
  ejecucion real.
- `fixtures/synthetic_fixture_apply_draft.sql`: plantilla SQL candidata
  S4.6.4.13 para una futura aplicacion manual privada de fixtures sinteticos.
  Permanece no aplicada, bloqueada por placeholders fail-fast, sin reset, sin
  Storage, sin crear Auth users por el archivo y sin conexion de la app.
- `fixtures/SYNTHETIC_AUTH_USERS_PLAN.md`: preflight documental S4.6.4.4 para
  usuarios Auth sinteticos futuros. No crea usuarios, no guarda UUIDs reales,
  no aplica fixtures y no prueba RLS end-to-end.
- `fixtures/SYNTHETIC_AUTH_USERS_MANUAL_GUIDE.md`: guia manual S4.6.4.6 para
  crear Auth users sinteticos en el Dashboard del laboratorio desechable, sin
  guardar valores sensibles ni autorizar fixtures.
- `fixtures/SYNTHETIC_FIXTURE_MAPPING_PREFLIGHT.md`: preflight documental
  S4.6.4.8 para mapping privado futuro de Auth UUIDs sinteticos. No guarda
  UUIDs reales, no aplica fixtures y no prueba RLS end-to-end.
- `fixtures/SYNTHETIC_FIXTURE_APPLY_DRY_REVIEW.md`: revision documental seca
  S4.6.4.9 del fixture apply, sin modificar SQL, ejecutar SQL ni aplicar
  fixtures.
- `fixtures/SYNTHETIC_FIXTURE_APPLY_MANUAL_PREFLIGHT.md`: preflight manual
  documental S4.6.4.10 para fixture apply futuro, sin ejecutar SQL, usar CLI
  ni conectar la app.
- `fixtures/synthetic_reset_draft.sql`: plantilla SQL candidata S4.6.4.13 de
  reset/cleanup sintetico, no aplicada, bloqueada por placeholders fail-fast y
  limitada a marcadores sinteticos del candidato. No es migration ni rollback
  ejecutado.
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
- `../SUPABASE_POST_RLS_LAB_RESULT.md`: registro S4.6.3.3.2 de evidencia
  post-RLS en laboratorio desechable; no verifica acceso con usuarios, Auth,
  Storage, fixtures, reset ni conexion del CRUD.
- `../SUPABASE_POST_AUTH_USERS_LAB_RESULT.md`: registro S4.6.4.7 de evidencia
  sanitizada post-Auth-users en laboratorio desechable; no prueba RLS
  end-to-end, memberships, fixtures, reset, Storage ni conexion del CRUD.
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

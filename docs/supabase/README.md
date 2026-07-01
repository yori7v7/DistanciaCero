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
- S4.6.4.15 registra en `../SUPABASE_POST_FIXTURE_APPLY_LAB_RESULT.md` que el
  fixture sintetico fue aplicado manualmente con exito en el laboratorio
  desechable, usando una copia privada fuera de Git.
- S4.6.4.16 crea `fixtures/SYNTHETIC_FIXTURE_VERIFICATION_PLAN.md` como plan
  documental de verificacion post-fixture, sin ejecutar SQL ni probar RLS.
- S4.6.4.17 crea `fixtures/synthetic_fixture_verification_queries_draft.sql`
  como draft SQL read-only para verificacion futura, sin ejecutar SQL.
- S4.6.4.18 registra en `../SUPABASE_POST_FIXTURE_VERIFICATION_LAB_RESULT.md`
  que la verificacion read-only del fixture paso en el laboratorio desechable,
  usando solo SELECT queries en SQL Editor.
- S4.6.4.19 crea `RLS_END_TO_END_TEST_PLAN.md` como plan documental para una
  futura prueba RLS end-to-end, sin ejecutar pruebas ni conectar la app.
- S4.6.4.20 crea `RLS_TEST_METHOD_DECISION.md` como decision documental de
  metodo. Recomienda script temporal local fuera del repo para una fase futura.
- S4.6.4.21 crea `RLS_PRIVATE_SCRIPT_PREP.md` como preparacion documental para
  un script temporal local fuera del repo. No crea el script privado real.
- S4.6.4.22 registra en `RLS_PRIVATE_SCRIPT_CREATION_RESULT.md` que la carpeta
  y archivos privados RLS fueron creados fuera del repo, sin ejecutar el script.
- S4.6.4.23 registra en `RLS_PRIVATE_SCRIPT_REVIEW_RESULT.md` que el script
  privado fue revisado en read-only mode, sin ejecutarlo.
- S4.6.4.33 registra en `RLS_E2E_SECURITY_GATE_RESULT.md` que el private RLS
  E2E security gate paso en el laboratorio desechable, con resultado
  sanitizado y sin guardar secretos.
- S4.6.4.34 crea `BACKEND_READINESS_GAP.md` para documentar que falta antes de
  conectar la app: Auth real, mapping, migracion, Storage, fallback,
  sincronizacion, rollback, variables seguras, performance y CRUD remoto.
- S4.6.4.35 crea `REMOTE_REPOSITORY_CONTRACT.md` como contrato documental
  futuro para `remoteContentRepository` y estrategia de feature flag. No
  implementa repository, no toca runtime y no conecta la app.
- S4.6.4.36 crea `LOCAL_TO_REMOTE_CONTENT_MAPPING.md` para documentar el
  mapping conceptual desde JSON/LocalStorage local hacia tablas remotas futuras,
  sin ejecutar migracion ni conectar la app.
- S4.6.4.37 crea `MIGRATION_DRY_RUN_PLAN.md` para documentar un futuro dry-run
  local sin red, sin crear script, sin ejecutar migracion y sin tocar Supabase.
- S4.6.4.38 crea `LOCAL_SNAPSHOT_EXPORT_FORMAT.md` para documentar el formato
  futuro de snapshot/export local, sin crear scripts, sin generar snapshot real,
  sin exportar datos reales y sin tocar runtime.
- S4.6.4.39 crea `LOCAL_SNAPSHOT_VALIDATION_RULES.md` para documentar reglas
  futuras de validacion del snapshot local, sin crear scripts, sin generar
  snapshot real, sin leer LocalStorage real, sin ejecutar migracion y sin tocar
  runtime.
- S4.6.4.40 crea `MIGRATION_DRY_RUN_REPORT_FORMAT.md` para documentar el
  formato futuro del reporte de dry-run, sin crear scripts, sin ejecutar
  dry-run, sin generar snapshot real, sin leer datos reales y sin tocar runtime.
- S4.6.4.41 crea `MIGRATION_INSERT_GATE_CHECKLIST.md` para documentar el gate
  futuro previo a cualquier insert controlado, sin crear scripts, sin insertar
  datos, sin ejecutar dry-run, sin tocar Supabase y sin conectar runtime.
- S4.6.4.42 crea `CONTROLLED_LAB_INSERT_PLAN.md` para documentar el plan futuro
  de insert controlado en laboratorio desechable, sin crear scripts, sin
  insertar datos, sin ejecutar dry-run, sin tocar Supabase y sin conectar
  runtime.
- S4.6.4.43 audita la consistencia global de docs Supabase antes de scripts en
  modo read-only. El resultado fue NO-GO por referencias next-phase obsoletas,
  sin secretos ni cambios runtime.
- S4.6.4.44 repara referencias next-phase obsoletas y registra
  `GLOBAL_DOCS_CONSISTENCY_AUDIT_RESULT.md`, sin crear scripts, sin snapshot
  real, sin dry-run real, sin insert real y sin conectar runtime.
- S4.6.4.45 crea `SNAPSHOT_DRY_RUN_SCRIPT_DESIGN.md` para documentar el diseno
  futuro de scripts de snapshot/export y migration dry-run. No crea scripts,
  no genera snapshot real, no lee LocalStorage real, no ejecuta dry-run, no
  inserta datos y no conecta runtime.
- Reset, Storage, app connection, backend readiness y production readiness
  siguen pendientes.
- No hay backend conectado a la app ni listo para produccion.
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
- `../SUPABASE_POST_FIXTURE_APPLY_LAB_RESULT.md`: registro S4.6.4.15 de
  resultado sanitizado post-fixture-apply en laboratorio desechable. No guarda
  valores sensibles y no prueba RLS end-to-end.
- `fixtures/SYNTHETIC_FIXTURE_VERIFICATION_PLAN.md`: plan documental S4.6.4.16
  para una futura verificacion de counts, FK chain y memberships. No ejecuta
  SQL y no prueba RLS end-to-end.
- `fixtures/synthetic_fixture_verification_queries_draft.sql`: draft SQL
  read-only S4.6.4.17 para verificacion de counts, FK chain, memberships,
  metadata sintetica y guards de datos. Fue ejecutado manualmente como SELECT
  only en S4.6.4.18 dentro del laboratorio desechable y no prueba RLS
  end-to-end.
- `../SUPABASE_POST_FIXTURE_VERIFICATION_LAB_RESULT.md`: registro S4.6.4.18 de
  resultado sanitizado PASS post-verificacion read-only en laboratorio
  desechable. No guarda valores sensibles, no ejecuta reset, no toca Storage,
  no conecta la app y no prueba RLS end-to-end.
- `RLS_END_TO_END_TEST_PLAN.md`: plan documental S4.6.4.19 para una futura
  prueba RLS end-to-end con usuarios Auth sinteticos. No ejecuta pruebas, no
  obtiene tokens/JWTs, no toca Supabase, no conecta la app y no modifica
  runtime.
- `RLS_TEST_METHOD_DECISION.md`: decision documental S4.6.4.20 para una futura
  prueba RLS end-to-end. Recomienda script temporal local fuera del repo, sin
  ejecutar pruebas, sin usar CLI, sin tocar Supabase y sin conectar la app.
- `RLS_PRIVATE_SCRIPT_PREP.md`: preparacion documental S4.6.4.21 para un script
  temporal local fuera del repo. No crea script privado real, no ejecuta
  pruebas, no usa tokens/JWTs, no toca Supabase y no conecta la app.
- `RLS_PRIVATE_SCRIPT_CREATION_RESULT.md`: resultado S4.6.4.22 de creacion de
  carpeta y archivos privados fuera del repo. No ejecuta el script, no toca
  Supabase y no modifica runtime.
- `RLS_PRIVATE_SCRIPT_REVIEW_RESULT.md`: resultado S4.6.4.23 de revision
  read-only del script privado. No ejecuta el script y no prueba RLS
  end-to-end.
- `RLS_E2E_SECURITY_GATE_RESULT.md`: resultado S4.6.4.33 del private RLS E2E
  security gate en laboratorio desechable. Registra PASS para usuarios con
  membership, denial cross-space, denial de external_user y CHECK aceptable para
  anon/no-session bloqueado por privilegios de base de datos antes de RLS. No
  conecta la app, no toca runtime, no toca Storage y no prueba produccion.
- `BACKEND_READINESS_GAP.md`: documento S4.6.4.34 de gaps antes de conectar la
  app. El backend lab security gate paso, pero la app sigue bloqueada hasta
  resolver estrategia de Auth real, mapping, migracion, Storage, fallback,
  sincronizacion, rollback, env segura, performance y pruebas CRUD remoto.
- `REMOTE_REPOSITORY_CONTRACT.md`: documento S4.6.4.35 del contrato logico
  futuro para `remoteContentRepository` y estrategia de feature flag. Mantiene
  `contentService` como fachada, LocalStorage como default/fallback y prohibe
  acceso directo a Supabase desde componentes o escenas.
- `LOCAL_TO_REMOTE_CONTENT_MAPPING.md`: documento S4.6.4.36 del mapping
  conceptual desde JSON/LocalStorage local a `profiles`, `relationship_spaces`,
  `universe_members`, `content_items`, `content_events` y `media_assets`. No
  migra datos, no toca Storage, no ejecuta SQL y no conecta runtime.
- `MIGRATION_DRY_RUN_PLAN.md`: documento S4.6.4.37 del plan futuro de dry-run
  de migracion. Define entradas, salidas, validaciones, NO-GO y rollback futuro
  sin crear scripts, sin ejecutar migracion, sin tocar Supabase y sin conectar
  runtime.
- `LOCAL_SNAPSHOT_EXPORT_FORMAT.md`: documento S4.6.4.38 del formato futuro de
  snapshot/export local para alimentar un dry-run de migracion. No crea scripts,
  no genera snapshot real, no exporta datos reales, no lee LocalStorage real y
  no conecta runtime.
- `LOCAL_SNAPSHOT_VALIDATION_RULES.md`: documento S4.6.4.39 de reglas futuras
  de validacion para un snapshot/export local antes del dry-run. No crea
  scripts, no genera snapshot real, no lee LocalStorage real, no exporta datos
  reales y no conecta runtime.
- `MIGRATION_DRY_RUN_REPORT_FORMAT.md`: documento S4.6.4.40 del formato futuro
  del reporte de migration dry-run. Define conteos, operaciones planeadas,
  skipped items, warnings, conflictos, duplicados, identity mapping, media
  pendiente y NO-GO reasons sin ejecutar dry-run, sin crear scripts y sin tocar
  runtime.
- `MIGRATION_INSERT_GATE_CHECKLIST.md`: documento S4.6.4.41 del checklist/gate
  futuro previo a cualquier insert controlado de contenido migrado. No crea
  scripts, no inserta datos, no ejecuta dry-run real, no toca Supabase y no
  conecta runtime.
- `CONTROLLED_LAB_INSERT_PLAN.md`: documento S4.6.4.42 del plan futuro para un
  insert controlado en laboratorio desechable. No crea scripts, no inserta
  datos, no ejecuta dry-run real, no toca Supabase y no conecta runtime.
- `GLOBAL_DOCS_CONSISTENCY_AUDIT_RESULT.md`: registro S4.6.4.43/S4.6.4.44 de
  auditoria global read-only y reparacion docs-only de referencias next-phase
  obsoletas. No crea scripts, no genera snapshot real, no ejecuta dry-run real,
  no inserta datos y no conecta runtime.
- `SNAPSHOT_DRY_RUN_SCRIPT_DESIGN.md`: documento S4.6.4.45 del diseno
  conceptual de futuros scripts de snapshot/export, validacion, dry-run y
  resumen sanitizado. No crea scripts, no genera snapshots reales, no lee
  LocalStorage real, no ejecuta dry-run, no inserta datos y no conecta runtime.
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

## Siguiente fase recomendada

Disenar fixtures/mock snapshot examples como docs-only work, sin crear scripts
ejecutables, sin generar snapshot real, sin leer LocalStorage real, sin ejecutar
dry-run, sin insertar datos y sin tocar runtime.

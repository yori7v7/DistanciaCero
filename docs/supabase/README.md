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
- S4.6.4.46 crea `MOCK_SNAPSHOT_EXAMPLES.md` con ejemplos documentales
  sanitizados de snapshot PASS, snapshot CHECK, snapshot NO-GO, dry-run report
  y resumen humano mock. No crea scripts, no genera JSON real fuera de docs,
  no lee LocalStorage real, no ejecuta dry-run, no inserta datos y no conecta
  runtime.
- S4.6.4.47 crea `SCRIPT_IMPLEMENTATION_PLAN.md` para documentar que el primer
  script futuro recomendado es un validador mock-only sin red. No crea scripts,
  no crea `scripts/migration`, no genera snapshot real, no lee LocalStorage
  real, no ejecuta dry-run, no inserta datos y no conecta runtime.
- S4.6.4.48 crea `../../scripts/migration/validate-mock-snapshot.mjs` y tres
  fixtures mock sanitizados. El script es mock-only, no usa red, no importa
  Supabase, no lee `.env.local`, no lee LocalStorage real, no genera snapshots
  reales, no ejecuta dry-run real y no inserta datos.
- S4.6.4.50 crea `../../scripts/migration/dry-run-mock-snapshot.mjs` para
  transformar snapshots mock sanitizados en reportes dry-run mock sanitizados
  por stdout. No escribe reportes por defecto, no usa red, no importa Supabase,
  no lee `.env.local`, no lee LocalStorage real y no inserta datos.
- S4.6.4.52 crea `../../scripts/migration/run-mock-migration-checks.mjs` como
  runner mock-only para validar exit codes esperados del validador y del dry-run
  mock. No usa red, no importa Supabase, no lee `.env.local`, no lee
  LocalStorage real y no toca runtime.
- S4.6.4.54 agrega scripts npm de conveniencia para ejecutar esos checks
  mock-only: `migration:mock`, `migration:mock:validate` y
  `migration:mock:dry-run`. No instala dependencias, no usa red, no toca
  Supabase, no lee `.env.local`, no lee LocalStorage real, no usa datos reales
  y no inserta nada.
- S4.6.4.57 crea `PRIVATE_SNAPSHOT_WORKFLOW.md` para documentar el flujo
  privado futuro de export manual desde UI hacia una carpeta fuera del repo. No
  genera snapshot real, no lee LocalStorage real por scripts, no crea scripts,
  no guarda datos reales en Git/chat y no toca Supabase.
- S4.6.5.3 crea `PRIVATE_SNAPSHOT_VALIDATOR_DESIGN.md` para documentar el
  diseno del futuro validador privado local-only para exports UI guardados fuera
  del repo. No crea script, no lee export privado, no genera snapshot real, no
  lee LocalStorage real, no toca Supabase y no inserta datos.
- S4.6.5.4 crea `../../scripts/migration/validate-private-local-export.mjs` y
  fixtures sanitizadas `mock-local-export-*` para validar exports UI v2 con
  salida sanitizada. No se ejecuta contra export privado real, no lee archivos
  privados fuera del repo, no lee LocalStorage real, no toca Supabase y no
  inserta datos.
- S4.6.5.11 crea `PRIVATE_DRY_RUN_NORMALIZER_DESIGN.md` para documentar el
  diseno del futuro normalizador/dry-run privado local-only. No crea scripts,
  no lee export privado, no genera snapshot real, no ejecuta dry-run real, no
  toca Supabase, no inserta datos y no toca Storage.
- S4.6.5.12 crea `../../scripts/migration/dry-run-private-local-export.mjs` y
  una fixture media/playlist sanitizada para probar normalizacion/dry-run solo
  dentro del repo. No lee export privado real, no lee archivos privados, no lee
  LocalStorage real, no toca Supabase y no inserta datos.
- S4.6.5.14 crea `PRIVATE_DRY_RUN_RESULT.md` para registrar el resultado
  sanitizado del dry-run privado ejecutado manualmente por el usuario fuera del
  repo. Resultado `CHECK` esperado, 18 operaciones planeadas, 0 skipped, 0
  conflicts, 0 duplicate candidates y 0 noGoReasons. No incluye export privado,
  rutas privadas, Data URLs, URLs completas, payload completo ni secretos.
- S4.6.5.15 crea `CONTROLLED_PRIVATE_LAB_INSERT_POLICY.md` para documentar la
  politica de un futuro primer insert privado controlado en lab. Recomienda 14
  `content_items` limpios y difiere 4 items de media/playlist. No crea SQL, no
  crea scripts, no toca Supabase y no inserta datos.
- S4.6.5.16 crea `PRIVATE_INSERT_MANIFEST_FORMAT.md` para documentar el formato
  del futuro manifest sanitizado. Selecciona conceptualmente 14 items limpios,
  difiere 4 items pending-review y no incluye payload privado, Data URLs, rutas
  privadas ni secretos. No genera manifest real, no crea scripts y no inserta.
- S4.6.5.17 crea `../../scripts/migration/generate-private-insert-manifest.mjs`
  y fixtures sanitizadas de dry-run report. El script genera manifest JSON
  sanitizado con 14 selected/4 deferred desde fixtures mock. En S4.6.5.17 no
  lee dry-run privado real, no genera manifest real de usuario, no toca
  Supabase y no inserta.
- S4.6.5.18 audita el generador de manifest como local-only, built-ins de Node,
  sin red, sin Supabase, sin `src`, sin `.env.local`, sin LocalStorage real,
  sin escritura por defecto y sin modo insert.
- S4.6.5.19 crea `PRIVATE_INSERT_MANIFEST_RESULT.md` para registrar el
  resultado sanitizado del manifest privado generado manualmente por el usuario
  fuera del repo. Resultado `CHECK`: 14 selected, 4 deferred, 0 noGoReasons y
  `review_manifest_before_any_insert`. No incluye manifest privado, dry-run
  privado, export privado, payload, Data URLs, URLs completas, rutas privadas ni
  secretos.
- S4.6.5.20 crea `CONTROLLED_PRIVATE_LAB_INSERT_FINAL_GATE.md` como gate final
  documental obligatorio antes de cualquier insert privado controlado en lab.
  Define checks minimos, items permitidos/bloqueados, identity mapping,
  confirmacion de lab, rollback, verificacion futura y NO-GO inmediatos. No
  crea scripts, no crea SQL, no ejecuta insert y no toca Supabase.
- S4.6.5.21 crea `CONTROLLED_PRIVATE_LAB_INSERT_SCRIPT_DESIGN.md` como diseno
  docs-only del futuro script de insert controlado en lab. Define el script
  tentativo, gates, scope de 14 `content_items`, exclusion de media/playlist,
  modos preflight/no-network y lab insert, reporte sanitizado y rollback. No
  crea scripts, no crea SQL, no ejecuta insert y no toca Supabase.
- S4.6.5.22 crea `../../scripts/migration/preflight-private-lab-insert.mjs` y
  fixtures sanitizadas de manifest + identity mapping. El script es
  preflight/no-network, requiere flags explicitos, valida 14 selected/4
  deferred, bloquea media/playlist selected, no toca Supabase y no inserta.
- S4.6.5.23 audita el preflight no-network como local-only, sin red, sin
  Supabase, sin `src`, sin `.env.local`, sin escrituras, sin modo insert y sin
  secretos.
- S4.6.5.24 crea `PRIVATE_LAB_INSERT_PREFLIGHT_RESULT.md` para registrar el
  resultado sanitizado del preflight no-network ejecutado manualmente por el
  usuario contra manifest + identity mapping privados fuera del repo. Resultado
  `PASS`: 14 selected, 4 deferred, identity mapping confirmed, 0 warnings, 0
  noGoReasons, no network, no Supabase y no insert.
- S4.6.5.25 crea `PRIVATE_INSERT_PAYLOAD_BUILDER_DESIGN.md` para documentar el
  futuro payload builder privado. El builder tomaria export privado v2,
  manifest sanitizado e identity/space mapping privado para producir un payload
  privado de 14 `content_items` fuera del repo. No crea script, no genera
  payload real, no toca Supabase y no inserta.
- S4.6.5.26 crea `../../scripts/migration/build-private-insert-payload.mjs` y
  fixtures sanitizadas. El script toma export v2 + manifest + identity mapping
  mock, construye filas conceptuales de `content_items` en memoria e imprime
  solo resumen sanitizado. No lee export/manifest/mapping privados reales, no
  escribe payload real, no toca Supabase y no inserta.
- S4.6.5.32 crea `PRIVATE_INSERT_PAYLOAD_BUILDER_RESULT.md` para registrar el
  resultado sanitizado del payload builder privado ejecutado manualmente por el
  usuario fuera del repo. Resultado `PASS`: 14 selected, 14 payload rows, 4
  deferred, 0 missing local refs, 0 noGoReasons, identity mapping confirmed,
  no network, no Supabase, no payload impreso y no insert.
- S4.6.5.33 crea `PRIVATE_INSERT_PAYLOAD_PERSISTENCE_WORKFLOW.md` para
  documentar el workflow futuro de escritura opcional de payload privado fuera
  del repo. No crea scripts, no modifica scripts, no genera payload real, no
  toca Supabase y no inserta.
- S4.6.5.34 implementa escritura opcional `--out` en
  `../../scripts/migration/build-private-insert-payload.mjs`, probada solo con
  fixtures sanitizadas. Bloquea output dentro del repo y no toca Supabase.
- S4.6.5.36 crea `PRIVATE_INSERT_PAYLOAD_PERSISTENCE_RESULT.md` para registrar
  el resultado sanitizado de la persistencia privada reportada por el usuario:
  `PASS`, 14 selected, 14 payload rows, 4 deferred, output fuera del repo, sin
  payload real en Git/chat/Codex, sin Supabase, sin Storage y sin insert.
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
- `MOCK_SNAPSHOT_EXAMPLES.md`: documento S4.6.4.46 con ejemplos mock
  sanitizados de snapshot local y dry-run report para referencia futura de
  validadores/scripts. No contiene datos reales, no crea JSON real fuera de
  docs, no ejecuta dry-run y no autoriza inserts.
- `SCRIPT_IMPLEMENTATION_PLAN.md`: documento S4.6.4.47 del plan de
  implementacion para el primer script futuro. Recomienda
  `validate-mock-snapshot.mjs` como validador mock-only sin red para una fase
  futura, sin crearlo todavia.
- `../../scripts/migration/validate-mock-snapshot.mjs`: script S4.6.4.48
  mock-only para validar snapshots sanitizados de juguete. Usa solo modulos
  built-in de Node, no usa red, no importa Supabase ni `src`, no lee
  `.env.local`, no lee LocalStorage y no escribe datos.
- `../../scripts/migration/fixtures/*.json`: fixtures mock sanitizados para
  `PASS`, `CHECK` y `NO-GO`; no son snapshots reales ni payloads de migracion.
- `../../scripts/migration/dry-run-mock-snapshot.mjs`: script S4.6.4.50
  mock-only para producir reportes dry-run sanitizados desde fixtures mock. No
  ejecuta migracion real ni escribe archivos por defecto.
- `../../scripts/migration/run-mock-migration-checks.mjs`: runner S4.6.4.52
  mock-only que valida exit codes esperados sin imprimir payloads completos.
- `../../scripts/migration/README.md`: reglas de uso del validador mock-only.
- `../../package.json`: scripts npm S4.6.4.54 para ejecutar checks mock-only
  sin rutas largas; no cambia dependencias.
- `PRIVATE_SNAPSHOT_WORKFLOW.md`: workflow S4.6.4.57 para un futuro export
  privado desde UI, fuera del repo y sin datos reales en docs/chat.
- `PRIVATE_SNAPSHOT_VALIDATOR_DESIGN.md`: diseno S4.6.5.3 del futuro validador
  privado local-only para un export UI guardado fuera del repo; S4.6.5.4 crea
  la implementacion inicial y la mantiene bloqueada para datos reales hasta una
  revision futura.
- `PRIVATE_DRY_RUN_NORMALIZER_DESIGN.md`: diseno S4.6.5.11 del futuro
  normalizador/dry-run privado local-only; S4.6.5.12 crea la implementacion
  inicial con fixtures sanitizadas solamente. Define como convertir un export
  UI v2 validado en operaciones planeadas sanitizadas, sin leer export privado,
  insertar datos, tocar Supabase o subir media.
- `PRIVATE_DRY_RUN_RESULT.md`: resultado S4.6.5.14 del dry-run privado
  reportado de forma sanitizada. Registra `CHECK`, 18 operaciones planeadas,
  pendientes media/playlist y 0 noGoReasons, sin payload privado ni secretos.
- `CONTROLLED_PRIVATE_LAB_INSERT_POLICY.md`: politica S4.6.5.15 para un futuro
  primer insert privado en lab desechable. Recomienda incluir 14 items limpios
  y diferir media/playlist hasta politicas futuras.
- `PRIVATE_INSERT_MANIFEST_FORMAT.md`: formato S4.6.5.16 del futuro manifest
  sanitizado para el primer insert privado controlado. Define conteos,
  selected/deferred items, identity mapping privado pendiente, safety gates y
  rollback conceptual sin payload real.
- `PRIVATE_INSERT_MANIFEST_RESULT.md`: resultado S4.6.5.19 del manifest
  privado reportado de forma sanitizada. Registra `CHECK`, 14 selected, 4
  deferred y 0 noGoReasons, sin payload privado ni secretos.
- `CONTROLLED_PRIVATE_LAB_INSERT_FINAL_GATE.md`: gate S4.6.5.20 obligatorio
  antes de cualquier insert privado controlado. Bloquea insert sin GO explicito,
  identity mapping privado, lab desechable confirmado, checks verdes y rollback
  decidido.
- `CONTROLLED_PRIVATE_LAB_INSERT_SCRIPT_DESIGN.md`: diseno S4.6.5.21 del
  futuro script `../../scripts/migration/insert-private-lab-content-items.mjs`.
  La primera implementacion recomendada es preflight/no-network con fixtures
  sanitizadas, sin Supabase ni insert.
- `../../scripts/migration/preflight-private-lab-insert.mjs`: script S4.6.5.22
  local-only para validar manifest + identity mapping con fixtures sanitizadas.
  No escribe archivos, no toca Supabase, no inserta y no debe ejecutarse contra
  un manifest privado real sin una auditoria futura.
- `../../scripts/migration/fixtures/mock-private-insert-manifest-*.json` y
  `../../scripts/migration/fixtures/mock-private-identity-mapping-*.json`:
  fixtures sanitizadas del preflight.
- `PRIVATE_LAB_INSERT_PREFLIGHT_RESULT.md`: resultado S4.6.5.24 del preflight
  privado no-network reportado de forma sanitizada. Registra `PASS`, 14
  selected, 4 deferred, identity mapping confirmed, 0 warnings y 0 noGoReasons,
  sin payload privado ni secretos.
- `PRIVATE_INSERT_PAYLOAD_BUILDER_DESIGN.md`: diseno S4.6.5.25 del futuro
  payload builder privado para 14 `content_items`. Mantiene payload real fuera
  del repo/chat y sigue sin Supabase ni insert.
- `../../scripts/migration/build-private-insert-payload.mjs`: script S4.6.5.26
  local-only/no-network para construir un payload conceptual desde fixtures
  sanitizadas de export v2, manifest e identity mapping. Desde S4.6.5.34 puede
  escribir opcionalmente con `--out` solo fuera del repo y con confirmacion
  explicita. No imprime payload completo, no toca Supabase y no inserta.
- `../../scripts/migration/fixtures/mock-private-local-export-v2-*.json` y
  `../../scripts/migration/fixtures/mock-private-insert-payload-expected-summary.json`:
  fixtures sanitizadas del payload builder. No son exports privados reales ni
  payloads privados de usuario.
- `PRIVATE_INSERT_PAYLOAD_PERSISTENCE_RESULT.md`: resultado S4.6.5.36 de la
  persistencia privada reportada de forma sanitizada. Registra `PASS`, 14
  payload rows, output fuera del repo, no payload impreso, no red, no Supabase
  y no insert.
- `../../scripts/migration/generate-private-insert-manifest.mjs`: script
  S4.6.5.17 local-only para generar manifests sanitizados desde dry-run reports
  sanitizados. Rechaza URLs remotas, no escribe archivos, no inserta y fue
  auditado antes de cualquier uso con dry-run privado real.
- `../../scripts/migration/fixtures/mock-private-dry-run-result-*.json`:
  fixtures sanitizadas para el generador de manifest. No son reportes privados
  reales.
- `../../scripts/migration/dry-run-private-local-export.mjs`: script S4.6.5.12
  local-only para normalizar exports UI v2 desde una ruta local explicita hacia
  un reporte dry-run JSON sanitizado. Rechaza URLs remotas, no escribe archivos
  y ya fue usado manualmente por el usuario fuera del repo con resultado
  sanitizado documentado en `PRIVATE_DRY_RUN_RESULT.md`.
- `../../scripts/migration/validate-private-local-export.mjs`: script S4.6.5.4
  local-only para validar exports UI v2 desde una ruta local explicita. Rechaza
  URLs remotas e imprime solo resumen sanitizado; el resultado privado
  reportado se mantiene fuera del repo salvo por conteos/codigos sanitizados.
- `../../scripts/migration/fixtures/mock-local-export-*.json`: fixtures
  sanitizadas para PASS, CHECK empty y NO-GO del validador privado. No son
  exports reales.
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
- Mapping de `local-owner_b` y `local-owner_a` a usuarios Auth reales.
- Mapping de `distancia-cero-local-space` a un `relationship_spaces.id` real.
- Plan de migracion de Data URL a Storage.
- Estrategia de rollback.

## Regla de oro

No ejecutar estos SQL tal cual contra Supabase sin revision. Estan escritos como base de discusion tecnica, no como migraciones listas para produccion.

## Siguiente fase recomendada

Disenar el controlled lab insert executor workflow antes de cualquier insert
real. Todavia sin insert, sin SQL nuevo, sin datos reales en Git/chat, sin
LocalStorage real leido por scripts, sin Supabase desde Codex, sin `.env.local`,
sin runtime y sin Storage.

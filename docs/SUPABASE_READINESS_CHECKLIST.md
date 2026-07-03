# Supabase Readiness Checklist

> ESTADO: GATE DOCUMENTAL. Este archivo no instala Supabase, no aplica SQL,
> no crea un cliente remoto y no modifica el runtime de Distancia Cero.

## 1. Resumen

Este documento define los criterios operativos y de seguridad que deben
cumplirse antes de pasar de documentacion Supabase a implementacion real.

Su funcion es producir un veredicto verificable de `GO`, `NO-GO` o `WARN` para
cada fase. No sustituye revision tecnica, pruebas de RLS, backup ni aprobacion
humana.

Este checklist:

- no instala dependencias;
- no aplica schema, RLS, migrations ni policies;
- no crea un cliente Supabase;
- no conecta repositories remotos;
- no cambia LocalStorage ni export/import v2;
- no toca componentes, escenas, musica o Router;
- no cambia la API publica sync de `contentService`.

El estado inicial global es **NO-GO para implementacion remota** mientras exista
cualquier gate critico pendiente.

## 2. Estado actual esperado

Baseline historico verificado al crear este documento, antes de S4.3:

- [x] Supabase esta ausente de `package.json`.
- [x] No existen imports de `@supabase` en `src`.
- [x] No existe una llamada `createClient` en `src`.
- [x] No existen variables `VITE_SUPABASE_*` en el runtime.
- [x] `react-router-dom` esta instalado, pero Router no esta activo.
- [x] No existen `BrowserRouter`, `Routes`, `Route`, `useNavigate` o
      `useParams` en `src`.
- [x] El CRUD actual sigue siendo local y sync.
- [x] La API publica de `contentService` sigue siendo sync.
- [x] `contentRepository` reexporta la implementacion local.
- [x] `localContentRepository` es la unica capa que importa
      `localContentStore`.
- [x] LocalStorage sigue siendo la fuente activa y fallback estable.
- [x] Export/import v2 permanece intacto como backup offline.
- [x] Supabase sigue aislado del runtime; S4.6.3.2.2 solo registro schema en
      laboratorio desechable.
- [x] El build base pasa.
- [x] El arbol Git estaba limpio antes de iniciar esta fase documental.

Baseline historico post-S4.3/S4.3.1, antes de S4.4:

- [x] `@supabase/supabase-js@2.108.2` esta instalado de forma aislada.
- [x] Vite esta actualizado a `8.0.16` y `npm audit` esta limpio.
- [x] No existen imports `@supabase` ni llamadas `createClient` en `src`.
- [x] No existe cliente Supabase ni conexion remota.
- [x] El repository local, LocalStorage y la API sync siguen activos.

Estado verificado post-S4.4.1:

- [x] Existe un factory aislado en `src/integrations/supabase/client.js`.
- [x] Solo ese archivo importa `@supabase/supabase-js`, usa `createClient` y
      lee las variables Supabase documentadas.
- [x] Importar el factory no crea cliente, no hace queries y no toca Auth,
      Storage o Realtime.
- [x] Ningun runtime activo o repository importa el factory.
- [x] No existe conexion remota y el CRUD sigue local/sync.

Estado verificado post-S4.5.1:

- [x] Existe `scripts/verify-supabase-isolation.mjs` como verificador manual,
      sin framework ni dependencia nueva.
- [x] El verificador cubre contrato remoto fail-fast, factory import-safe,
      cero fetch y aislamiento del runtime.
- [x] El verificador no prueba RLS/backend real y no conecta el CRUD.
- [x] Su alcance esta documentado en `docs/SUPABASE_CONTRACT_TESTS.md`.
- [x] S4.6.4.1 documenta/prepara fixtures sinteticos controlados sin aplicarlos:
      reset, Storage, Auth users y app siguen fuera de alcance.
- [x] S4.6.4.3 crea un draft separado de aplicacion futura de fixtures, tambien
      no aplicado y sin crear Auth users.
- [x] S4.6.4.4 documenta el preflight de usuarios Auth sinteticos futuros, sin
      crear usuarios ni guardar UUIDs reales.
- [x] S4.6.4.6 documenta una guia manual segura para crear Auth users
      sinteticos en el laboratorio desechable, sin conectar la app ni aplicar
      fixtures.
- [x] S4.6.4.7 registra evidencia sanitizada de que los 4 Auth users
      sinteticos fueron creados manualmente en el laboratorio desechable.
- [x] S4.6.4.8 documenta el preflight de mapping privado para fixtures
      sinteticos futuros, sin guardar UUIDs reales ni aplicar SQL.
- [x] S4.6.4.9 documenta una dry-review de fixture apply, sin ejecutar SQL,
      sin modificar SQL y sin aplicar fixtures.
- [x] S4.6.4.10 documenta el preflight manual de fixture apply futuro, sin
      ejecutar SQL, sin usar CLI y sin conectar la app.
- [x] S4.6.4.13 convierte `synthetic_fixture_apply_draft.sql` y
      `synthetic_reset_draft.sql` en plantillas SQL candidatas con placeholders
      fail-fast. Siguen sin aplicarse y requieren copia privada fuera de Git
      antes de cualquier uso manual futuro.
- [x] S4.6.4.15 registra en `docs/SUPABASE_POST_FIXTURE_APPLY_LAB_RESULT.md`
      que el fixture sintetico fue aplicado manualmente con exito en el
      laboratorio desechable, usando copia privada fuera de Git.
- [x] S4.6.4.16 crea
      `docs/supabase/fixtures/SYNTHETIC_FIXTURE_VERIFICATION_PLAN.md` como plan
      documental post-fixture, sin ejecutar SQL ni probar RLS.
- [x] S4.6.4.17 crea
      `docs/supabase/fixtures/synthetic_fixture_verification_queries_draft.sql`
      como draft read-only de verificacion, sin ejecutar SQL ni probar RLS.
- [x] S4.6.4.18 registra en
      `docs/SUPABASE_POST_FIXTURE_VERIFICATION_LAB_RESULT.md` que las queries
      read-only de verificacion fueron ejecutadas manualmente en SQL Editor del
      laboratorio desechable y todos los checks sanitizados salieron PASS.
- [x] S4.6.4.19 crea `docs/supabase/RLS_END_TO_END_TEST_PLAN.md` como plan
      documental para una futura prueba RLS end-to-end, sin ejecutar pruebas,
      sin usar tokens/JWTs, sin tocar Supabase y sin conectar la app.
- [x] S4.6.4.20 crea `docs/supabase/RLS_TEST_METHOD_DECISION.md` como decision
      documental de metodo. Recomienda script temporal local fuera del repo
      para una fase futura, sin ejecutar pruebas, sin usar CLI y sin conectar
      la app.
- [x] S4.6.4.21 crea `docs/supabase/RLS_PRIVATE_SCRIPT_PREP.md` como
      preparacion documental para un script temporal local fuera del repo. No
      crea script privado, no ejecuta pruebas, no usa tokens/JWTs y no toca
      Supabase.
- [x] S4.6.4.22 registra en
      `docs/supabase/RLS_PRIVATE_SCRIPT_CREATION_RESULT.md` que el workspace y
      script privados fueron creados fuera del repo. No se ejecuto el script,
      no se modifico el repo y no se tocaron Supabase/app/runtime.
- [x] S4.6.4.23 registra en
      `docs/supabase/RLS_PRIVATE_SCRIPT_REVIEW_RESULT.md` la revision read-only
      del script privado. No se ejecuto el script y no se probaron RLS/Auth
      reales.
- [x] S4.6.4.33 registra en
      `docs/supabase/RLS_E2E_SECURITY_GATE_RESULT.md` el resultado sanitizado
      PASS del private RLS E2E security gate en laboratorio desechable.
- [x] S4.6.4.34 crea `docs/supabase/BACKEND_READINESS_GAP.md` para documentar
      gaps antes de conectar la app: Auth real, mapping, migracion, Storage,
      fallback, sincronizacion, rollback, env segura, performance y CRUD remoto.
- [x] S4.6.4.35 crea `docs/supabase/REMOTE_REPOSITORY_CONTRACT.md` como
      contrato documental futuro para `remoteContentRepository` y estrategia de
      feature flag, sin tocar runtime ni conectar la app.
- [x] S4.6.4.36 crea `docs/supabase/LOCAL_TO_REMOTE_CONTENT_MAPPING.md` como
      mapping documental desde JSON/LocalStorage local hacia tablas remotas
      futuras, sin ejecutar migracion ni conectar la app.
- [x] S4.6.4.37 crea `docs/supabase/MIGRATION_DRY_RUN_PLAN.md` como plan
      documental para un dry-run futuro, sin crear scripts, sin ejecutar
      migracion, sin tocar Supabase y sin conectar la app.
- [x] S4.6.4.38 crea `docs/supabase/LOCAL_SNAPSHOT_EXPORT_FORMAT.md` como
      formato documental futuro de snapshot/export local, sin crear scripts, sin
      generar snapshot real, sin exportar datos reales, sin leer LocalStorage
      real, sin tocar runtime y sin conectar la app.
- [x] S4.6.4.39 crea `docs/supabase/LOCAL_SNAPSHOT_VALIDATION_RULES.md` como
      reglas documentales futuras de validacion para snapshot/export local, sin
      crear scripts, sin generar snapshot real, sin leer LocalStorage real, sin
      exportar datos reales, sin ejecutar migracion y sin conectar la app.
- [x] S4.6.4.40 crea `docs/supabase/MIGRATION_DRY_RUN_REPORT_FORMAT.md` como
      formato documental futuro para el reporte de migration dry-run, sin crear
      scripts, sin ejecutar dry-run real, sin generar snapshot real, sin leer
      datos reales, sin ejecutar migracion y sin conectar la app.
- [x] S4.6.4.41 crea `docs/supabase/MIGRATION_INSERT_GATE_CHECKLIST.md` como
      checklist/gate documental futuro previo a cualquier insert controlado,
      sin crear scripts, sin insertar datos, sin ejecutar dry-run real, sin
      tocar Supabase/CLI/Dashboard y sin conectar la app.
- [x] S4.6.4.42 crea `docs/supabase/CONTROLLED_LAB_INSERT_PLAN.md` como plan
      documental futuro para insert controlado en laboratorio desechable, sin
      crear scripts, sin insertar datos, sin ejecutar dry-run real, sin tocar
      Supabase/CLI/Dashboard y sin conectar la app.
- [x] S4.6.4.43 audita en modo read-only la consistencia global de docs
      Supabase antes de scripts y registra NO-GO por referencias next-phase
      obsoletas, sin secretos ni cambios runtime.
- [x] S4.6.4.44 repara referencias next-phase obsoletas y registra el resultado
      de auditoria en `docs/supabase/GLOBAL_DOCS_CONSISTENCY_AUDIT_RESULT.md`,
      sin crear scripts, sin snapshot real, sin dry-run real, sin insert real y
      sin conectar la app.
- [x] S4.6.4.45 crea `docs/supabase/SNAPSHOT_DRY_RUN_SCRIPT_DESIGN.md` como
      diseno documental de futuros scripts de snapshot/export, validacion,
      dry-run y resumen sanitizado. No crea scripts, no genera snapshot real,
      no lee LocalStorage real, no ejecuta dry-run real, no inserta datos y no
      conecta la app.
- [x] S4.6.4.46 crea `docs/supabase/MOCK_SNAPSHOT_EXAMPLES.md` con ejemplos
      documentales sanitizados de snapshot PASS, snapshot CHECK, snapshot
      NO-GO, dry-run report y resumen humano mock. No crea scripts, no genera
      JSON real fuera de docs, no lee LocalStorage real, no ejecuta dry-run
      real, no inserta datos y no conecta la app.
- [x] S4.6.4.47 crea `docs/supabase/SCRIPT_IMPLEMENTATION_PLAN.md` como plan
      documental del primer script futuro. Recomienda un validador mock-only
      sin red, sin Supabase, sin `.env.local`, sin LocalStorage real y sin
      runtime. No crea scripts ni `scripts/migration`.
- [x] S4.6.4.48 crea `scripts/migration/validate-mock-snapshot.mjs`,
      `scripts/migration/README.md` y tres fixtures mock sanitizados. El script
      es mock-only, no usa red, no importa Supabase ni `src`, no lee
      `.env.local`, no lee LocalStorage real, no genera snapshot real, no
      ejecuta dry-run real y no inserta datos.
- [x] S4.6.4.50 crea `scripts/migration/dry-run-mock-snapshot.mjs` como script
      mock-only para transformar snapshots sanitizados de juguete en reportes
      dry-run mock por stdout. No usa red, no importa Supabase ni `src`, no lee
      `.env.local`, no lee LocalStorage real, no escribe reportes por defecto y
      no inserta datos.
- [x] S4.6.4.52 crea `scripts/migration/run-mock-migration-checks.mjs` como
      runner mock-only para validar exit codes esperados del validador y del
      dry-run mock. No usa red, no importa Supabase ni `src`, no lee
      `.env.local`, no lee LocalStorage real, no imprime payloads completos y
      no inserta datos.
- [x] S4.6.4.54 agrega scripts npm de conveniencia para ejecutar los checks
      mock-only de migracion sin rutas largas. No instala dependencias, no toca
      runtime, no usa Supabase, no lee `.env.local`, no lee LocalStorage real,
      no usa datos reales y no inserta datos.
- [x] S4.6.4.57 documenta `docs/supabase/PRIVATE_SNAPSHOT_WORKFLOW.md` como
      workflow privado futuro para export manual desde UI hacia carpeta privada
      fuera del repo. No genera snapshot real, no lee LocalStorage real por
      scripts, no crea scripts, no toca runtime, no usa Supabase y no pone datos
      reales en Git/chat.
- [x] S4.6.5.3 documenta `docs/supabase/PRIVATE_SNAPSHOT_VALIDATOR_DESIGN.md`
      como diseno del futuro validador privado de exports UI guardados fuera
      del repo. No crea script, no lee export privado, no genera snapshot real,
      no lee LocalStorage real, no toca runtime, no usa Supabase y no inserta
      datos.
- [x] S4.6.5.4 crea `scripts/migration/validate-private-local-export.mjs` y
      fixtures sanitizadas `mock-local-export-*` para validar exports UI v2 con
      salida sanitizada. No se ejecuta contra export privado real, no lee
      archivos privados fuera del repo, no lee LocalStorage real, no toca
      runtime, no usa Supabase y no inserta datos.
- [x] S4.6.5.11 crea
      `docs/supabase/PRIVATE_DRY_RUN_NORMALIZER_DESIGN.md` como diseno
      documental del futuro normalizador/dry-run privado local-only para un
      export UI v2 ya validado. No crea script, no lee export privado, no
      genera snapshot real, no ejecuta dry-run real, no toca Supabase, no
      inserta datos y no toca Storage.
- [x] S4.6.5.12 crea `scripts/migration/dry-run-private-local-export.mjs` y
      la fixture `mock-local-export-check-media-playlist.json` para probar el
      normalizador/dry-run solo con fixtures sanitizadas. No lee export privado,
      no lee archivos privados, no genera snapshot real, no lee LocalStorage
      real, no toca runtime, no usa Supabase y no inserta datos.
- [x] S4.6.5.14 registra en
      `docs/supabase/PRIVATE_DRY_RUN_RESULT.md` el resultado sanitizado del
      dry-run privado ejecutado manualmente por el usuario. Resultado `CHECK`
      esperado por media/playlist, 18 operaciones planeadas, 0 skipped, 0
      conflicts, 0 duplicates y 0 noGoReasons. No incluye export privado,
      rutas privadas, Data URLs, URLs completas, payload completo ni secretos.
- [x] S4.6.5.15 documenta
      `docs/supabase/CONTROLLED_PRIVATE_LAB_INSERT_POLICY.md` como politica
      docs-only para un futuro primer insert privado en lab desechable. La
      decision recomendada es insertar solo 14 `content_items` limpios y diferir
      `blackHoleGallery` 2 y `playlist` 2 por media/Storage y source policy.
      No crea SQL, no crea scripts, no toca Supabase y no inserta datos.
- [x] S4.6.5.16 documenta
      `docs/supabase/PRIVATE_INSERT_MANIFEST_FORMAT.md` como formato docs-only
      del futuro manifest sanitizado. El manifest seleccionaria 14 items
      limpios y diferiria 4 items pending-review. No genera manifest real, no
      crea scripts, no crea SQL, no toca Supabase y no inserta datos.
- [x] S4.6.5.17 crea
      `scripts/migration/generate-private-insert-manifest.mjs` y fixtures
      sanitizadas `mock-private-dry-run-result-*`. El script genera manifest
      sanitizado desde un dry-run report mock, selecciona 14 items limpios y
      difiere 4 items pending-review. No lee dry-run privado real, no genera
      manifest real de usuario, no crea SQL, no toca Supabase y no inserta.
- [x] Reset, Storage, conexion de app, backend readiness y production readiness
      siguen pendientes.

Este baseline debe volver a comprobarse antes de cada fase. Un estado verificado
aqui no autoriza por si solo cambios futuros.

## 3. Principios de activacion

- No activar el repository remoto por defecto.
- No hacer de Supabase un requisito para abrir la app.
- No borrar, reemplazar ni migrar LocalStorage automaticamente.
- No convertir `contentService` a async de golpe.
- No cambiar firmas o return types publicos sin plan de compatibilidad.
- No tocar UI visible hasta que repositories, contratos y fallback esten
  probados de forma aislada.
- No usar `service_role` ni secretos administrativos en frontend, Vite o Git.
- No tratar la anon/publishable key como sustituto de RLS.
- No usar `local-owner_b`, `local-owner_a` o `distancia-cero-local-space` como UUID
  remotos.
- No inventar autoria para contenido legacy sin metadata verificable.
- No atribuir automaticamente al importador contenido de autor desconocido.
- No usar hard delete como comportamiento remoto por defecto.
- No activar Router, Auth routing y Supabase en una misma fase.
- No mezclar cambios de escenas o musica con infraestructura remota.
- No aplicar SQL documental sin convertirlo antes en migrations revisadas.
- No habilitar escritura remota antes de probar lectura, RLS y rollback.
- No habilitar Realtime antes de definir conflictos y versionado.
- Mantener export/import v2 disponible como backup offline.

## 4. Gates criticos antes de implementacion

Estados permitidos:

- `[ ] Pendiente`: no existe evidencia suficiente.
- `[x] Cumplido`: existe evidencia revisada para la fase indicada.
- `[!] Bloqueado`: una condicion impide avanzar.

| Gate | Severidad | Criterio de aceptacion | Evidencia requerida | Estado |
| --- | --- | --- | --- | --- |
| Bootstrap owner/partner seguro | Critico | Crear Auth, profiles, space y memberships sin self-owner client-side | Diseno aprobado de RPC/admin flow, casos de error y rollback | [ ] Pendiente |
| Mapping UUID verificado | Critico | Mapear owner_b, owner_a y space local a UUID reales sin ambiguedad | Registro firmado/revisado de mapping y validacion de FKs | [ ] Pendiente |
| RLS final revisada | Critico | Policies finales protegen profiles, memberships, contenido, eventos y media sin permisos amplios de escritura | SQL final revisado y matriz de pruebas multiusuario | [ ] Pendiente |
| Proyecto Supabase desechable | Critico | Confirmar que el laboratorio puede destruirse, no es produccion, no contiene datos reales y no conecta la app | `docs/SUPABASE_DISPOSABLE_PROJECT_CHECKLIST.md`, aprobacion humana y evidencia sin secretos | [ ] Pendiente |
| Variables de entorno seguras | Alto | Definir URL y anon/publishable key sin secretos administrativos | `.env.example`, reglas de deploy y escaneo de secretos | [ ] Pendiente |
| Estrategia sync local vs async remoto | Critico | Preservar contrato sync o definir hidratacion/cache compatible | ADR/diseno con estados loading, error, offline y rollback | [ ] Pendiente |
| Fallback local | Critico | La app abre y permite modo local sin red o Supabase | Pruebas offline y procedimiento de desactivacion remota | [ ] Pendiente |
| Repository remoto no activo | Alto | Skeleton aislado no cambia el selector ni el comportamiento local | Diff, busqueda de imports y tests del selector local | [ ] Pendiente |
| Fixtures conceptuales listos | Alto | Nombres sinteticos, matriz minima y rollback conceptual definidos antes de SQL fixture draft | `docs/supabase/fixtures/README.md` revisado, sin SQL ejecutable ni datos reales | [ ] Pendiente |
| Fixture SQL candidate no aplicado | Critico | La plantilla candidata de fixtures queda bloqueada por placeholders y no puede usarse sin copia privada fuera de Git, entorno desechable, mapping privado, reset/rollback y aprobacion explicita | `synthetic_fixture_apply_draft.sql` revisado como candidato fail-fast, sin valores reales y sin aplicacion | [ ] Pendiente |
| Reset SQL candidate no aplicado | Critico | La plantilla candidata de reset queda bloqueada por placeholders y no puede usarse sin copia privada fuera de Git, entorno desechable, filtros sinteticos, revision y aprobacion explicita | `synthetic_reset_draft.sql` revisado como candidato fail-fast, sin valores reales y sin aplicacion | [ ] Pendiente |
| Pruebas minimas | Critico | Existen pruebas de contrato, RLS/Auth, fallback e import antes de UI | Matriz ejecutada con resultados reproducibles | [ ] Pendiente |
| Media/Data URL | Alto | Existe plan de validacion, upload privado, referencia y cleanup | Flujo probado en entorno aislado con archivos invalidos y fallos | [ ] Pendiente |
| Export/import v2 | Critico | Sigue funcionando como backup y la migracion remota es manual/idempotente | Backup de prueba, dry run, reimport y rollback verificados | [ ] Pendiente |
| `user_content_state` para opened/read | Medio | Se aprueba schema remoto o decision explicita de mantenerlo local | ADR y pruebas de compatibilidad con IDs base/locales | [ ] Pendiente |
| Autoria legacy | Critico | Autor desconocido queda null/controlado, nunca atribuido por conveniencia | Casos de import sin metadata y policy administrativa aprobada | [ ] Pendiente |
| Hidden restore vs hard delete | Alto | Restaurar hidden no borra contenido ni elude auditoria | Diseno de marker/RPC/soft delete y pruebas de restauracion | [ ] Pendiente |
| Rollback Storage + DB | Critico | Fallos parciales no dejan perdida ni media huerfana permanente | Journal, compensacion, reintento idempotente y prueba de fallo | [ ] Pendiente |
| Conflictos offline/online | Alto | Existe regla para ediciones concurrentes owner_a/owner_b | Estrategia de version, deteccion y resolucion probada | [ ] Pendiente |
| Audit log confiable | Alto | Eventos confiables no dependen de payload libre del cliente | Trigger/RPC/admin flow y prueba de inmutabilidad | [ ] Pendiente |
| Router fuera de alcance | Bajo | Ninguna fase Supabase activa Router implicitamente | Busqueda de imports y diff sin cambios de routing | [x] Cumplido |

Un gate solo cambia a `[x] Cumplido` cuando su evidencia existe y ha sido
revisada. Crear un archivo o instalar una dependencia no completa por si solo
ningun gate critico.

## 5. Checklist go/no-go global

### GO

`GO` se permite solo cuando:

- [ ] Todos los gates `Critico` aplicables estan en `[x] Cumplido`.
- [ ] Todos los gates `Alto` necesarios para la fase estan cumplidos.
- [ ] No hay secretos, SQL no revisado o cambios runtime fuera de alcance.
- [ ] El build y las pruebas de la fase pasan.
- [ ] El fallback local fue verificado despues del cambio.
- [ ] El diff contiene solo archivos autorizados.
- [ ] Existe rollback documentado y ejecutable para la fase.
- [ ] El siguiente paso tiene alcance y responsable claros.

### NO-GO

El resultado obligatorio es `NO-GO` si:

- [x] Falta cualquiera de los gates criticos. Estado actual de esta fase.
- [ ] Se detecta una `service_role` o secreto en frontend/Git.
- [ ] RLS permite acceso fuera del relationship space.
- [ ] El modo local deja de funcionar.
- [ ] Se rompe export/import v2 o no existe backup recuperable.
- [ ] La fase cambia la API sync sin compatibilidad aprobada.
- [ ] Se pretende importar autoria legacy sin mapping verificable.
- [ ] No puede demostrarse rollback de DB/Storage.
- [ ] El build o pruebas obligatorias fallan.

### WARN

`WARN` puede usarse cuando faltan gates `Medio` o `Bajo` que no afectan la
fase documental o aislada actual. Un `WARN`:

- no permite ignorar gates criticos;
- debe listar riesgo, owner y fecha/condicion de resolucion;
- no autoriza escritura remota ni datos reales;
- debe convertirse en `GO` o `NO-GO` antes de produccion.

## 6. Fases autorizadas despues de este checklist

Cada fase requiere aprobacion separada. Completar una no activa automaticamente
la siguiente.

### S4.0: auditoria tecnica del cliente sin instalar

- Objetivo: definir API del cliente, lifecycle, manejo de env y errores.
- Permitido: documentacion y lectura.
- Prohibido: dependencia, `createClient`, imports runtime.
- Salida: diseno aprobado y veredicto de variables necesarias.

### S4.1: docs de variables y `.env.example`

- Objetivo: documentar `VITE_SUPABASE_URL` y anon/publishable key.
- Permitido: docs y `.env.example` sin valores reales.
- Prohibido: `service_role`, secretos, conexion runtime.
- Salida: reglas de despliegue, validacion y escaneo de secretos.

### S4.2: contrato y remote repository skeleton

- Objetivo: fijar la interfaz remota sin dependencia Supabase activa.
- Permitido: contrato, skeleton y tipos/helpers aislados.
- Prohibido: cliente real, imports de Supabase o conectar el skeleton al CRUD.
- Salida: repository local sigue siendo la implementacion activa.

### S4.3: instalar `@supabase/supabase-js` sin usarlo

- Objetivo: agregar solo la dependencia oficial.
- Permitido: `package.json` y lockfile tras aprobacion explicita.
- Prohibido: imports, cliente, Auth, CRUD o Router.
- Salida: build estable y busqueda que confirme cero uso runtime.

### S4.4: cliente/factory Supabase aislado [COMPLETADA]

- Objetivo: crear un cliente encapsulado sin conectarlo al CRUD.
- Permitido: modulo aislado y validacion segura de env.
- Prohibido: selector remoto, UI, Auth visible o escritura.
- Salida: importado solo por tests o no importado por runtime activo.

### S4.5: tests y contratos de repository [S4.5.1 DISPONIBLE]

- Objetivo: demostrar equivalencia semantica y fallback.
- Permitido: pruebas de contrato y fixtures sin datos privados.
- Prohibido: UI productiva o migracion real.
- Salida S4.5.1: verificador reproducible de contrato remoto, factory y
  aislamiento mediante `node scripts/verify-supabase-isolation.mjs`.
- Pendiente: pruebas de integracion, RLS/backend y cobertura semantica remota
  de create/update/delete/override/hidden/legacy.

### S4.6: entorno Supabase aislado [S4.6.1 CHECKLIST DISPONIBLE]

- Objetivo: probar schema y RLS revisados fuera de produccion.
- Permitido: proyecto de prueba sin datos reales tras aprobacion.
- Prohibido: aplicar drafts sin revision o conectar la app productiva.
- Estado S4.6.1: `docs/SUPABASE_ISOLATED_ENVIRONMENT.md` documenta el entorno,
  bloqueantes y matriz; no crea proyecto ni aplica SQL.
- Estado S4.6.2.1: schema draft refinado documentalmente, sin ejecutar SQL.
- Estado S4.6.2.2: RLS draft refinado documentalmente, sin aplicar ni probar.
- Estado S4.6.2.4: plan conceptual de fixtures/matriz creado, sin SQL
  ejecutable.
- Estado S4.6.2.5.1: fixture SQL draft documental creado, no aplicado, con
  plantillas comentadas y sin reset.
- Estado S4.6.2.6.1: reset SQL draft documental creado, no aplicado, separado
  del fixture y sin rollback garantizado.
- Estado S4.6.3.0: `docs/SUPABASE_MANUAL_APPLICATION_RUNBOOK.md` documenta el
  procedimiento operativo y gate humano antes de S4.6.3.1+. No aplica SQL, no
  crea proyecto Supabase y no conecta la app.
- Estado S4.6.3.1: `docs/SUPABASE_DISPOSABLE_PROJECT_CHECKLIST.md` documenta
  el gate de proyecto desechable, evidencia segura y manejo de secretos. No
  crea proyecto Supabase, no aplica SQL y no conecta la app.
- Estado S4.6.3.2.2: `docs/SUPABASE_POST_SCHEMA_LAB_RESULT.md` registra
  evidencia humana sanitizada de aplicacion manual solo del schema draft en
  laboratorio desechable. Las seis tablas esperadas fueron reportadas con
  `0 rows`.
- Estado S4.6.3.3.0b: `docs/supabase/rls_draft.sql` queda preparado como
  candidato de aplicacion manual en laboratorio desechable. En esa subfase
  todavia no se habia aplicado en laboratorio y el CRUD seguia desconectado.
- Estado S4.6.3.3.2: `docs/SUPABASE_POST_RLS_LAB_RESULT.md` registra
  evidencia humana sanitizada de aplicacion manual solo del RLS draft en
  laboratorio desechable, con resultado `Success. No rows returned`. No verifica
  comportamiento con usuarios, no aplica fixtures/reset, no toca Storage y no
  conecta el CRUD.
- Estado S4.6.4.1: `docs/supabase/fixtures/README.md` y
  `docs/supabase/fixtures/synthetic_fixture_plan.sql` quedan actualizados como
  preflight/candidato futuro documentado. No se aplican fixtures, no se aplica
  reset, no se crean Auth users y no se toca Storage.
- Estado S4.6.4.3: `docs/supabase/fixtures/synthetic_fixture_apply_draft.sql`
  queda creado como draft separado para una futura aplicacion manual. El archivo
  no aplica SQL, no mezcla reset, no crea Auth users y no conecta el CRUD.
- Estado S4.6.4.4: `docs/supabase/fixtures/SYNTHETIC_AUTH_USERS_PLAN.md`
  queda creado como preflight documental. No crea usuarios, no guarda UUIDs
  reales, no usa emails reales y no prueba RLS end-to-end.
- Estado S4.6.4.6:
  `docs/supabase/fixtures/SYNTHETIC_AUTH_USERS_MANUAL_GUIDE.md` queda creado
  como guia manual segura para Auth users sinteticos en laboratorio desechable.
  No conecta la app, no aplica fixtures, no toca Storage y no guarda valores
  sensibles.
- Estado S4.6.4.7: `docs/SUPABASE_POST_AUTH_USERS_LAB_RESULT.md` registra que
  los 4 Auth users sinteticos fueron creados manualmente en el laboratorio
  desechable. No guarda UUIDs reales, project ref real, passwords, tokens,
  keys ni service-role. RLS end-to-end, memberships, fixtures, reset, Storage,
  app/backend y produccion siguen pendientes.
- Estado S4.6.4.8:
  `docs/supabase/fixtures/SYNTHETIC_FIXTURE_MAPPING_PREFLIGHT.md` queda creado
  como preflight documental para mapping privado futuro. No guarda UUIDs
  reales, no aplica fixtures, no ejecuta reset, no toca Storage y no conecta la
  app. RLS end-to-end, memberships, fixture apply, backend readiness y
  production readiness siguen pendientes.
- Estado S4.6.4.9:
  `docs/supabase/fixtures/SYNTHETIC_FIXTURE_APPLY_DRY_REVIEW.md` queda creado
  como revision documental seca del fixture apply. No modifica SQL, no ejecuta
  SQL, no aplica fixtures, no ejecuta reset y no conecta la app. RLS
  end-to-end, memberships, Storage, backend readiness y production readiness
  siguen pendientes.
- Estado S4.6.4.10:
  `docs/supabase/fixtures/SYNTHETIC_FIXTURE_APPLY_MANUAL_PREFLIGHT.md` queda
  creado como preflight manual documental para fixture apply futuro. No ejecuta
  SQL, no modifica SQL, no usa CLI, no aplica fixtures, no ejecuta reset, no
  toca Storage y no conecta la app. RLS end-to-end, memberships, backend
  readiness y production readiness siguen pendientes.
- Estado S4.6.4.13:
  `docs/supabase/fixtures/synthetic_fixture_apply_draft.sql` y
  `docs/supabase/fixtures/synthetic_reset_draft.sql` quedan convertidos en
  plantillas SQL candidatas con `begin`/`commit`, placeholders explicitos y
  bloque fail-fast. No se ejecuto SQL, no se aplican fixtures, no se ejecuta
  reset, no se usan UUIDs reales, no se toca Supabase/CLI/Dashboard y no se
  conecta la app. RLS end-to-end, memberships, Storage, backend readiness y
  production readiness siguen pendientes.
- Estado S4.6.4.15:
  `docs/SUPABASE_POST_FIXTURE_APPLY_LAB_RESULT.md` registra resultado
  sanitizado de apply manual exitoso de fixtures sinteticos en el laboratorio
  desechable. Se uso SQL Editor y copia privada fuera del repo; no se guardan
  UUIDs reales, project ref real, passwords, tokens, keys ni service-role. SQL
  Editor privilegiado no prueba RLS end-to-end. Reset, membership tests,
  Storage, app/backend y produccion siguen pendientes.
- Estado S4.6.4.16:
  `docs/supabase/fixtures/SYNTHETIC_FIXTURE_VERIFICATION_PLAN.md` queda creado
  como plan documental para verificar counts, FK chain y memberships en una
  fase futura. No ejecuta SQL, no toca Supabase/CLI/Dashboard, no conecta la app
  y no prueba RLS end-to-end. Reset, membership tests reales, Storage,
  app/backend y produccion siguen pendientes.
- Estado S4.6.4.17:
  `docs/supabase/fixtures/synthetic_fixture_verification_queries_draft.sql`
  queda creado como draft SQL read-only para verificar counts, FK chain,
  memberships, metadata sintetica y guards de datos. No se ejecuto SQL, no se
  toca Supabase/CLI/Dashboard, no se conecta la app y no prueba RLS end-to-end.
  Ejecutar verificacion manual, reset, membership tests reales, Storage,
  app/backend y produccion siguen pendientes.
- Estado S4.6.4.18:
  `docs/SUPABASE_POST_FIXTURE_VERIFICATION_LAB_RESULT.md` registra resultado
  sanitizado PASS de verificacion manual read-only en SQL Editor del
  laboratorio desechable. Solo se ejecutaron SELECT queries, no hubo reset,
  Storage, app connection, secretos ni cambios runtime. SQL Editor privilegiado
  no prueba RLS end-to-end; Auth/RLS test real, reset, Storage, app/backend y
  produccion siguen pendientes.
- Estado S4.6.4.19:
  `docs/supabase/RLS_END_TO_END_TEST_PLAN.md` documenta planificacion de una
  futura prueba RLS end-to-end con usuarios Auth sinteticos del laboratorio
  desechable. No ejecuta pruebas, no obtiene tokens/JWTs, no toca Supabase,
  no conecta la app y no modifica runtime. La decision de metodo seguro queda
  pendiente para S4.6.4.20.
- Estado S4.6.4.20:
  `docs/supabase/RLS_TEST_METHOD_DECISION.md` documenta la decision de metodo
  para una futura prueba RLS end-to-end. El metodo recomendado es script
  temporal local fuera del repo, con secretos manejados privadamente. No
  ejecuta pruebas, no usa CLI, no toca Supabase, no conecta la app y no
  modifica runtime.
- Estado S4.6.4.21:
  `docs/supabase/RLS_PRIVATE_SCRIPT_PREP.md` documenta preparacion para un
  script temporal local fuera del repo en una fase futura. No crea script
  privado real, no crea carpetas privadas, no ejecuta pruebas, no usa
  tokens/JWTs, no toca Supabase, no conecta la app y no modifica runtime.
- Estado S4.6.4.22:
  `docs/supabase/RLS_PRIVATE_SCRIPT_CREATION_RESULT.md` documenta que la
  carpeta y archivos privados para RLS fueron creados fuera del repo. No se
  ejecuto el script, no se modifico el repo, no se tocaron Supabase/CLI/
  Dashboard, SQL Editor, app, runtime ni `.env.local`.
- Estado S4.6.4.23:
  `docs/supabase/RLS_PRIVATE_SCRIPT_REVIEW_RESULT.md` documenta la revision
  read-only del script privado. El script no se ejecuto y RLS end-to-end sigue
  sin probarse.
- Estado S4.6.4.33:
  `docs/supabase/RLS_E2E_SECURITY_GATE_RESULT.md` registra resultado
  sanitizado PASS del private RLS E2E security gate en laboratorio desechable.
  Membership read paths, cross-space denial y external non-member denial fueron
  reportados como PASS. Anon/no-session quedo bloqueado por privilegios de base
  de datos antes de RLS, lo cual es aceptable para este proyecto y no justifica
  abrir `GRANT SELECT` a anon solo para una prueba cosmetica. La app sigue
  desconectada; runtime, `.env.local`, Storage y reset siguen sin tocarse.
- Estado S4.6.4.34:
  `docs/supabase/BACKEND_READINESS_GAP.md` documenta que el backend lab security
  gate paso, pero todavia faltan Auth real, mapping de perfiles, seed/migracion
  de contenido, Storage, fallback/offline, sincronizacion local/remota,
  rollback, separacion lab/produccion, variables seguras, performance, pruebas
  CRUD remoto y pruebas multiperfil antes de conectar la app.
- Estado S4.6.4.35:
  `docs/supabase/REMOTE_REPOSITORY_CONTRACT.md` documenta el contrato logico
  futuro de `remoteContentRepository`, la estrategia de feature flag y el plan
  gradual A-H. No implementa repository, no toca `src`, no cambia runtime y no
  conecta la app.
- Estado S4.6.4.36:
  `docs/supabase/LOCAL_TO_REMOTE_CONTENT_MAPPING.md` documenta las fuentes
  locales actuales, su destino remoto conceptual, reglas de identidad,
  orden/visibilidad, contenido sensible y estrategia futura de migracion. No
  ejecuta migracion, no toca SQL, no toca Storage y no conecta la app.
- Estado S4.6.4.37:
  `docs/supabase/MIGRATION_DRY_RUN_PLAN.md` documenta entradas, salidas,
  validaciones, estrategia futura, NO-GO y rollback para un dry-run de migracion
  futuro. No crea scripts, no ejecuta migracion, no toca Supabase/CLI/Dashboard,
  no toca runtime y no conecta la app.
- Estado S4.6.4.38:
  `docs/supabase/LOCAL_SNAPSHOT_EXPORT_FORMAT.md` documenta el formato futuro
  de snapshot/export local para alimentar un dry-run de migracion. No crea
  scripts, no genera snapshot real, no exporta datos reales, no lee
  LocalStorage real, no toca Supabase/CLI/Dashboard, no toca runtime y no
  conecta la app.
- Estado S4.6.4.39:
  `docs/supabase/LOCAL_SNAPSHOT_VALIDATION_RULES.md` documenta reglas futuras
  de validacion para un snapshot/export local antes de cualquier dry-run. No
  crea scripts, no genera snapshot real, no lee LocalStorage real, no exporta
  datos reales, no toca Supabase/CLI/Dashboard, no toca runtime y no conecta la
  app.
- Estado S4.6.4.40:
  `docs/supabase/MIGRATION_DRY_RUN_REPORT_FORMAT.md` documenta el formato
  futuro del reporte de migration dry-run para revisar conteos, warnings,
  conflictos, duplicados, media pendiente y resultado final antes de cualquier
  insert. No crea scripts, no ejecuta dry-run real, no genera snapshot real, no
  lee datos reales, no toca Supabase/CLI/Dashboard, no toca runtime y no conecta
  la app.
- Estado S4.6.4.41:
  `docs/supabase/MIGRATION_INSERT_GATE_CHECKLIST.md` documenta el checklist/gate
  futuro previo a cualquier insert controlado de contenido migrado. No crea
  scripts, no inserta datos, no ejecuta dry-run real, no genera snapshot real,
  no lee datos reales, no toca Supabase/CLI/Dashboard, no toca runtime y no
  conecta la app.
- Estado S4.6.4.42:
  `docs/supabase/CONTROLLED_LAB_INSERT_PLAN.md` documenta el plan futuro para
  un insert controlado en el laboratorio desechable solo despues de snapshot
  validation, dry-run report e insert gate. No crea scripts, no inserta datos,
  no ejecuta dry-run real, no genera snapshot real, no lee datos reales, no toca
  Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- Estado S4.6.4.43:
  auditoria global read-only de docs Supabase antes de scripts. Resultado:
  NO-GO por referencias next-phase obsoletas; sin secretos, sin app conectada,
  sin produccion lista, sin Storage tocado, sin snapshot/dry-run/insert real y
  sin `.env.local` llenado.
- Estado S4.6.4.44:
  reparacion docs-only de referencias next-phase obsoletas. Dejo lista la
  salida hacia la fase documentada en S4.6.4.45.
- Estado S4.6.4.45:
  `docs/supabase/SNAPSHOT_DRY_RUN_SCRIPT_DESIGN.md` documenta el diseno
  conceptual de futuros scripts de snapshot/export, validacion, dry-run y
  resumen sanitizado. No crea scripts, no genera snapshot real, no lee
  LocalStorage real, no ejecuta dry-run real, no inserta datos, no toca
  Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- Estado S4.6.4.46:
  `docs/supabase/MOCK_SNAPSHOT_EXAMPLES.md` documenta ejemplos mock
  sanitizados de snapshot local y dry-run report para referencia futura de
  validadores/scripts. No crea scripts, no genera JSON real fuera de docs, no
  lee LocalStorage real, no ejecuta dry-run real, no inserta datos, no toca
  Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- Estado S4.6.4.47:
  `docs/supabase/SCRIPT_IMPLEMENTATION_PLAN.md` documenta que el primer script
  futuro recomendado es un validador mock-only sin red. No crea scripts, no
  crea `scripts/migration`, no genera JSON real fuera de docs, no genera
  snapshot real, no lee LocalStorage real, no ejecuta dry-run real, no inserta
  datos, no toca Supabase/CLI/Dashboard, no toca runtime y no conecta la app.
- Estado S4.6.4.48:
  `scripts/migration/validate-mock-snapshot.mjs` valida solo snapshots mock
  sanitizados. Los fixtures `PASS`, `CHECK` y `NO-GO` viven en
  `scripts/migration/fixtures/`. No toca `src`, runtime, Supabase, CLI,
  Dashboard, SQL, `.env.local`, LocalStorage real, Storage ni datos reales.
- Estado S4.6.4.50:
  `scripts/migration/dry-run-mock-snapshot.mjs` produce reportes dry-run mock
  sanitizados por stdout desde fixtures mock. No toca `src`, runtime, Supabase,
  CLI, Dashboard, SQL, `.env.local`, LocalStorage real, Storage ni datos reales.
- Estado S4.6.4.52:
  `scripts/migration/run-mock-migration-checks.mjs` ejecuta checks mock-only de
  exit codes esperados para el validador y el dry-run mock. No imprime payloads
  completos, no toca `src`, runtime, Supabase, CLI, Dashboard, SQL,
  `.env.local`, LocalStorage real, Storage ni datos reales.
- Estado S4.6.4.54:
  `package.json` expone `migration:mock`, `migration:mock:validate` y
  `migration:mock:dry-run` como atajos npm para checks mock-only. No cambia
  dependencias, no toca `src`, runtime, Supabase, CLI, Dashboard, SQL,
  `.env.local`, LocalStorage real, Storage ni datos reales.
- Estado S4.6.4.57:
  `docs/supabase/PRIVATE_SNAPSHOT_WORKFLOW.md` documenta como obtener en una
  fase futura un export real privado desde la UI, guardarlo fuera del repo y
  reportar solo estado sanitizado. No genera snapshot real, no lee LocalStorage
  real por scripts, no crea scripts, no toca Supabase/CLI/Dashboard, no toca
  `.env.local`, no toca Storage y no conecta la app.
- Estado S4.6.5.3:
  `docs/supabase/PRIVATE_SNAPSHOT_VALIDATOR_DESIGN.md` documenta el diseno del
  futuro validador privado local-only para un export UI guardado fuera del
  repo. No crea script, no lee export privado, no genera snapshot real, no lee
  LocalStorage real, no toca Supabase/CLI/Dashboard, no toca `.env.local`, no
  toca Storage y no conecta la app.
- Estado S4.6.5.4:
  `scripts/migration/validate-private-local-export.mjs` existe con alcance
  local-only y salida sanitizada. Fue probado solo con fixtures sanitizadas
  dentro del repo: PASS exit 0, CHECK exit 2, NO-GO exit 1, no args exit 5 y
  URL remota exit 5. No lee export privado real ni archivos privados.
- Estado S4.6.5.11:
  `docs/supabase/PRIVATE_DRY_RUN_NORMALIZER_DESIGN.md` documenta como un futuro
  script `dry-run-private-local-export.mjs` deberia transformar un export UI v2
  validado en operaciones planeadas sanitizadas. No crea script, no lee export
  privado, no genera snapshot real, no ejecuta dry-run real, no inserta datos y
  mantiene Supabase/Storage bloqueados.
- Estado S4.6.5.12:
  `scripts/migration/dry-run-private-local-export.mjs` existe con alcance
  local-only y salida JSON sanitizada. Fue probado solo con fixtures
  sanitizadas: PASS exit 0, CHECK empty exit 2, NO-GO exit 1, no args exit 5,
  URL remota exit 5 y media/playlist CHECK exit 2. No lee export privado real
  ni archivos privados.
- Estado S4.6.5.14:
  `docs/supabase/PRIVATE_DRY_RUN_RESULT.md` registra el resultado sanitizado
  reportado por el usuario tras ejecutar el dry-run contra su export privado
  fuera del repo. Resultado `CHECK`, `totalItems` 18,
  `plannedOperationsCount` 18, `skippedItemsCount` 0, `conflictsCount` 0,
  `duplicateCandidatesCount` 0 y `noGoReasonsCount` 0. Los pendientes
  esperados son `mediaPending` 2 y `playlistPending` 2.
- Estado S4.6.5.15:
  `docs/supabase/CONTROLLED_PRIVATE_LAB_INSERT_POLICY.md` define la politica
  recomendada para un futuro primer insert privado en lab: seleccionar 14 items
  limpios y diferir 4 items pending-review (`blackHoleGallery` y `playlist`).
  No se ejecuta insert, no se crea SQL, no se crea script y no se toca
  Supabase.
- Estado S4.6.5.16:
  `docs/supabase/PRIVATE_INSERT_MANIFEST_FORMAT.md` define el formato
  sanitizado del futuro manifest: `selectedItemsCount` 14,
  `deferredItemsCount` 4, identity mapping privado pendiente y payload no
  incluido en repo/docs. No genera manifest real ni crea script.
- Estado S4.6.5.17:
  `scripts/migration/generate-private-insert-manifest.mjs` existe con alcance
  local-only y salida JSON sanitizada. Fue probado solo con fixtures
  sanitizadas: CHECK exit 2 con 14 selected/4 deferred, NO-GO exit 1, no args
  exit 5, URL remota exit 5, JSON invalido temporal exit 5 y patron inseguro
  temporal ABORTED exit 4. No lee dry-run privado real ni archivos privados.
- Salida futura: auditar el manifest generator antes de cualquier uso con
  dry-run privado real.

### S4.7: bootstrap owner/partner controlado

- Objetivo: probar creacion segura de profiles, space y memberships.
- Permitido: RPC/admin flow en entorno aislado.
- Prohibido: self-owner client-side o `service_role` en frontend.
- Salida: mapping UUID verificable y prueba de ultimo owner.

### S4.8: piloto read-only de una coleccion

- Objetivo: leer una coleccion piloto con fixtures sinteticos y sin datos
  privados reales, usando cache/fallback.
- Permitido: feature flag apagada por defecto, entorno aislado y datos
  sinteticos controlados.
- Prohibido: escritura, migracion masiva, media o Realtime.
- Salida: local-first intacto, errores/offline probados y rollback simple.

### S4.9: escritura y migracion controlada

- Objetivo: habilitar escritura o import remoto de forma limitada.
- Permitido solo si: RLS, autoria, idempotencia, conflictos y rollback estan
  cumplidos.
- Prohibido: datos reales sin backup, dry run y confirmacion.
- Salida: auditoria, reconciliacion y reversibilidad demostradas.

## 7. Archivos prohibidos hasta nuevo aviso

No deben tocarse como parte de preparacion Supabase general:

- `src/App.jsx`;
- `src/components/SceneModeController.jsx`;
- `src/components/SceneMusicController.jsx`;
- export/import runtime dentro de `CentroUniversoSection.jsx`;
- cualquier JSON base en `src/data`;
- `package.json`, salvo fase S4.3 aprobada expresamente o S4.6.4.54 para
  scripts npm mock-only sin dependencias nuevas;
- lockfile, salvo fase S4.3 aprobada expresamente;
- `vite.config.js`, salvo fase especifica aprobada;
- API publica sync de `src/services/contentService.js`;
- React Router runtime, rutas, hash/scene navigation o guards;
- musica, volumen, escenas y progreso opened/read;
- componentes visibles antes de completar contratos y pruebas aisladas.

Si una fase necesita alguno de estos archivos, debe detenerse y solicitar una
auditoria y autorizacion especificas.

## 8. Evidencia requerida por fase

### Evidencia estandar obligatoria

Cada fase debe entregar:

- [ ] `git status` inicial y final.
- [ ] `npm.cmd run build` inicial y final.
- [ ] `git diff --stat`.
- [ ] Diff completo de cada archivo autorizado modificado.
- [ ] `git diff --check`.
- [ ] Lista exacta de archivos creados/modificados.
- [ ] Confirmacion de archivos prohibidos no tocados.
- [ ] Resultado de busqueda de Supabase cuando aplique.
- [ ] Resultado de busqueda de Router cuando aplique.
- [ ] Riesgos nuevos y rollback de la fase.
- [ ] Veredicto `GO`, `NO-GO` o `WARN`.

### Evidencia especifica

| Fase | Evidencia adicional minima |
| --- | --- |
| S4.0 | Contrato del cliente, env, errores y limites de responsabilidad |
| S4.1 | `.env.example` sin secretos y lista de variables permitidas |
| S4.2 | Contrato del repository y evidencia de que el repository local sigue activo |
| S4.3 | `npm ls`, build y cero imports de Supabase en `src` |
| S4.4 | Validacion de env, ausencia de `service_role` y cliente no conectado |
| S4.5 | Resultados reproducibles de tests de contrato y fallback |
| S4.6 | Matriz RLS con usuarios de mismo/diferente space y rollback SQL |
| S4.7 | Evidencia de bootstrap, mapping UUID y proteccion del ultimo owner |
| S4.8 | Pruebas online/offline/error y feature flag apagada por defecto |
| S4.9 | Backup, dry run, idempotencia, conflictos, audit y rollback ejecutado |

Ninguna captura o log debe incluir tokens, cookies, claves o contenido privado.

## 9. Matriz de riesgos

| Riesgo | Impacto | Probabilidad | Mitigacion | Fase donde debe resolverse |
| --- | --- | --- | --- | --- |
| Self-owner durante bootstrap | Critico | Media | RPC/admin flow, constraints y pruebas de roles | S4.7 |
| `service_role` expuesto | Critico | Media | Prohibir frontend, escaneo y rotacion inmediata | S4.1-S4.4 |
| RLS permisiva | Critico | Media | Matriz multi-space, review y deny-by-default | S4.6 |
| `contentService` async roto | Critico | Alta | Cache/hidratacion y contrato compatible antes de conectar | S4.0-S4.5 |
| Perdida de datos locales | Critico | Media | LocalStorage intacto, backup v2 y migracion opt-in | S4.8-S4.9 |
| Autoria falsa | Alto | Media | Mapping verificado y null para legado desconocido | S4.7-S4.9 |
| Hard delete accidental | Alto | Media | Soft delete/marker, RPC y audit obligatorio | S4.6-S4.9 |
| Storage huerfano | Alto | Alta | Journal, compensacion, cleanup e idempotencia | S4.9 |
| Conflicto owner_a/owner_b | Alto | Alta | Versionado optimista y resolucion explicita | S4.5-S4.9 |
| Router activado antes de tiempo | Medio | Baja | Mantenerlo fuera de alcance y buscar imports | Todas |
| Export/import incompatible | Critico | Media | Fixtures v1/v2, dry run y pruebas de restauracion | S4.5-S4.9 |
| Build roto por dependency/config | Alto | Media | Fases aisladas, build inicial/final y rollback de lockfile | S4.3-S4.4 |
| Audit log falsificable | Alto | Media | Trigger/RPC/admin; no insert libre del cliente | S4.6-S4.9 |
| IDs locales usados como UUID | Critico | Baja | Registro de mapping y validacion estricta de UUID | S4.7-S4.9 |
| Media privada expuesta | Critico | Media | Bucket privado y policies por membership | S4.6-S4.9 |

## 10. Decisiones pendientes

- [ ] Metodo de bootstrap inicial y proteccion del ultimo owner.
- [ ] Ubicacion y custodia del mapping local -> remoto.
- [ ] Si `profiles` conservara `local_slug`.
- [ ] Diseno final de `user_content_state`.
- [ ] Referencia de progreso para JSON base y contenido remoto.
- [ ] Estrategia de cache/hidratacion sync/async.
- [ ] Fuente de verdad durante estados offline.
- [x] Contrato remoto documental y estrategia de feature flag conceptual.
- [x] Mapping documental local JSON/LocalStorage -> tablas remotas.
- [x] Migration dry-run plan documental.
- [x] Snapshot/export format documental.
- [x] Snapshot validation rules documental.
- [x] Migration dry-run report format documental.
- [x] Migration insert gate checklist documental.
- [x] Controlled lab insert plan documental.
- [x] Global Supabase docs consistency audit before scripts.
- [x] Supabase docs next-phase consistency repair.
- [x] Snapshot/dry-run script design docs-only.
- [x] Fixtures/mock snapshot examples docs-only.
- [x] Script implementation plan docs-only and mock-only validator decision.
- [x] First mock-only validator script with limited scope.
- [x] First mock-only dry-run report script with limited scope.
- [x] Mock migration smoke-test runner with limited scope.
- [x] NPM mock migration shortcuts with limited scope.
- [x] Private snapshot workflow docs-only.
- [x] Private snapshot validator design docs-only.
- [x] Private local export validator script with sanitized output.
- [x] Private local export validator script review and private retest
      sanitized.
- [x] Private dry-run normalizer design docs-only.
- [x] Private dry-run normalizer script with sanitized fixtures only.
- [x] Private dry-run result sanitized docs.
- [x] Controlled private insert policy docs-only.
- [x] Insert manifest format/design docs-only.
- [x] Insert manifest generator with sanitized fixtures only.
- [ ] Private insert manifest generator audit.
- [ ] Estrategia de conflictos owner_a/owner_b.
- [ ] Versionado optimista o mecanismo equivalente.
- [ ] Estrategia de rollback y cleanup de media.
- [ ] Estrategia y tooling de pruebas.
- [ ] Si existira RPC administrativa de importacion.
- [ ] Si el audit log se generara mediante trigger, RPC o admin.
- [ ] Restauracion de hidden sin hard delete general.
- [ ] Politica para autoria legacy desconocida.
- [ ] Forma de activar/desactivar repository remoto.
- [ ] Condiciones que justificarian export/import v3.
- [ ] Momento y alcance, si alguno, para activar React Router.

## 11. Plantilla de veredicto por fase

```md
## Veredicto de fase

- Fase: <identificador y nombre>
- Veredicto: GO / NO-GO / WARN
- Fecha: <ISO date>
- Alcance aprobado: <descripcion breve>
- Archivos tocados: <lista exacta>
- Archivos prohibidos verificados: <lista/confirmacion>
- Riesgos nuevos: <lista o ninguno>
- Riesgos pendientes: <lista>
- Evidencia revisada: <comandos, tests y diffs>
- Rollback verificado: si / no / no aplica
- Siguiente fase recomendada: <una sola fase>
- Aprobado por: <persona/proceso>
```

Reglas de uso:

- `GO` requiere evidencia, no solo intencion.
- `NO-GO` debe identificar el gate bloqueante.
- `WARN` no puede ocultar un gate critico pendiente.
- El veredicto no debe contener secretos ni datos privados.

## 12. Checklist de aceptacion de este documento

- [x] Solo crea `docs/SUPABASE_READINESS_CHECKLIST.md`.
- [x] No toca runtime ni archivos de `src`.
- [x] No instala dependencias.
- [x] No agrega ni configura Supabase.
- [x] No activa React Router.
- [x] No aplica SQL ni migrations.
- [x] No cambia `package.json` ni lockfile.
- [x] No cambia `vite.config.js`.
- [x] No cambia export/import v2.
- [x] No cambia JSON base.
- [x] No cambia la API sync de `contentService`.
- [x] Conserva LocalStorage como runtime y fallback estable.
- [x] El build pasa despues de crear el documento.

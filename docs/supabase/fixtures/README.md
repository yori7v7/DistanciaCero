# Supabase Synthetic Fixtures Plan

## 1. Resumen

Este documento define un plan conceptual y preflight S4.6.4.1 de fixtures
sinteticos para una validacion futura de schema/RLS en un entorno Supabase
aislado y desechable.

Este README:

- no contiene SQL ejecutable;
- no ejecuta ni aplica SQL;
- no crea usuarios reales;
- no usa datos privados reales;
- no aplica fixtures ni reset;
- no verifica RLS con usuarios/memberships;
- no conecta la app ni el CRUD;
- no crea proyecto Supabase;
- no define tokens, keys, emails reales ni service-role.

Todo contenido real de Distancia Cero debe tratarse como privado. Los ejemplos
de este documento son neutrales y sinteticos.

El archivo `synthetic_fixture_plan.sql` complementa este README como candidato
futuro documentado y no aplicado. Sus plantillas estan comentadas por defecto y
no son migrations ni fixtures ejecutados.

El archivo `synthetic_fixture_apply_draft.sql` es ahora una plantilla SQL
candidata S4.6.4.13 para una aplicacion manual futura de fixtures sinteticos.
S4.6.4.15 registra que fue aplicado manualmente con exito en el laboratorio
desechable desde una copia privada fuera de Git. El archivo versionado sigue
bloqueado por placeholders fail-fast; no debe ejecutarse directo desde el repo.

El archivo `SYNTHETIC_AUTH_USERS_PLAN.md` documenta el preflight S4.6.4.4 para
usuarios Auth sinteticos futuros. No crea usuarios, no guarda UUIDs reales y no
autoriza fixtures; solo define actores, placeholders y criterios GO/NO-GO.

El archivo `SYNTHETIC_AUTH_USERS_MANUAL_GUIDE.md` documenta la guia manual
S4.6.4.6 para crear Auth users sinteticos en el Dashboard del laboratorio
desechable. No declara usuarios creados, no guarda emails/UUIDs/passwords
reales y no autoriza fixtures.

El archivo `../../SUPABASE_POST_AUTH_USERS_LAB_RESULT.md` registra el resultado
sanitizado S4.6.4.7: los 4 Auth users sinteticos fueron creados manualmente en
el laboratorio desechable. No guarda UUIDs reales, project ref real, passwords,
tokens, keys ni service-role, y no autoriza fixtures.

El archivo `SYNTHETIC_FIXTURE_MAPPING_PREFLIGHT.md` documenta el preflight
S4.6.4.8 para un mapping privado futuro de Auth UUIDs sinteticos. No guarda
UUIDs reales, no aplica fixtures, no ejecuta reset y no prueba RLS end-to-end.

El archivo `SYNTHETIC_FIXTURE_APPLY_DRY_REVIEW.md` documenta la dry-review
S4.6.4.9 de fixture apply. No modifica SQL, no ejecuta SQL, no aplica fixtures
y no autoriza reset.

El archivo `SYNTHETIC_FIXTURE_APPLY_MANUAL_PREFLIGHT.md` documenta el preflight
manual S4.6.4.10 para una futura aplicacion de fixtures. No ejecuta SQL, no
usa CLI, no aplica fixtures y no conecta la app.

El archivo `synthetic_reset_draft.sql` es ahora una plantilla SQL candidata
S4.6.4.13 de reset/cleanup sintetico separado. Permanece no aplicado, bloqueado
por placeholders fail-fast, no es rollback garantizado y no debe ejecutarse sin
entorno desechable, copia privada fuera de Git, project ref confirmado y
aprobacion futura.

El archivo `../../SUPABASE_POST_FIXTURE_APPLY_LAB_RESULT.md` registra el
resultado sanitizado S4.6.4.15: fixture sintetico aplicado manualmente con
exito en el laboratorio desechable. No guarda UUIDs reales, project ref real,
passwords, tokens, keys ni service-role; no prueba RLS end-to-end y no autoriza
conexion de la app.

El archivo `SYNTHETIC_FIXTURE_VERIFICATION_PLAN.md` documenta el plan
S4.6.4.16 para verificar el fixture aplicado en una fase futura. No ejecuta
SQL, no toca Supabase, no conecta la app y no prueba RLS end-to-end.

El archivo `synthetic_fixture_verification_queries_draft.sql` documenta el draft
SQL read-only S4.6.4.17 para verificar counts, FK chain, memberships, metadata
sintetica y guards de datos. S4.6.4.18 registra que fue ejecutado manualmente
como SELECT-only verification en el laboratorio desechable, sin conectar la app
y sin probar RLS end-to-end.

El archivo `../../SUPABASE_POST_FIXTURE_VERIFICATION_LAB_RESULT.md` registra el
resultado sanitizado S4.6.4.18: verificacion read-only del fixture pasada en el
laboratorio desechable. No guarda valores sensibles, no ejecuta reset, no toca
Storage, no conecta la app y no prueba RLS end-to-end.

El archivo `../RLS_END_TO_END_TEST_PLAN.md` documenta el plan S4.6.4.19 para
una futura prueba RLS end-to-end con usuarios Auth sinteticos. No ejecuta
pruebas, no usa tokens/JWTs, no toca Supabase, no conecta la app y no modifica
runtime.

El archivo `../RLS_TEST_METHOD_DECISION.md` documenta la decision S4.6.4.20
para una futura prueba RLS end-to-end. Recomienda script temporal local fuera
del repo, sin ejecutar pruebas, sin usar CLI, sin tocar Supabase y sin conectar
la app.

El archivo `../RLS_PRIVATE_SCRIPT_PREP.md` documenta la preparacion S4.6.4.21
para un script temporal local fuera del repo, sin crearlo ni ejecutarlo.

El archivo `../RLS_PRIVATE_SCRIPT_CREATION_RESULT.md` registra el resultado
S4.6.4.22: carpeta y archivos privados creados fuera del repo, sin ejecutar el
script y sin tocar Supabase/app/runtime.

El archivo `../RLS_PRIVATE_SCRIPT_REVIEW_RESULT.md` registra el resultado
S4.6.4.23: revision read-only del script privado, sin ejecutarlo y sin probar
RLS end-to-end.

El archivo `../RLS_E2E_SECURITY_GATE_RESULT.md` registra el resultado
S4.6.4.33: private RLS E2E security gate PASS en el laboratorio desechable.
Los usuarios con membership leen sus espacios permitidos, los accesos
cross-space y external_user quedan bloqueados, y anon/no-session queda
bloqueado por privilegios de base de datos antes de RLS. No conecta la app, no
toca Storage, no ejecuta reset y no declara produccion lista.

## 2. Estado actual

- [x] Schema draft refinado en S4.6.2.1.
- [x] Schema draft aplicado manualmente en laboratorio Supabase desechable y
  documentado en S4.6.3.2.2, sin datos reales y sin conexion de la app.
- [x] RLS draft refinado en S4.6.2.2.
- [x] RLS draft aplicado manualmente en laboratorio Supabase desechable y
  documentado en S4.6.3.3.2, sin fixtures/reset y sin conexion de la app.
- [x] El private RLS E2E security gate con usuarios sinteticos, memberships y
  cliente autenticado normal paso en S4.6.4.33 dentro del laboratorio
  desechable.
- [x] Factory Supabase aislado existe.
- [x] Verificador manual pasa con cero fetch.
- [x] CRUD local/sync sigue activo.
- [x] Remote repository skeleton sigue fail-fast.
- [x] LocalStorage sigue activo y funciona como fallback.
- [x] Router sigue inactivo.
- [x] Existe `synthetic_fixture_plan.sql` como draft documental no aplicado y
  sin operaciones ejecutables por defecto.
- [x] Existe `synthetic_fixture_apply_draft.sql` como plantilla SQL candidata
  aplicada manualmente en laboratorio desechable desde copia privada fuera de
  Git, con resultado sanitizado documentado en
  `../../SUPABASE_POST_FIXTURE_APPLY_LAB_RESULT.md`.
- [x] Existe `SYNTHETIC_AUTH_USERS_PLAN.md` como preflight documental de Auth
  users sinteticos, sin usuarios creados ni UUIDs reales versionados.
- [x] Existe `SYNTHETIC_AUTH_USERS_MANUAL_GUIDE.md` como guia manual segura
  para Auth users sinteticos, sin valores sensibles versionados.
- [x] Existe `../../SUPABASE_POST_AUTH_USERS_LAB_RESULT.md` con evidencia
  sanitizada de que los 4 Auth users sinteticos fueron creados manualmente en
  el laboratorio desechable.
- [x] Existe `SYNTHETIC_FIXTURE_MAPPING_PREFLIGHT.md` como preflight documental
  para mapping privado futuro, sin UUIDs reales versionados.
- [x] Existe `SYNTHETIC_FIXTURE_APPLY_DRY_REVIEW.md` como dry-review
  documental, sin fixture apply, sin reset y sin SQL ejecutado.
- [x] Existe `SYNTHETIC_FIXTURE_APPLY_MANUAL_PREFLIGHT.md` como preflight
  manual documental, sin fixture apply, sin reset y sin SQL ejecutado.
- [x] Existe `synthetic_reset_draft.sql` como plantilla SQL candidata no
  aplicada, bloqueada por placeholders fail-fast y separada del fixture apply.
- [x] Existe laboratorio desechable reportado por evidencia humana; Auth users
  sinteticos fueron creados manualmente y el fixture sintetico fue aplicado
  manualmente desde copia privada. Storage, reset y app conectada siguen fuera
  de alcance.
- [x] Existe `SYNTHETIC_FIXTURE_VERIFICATION_PLAN.md` como plan documental
  post-fixture. No ejecuta SQL y no prueba RLS end-to-end.
- [x] Existe `synthetic_fixture_verification_queries_draft.sql` como draft SQL
  read-only de verificacion. Fue ejecutado manualmente en S4.6.4.18 como SELECT
  only en el laboratorio desechable y no prueba RLS end-to-end.
- [x] Existe `../../SUPABASE_POST_FIXTURE_VERIFICATION_LAB_RESULT.md` con
  resultado sanitizado PASS de la verificacion read-only del fixture. Reset,
  Storage y app connection siguen fuera de alcance.
- [x] Existe `../RLS_END_TO_END_TEST_PLAN.md` como plan documental para una
  prueba RLS end-to-end que despues quedo registrada como PASS sanitizado en
  S4.6.4.33. Reset, Storage y app connection siguen pendientes.
- [x] Existe `../RLS_TEST_METHOD_DECISION.md` como decision documental de
  metodo para RLS. El metodo recomendado es script temporal local fuera del
  repo; S4.6.4.33 registra el resultado PASS sanitizado de ese security gate.
  Reset, Storage y app connection siguen pendientes.
- [x] Existe `../RLS_PRIVATE_SCRIPT_CREATION_RESULT.md` con evidencia
  documental de que el workspace/script privado fue creado fuera del repo. El
  script no fue ejecutado.
- [x] Existe `../RLS_PRIVATE_SCRIPT_REVIEW_RESULT.md` con evidencia documental
  de revision read-only del script privado.
- [x] Existe `../RLS_E2E_SECURITY_GATE_RESULT.md` con resultado sanitizado PASS
  del private RLS E2E security gate. Reset, Storage, app connection, backend
  readiness y production readiness siguen pendientes.

## 2.1 Preflight S4.6.4.1

Esta fase solo prepara documentacion para una futura aplicacion manual de
fixtures. No cambia el estado de la base ni del runtime.

Reglas del preflight:

- en S4.6.4.1, los fixtures seguian sin aplicarse;
- reset sigue no aplicado y separado;
- Storage queda fuera de alcance;
- Auth users queda fuera de alcance;
- el draft aplicable futuro requiere Auth users sinteticos antes de cualquier
  prueba real de acceso;
- el plan S4.6.4.4 define usuarios Auth sinteticos solo como preflight futuro;
- app/CRUD siguen desconectados;
- SQL Editor corre con privilegios y no representa un cliente autenticado
  normal;
- RLS aplicada en laboratorio todavia no equivale a verificacion con usuarios
  sinteticos y memberships;
- cualquier aplicacion manual futura requiere otro GO explicito;
- rollback principal: destruir el laboratorio Supabase desechable.

## 3. Objetivo de los fixtures sinteticos

Los fixtures futuros deben permitir probar, en una fase posterior y solo con
aprobacion explicita:

- invariantes de schema;
- RLS por membership y role;
- aislamiento cross-space;
- actores `owner`, `partner` y externo;
- filas `local`, `override` y `hidden`;
- media metadata sin archivos reales;
- eventos/audit de forma conceptual;
- operaciones denegadas;
- rollback/reset repetible;
- ausencia de datos reales.

## 4. Convenciones de nombres

Usar solo nombres sinteticos y neutrales:

- `owner_a`
- `partner_a`
- `owner_b`
- `external_user`
- `admin_actor_conceptual`
- `space_a`
- `space_b`
- `space_empty` opcional
- `item_a_*`
- `item_b_*`
- `synthetic_*`

Reglas:

- sin emails reales;
- sin nombres reales;
- sin project ref real;
- UUIDs solo como placeholders documentales;
- textos neutrales, por ejemplo `Synthetic reason A1`;
- no usar nombres reales del proyecto en fixtures.

## 5. Identidades sinteticas

| Actor | Proposito | Rol | Space | Puede | No puede |
| --- | --- | --- | --- | --- | --- |
| `owner_a` | Actor principal de Space A | `owner` | `space_a` | Leer Space A y operar mediante flujos futuros autorizados | Leer Space B, escribir memberships directos, saltar RLS |
| `partner_a` | Segundo miembro de Space A | `partner` | `space_a` | Leer Space A y operar si la policy/RPC futura lo permite | Cambiar roles, quitar owners, leer Space B |
| `owner_b` | Control de aislamiento cruzado | `owner` | `space_b` | Leer Space B | Leer o modificar Space A |
| `external_user` | Usuario autenticado sin membership | ninguno | ninguno | Solo recibir denegaciones esperadas | Leer, escribir o descubrir datos de Space A/B |
| `admin_actor_conceptual` | Actor conceptual para bootstrap/import futuro | admin controlado | segun flujo | Ejecutar bootstrap/import si existe RPC/admin aprobado | Usarse desde frontend o reemplazar RLS |

No se deben usar emails reales. Si una fase posterior necesita Auth users,
deben ser cuentas sinteticas y desechables.

## 6. Spaces sinteticos

| Space | Proposito | Miembros | Datos asociados | Pruebas positivas | Pruebas negativas |
| --- | --- | --- | --- | --- | --- |
| `space_a` | Space principal de pruebas | `owner_a`, `partner_a` | `item_a_*`, media/eventos A | lectura de miembros, fixtures validos | acceso de `owner_b` y `external_user` |
| `space_b` | Space de aislamiento cruzado | `owner_b` | `item_b_*`, media/eventos B | lectura de `owner_b` | acceso desde `owner_a`/`partner_a` |
| `space_empty` | Caso opcional negativo | ninguno o solo placeholder | ninguno | comprobar bootstrap/reset futuros | no debe usarse para datos privados ni writes libres |

## 7. Contenido sintetico por coleccion

| Coleccion | Ejemplo neutral | Nota |
| --- | --- | --- |
| `reasons` | `Synthetic reason A1` | Generico |
| `promises` | `Synthetic promise A1` | Generico |
| `importantDates` | `Synthetic date A1` | Generico |
| `futureDreams` | `Synthetic dream A1` | Generico |
| `timeline` | `Synthetic timeline A1` | Generico |
| `blackHoleGallery` | `Synthetic gallery item A1` | Puede tener media metadata sintetica |
| `playlist` | `Synthetic playlist item A1` | No usar URLs privadas |
| `monthlyLetters` | `Synthetic monthly letter A1` | Legacy/adaptador futuro si aplica |
| `openWhenLetters` | `Synthetic open when A1` | Legacy/adaptador futuro si aplica |

`monthlyLetters` y `openWhenLetters` no deben recibir autoria inventada. Si se
modelan en remoto, deben pasar por un adaptador o import controlado.

## 8. Casos local / override / hidden

Casos validos:

| Caso | kind | local_id | base_id | Esperado |
| --- | --- | --- | --- | --- |
| Local valido | `local` | presente | null | Pasa schema |
| Override valido | `override` | null | presente | Pasa schema |
| Hidden valido | `hidden` | null | presente | Pasa schema y `is_hidden=true` |

Casos invalidos:

| Caso | Esperado |
| --- | --- |
| Local sin `local_id` | Falla por schema |
| Local con `base_id` | Falla por schema |
| Override sin `base_id` | Falla por schema |
| Override con `local_id` | Falla por schema |
| Hidden sin `base_id` | Falla por schema |
| Hidden con `local_id` | Falla por schema |
| Override apuntando a base de otro space | Debe fallar por RLS o flujo futuro controlado |
| Hidden apuntando a base de otro space | Debe fallar por RLS o flujo futuro controlado |

## 9. Media assets sinteticos

Media debe probar solo metadata, sin archivo real:

- bucket placeholder: `relationship-media-synthetic`;
- path placeholder: `space-a/synthetic-gallery-a1.txt`;
- `content_item_id` debe pertenecer al mismo `space_id`;
- media cross-space debe fallar por schema/FK;
- `storage.objects` sigue fuera de alcance;
- cleanup de Storage queda pendiente para una fase Storage futura.

No usar fotos, videos, Data URL privados ni URLs publicas permanentes.

## 10. Events / audit sinteticos

Eventos conceptuales:

- evento append-only conceptual;
- `action='content_created'` como ejemplo neutral;
- payload minimo y sanitizado;
- update/delete de event debe denegarse;
- event cross-space debe fallar por schema/FK;
- audit no debe depender de escrituras libres del cliente;
- audit confiable queda pendiente de trigger/RPC/admin.

## 11. Matriz futura de pruebas

| ID | Actor | Space | Operacion | Fixture | Esperado | Valida | Fase futura |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | `owner_a` | `space_a` | SELECT | `item_a_reason_1` | Permitido | RLS | S4.6.4 |
| T02 | `partner_a` | `space_a` | SELECT | `item_a_promise_1` | Permitido | RLS | S4.6.4 |
| T03 | `owner_b` | `space_a` | SELECT | `item_a_reason_1` | Denegado | RLS | S4.6.4 |
| T04 | `external_user` | `space_a` | SELECT | `item_a_reason_1` | Denegado | RLS | S4.6.4 |
| T05 | `owner_a` | `space_b` | SELECT | `item_b_reason_1` | Denegado | RLS | S4.6.4 |
| T06 | `owner_a` | `space_a` | INSERT local valido | `item_a_local_1` | Pendiente RPC/grants minimos | RPC futura | S4.6.4+ |
| T07 | `partner_a` | `space_a` | INSERT local valido | `item_a_local_2` | Pendiente policy final/RPC | RPC futura | S4.6.4+ |
| T08 | `external_user` | `space_a` | INSERT local | `item_external_local_1` | Denegado | RLS | S4.6.4 |
| T09 | `owner_a` | `space_a` | INSERT local sin `local_id` | invalid local | Falla | Schema | S4.6.4 |
| T10 | `owner_a` | `space_a` | INSERT override sin `base_id` | invalid override | Falla | Schema | S4.6.4 |
| T11 | `owner_a` | `space_a` | INSERT hidden con `local_id` | invalid hidden | Falla | Schema | S4.6.4 |
| T12 | `owner_a` | cross-space | Media cross-space | media A -> item B | Falla | Schema/FK | S4.6.4 |
| T13 | `owner_a` | cross-space | Event cross-space | event A -> item B | Falla | Schema/FK | S4.6.4 |
| T14 | `owner_a` | `space_a` | DELETE content_items | `item_a_reason_1` | Denegado | RLS | S4.6.4 |
| T15 | `owner_a` | `space_a` | UPDATE columnas sensibles | `space_id/kind` | Denegado o requiere RPC/trigger | RLS/RPC futura | S4.6.4+ |
| T16 | `owner_a` | `space_a` | Direct membership write | member row | Denegado | RLS/RPC futura | S4.6.4+ |
| T17 | `owner_a` | `space_a` | Quitar ultimo owner | owner membership | Denegado en RPC futura | RPC futura | S4.7 |
| T18 | cliente normal | `space_a` | Insert audit libre | event row | No confiable/denegado | Audit futura | S4.6.4+ |
| T19 | operador | todos | Rollback/reset | synthetic fixtures | Limpia fixtures sinteticos | Reset futuro | S4.6.4+ |
| T20 | operador | todos | Storage objects | object metadata | NO-GO hasta policies futuras | Storage futura | S4.9 |

Esta matriz T01-T20 es la referencia de resultados esperados para cualquier
ejecucion futura. Si la matriz y el SQL draft divergen, detener la fase y
actualizar documentacion antes de aplicar cualquier SQL.

## 12. Reset / rollback conceptual

Rollback principal:

- destruir el proyecto Supabase desechable.

Reset SQL futuro:

- existe como `synthetic_reset_draft.sql`, pero sigue siendo un draft
  documental no aplicado;
- solo puede revisarse para ejecucion futura con aprobacion explicita;
- debe limpiar en orden conceptual:
  1. `content_events`;
  2. `media_assets`;
  3. `content_items`;
  4. `universe_members`;
  5. `relationship_spaces`;
  6. `profiles` sinteticos;
  7. Storage si se prueba despues.

Reglas:

- nunca contra un entorno no desechable;
- confirmar project ref dos veces antes de cualquier SQL futuro;
- no automatizar reset contra un proyecto desconocido;
- no conservar tokens, screenshots o credenciales en Git.
- no tratar el draft como rollback garantizado.

## 13. Seguridad

- No datos reales.
- No emails reales.
- No service-role en frontend.
- No service-role en Git.
- No tokens en docs.
- No capturas con keys completas.
- No project ref real.
- Fixtures demasiado realistas son riesgo.
- Contenido romantico real queda prohibido.

## 14. Fases siguientes

- **S4.6.2.5:** evaluar fixture SQL draft no aplicado.
- **S4.6.2.5.1:** crear `synthetic_fixture_plan.sql` como draft documental no
  aplicado, con plantillas comentadas y sin reset.
- **S4.6.2.6.1:** crear `synthetic_reset_draft.sql` como draft documental no
  aplicado, separado del fixture y sin rollback garantizado.
- **S4.6.3.2.2:** registrar aplicacion manual de schema en laboratorio
  desechable, sin fixtures/reset y sin app conectada.
- **S4.6.3.3.2:** registrar aplicacion manual de RLS en laboratorio
  desechable, sin verificar usuarios/memberships y sin app conectada.
- **S4.6.4.1:** documentacion/preflight de fixtures sinteticos controlados.
- **S4.6.4.3:** crear `synthetic_fixture_apply_draft.sql` como draft separado
  futuro, no aplicado, sin reset y sin usuarios creados por el archivo.
- **S4.6.4.4:** crear `SYNTHETIC_AUTH_USERS_PLAN.md` como preflight documental
  de usuarios Auth sinteticos, sin crear usuarios ni guardar UUIDs reales.
- **S4.6.4.6:** crear `SYNTHETIC_AUTH_USERS_MANUAL_GUIDE.md` como guia manual
  segura para crear Auth users sinteticos en el laboratorio desechable.
- **S4.6.4.7:** registrar resultado post-Auth-users en
  `../../SUPABASE_POST_AUTH_USERS_LAB_RESULT.md`, sin valores sensibles y sin
  probar RLS end-to-end.
- **S4.6.4.8:** crear `SYNTHETIC_FIXTURE_MAPPING_PREFLIGHT.md` como preflight
  documental de mapping privado, sin UUIDs reales y sin aplicar fixtures.
- **S4.6.4.9:** crear `SYNTHETIC_FIXTURE_APPLY_DRY_REVIEW.md` como dry-review
  documental de fixture apply SQL antes de cualquier aplicacion.
- **S4.6.4.10:** crear `SYNTHETIC_FIXTURE_APPLY_MANUAL_PREFLIGHT.md` como
  preflight manual documental, todavia sin ejecutar SQL.
- **S4.6.4.11:** auditoria final de docs antes de cualquier fixture apply.
- **S4.6.4.12:** auditoria de candidatos apply/reset; ambos seguian
  documentales antes de S4.6.4.13.
- **S4.6.4.13:** convertir `synthetic_fixture_apply_draft.sql` y
  `synthetic_reset_draft.sql` en plantillas SQL candidatas con placeholders
  fail-fast. No se ejecuta SQL, no se aplican fixtures y no se ejecuta reset.
- **S4.6.4.15:** registrar resultado sanitizado de fixture apply manual exitoso
  en `../../SUPABASE_POST_FIXTURE_APPLY_LAB_RESULT.md`. SQL Editor privilegiado
  no prueba RLS end-to-end.
- **S4.6.4.16:** crear `SYNTHETIC_FIXTURE_VERIFICATION_PLAN.md` como plan
  documental de verificacion post-fixture. No ejecuta SQL ni prueba RLS.
- **S4.6.4.17:** crear `synthetic_fixture_verification_queries_draft.sql` como
  draft SQL read-only de verificacion. No ejecuta SQL ni prueba RLS.
- **S4.6.4.18:** registrar resultado sanitizado de verificacion read-only
  manual del fixture en `../../SUPABASE_POST_FIXTURE_VERIFICATION_LAB_RESULT.md`.
  Solo SELECT queries, sin reset, Storage, app connection ni RLS end-to-end.
- **S4.6.4.19:** crear `../RLS_END_TO_END_TEST_PLAN.md` como plan documental de
  una futura prueba RLS end-to-end. No ejecuta pruebas ni conecta la app.
- **S4.6.4.20:** crear `../RLS_TEST_METHOD_DECISION.md` como decision de metodo
  seguro para prueba RLS. Recomienda script temporal local fuera del repo;
  todavia sin ejecutar pruebas ni compartir tokens/JWTs en Git/chat.
- **S4.6.4.21:** preparar instrucciones para script temporal local privado
  fuera del repo; todavia sin ejecutar pruebas RLS.
- **S4.6.4.22:** registrar creacion de carpeta y archivos privados RLS fuera
  del repo; script no ejecutado.
- **S4.6.4.23:** registrar revision read-only del script privado RLS; RLS
  end-to-end no probada.
- **S4.6.4.26:** preparar configuracion privada RLS; todavia sin ejecutar RLS
  ni compartir secretos en Git/chat.
- **S4.6.4.33:** registrar resultado sanitizado PASS del private RLS E2E
  security gate en `../RLS_E2E_SECURITY_GATE_RESULT.md`, sin conectar la app ni
  declarar backend/produccion listos.
- **S4.6.4.x futura:** aplicacion manual de fixtures solo con GO explicito y
  matriz T01-T20 revisada.
- **S4.7:** bootstrap owner/partner controlado.
- **S4.8:** piloto read-only con fixtures sinteticos.
- **S4.9:** escritura/migracion solo despues de RLS, rollback y conflictos.

## 15. Criterios go/no-go antes de usar cualquier SQL fixture

- [ ] README conceptual completo.
- [ ] `synthetic_fixture_plan.sql` revisado como draft documental.
- [ ] `synthetic_fixture_apply_draft.sql` revisado como plantilla candidata
  bloqueada por placeholders fail-fast.
- [ ] `SYNTHETIC_AUTH_USERS_PLAN.md` revisado antes de crear usuarios Auth
  sinteticos en cualquier fase futura.
- [ ] `synthetic_reset_draft.sql` revisado como plantilla candidata bloqueada
  por placeholders fail-fast antes de cualquier cleanup futuro.
- [ ] Nombres sinteticos definidos.
- [ ] Matriz minima definida.
- [ ] No hay datos reales.
- [ ] No hay project ref real.
- [ ] Rollback conceptual definido.
- [ ] Schema/RLS aplicados manualmente en laboratorio desechable confirmado.
- [ ] Comportamiento RLS con usuarios/memberships sigue marcado como pendiente.
- [ ] Auth users sinteticos fueron creados manualmente en laboratorio
  desechable, pero sus UUIDs no deben versionarse.
- [ ] Mapping privado preflight documentado; cualquier mapping real debe vivir
  fuera del repo y revisarse antes de una fase futura aprobada.
- [ ] Dry-review de fixture apply documentada; fixture apply sigue bloqueado
  hasta fase manual explicita.
- [ ] Preflight manual de fixture apply documentado; fixture apply sigue
  bloqueado hasta aprobacion futura explicita.
- [ ] Plantillas candidatas S4.6.4.13 revisadas; cualquier copia con UUIDs reales
  debe permanecer privada y fuera de Git.
- [ ] Resultado S4.6.4.15 revisado; fixture apply manual esta documentado, pero
  en esa fase RLS end-to-end, membership tests, reset, Storage y app seguian
  pendientes.
- [ ] Plan S4.6.4.16 revisado; futuras query drafts deben seguir sin ejecutar
  SQL hasta aprobacion explicita.
- [ ] Draft S4.6.4.17 revisado y resultado S4.6.4.18 documentado; en esa fase
  RLS end-to-end, Auth/RLS tests reales, reset, Storage y app seguian
  pendientes.
- [ ] Plan S4.6.4.19 revisado; S4.6.4.33 ya registra private RLS E2E security
  gate PASS, pero backend readiness y app connection siguen pendientes.
- [ ] Decision S4.6.4.20 revisada; S4.6.4.33 ya registra private RLS E2E
  security gate PASS, pero backend readiness y app connection siguen
  pendientes.
- [ ] Si una fase futura repite o amplia pruebas RLS, memberships y mapping
  privado deben revisarse antes y sus UUIDs no deben versionarse.
- [ ] Storage sigue fuera de alcance.
- [ ] Reset sigue separado y no aplicado.
- [ ] La app sigue desconectada.
- [ ] Verificador limpio.
- [ ] Build limpio.
- [ ] Audit limpio.

## 16. No objetivos

- No SQL ejecutable.
- No ejecutar ni aplicar SQL.
- No crear usuarios reales.
- No crear proyecto Supabase.
- No conectar app.
- No probar Storage real.
- No migrar datos reales.
- No usar nombres reales del proyecto en fixtures.
- No usar Ale/Yori/Diego en fixtures.
- No usar un entorno no desechable.

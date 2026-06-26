# Supabase Synthetic Fixtures Plan

## 1. Resumen

Este documento define un plan conceptual de fixtures sinteticos para una
validacion futura de schema/RLS en un entorno Supabase aislado y desechable.

Este README:

- no contiene SQL ejecutable;
- no ejecuta ni aplica SQL;
- no crea usuarios reales;
- no usa datos privados reales;
- no prueba Supabase real todavia;
- no conecta la app ni el CRUD;
- no crea proyecto Supabase;
- no define tokens, keys, emails reales ni service-role.

Todo contenido real de Distancia Cero debe tratarse como privado. Los ejemplos
de este documento son neutrales y sinteticos.

El archivo `synthetic_fixture_plan.sql` complementa este README como draft SQL
documental no aplicado. Sus plantillas estan comentadas por defecto y no son
migrations ni fixtures ejecutados.

## 2. Estado actual

- [x] Schema draft refinado en S4.6.2.1, no ejecutado.
- [x] RLS draft refinado en S4.6.2.2, no ejecutado ni probado en backend real.
- [x] Factory Supabase aislado existe.
- [x] Verificador manual pasa con cero fetch.
- [x] CRUD local/sync sigue activo.
- [x] Remote repository skeleton sigue fail-fast.
- [x] LocalStorage sigue activo y funciona como fallback.
- [x] Router sigue inactivo.
- [x] Existe `synthetic_fixture_plan.sql` como draft documental no aplicado y
  sin operaciones ejecutables por defecto.
- [x] No existe reset SQL.
- [x] No existe entorno Supabase aplicado para estas pruebas.

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

## 12. Reset / rollback conceptual

Rollback principal:

- destruir el proyecto Supabase desechable.

Reset SQL futuro:

- solo cuando exista un plan separado, revisado y no automatico;
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
- **Fase separada futura:** reset draft no aplicado.
- **S4.6.3:** aplicacion manual de schema/RLS en proyecto desechable solo si
  todos los gates pasan.
- **S4.6.4:** pruebas manuales multiusuario.
- **S4.7:** bootstrap owner/partner controlado.
- **S4.8:** piloto read-only con fixtures sinteticos.
- **S4.9:** escritura/migracion solo despues de RLS, rollback y conflictos.

## 15. Criterios go/no-go antes de convertir o ejecutar cualquier SQL fixture

- [ ] README conceptual completo.
- [ ] `synthetic_fixture_plan.sql` revisado como draft documental.
- [ ] Nombres sinteticos definidos.
- [ ] Matriz minima definida.
- [ ] No hay datos reales.
- [ ] No hay project ref real.
- [ ] Rollback conceptual definido.
- [ ] Schema/RLS drafts siguen no ejecutados.
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

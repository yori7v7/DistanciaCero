# Synthetic Auth Users Plan

## 1. Resumen

BORRADOR DOCUMENTAL.

Este documento define el preflight S4.6.4.4 para usuarios Auth sinteticos en
un laboratorio Supabase desechable. No crea usuarios, no aplica fixtures, no
ejecuta SQL y no conecta la app. Solo prepara una estrategia manual futura para
validar RLS con usuarios autenticados controlados.

Estado actual:

- NO crear usuarios todavia.
- NO aplicado.
- Requiere GO manual futuro.
- Requiere laboratorio Supabase desechable.
- Rollback principal: destruir el laboratorio Supabase desechable.

## 2. No objetivos

- No usar Supabase CLI.
- No usar service-role.
- No guardar passwords en Git.
- No guardar UUIDs reales en Git.
- No guardar project ref, tokens, keys, anon key ni URLs sensibles.
- No usar emails reales.
- No usar nombres reales.
- No usar datos de Ale/Yori/Diego/Alecita.
- No tocar Storage.
- No meter media real.
- No conectar app ni CRUD.
- No aplicar fixtures.
- No ejecutar reset.
- No probar RLS end-to-end en esta fase.

## 3. Contexto requerido

Una fase futura podria crear usuarios Auth sinteticos manualmente desde el
Supabase Auth dashboard, solo dentro de un laboratorio desechable y solo con GO
manual explicito.

SQL Editor privilegiado puede servir para setup controlado, pero no prueba RLS
real de usuario autenticado. La prueba real de RLS requiere cliente/API
autenticado futuro o metodo seguro aprobado.

## 4. Usuarios conceptuales

| Usuario conceptual | Proposito | Space esperado | Resultado esperado |
| --- | --- | --- | --- |
| `owner_a` | Miembro owner de `space_a` | `space_a` | Puede leer contenido de `space_a` |
| `partner_a` | Miembro partner/viewer/editor futuro de `space_a` segun policy | `space_a` | Puede leer contenido de `space_a` si la policy lo permite |
| `owner_b` | Owner de `space_b` | `space_b` | Sirve para pruebas cross-space |
| `external_user` | Usuario autenticado sin membership | ninguno | Debe fallar al leer contenido privado |

Estos nombres son identificadores sinteticos documentales. No deben representar
personas reales ni datos romanticos reales.

## 5. Emails placeholder

Ejemplos documentales seguros:

- `owner-a@example.invalid`
- `partner-a@example.invalid`
- `owner-b@example.invalid`
- `external-user@example.invalid`

`example.invalid` es placeholder documental. Si el dashboard de Supabase exige
emails validos para crear cuentas en una fase futura, se debe definir otra
alternativa segura, temporal y controlada en una fase separada. No decidir ni
crear esas cuentas ahora.

No guardar passwords en documentos, Git, chat, logs ni screenshots.

## 6. Mapping de placeholders

Los usuarios Auth sinteticos futuros producirian UUIDs reales solo dentro del
laboratorio desechable. Esos valores deben guardarse fuera de Git, en una nota
local temporal aprobada, y destruirse junto con el laboratorio.

Placeholders documentales:

- `<owner_a_auth_uuid>`
- `<partner_a_auth_uuid>`
- `<owner_b_auth_uuid>`
- `<external_user_auth_uuid>`

Uso futuro esperado:

- `profiles.id`
- `universe_members.user_id`
- `docs/supabase/fixtures/synthetic_fixture_apply_draft.sql`

Reglas:

- No commitear UUIDs reales.
- No pegar UUIDs reales en issues, docs, chat o capturas.
- No confundir estos UUIDs con `local-yori`, `local-ale` ni ningun ID local.
- No inferir autoria para datos existentes.

## 7. Relacion con fixture apply draft

`synthetic_fixture_apply_draft.sql` depende de estos usuarios solo como
precondicion futura. Ese draft:

- NO debe insertar en `auth.users`.
- NO debe crear usuarios.
- Debe usar placeholders de UUID.
- No prueba RLS end-to-end por si solo.
- Requiere cliente/API autenticado futuro o metodo seguro aprobado para probar
  acceso normal.

Si este plan y el fixture apply draft divergen, detener la fase y actualizar
documentacion antes de aplicar cualquier cosa.

## 8. Evidencia futura esperada

Despues de crear usuarios en una fase futura, la persona operadora debera
reportar solo checks sanitizados:

- Usuarios creados: si/no.
- Proyecto desechable: si/no.
- No produccion: si/no.
- No datos reales: si/no.
- No emails reales/personales: si/no.
- No service-role: si/no.
- No API keys abiertas/copied: si/no.
- No Storage tocado: si/no.
- No app conectada: si/no.
- UUIDs mapeados fuera de Git: si/no.
- Capturas sin tokens/project ref: si/no.

No se deben adjuntar passwords, UUIDs reales, project refs, tokens, keys, URL
real del proyecto ni capturas con valores sensibles.

## 9. Criterios GO futuros

Una fase futura solo puede avanzar si todo esto es verdadero:

- Hay GO humano explicito para crear usuarios Auth sinteticos.
- El laboratorio desechable esta confirmado.
- No es produccion.
- Schema y RLS de laboratorio estan en el estado esperado.
- `node scripts/verify-supabase-isolation.mjs` pasa.
- Build pasa.
- Audit pasa.
- `synthetic_fixture_apply_draft.sql` sigue como draft revisado.
- No se usaran datos reales ni emails personales.
- Existe plan de rollback: destruir el laboratorio.
- Se sabe donde guardar UUIDs fuera de Git de forma temporal.

## 10. Criterios NO-GO

Detenerse si aparece cualquiera de estos casos:

- Proyecto no desechable.
- Produccion o entorno ambiguo.
- Email real o personal.
- Nombre real.
- Token/key/service-role visible.
- Project ref expuesto.
- Password en Git, chat, log o captura.
- Storage tocado.
- App conectada.
- Usuarios creados antes de GO.
- UUIDs reales en repo.
- Datos privados.
- Dudas del entorno.

## 11. Checklist final de esta fase

- [x] Plan documental creado.
- [x] No usuarios creados.
- [x] No fixtures aplicados.
- [x] No reset aplicado.
- [x] No Storage tocado.
- [x] No app conectada.
- [x] No SQL ejecutado.
- [x] No Supabase CLI.
- [x] No secrets ni datos reales.

Este documento no autoriza ejecucion. Solo reduce ambiguedad para una fase
futura con GO separado.

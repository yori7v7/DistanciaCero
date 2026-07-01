# S4.6.4.19 RLS End-to-End Test Plan

## Estado

- Status: PLANNING ONLY
- Scope: disposable Supabase lab only
- Runtime impact: none
- App connection: none
- Storage: untouched
- Reset: not applied
- Fixture apply: manually applied in lab
- Read-only verification: passed
- RLS end-to-end: not tested yet
- Production readiness: no

## Proposito

Esta fase solo planea una futura prueba RLS end-to-end con usuarios Auth
sinteticos del laboratorio Supabase desechable. No ejecuta pruebas, no obtiene
tokens, no conecta cliente y no modifica runtime.

## Estado previo

- Schema draft aplicado manualmente.
- RLS draft aplicado manualmente.
- 4 Auth users sinteticos creados manualmente.
- Fixture sintetico aplicado manualmente.
- Verificacion read-only del fixture paso.
- external_user existe y no tiene membership.
- Reset no aplicado.
- Storage no tocado.
- App no conectada.
- RLS end-to-end no probado todavia.

## Usuarios conceptuales para pruebas futuras

- owner_a
- partner_a
- owner_b
- external_user

No incluir UUIDs reales, emails reales, passwords ni tokens.

## Estrategia futura propuesta

Planear una fase posterior donde se pruebe acceso como usuarios autenticados
sinteticos sin service-role.

Debe cubrir:

- owner_a puede ver/modificar datos de space A segun RLS esperada.
- partner_a puede ver datos de space A segun RLS esperada.
- owner_b puede ver datos de space B pero no space A.
- external_user no debe ver datos de spaces donde no tiene membership.
- SQL Editor privilegiado no cuenta como prueba RLS.
- Cualquier prueba debe evitar service-role.
- Cualquier token/JWT debe mantenerse fuera de Git/chat.

## Opciones seguras futuras para ejecutar pruebas

Estas opciones quedan documentadas sin implementarse todavia:

- Manual Supabase Dashboard/API docs solo si no expone tokens en chat/Git.
- Script local temporal fuera del repo, si una fase futura lo autoriza.
- Test harness local dentro del repo solo en fase futura, sin secrets committed y
  con .env.local fuera de Git.
- No usar service-role en cliente ni en test de RLS de usuario normal.

S4.6.4.20 documenta la decision de metodo en
`RLS_TEST_METHOD_DECISION.md`: el candidato recomendado para una fase futura es
un script temporal local fuera del repo, con valores sensibles manejados
privadamente.

## Datos/secretos prohibidos

- No UUIDs reales en Git/chat.
- No project ref real en Git/chat.
- No passwords.
- No JWTs.
- No access tokens.
- No refresh tokens.
- No service-role.
- No screenshots sensibles.
- No emails personales reales.

## Stop conditions

- Proyecto equivocado.
- Produccion real.
- Datos reales.
- Usuarios reales.
- Tokens/JWTs/keys/passwords/service-role en Git/chat.
- App connection accidental.
- Storage tocado.
- Reset ejecutado sin aprobacion.
- Prueba RLS asumida usando SQL Editor privilegiado.
- Duda sobre mapping o usuario autenticado.

## Resultado esperado de una fase futura

Plantilla sanitizada de resultado:

- owner_a space A access: PASS/CHECK
- partner_a space A access: PASS/CHECK
- owner_b space B access: PASS/CHECK
- owner_b denied from space A: PASS/CHECK
- external_user denied from member-only data: PASS/CHECK
- service-role used: no
- tokens shared: no
- app connected: no

## Next recommended phase

S4.6.4.21 - RLS private script prep

Clarifications:

- S4.6.4.20 ya decide el metodo seguro de prueba sin ejecutarla.
- La siguiente fase puede preparar instrucciones para un script temporal local
  fuera del repo.
- Todavia no debe ejecutar pruebas.
- Todavia no debe conectar la app.
- Todavia no debe usar tokens/JWTs en Git/chat.

# S4.6.4.20 RLS Test Method Decision

## Estado

- Status: METHOD DECISION ONLY
- Scope: disposable Supabase lab only
- Runtime impact: none
- App connection: none
- Storage: untouched
- Reset: not applied
- Fixture apply: manually applied in lab
- Read-only verification: passed
- RLS end-to-end: private security gate PASS recorded in S4.6.4.33
- Production readiness: no

## Proposito

Esta fase decide el metodo seguro para una futura prueba RLS end-to-end con
usuarios Auth sinteticos del laboratorio Supabase desechable, sin ejecutar la
prueba todavia.

## Estado previo

- Schema draft aplicado manualmente.
- RLS draft aplicado manualmente.
- 4 Auth users sinteticos creados manualmente.
- Fixture sintetico aplicado manualmente.
- Verificacion read-only del fixture paso.
- Plan RLS end-to-end documentado.
- Reset no aplicado.
- Storage no tocado.
- App no conectada.
- En esta fase de decision de metodo, RLS end-to-end aun no se habia probado.

## Resultado posterior S4.6.4.33

`RLS_E2E_SECURITY_GATE_RESULT.md` registra que el metodo privado fuera del repo
se ejecuto en el laboratorio desechable y produjo un security gate PASS
sanitizado:

- owner_a space A read: PASS
- partner_a space A read: PASS
- owner_b space B read: PASS
- owner_b denied from space A: PASS
- external_user denied from member-only data: PASS
- anon/no-session blocked by database privileges before RLS: CHECK
- script exit code: 0

El resultado anon/no-session no abre permisos anon ni declara una policy anon
como probada. Solo confirma que el request anon bien formado quedo bloqueado
por privilegios de base de datos antes de acceder a datos protegidos.

## Opciones evaluadas

### A. SQL Editor privilegiado

- Pros: simple.
- Contras: no prueba RLS real porque SQL Editor usa contexto privilegiado.
- Decision: NO usar como prueba RLS end-to-end.

### B. Supabase CLI

- Pros: automatizable.
- Contras: fuera de alcance actual, puede requerir project ref/config local.
- Decision: NO usar en esta fase.

### C. Conectar la app real temporalmente

- Pros: parecido a uso final.
- Contras: toca runtime, .env.local y riesgo de mezclar app/CRUD antes de
  tiempo.
- Decision: NO usar todavia.

### D. Script temporal local fuera del repo

- Pros: permite usar anon/publishable key y Auth sintetico sin guardar secretos
  en Git; no toca runtime; no conecta la app; puede simular usuarios reales.
- Contras: requiere manejo privado de URL/key/passwords/JWTs fuera del repo.
- Decision recomendada: candidato mas seguro para fase futura, siempre que se
  cree fuera del repo y no se compartan secretos.

### E. Test harness versionado dentro del repo

- Pros: reproducible.
- Contras: riesgo de secretos, requiere diseno mas cuidadoso, puede adelantar
  runtime/test infra.
- Decision: posponer.

## Decision recomendada

Para una fase futura:

- Usar script temporal local fuera del repo.
- No versionar el script si contiene cualquier valor sensible.
- No usar service-role.
- Usar solo anon/publishable key del lab, manejada privadamente.
- Usar credenciales temporales de usuarios sinteticos, manejadas privadamente.
- No pegar tokens/JWTs/passwords en chat ni Git.
- Reportar solo PASS/CHECK sanitizado.
- Mantener app desconectada.

S4.6.4.21 documenta la preparacion en `RLS_PRIVATE_SCRIPT_PREP.md`, sin crear
el script privado real y sin ejecutar pruebas.

S4.6.4.22 documenta en `RLS_PRIVATE_SCRIPT_CREATION_RESULT.md` que la carpeta y
archivos privados fueron creados fuera del repo, sin ejecutar el script.

S4.6.4.23 documenta en `RLS_PRIVATE_SCRIPT_REVIEW_RESULT.md` que el script
privado fue revisado en read-only mode, sin ejecutarlo y sin probar RLS
end-to-end.

## Pruebas futuras esperadas

Solo planear, no ejecutar:

- owner_a puede leer datos de space A.
- partner_a puede leer datos de space A.
- owner_b puede leer datos de space B.
- owner_b no puede leer datos privados de space A.
- external_user no puede leer datos member-only.
- external_user no puede escribir datos member-only.
- anon/no session no puede leer datos protegidos.
- service-role used: no.
- tokens shared: no.
- app connected: no.

## Secret handling para fase futura

- No UUIDs reales en Git/chat.
- No project ref real en Git/chat.
- No passwords en Git/chat.
- No JWTs en Git/chat.
- No access tokens.
- No refresh tokens.
- No service-role.
- No screenshots sensibles.
- No emails personales reales.
- Si se usa un archivo temporal con valores privados, debe vivir fuera del repo.

## Stop conditions

- Proyecto equivocado.
- Produccion real.
- Datos reales.
- Usuarios reales.
- Se necesita service-role.
- Tokens/JWTs/passwords/keys aparecen en Git/chat.
- App connection accidental.
- .env.local tocado.
- Storage tocado.
- Reset ejecutado sin aprobacion.
- Duda sobre credenciales de usuarios sinteticos.

## Resultado esperado de una fase futura

S4.6.4.21 RLS METHOD PREP RESULT

Method:

- Temporary local script outside repo: yes/no
- Service-role used: no
- App connected: no
- Runtime touched: no
- .env.local touched: no
- Tokens/JWTs/passwords shared: no

Planned checks:

- owner_a space A read: planned
- partner_a space A read: planned
- owner_b space B read: planned
- owner_b denied from space A: planned
- external_user denied from member-only data: planned
- anon/no-session denied from protected data: planned

Verdict:

- READY FOR RLS PRIVATE SCRIPT PREP / NO-GO

## Next recommended phase

Historical next phase completed/superseded:

- Backend readiness gaps are now documented in `BACKEND_READINESS_GAP.md`.
- S4.6.4.33 recorded the private RLS E2E security gate PASS.

Current next phase:

- If S4.6.4.44 docs consistency repair is clean, proceed to
  snapshot/dry-run script design as docs-only work.
- Still no executable script, real snapshot, real LocalStorage read, real
  dry-run, real insert, runtime change, app connection or sensitive values in
  Git/chat.

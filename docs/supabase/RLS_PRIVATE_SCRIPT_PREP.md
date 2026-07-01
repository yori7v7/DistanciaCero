# S4.6.4.21 RLS Private Script Prep

## Estado

- Status: PRIVATE SCRIPT PREP ONLY
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

Esta fase prepara instrucciones y criterios para un script temporal local fuera
del repo que podria probar RLS en una fase futura. No crea el script privado
real y no ejecuta pruebas.

## Estado previo

- Schema draft aplicado manualmente.
- RLS draft aplicado manualmente.
- 4 Auth users sinteticos creados manualmente.
- Fixture sintetico aplicado manualmente.
- Verificacion read-only del fixture paso.
- Plan RLS end-to-end documentado.
- Metodo recomendado documentado: script temporal local fuera del repo.
- Reset no aplicado.
- Storage no tocado.
- App no conectada.
- RLS end-to-end no probado todavia.

## Carpeta privada futura recomendada

Si se autoriza una fase futura, cualquier script temporal debe vivir fuera del
repo, por ejemplo:

- Desktop/distancia-cero-private-rls-lab

No crear esa carpeta en esta fase.

## Valores privados futuros requeridos

Listar solo nombres conceptuales, sin pedir valores:

- Supabase lab URL
- Supabase lab anon/publishable key
- Synthetic user credentials for owner_a
- Synthetic user credentials for partner_a
- Synthetic user credentials for owner_b
- Synthetic user credentials for external_user

Clarifications:

- No service-role.
- No project ref en Git/chat.
- No passwords en Git/chat.
- No tokens/JWTs en Git/chat.
- No screenshots sensibles.
- No emails personales reales.

## Script privado futuro, comportamiento planeado

El script futuro deberia:

- Crear un client anon normal.
- Sign in como cada usuario sintetico.
- Ejecutar queries desde contexto autenticado del usuario.
- Confirmar que owner_a puede leer datos de space A.
- Confirmar que partner_a puede leer datos de space A.
- Confirmar que owner_b puede leer datos de space B.
- Confirmar que owner_b no puede leer datos privados de space A.
- Confirmar que external_user no puede leer datos member-only.
- Confirmar que anon/no-session no puede leer datos protegidos.
- No imprimir tokens.
- No imprimir UUIDs.
- No imprimir project ref.
- Reportar solo PASS/CHECK sanitizado.

## Anti-goals

- No versionar script con secretos.
- No usar service-role.
- No conectar la app real.
- No tocar runtime.
- No tocar .env.local del repo.
- No usar Supabase CLI.
- No tocar Storage.
- No ejecutar reset.
- No probar produccion.

## Stop conditions

- Proyecto equivocado.
- Produccion real.
- Datos reales.
- Usuarios reales.
- Service-role requerida.
- Tokens/JWTs/passwords/keys aparecen en Git/chat.
- App connection accidental.
- .env.local tocado.
- Storage tocado.
- Reset ejecutado sin aprobacion.
- Duda sobre credenciales sinteticas.

## Resultado esperado de una fase futura

S4.6.4.22 RLS PRIVATE SCRIPT PREP RESULT

Private workspace:

- Outside repo: yes/no
- Script created outside repo: yes/no
- Service-role used: no
- App connected: no
- Runtime touched: no
- .env.local touched: no
- Tokens/JWTs/passwords shared: no

Prepared checks:

- owner_a space A read: prepared
- partner_a space A read: prepared
- owner_b space B read: prepared
- owner_b denied from space A: prepared
- external_user denied from member-only data: prepared
- anon/no-session denied from protected data: prepared

Verdict:

- READY FOR PRIVATE RLS SCRIPT CREATION / NO-GO

S4.6.4.22 documenta el resultado real en
`RLS_PRIVATE_SCRIPT_CREATION_RESULT.md`: la carpeta y archivos privados fueron
creados fuera del repo, sin ejecutar el script.

S4.6.4.23 documenta la revision en `RLS_PRIVATE_SCRIPT_REVIEW_RESULT.md`: el
script privado fue revisado en read-only mode, sin ejecutarlo y sin probar RLS
end-to-end.

## Next recommended phase

S4.6.4.26 - RLS private config prep

Clarifications:

- S4.6.4.22 ya creo el script temporal fuera del repo.
- S4.6.4.23 ya reviso el script privado sin ejecutarlo.
- La siguiente fase puede preparar configuracion privada, sin ejecutar RLS.
- Todavia requiere aprobacion explicita.
- Debe mantener secrets fuera de Git/chat.
- Puede preparar configuracion, pero no debe ejecutar las pruebas.
- No debe conectar la app real.

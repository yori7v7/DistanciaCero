# Supabase Post-Schema Lab Result

## 1. Resumen

S4.6.3.2.2 registra evidencia humana sanitizada de una aplicacion manual de
`docs/supabase/schema_draft.sql` en un laboratorio Supabase desechable.

Este registro no contiene project ref, URLs reales, tokens, keys, anon key,
passwords ni service-role. Tampoco cambia runtime, no conecta el CRUD y no
modifica archivos SQL.

## 2. Evidencia recibida

- Proyecto Supabase creado o seleccionado manualmente por el usuario.
- Laboratorio confirmado como desechable y destruible.
- No es el entorno real de Distancia Cero.
- No contiene datos reales.
- No contiene usuarios reales.
- No contiene media real.
- No esta conectado a la app.
- Se ejecuto manualmente solo `docs/supabase/schema_draft.sql`.
- El primer intento tuvo una incidencia de conexion/dashboard.
- El segundo intento termino con `Success. No rows returned`.
- `docs/supabase/rls_draft.sql` no fue aplicado.
- Fixtures y reset no fueron aplicados.
- Storage no fue tocado.
- No se compartieron secrets ni project ref real.

Si Supabase muestra una etiqueta visual tipo `production` en la rama principal
del dashboard, este documento no la interpreta como entorno real de Distancia
Cero. El alcance confirmado sigue siendo laboratorio desechable.

## 3. Tablas visibles reportadas

La evidencia humana reporto estas tablas con `0 rows`:

- `content_events`
- `content_items`
- `media_assets`
- `profiles`
- `relationship_spaces`
- `universe_members`

Los `0 rows` son el estado esperado para esta subfase porque el schema draft no
incluye carga de contenido, usuarios, fixtures, media ni migracion de datos.

## 4. Alcance limitado

Esta subfase solo registra que el schema draft fue ejecutado manualmente en el
laboratorio desechable.

No demuestra:

- funcionamiento completo de Supabase;
- funcionamiento de backend remoto;
- policies RLS;
- Auth real;
- Storage;
- Realtime;
- fixtures;
- reset;
- migracion de datos;
- conexion del CRUD de la app.

La app local sigue siendo el runtime activo y el fallback estable.

## 5. Incidencia no bloqueante

El primer intento con error de conexion/dashboard queda registrado como
incidencia operativa. No bloquea esta subfase porque hubo un intento posterior
con resultado exitoso y se reportaron las seis tablas esperadas.

## 6. Siguiente fase segura

La siguiente fase segura es:

- **S4.6.3.3.0:** diseno/preflight de RLS.

Esa fase debe seguir sin conectar el CRUD, sin aplicar fixtures/reset y sin
tocar Storage. Cualquier aplicacion de RLS requiere aprobacion separada,
evidencia sanitizada y un nuevo veredicto go/no-go.

Nota posterior: S4.6.3.3.2 quedo registrada en
`docs/SUPABASE_POST_RLS_LAB_RESULT.md` como evidencia humana sanitizada de
aplicacion manual solo del RLS draft en laboratorio desechable. Ese registro
mantiene alcance limitado y no cambia el alcance historico de este documento.

## 7. Anti-obsolescencia

Este resultado no debe convertirse en una afirmacion amplia de preparacion
remota. Las futuras notas deben decir que el schema draft fue aplicado en
laboratorio desechable con alcance limitado.

No debe usarse como senal de que el entorno remoto, RLS, Auth, Storage,
fixtures, reset o la conexion de la app estan listos.

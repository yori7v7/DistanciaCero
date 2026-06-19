# Supabase Local Remote Mapping

> ESTADO: CONTRATO DOCUMENTAL FUTURO. No instala Supabase, no ejecuta SQL,
> no migra datos y no modifica el runtime local de Distancia Cero.

## 1. Resumen

Este documento define el mapping conceptual y operativo para una futura
migracion manual desde el almacenamiento local de Distancia Cero hacia
Supabase Auth, Postgres y Storage.

Su objetivo es separar con claridad:

- los identificadores locales de los UUID remotos;
- la autoria historica de la identidad que ejecuta una importacion;
- el contenido editable de los estados de progreso o desarrollo;
- los datos JSON de dominio de las columnas remotas de ownership;
- las imagenes embebidas como Data URL de los objetos privados en Storage.

Este contrato no implementa Supabase, no ejecuta los drafts SQL, no sincroniza
datos y no cambia el fallback local. La app sigue usando LocalStorage y
export/import v2 como respaldo offline.

## 2. No objetivos

Esta fase no pretende:

- instalar el cliente de Supabase;
- cambiar el runtime, componentes o repositories actuales;
- cambiar LocalStorage ni sus keys;
- modificar el formato de export/import v2;
- inventar autoria retroactiva para contenido sin metadata;
- definir sincronizacion bidireccional o Realtime;
- resolver todavia conflictos concurrentes Ale/Yori;
- activar React Router o proteger rutas;
- aplicar SQL, RLS, buckets o migraciones reales;
- modificar los JSON base de la aplicacion.

## 3. Identidades locales y equivalentes remotos

Los IDs locales son referencias de compatibilidad. No son UUIDs de Supabase y
no se deben escribir directamente en foreign keys remotas.

| Referencia local | Significado actual | Destino remoto | Regla |
| --- | --- | --- | --- |
| `local-yori` | Yori / Diego | `auth.users.id` y `profiles.id` reales | Requiere UUID verificado |
| `local-ale` | Ale / Alecita | `auth.users.id` y `profiles.id` reales | Requiere UUID verificado |
| `distancia-cero-local-space` | Universo local Distancia Cero | `relationship_spaces.id` real | Requiere UUID creado y verificado |

Los UUID reales se completaran durante un bootstrap o una migracion controlada.
El proceso debe producir un registro revisable del mapping antes de importar
contenido.

Reglas:

- `profiles.id` debe corresponder al mismo UUID que `auth.users.id`.
- No resolver usuarios por `displayName`; puede cambiar o repetirse.
- `local_slug` puede ayudar a migrar, pero no sustituye una confirmacion.
- Un mapping ausente o ambiguo debe detener la atribucion de autoria.
- El actor que importa no se convierte automaticamente en autor historico.

## 4. Perfiles y roles

Mapping conceptual de perfil:

| Local | Remoto |
| --- | --- |
| `LOCAL_USERS[].id` | Registro de mapping hacia `profiles.id` |
| `LOCAL_USERS[].slug` | `profiles.local_slug`, si se conserva |
| `LOCAL_USERS[].displayName` | `profiles.display_name` |
| `LOCAL_USERS[].avatar` | `profiles.avatar_url`, si existe un asset valido |

El campo local `role` es un atajo del modo fake/dev. No debe convertirse en una
columna de autorizacion global en `profiles`.

Los roles remotos pertenecen al space y viven en `universe_members.role`:

| Usuario local | Rol remoto inicial |
| --- | --- |
| `local-yori` | `owner` |
| `local-ale` | `partner` |

RLS debe consultar membership y rol del space, no confiar en propiedades del
perfil ni en valores enviados libremente por el cliente.

## 5. Relationship space y memberships

El bootstrap remoto debe:

1. Crear un `relationship_spaces` para Distancia Cero.
2. Registrar su UUID como equivalente de `distancia-cero-local-space`.
3. Crear un `universe_members` para Yori con rol `owner`.
4. Crear un `universe_members` para Ale con rol `partner`.
5. Verificar que ambos profiles apuntan a usuarios Auth reales.
6. Guardar evidencia del mapping antes de importar contenido.

La creacion del space y del primer owner no debe depender de una insercion
client-side libre. El flujo futuro recomendado es una RPC controlada, Edge
Function o proceso admin/migration revisado. No se permite self-owner
arbitrario.

Todos los `content_items`, `content_events` y `media_assets` migrados deben usar
el UUID remoto del mismo `relationship_spaces` en `space_id`.

## 6. Mapping de contenido generico

El contenido local nuevo de cada coleccion se representa remotamente como una
fila `content_items` con `kind = 'local'`.

### Transformacion recomendada

| Origen local | Destino `content_items` |
| --- | --- |
| Nombre de coleccion | `collection` |
| `item.id` | `local_id` como texto |
| Sin equivalente | `id` UUID remoto generado |
| Space local | `space_id` mediante mapping verificado |
| Item local | `kind = 'local'` |
| Campos propios del modulo | `data` JSONB |
| Version inicial | `schema_version = 1` |
| Estado normal | `is_hidden = false`, mientras exista esa ayuda |
| `createdBy` | `created_by` mediante mapping verificado |
| `updatedBy` | `updated_by` mediante mapping verificado |
| `createdAt` | `created_at` como dato importado validado |
| `updatedAt` | `updated_at` como dato importado validado |
| `source: 'local-dev'` | `source = 'imported-local'` o equivalente acordado |

Los timestamps locales describen el historial disponible, pero no constituyen
evidencia server-side. La migracion puede preservarlos si son fechas ISO
validas y debe registrar por separado cuando ocurrio la importacion.

### Separacion de datos y metadata

Recomendacion para construir `data`:

- extraer `id` hacia `local_id`;
- extraer metadata de autoria hacia columnas remotas;
- no usar `isLocal` como autorizacion remota;
- conservar los campos reales del modulo;
- conservar `displayLabel` solo si la UI remota sigue necesitandolo;
- validar el shape por coleccion antes de insertar;
- no eliminar campos desconocidos sin conservar previamente el backup v2.

Si `createdBy` o `updatedBy` no tienen mapping confiable, las columnas deben
quedar `null` o ser atendidas por un proceso administrativo explicitamente
documentado. No deben asumir el UUID del importador.

La policy normal de insert que exige `created_by = auth.uid()` no cubre este
caso legacy. La importacion requerira una RPC/admin path controlada y auditada.

## 7. Colecciones genericas incluidas

| Coleccion local | `content_items.collection` | Canal local actual | Nota |
| --- | --- | --- | --- |
| `reasons` | `reasons` | Generico | Metadata opcional en nuevos/editados |
| `promises` | `promises` | Generico | Metadata opcional en nuevos/editados |
| `importantDates` | `importantDates` | Generico | Validar fecha como dato de dominio |
| `futureDreams` | `futureDreams` | Generico | Corresponde a Wishlist |
| `timeline` | `timeline` | Generico | Preservar `details` como array |
| `blackHoleGallery` | `blackHoleGallery` | Generico | Requiere tratamiento de media |
| `playlist` | `playlist` | Generico | No confundir URLs externas con Storage |
| `monthlyLetters` | `monthlyLetters` | Legacy para locales | Sin metadata confiable por defecto |
| `openWhenLetters` | `openWhenLetters` | Legacy para locales | Sin metadata confiable por defecto |

Los nombres de coleccion deben conservarse exactamente durante la primera
migracion. Renombrarlos requeriria una version de schema y compatibilidad
explicita con JSON base, eventos y backups.

## 8. Overrides

Cada entrada de `overrides.<collection>` se transforma en una fila:

```txt
kind = 'override'
collection = nombre actual de la coleccion
base_id = clave/id del item base JSON
local_id = null
data = patch del override
schema_version = 1
source = 'imported-local'
```

Reglas:

- El `base_id` debe conservar el ID exacto del JSON base.
- El `id` redundante dentro del patch puede validarse contra `base_id`.
- La ausencia actual de autoria no debe atribuirse al importador.
- `created_by` y `updated_by` pueden quedar `null` en migracion controlada.
- El JSON base no se copia ni se modifica; el override sigue siendo un patch.
- El indice unico por `(space_id, collection, base_id, kind)` debe hacer la
  importacion idempotente.
- Un conflicto entre override local y override remoto debe detenerse o seguir
  una politica explicitamente elegida; no se resuelve con last-write-wins por
  defecto.

Actualmente los overrides se aplican a items base JSON. Si en el futuro se
permiten overrides sobre items remotos locales, ese caso necesitara una
referencia distinta y no debe reutilizar ambiguamente `base_id`.

## 9. Hidden

Cada ID de `hidden.<collection>` se representa como un marcador remoto:

```txt
kind = 'hidden'
collection = nombre actual de la coleccion
base_id = id del item base JSON
local_id = null
data = {}
schema_version = 1
is_hidden = true
source = 'imported-local'
```

`kind = 'hidden'` es la representacion principal. Si `is_hidden` se conserva,
es solo una ayuda de query y siempre debe reflejar `kind`.

Restaurar un item significa retirar o desactivar el marcador hidden, no borrar
el contenido base. Como el hard delete general no es la opcion recomendada, el
flujo final debe definirse mediante RPC auditada, soft delete del marcador o
eliminacion controlada especificamente para esta clase de estado.

La autoria ausente de hidden no se debe inventar. El evento de importacion o
restauracion puede registrar al actor sin convertirlo en autor historico del
marcador original.

## 10. Cartas legacy monthly/openWhen

Las cartas locales usan actualmente keys legacy separadas para
`monthlyLetters` y `openWhenLetters`. No pasan por el flujo generico que agrega
metadata de autoria.

Mapping remoto recomendado:

- una fila `content_items` por carta local;
- `kind = 'local'`;
- `collection = 'monthlyLetters'` o `'openWhenLetters'`;
- `local_id = String(letter.id)`;
- `base_id = null`;
- contenido, `locked`, etiquetas, fecha/mes, mood, preview, URL y demas campos
  compatibles dentro de `data`;
- `schema_version = 1`;
- autoria en `null` cuando no exista evidencia confiable;
- `source = 'imported-local'` para indicar procedencia de migracion.

No se deben fabricar `createdBy` o `updatedBy` retroactivos. Aunque un ID o
texto parezca asociable a una persona, eso no constituye mapping de autoria.

Los overrides y hidden de cartas ya usan el sistema generico y siguen las
reglas de las secciones anteriores. `locked` pertenece al contenido de la
carta; no es una policy de seguridad remota.

## 11. Opened/read

Opened/read no debe mapearse inicialmente como `content_items`. Es estado de
progreso por usuario, space e item.

Estado local actual:

- `distancia-cero-monthly-letter-${id}` con valor `opened`;
- `distancia-cero-open-when-${id}` con valor `opened`;
- no forma parte del backup export/import v2 actual.

Si se necesita sincronizacion remota, debe disenarse una tabla separada, por
ejemplo `user_content_state`, con al menos:

- `space_id`;
- `user_id`;
- `collection`;
- referencia estable al item remoto o `base_id`;
- estado `opened`;
- `opened_at`.

Queda pendiente resolver una referencia uniforme para cartas base JSON y
cartas locales remotas. Hasta entonces, opened/read puede permanecer local.

## 12. Simulation unlocked

`distancia-cero-sim-unlocked` es una preferencia local/dev de modo prueba.

No se debe migrar como:

- contenido romantico;
- rol o permiso;
- evidencia de que una carta fue abierta;
- configuracion compartida del relationship space.

Debe permanecer local inicialmente. Si algun dia se sincroniza, corresponde a
preferencias de desarrollo o de usuario, nunca a `content_items` ni a RLS.

## 13. Imagenes, Data URL y media assets

La galeria puede guardar una Data URL en `blackHoleGallery.image`. Es una
compatibilidad valida para LocalStorage y backup offline, pero no es la
solucion final para Postgres.

Flujo futuro recomendado:

1. Detectar si `image` contiene Data URL, ruta local o URL externa.
2. Validar MIME, extension, tamano y contenido antes de subir.
3. Decodificar la Data URL a un archivo temporal controlado.
4. Crear una ruta privada asociada al `space_id` y al asset.
5. Subir el archivo a un bucket privado de Supabase Storage.
6. Crear `media_assets` con bucket, path, MIME, size, space y ownership valido.
7. Asociar `media_assets.content_item_id` con el recuerdo remoto.
8. Sustituir en `data` la Data URL por `mediaAssetId` o referencia controlada.
9. Verificar acceso mediante membership antes de dar por terminada la fase.

Storage y Postgres no forman una transaccion atomica. El migrador debe registrar
cada paso y poder:

- borrar un objeto subido si falla la fila DB;
- borrar una fila provisional si falla el upload;
- detectar y limpiar media huerfana;
- reanudar sin duplicar assets;
- conservar el backup original hasta confirmar integridad.

No se deben guardar URLs firmadas permanentes ni Data URL final en Postgres.
Las policies de `media_assets` no sustituyen las policies de `storage.objects`.

## 14. Export/import v2

Export/import v2 se mantiene sin cambios como backup offline y puede servir
como fuente de una migracion manual futura.

Reglas de migracion:

- validar primero el archivo completo y luego cada coleccion;
- mantener compatibilidad con backups sin metadata;
- no generar autoria falsa por ausencia de metadata;
- resolver y confirmar mappings de usuarios y space antes de escribir;
- ejecutar una previsualizacion o dry run;
- no borrar LocalStorage despues de migrar;
- usar upsert o deteccion idempotente basada en los indices unicos;
- distinguir `local_id` de `base_id`;
- registrar errores y resultados por item;
- permitir reintento sin duplicar contenido;
- exigir confirmacion antes de modificar el remoto.

No hace falta crear v3 todavia. Debe evaluarse solo cuando se necesiten IDs
remotos, manifest de media, estado de migracion, mapping portable o resolucion
de conflictos que v2 no pueda expresar sin ambiguedad.

El importador remoto no debe reutilizar sin revision la validacion del import
local: son fronteras de confianza y destinos diferentes.

## 15. Registro de mapping recomendado

El mapping debe existir como artefacto revisable durante la migracion. Ejemplo
documental, sin UUIDs reales:

| local_user_id | remote_profile_id | confirmed_by | confirmed_at | notes |
| --- | --- | --- | --- | --- |
| `local-yori` | `<uuid-verificado-yori>` | `<actor/admin>` | `<ISO timestamp>` | Yori / Diego |
| `local-ale` | `<uuid-verificado-ale>` | `<actor/admin>` | `<ISO timestamp>` | Ale / Alecita |

| local_space_id | remote_space_id | confirmed_by | confirmed_at | notes |
| --- | --- | --- | --- | --- |
| `distancia-cero-local-space` | `<uuid-verificado-space>` | `<actor/admin>` | `<ISO timestamp>` | Distancia Cero |

Campos minimos recomendados:

- `local_user_id`;
- `remote_profile_id`;
- `local_space_id`;
- `remote_space_id`;
- `confirmed_by`;
- `confirmed_at`;
- `notes`.

Este registro puede vivir inicialmente en el procedimiento/documentacion de
migracion. Si se convierte en tabla, debe tener acceso administrativo y RLS
propia; no debe exponerse como mecanismo client-side para reasignar ownership.

## 16. Riesgos

### RLS y autoria legacy

Las policies normales proponen `created_by = auth.uid()` en inserts. Contenido
legacy sin autor no debe atribuirse al importador solo para satisfacer esa
policy. Se necesita una ruta de migracion controlada que permita `null` o use
una politica de procedencia aprobada.

### Actor de importacion frente a autor original

El actor que ejecuta la migracion puede registrarse en `content_events`, pero
no reemplaza `createdBy`/`updatedBy` desconocidos.

### Storage y Postgres no atomicos

Un fallo parcial puede dejar objetos o filas huerfanas. Se requiere journal,
rollback, reintentos idempotentes y cleanup.

### Colisiones de IDs locales

IDs basados en timestamp pueden colisionar entre backups o navegadores. Los
indices unicos detectan el problema, pero no deciden cual item gana.

### Estabilidad de base IDs

Overrides y hidden dependen de que los IDs de JSON base permanezcan estables.
Cambiar esos IDs rompe la referencia semantica aunque el SQL siga siendo valido.

### Conflictos Ale/Yori

Dos personas pueden editar el mismo item entre exportacion y migracion. No debe
usarse last-write-wins sin version, confirmacion o estrategia de conflictos.

### Opened/read sin schema final

No existe todavia la tabla remota definitiva para progreso por usuario y para
referenciar de forma uniforme items base y remotos.

### Hidden restore y hard delete

Restaurar requiere retirar el marcador. Debe acordarse soft delete, RPC o una
excepcion auditada antes de aplicar policies finales.

### Audit log client-side

Un cliente puede falsificar payloads o acciones. Si se busca auditoria real,
los eventos deben originarse en trigger, RPC o servidor controlado.

### Datos importados no confiables

Timestamps, source, URLs, MIME y metadata del backup deben validarse. El backup
es una fuente de datos, no una autoridad de seguridad.

## 17. Decisiones pendientes

- [ ] Definir el bootstrap seguro del primer owner.
- [ ] Decidir si la importacion usara RPC, Edge Function o proceso admin.
- [ ] Aprobar el formato y custodia del registro de mappings.
- [ ] Decidir si `profiles.local_slug` se conserva o el mapping vive solo en el
      proceso de migracion.
- [ ] Definir `user_content_state` para opened/read.
- [ ] Definir referencias a items base JSON dentro de progreso remoto.
- [ ] Definir resolucion de conflictos Ale/Yori.
- [ ] Definir versionado y validacion de `content_items.data` por coleccion.
- [ ] Decidir el tratamiento remoto de `displayLabel`.
- [ ] Definir restauracion auditada de marcadores hidden.
- [ ] Definir journal y cleanup de media huerfana.
- [ ] Decidir como migrar rutas/URLs de imagen que no sean Data URL.
- [ ] Confirmar si export/import v2 permanece intacto indefinidamente o si se
      agrega despues un manifest separado.
- [ ] Definir cuando un cambio justificaria export/import v3.
- [ ] Definir estrategia async/cache antes de activar repository remoto.

## 18. Checklist de aceptacion

Este documento cumple la fase si:

- [x] No toca runtime.
- [x] No instala dependencias.
- [x] No activa React Router.
- [x] No aplica SQL ni crea migraciones reales.
- [x] No modifica JSON base.
- [x] No cambia export/import v2.
- [x] No cambia la API sync de `contentService`.
- [x] No inventa autoria para contenido existente.
- [x] Conserva el modo local como fallback.
- [x] Solo documenta mapping local -> remoto y decisiones futuras.


# Supabase Isolated Environment

## 1. Resumen

Este documento define como preparar, en fases futuras aprobadas, un entorno
Supabase aislado y desechable para revisar schema y RLS con datos sinteticos.

S4.6.1 solo documenta el checklist. No crea un proyecto Supabase, no aplica
SQL, no conecta la app, no usa datos privados reales y no representa un entorno
de produccion.

## 2. Estado actual del proyecto

- [x] `@supabase/supabase-js` esta instalado de forma aislada.
- [x] Existe un factory aislado en `src/integrations/supabase/client.js`.
- [x] El verificador manual existe y pasa 34 checks con cero fetch.
- [x] El remote repository skeleton sigue inactivo y fail-fast.
- [x] `contentRepository.js` sigue exportando el repository local.
- [x] `contentService.js` conserva su API publica sync.
- [x] LocalStorage sigue siendo la fuente activa y fallback.
- [x] SQL, migrations y RLS no se han aplicado.
- [x] React Router sigue instalado pero inactivo.
- [x] La app permanece desconectada de Supabase.
- [ ] No existe todavia un proyecto Supabase aislado aprobado para estas
      pruebas.

## 3. Objetivo del entorno aislado

El entorno futuro debe:

- vivir en un proyecto Supabase separado y desechable;
- contener solo usuarios, spaces y contenido sinteticos;
- excluir por completo contenido real de Ale/Yori;
- permitir pruebas manuales de schema y RLS;
- cubrir roles owner, partner y usuario externo;
- comprobar aislamiento entre relationship spaces;
- permitir rollback/reset repetible;
- quedar claramente identificado como laboratorio, nunca produccion;
- mantener la app y el CRUD local desconectados.

## 4. Bloqueantes antes de aplicar drafts

Los archivos `docs/supabase/schema_draft.sql` y
`docs/supabase/rls_draft.sql` siguen siendo borradores documentales. No deben
ejecutarse mientras estos bloqueantes no esten resueltos y revisados.

### Schema draft refinado en S4.6.2.1

El refinamiento documental aborda, sin ejecutar SQL:

- invariantes completas de `local_id`/`base_id` segun kind;
- `data` limitado a JSONB object y `schema_version >= 1`;
- eliminacion de indices unicos redundantes;
- FKs compuestas para impedir asociaciones cross-space en events/media;
- check estricto para impedir divergencia entre `is_hidden` y kind;
- `deleted_at` para soft delete de content items;
- `ON DELETE RESTRICT` desde relationship spaces en tablas criticas;
- `content_events` definido conceptualmente como append-only.

Siguen pendientes:

- probar las invariantes y FKs en un entorno aislado;
- convertir el draft en migrations versionadas para schemas existentes;
- definir RLS/RPC para hard delete, restore y audit confiable;
- definir lifecycle/cleanup de media y policies de Storage;
- confirmar versionado final de `data` por collection.

### RLS draft refinado en S4.6.2.2

El refinamiento documental aborda, sin ejecutar SQL:

- helpers de membership/role con `search_path` fijo, revokes y grants minimos;
- wrappers explicitos para leer/modificar spaces;
- grants de tablas deny-by-default;
- `insert` libre de spaces y escrituras directas de memberships bloqueados;
- escritura directa de `content_items` bloqueada; el permiso amplio de INSERT
  fue retirado y queda pendiente RPC/permisos por columnas revisados;
- update directo de profiles/spaces/content bloqueado hasta RPC/grants seguros;
- hard delete de content items denegado;
- content events append-only sin insert/update/delete libre del cliente;
- media metadata en lectura solamente hasta disenar DB + Storage;
- Storage marcado como NO-GO sin policies de `storage.objects`.

Siguen pendientes:

- auditar owner/BYPASSRLS y recursion real de helpers en entorno aislado;
- implementar RPC bootstrap owner/partner transaccional;
- proteger ultimo owner mediante RPC/trigger y probar concurrencia;
- definir profile create/update, content create/update, soft delete e import
  admin mediante RPC/permisos minimos revisados;
- generar audit confiable mediante trigger/RPC;
- disenar policies reales de Storage y cleanup de media;
- ejecutar fixtures/reset y matriz multiusuario sintetica.

## 5. Diseno del entorno aislado

- Crear un proyecto Supabase nuevo con nombre claramente temporal.
- Verificar dos veces el project ref antes de cualquier accion futura.
- No reutilizar produccion, staging con datos reales ni proyectos personales
  que contengan informacion privada.
- Mantener `VITE_REMOTE_CONTENT_ENABLED=false` y la app desconectada.
- Ejecutar SQL solo desde Dashboard/SQL Editor o tooling administrativo en una
  fase futura expresamente aprobada.
- No usar service-role en frontend, Vite o archivos versionados.
- Si un bootstrap requiere privilegios admin, ejecutarlo fuera del repo y del
  navegador de la app.
- Registrar de forma privada el proyecto usado, fecha, operador y resultado de
  cada prueba.

## 6. Usuarios y datos sinteticos

S4.6.1 solo define estas fixtures conceptuales; no crea SQL ni usuarios.

- **Space A:** relationship space sintetico principal.
- **Space B:** segundo space para comprobar aislamiento cruzado.
- **Owner A:** miembro owner de Space A.
- **Partner A:** miembro partner de Space A.
- **Owner B:** miembro owner de Space B, sin membership en Space A.
- **Externo:** usuario autenticado sin membership en ninguno de los dos spaces.
- **Contenido:** textos neutrales como `Synthetic item A1`, sin informacion
  romantica o personal.
- **Override/hidden:** referencias a IDs base sinteticos y estables.
- **Media:** solo metadata sintetica; ninguna foto o archivo privado real.
- **Eventos:** payload minimo y sintetico, solo cuando el mecanismo de audit
  confiable haya sido definido.

Las credenciales de usuarios sinteticos no deben commitearse ni aparecer en
capturas publicas.

## 7. Matriz minima de pruebas futuras

| Caso | Actor | Operacion | Esperado | Fase |
| --- | --- | --- | --- | --- |
| Leer Space A | Owner A | SELECT contenido | Permitido | S4.6.4 |
| Leer Space A | Partner A | SELECT contenido | Permitido | S4.6.4 |
| Leer Space A | Externo | SELECT contenido | Denegado | S4.6.4 |
| Leer Space A | Owner B | SELECT contenido | Denegado | S4.6.4 |
| Crear local valido | Owner A | INSERT local | Pendiente de RPC/permisos minimos finales | S4.6.4 |
| Crear local valido | Partner A | INSERT local | Pendiente de RPC/permisos minimos finales | S4.6.4 |
| Crear contenido | Externo | INSERT local | Denegado | S4.6.4 |
| Crear override | Owner/Partner A | INSERT override de Space A | Permitido | S4.6.4 |
| Override cross-space | Owner B | INSERT/UPDATE sobre Space A | Denegado | S4.6.4 |
| Ocultar/restaurar | Owner/Partner A | Marker hidden | No ejecuta hard delete | S4.6.4 |
| Asociar media | Owner/Partner A | INSERT media_assets | Item y media comparten space | S4.6.4 |
| Asociar evento | Mecanismo confiable | INSERT content_events | Item y evento comparten space | S4.6.4 |
| Cambiar ownership | Owner/Partner A | UPDATE columnas sensibles | Denegado | S4.6.4 |
| Eliminar/degradar ultimo owner | Owner A | Cambio membership | Denegado atomicamente | S4.7 |
| Hard delete directo | Owner/Partner A | DELETE content_items | Denegado por defecto | S4.6.4 |
| Crear audit arbitrario | Cliente normal | INSERT evento libre | Denegado | S4.6.4 |
| Reset de laboratorio | Operador autorizado | Reset fixtures/proyecto | Entorno vuelve a baseline | S4.6.4 |

## 8. Variables y secretos

- `.env.local` puede existir para pruebas locales futuras, pero nunca debe
  commitearse.
- `VITE_SUPABASE_URL` y publishable/anon key son visibles en navegador si se
  usan desde frontend.
- `VITE_REMOTE_CONTENT_ENABLED` debe permanecer en `false` durante S4.6.
- Service-role nunca debe entrar en frontend, variables `VITE_*`, Git o logs.
- DB passwords, access tokens y credenciales administrativas deben permanecer
  fuera del repo y gestionarse por un canal seguro.
- No registrar tokens, passwords, cookies o keys completas.
- No publicar capturas con credenciales, project URLs sensibles o sesiones.
- Una publishable/anon key no sustituye Auth, membership ni RLS.

## 9. Rollback y reset

- El rollback principal es destruir el proyecto desechable completo.
- S4.6.2 debe disenar un reset SQL revisable antes de aplicar schema/RLS.
- El reset debe eliminar fixtures en orden seguro y preservar la posibilidad de
  diagnosticar fallos.
- Si se prueba Storage posteriormente, debe limpiar objetos y metadata.
- Nunca mezclar el reset con un project ref de produccion.
- Confirmar y registrar privadamente el project ref usado en cada ejecucion.
- Documentar resultado, conteos y cualquier residuo antes de cerrar la prueba.

## 10. Fases siguientes

- **S4.6.2.1:** schema draft refinado documentalmente, sin aplicar SQL.
- **S4.6.2.2:** RLS draft refinado documentalmente, sin aplicar SQL.
- **S4.6.2.3:** preparar fixtures/reset sinteticos y re-auditar drafts, sin ejecutar.
- **S4.6.3:** aplicar manualmente schema/RLS revisados en un proyecto Supabase
  desechable, solo si todos los gates pasan.
- **S4.6.4:** ejecutar la matriz multiusuario y documentar resultados/rollback.
- **S4.7:** implementar y probar bootstrap owner/partner controlado.
- **S4.8:** piloto read-only con fixtures sinteticos.
- **S4.9:** escritura/migracion solo despues de resolver RLS, rollback y
  conflictos.

Completar S4.6.1 no autoriza automaticamente ninguna fase posterior.

## 11. Go/no-go antes de aplicar SQL real

- [ ] El proyecto desechable fue creado y esta vacio.
- [ ] El project ref fue confirmado dos veces.
- [ ] Se confirmo que no es produccion.
- [ ] No se usaran datos privados reales.
- [ ] Schema y RLS drafts fueron corregidos y re-auditados.
- [ ] El bootstrap inicial fue disenado y revisado.
- [ ] El ultimo owner queda protegido atomicamente.
- [ ] Hard delete fue retirado o controlado mediante RPC/audit.
- [ ] Policies de Storage fueron disenadas.
- [ ] Reset y rollback fueron definidos y revisados.
- [ ] El verificador local sigue pasando con cero fetch.
- [ ] El build pasa y `npm audit` esta limpio.
- [ ] La app y el CRUD siguen desconectados.
- [ ] No existen secrets o datos privados en Git.

Si cualquiera de estos puntos falla, el resultado es **NO-GO** para aplicar
SQL.

## 12. No objetivos

- No aplicar o ejecutar SQL.
- No crear el proyecto remoto en esta fase.
- No conectar la app o el CRUD.
- No crear usuarios reales de Ale/Yori.
- No subir media real.
- No probar produccion.
- No activar React Router.
- No modificar runtime o LocalStorage.
- No migrar datos.

## 13. Checklist de aceptacion de S4.6.1

- [x] Solo se crean/modifican documentos autorizados.
- [x] No se modifica `src` o runtime.
- [x] No se modifica `scripts`.
- [x] No hay cambios en package o lockfile.
- [x] No se aplica o ejecuta SQL.
- [x] No se crean fixtures SQL.
- [x] No se conecta el CRUD.
- [x] El verificador manual pasa.
- [x] El build pasa.
- [x] `npm audit` esta limpio.

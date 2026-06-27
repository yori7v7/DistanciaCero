# Supabase Manual Application Runbook

> ESTADO: RUNBOOK DOCUMENTAL FUTURO.
>
> Este documento no aplica SQL, no crea proyecto Supabase, no conecta la app,
> no usa datos reales, no usa produccion, no contiene project refs, no contiene
> tokens, no contiene service-role y no representa una prueba completada.
>
> Crear este runbook no significa que Supabase este validado, que RLS haya sido
> probada, que el backend este listo o que la app este conectada.

## 1. Objetivo

Documentar el procedimiento futuro para aplicar manualmente schema y RLS en un
laboratorio Supabase aislado y desechable, manteniendo Distancia Cero
desconectada de Supabase.

Esta fase solo prepara el criterio operativo para una aplicacion futura. No
ejecuta SQL, no crea usuarios, no crea buckets, no activa Router, no conecta el
CRUD y no usa contenido real.

## 2. Estado actual

- `@supabase/supabase-js` esta instalado de forma aislada.
- Vite esta en `8.0.16`.
- `npm audit` esta limpio.
- Existe un factory aislado en `src/integrations/supabase/client.js`.
- El remote repository skeleton existe y sigue inactivo/fail-fast.
- `contentRepository.js` sigue apuntando al repository local.
- `contentService.js` conserva su API publica sync.
- LocalStorage sigue siendo la fuente activa y fallback.
- Router sigue inactivo.
- `docs/supabase/schema_draft.sql` esta refinado, pero no aplicado.
- `docs/supabase/rls_draft.sql` esta refinado, pero no aplicado ni probado.
- `docs/supabase/fixtures/synthetic_fixture_plan.sql` es documental y no
  aplicado.
- `docs/supabase/fixtures/synthetic_reset_draft.sql` es documental y no
  aplicado.
- El verificador, build y audit deben estar limpios antes de cualquier fase
  posterior.
- La app no esta conectada a Supabase.

## 3. Alcance permitido

Una futura S4.6.3 puede disenar o aprobar:

- seleccion o creacion manual de un proyecto Supabase desechable;
- confirmacion del project ref fuera de Git;
- aplicacion manual del schema draft si existe aprobacion explicita;
- aplicacion manual del RLS draft si existe aprobacion explicita;
- verificacion post-SQL sin app conectada;
- evidencia sin secretos, tokens, cookies, keys ni project refs completos.

Queda prohibido:

- usar datos reales de Ale, Yori o Diego;
- usar produccion o un proyecto con informacion privada;
- usar emails reales;
- guardar service-role en Git, frontend, variables `VITE_*` o logs;
- conectar la app o el CRUD remoto;
- activar Router;
- usar Storage real;
- aplicar fixtures en la misma subfase inicial;
- aplicar reset en la misma subfase inicial;
- tomar o compartir screenshots con tokens;
- decir que fixtures/reset fueron aplicados si no existe evidencia separada.

## 4. Subfases propuestas

- **S4.6.3.1:** checklist de proyecto Supabase desechable.
- **S4.6.3.2:** aplicacion manual de schema en laboratorio.
- **S4.6.3.3:** aplicacion manual de RLS en laboratorio.
- **S4.6.3.4:** verificacion post-SQL sin app.
- **S4.6.3.5:** decision go/no-go para fixtures sinteticos.
- **S4.6.4:** pruebas multiusuario/RLS con fixtures, todavia sin CRUD real.

Estas fases no estan completadas. Cada una requiere aprobacion separada.

## 5. Gate humano antes de cualquier SQL

Antes de ejecutar cualquier SQL real, una persona debe confirmar:

- [ ] Git limpio.
- [ ] `node scripts/verify-supabase-isolation.mjs` pasa.
- [ ] `npm.cmd run build` pasa.
- [ ] `npm.cmd audit` esta limpio.
- [ ] Proyecto Supabase desechable confirmado.
- [ ] Project ref confirmado dos veces y guardado fuera de Git.
- [ ] El proyecto no es produccion.
- [ ] No se usaran datos reales.
- [ ] No se usaran emails reales.
- [ ] No existe service-role en frontend, Git o logs.
- [ ] Schema draft revisado.
- [ ] RLS draft revisado.
- [ ] Fixture/reset revisados, pero no aplicados todavia.
- [ ] Rollback entendido: destruir el proyecto desechable.
- [ ] Capturas y logs sin tokens, cookies, keys o project refs completos.
- [ ] Aprobacion humana explicita para la subfase exacta.

Si algun punto no se cumple, el resultado es **NO-GO**.

## 6. Orden operativo futuro

1. Confirmar arbol Git limpio.
2. Correr verificador, build y audit.
3. Revisar este runbook y los documentos relacionados.
4. Crear o seleccionar manualmente un proyecto Supabase desechable.
5. Guardar el project ref fuera de Git.
6. Confirmar dos veces que el proyecto no es produccion.
7. Aplicar `docs/supabase/schema_draft.sql` manualmente solo si se autoriza.
8. Revisar errores de schema sin ocultarlos y sin exponer tokens.
9. Aplicar `docs/supabase/rls_draft.sql` manualmente solo si se autoriza.
10. Revisar policies y grants sin conectar la app.
11. No aplicar fixtures hasta una subfase separada.
12. No aplicar reset salvo subfase separada.
13. Destruir el proyecto si aparece duda de seguridad o error no entendido.

## 7. Evidencia requerida futura

Una futura fase de aplicacion manual debe entregar:

- `git status` antes y despues;
- salida completa del verificador;
- resultado de build;
- resultado de audit;
- `npm.cmd ls @supabase/supabase-js`;
- `npm.cmd ls vite`;
- confirmacion segura del proyecto desechable sin tokens ni project ref completo;
- lista de archivos SQL aplicados;
- errores SQL completos si existen, sin tokens;
- confirmacion de que la app sigue desconectada;
- confirmacion de que no se usaron datos reales;
- confirmacion de que no se expuso service-role.

## 8. Criterios NO-GO

Detener todo si ocurre cualquiera de estas condiciones:

- project ref dudoso;
- proyecto no desechable;
- aparece service-role;
- aparece token, key, cookie o secreto real;
- aparecen datos reales;
- aparece email real;
- SQL incluye `DROP` o `TRUNCATE` inesperado;
- SQL falla a medias y no se entiende el estado resultante;
- RLS parece permitir acceso cruzado entre relationship spaces;
- reset no esta entendido;
- app conectada a Supabase;
- Router activado;
- build, verificador o audit fallan;
- docs afirman un estado no real;
- capturas o logs contienen secretos.

## 9. Riesgos

| Riesgo | Severidad | Mitigacion | Fase |
| --- | --- | --- | --- |
| Proyecto equivocado | Critica | Doble confirmacion de project ref fuera de Git | S4.6.3.1 |
| Service-role expuesto | Critica | Prohibir frontend/Git/logs y escanear evidencia | S4.6.3.1+ |
| Datos reales | Critica | Usar solo proyecto y datos sinteticos | S4.6.3.1+ |
| Screenshots con tokens | Alta | Redactar o evitar capturas sensibles | S4.6.3.1+ |
| Schema no idempotente | Alta | Usar laboratorio vacio y registrar errores | S4.6.3.2 |
| RLS permisiva | Critica | Matriz multi-space antes de conectar app | S4.6.3.3/S4.6.4 |
| RLS demasiado restrictiva | Alta | Pruebas owner/partner/external con fixtures | S4.6.4 |
| Bootstrap inseguro | Critica | RPC/admin flow separado, nunca self-owner client-side | S4.7 |
| Ultimo owner | Alta | Trigger/RPC o regla atomica futura | S4.7 |
| Audit no confiable | Alta | Trigger/RPC/server-side antes de writes reales | S4.9 |
| Storage sin policies | Alta | No usar Storage real hasta policies privadas | Fase Storage |
| Reset falso | Alta | Reset solo subfase separada; rollback principal destruir proyecto | S4.6.3.5+ |
| App conectada antes de tiempo | Critica | Mantener repository local y verificador limpio | Todas |

## 10. Relacion con otros documentos

- `docs/supabase/schema_draft.sql`
- `docs/supabase/rls_draft.sql`
- `docs/supabase/fixtures/README.md`
- `docs/supabase/fixtures/synthetic_fixture_plan.sql`
- `docs/supabase/fixtures/synthetic_reset_draft.sql`
- `docs/SUPABASE_READINESS_CHECKLIST.md`
- `docs/SUPABASE_ISOLATED_ENVIRONMENT.md`
- `docs/SUPABASE_MIGRATION_PLAN.md`

Si este runbook y cualquiera de esos documentos divergen, detener la fase y
sincronizar documentacion antes de aplicar SQL.

## 11. Anti-obsolescencia

- Crear este runbook no cambia runtime.
- Crear este runbook no aplica SQL.
- Crear este runbook no prueba RLS.
- Crear este runbook no conecta Supabase.
- Crear este runbook no crea proyecto Supabase.
- Crear este runbook no aplica fixtures ni reset.

Si en futuras fases se aplica schema/RLS en laboratorio, los docs deben decir
`aplicado en laboratorio`, no `produccion lista`.

Evitar estas frases salvo como advertencias de no uso:

- Supabase validado.
- RLS probada.
- backend listo.
- app conectada.
- fixtures aplicados.
- reset probado.
- produccion lista.


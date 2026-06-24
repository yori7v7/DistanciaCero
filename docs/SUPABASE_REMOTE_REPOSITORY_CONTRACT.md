# Supabase Remote Repository Contract

> ESTADO: SKELETON INACTIVO. No implementa Supabase, no crea un cliente, no
> ejecuta queries y no esta conectado al runtime de Distancia Cero.

## 1. Resumen

Este documento fija el contrato estructural de un futuro repository remoto de
contenido. El objetivo de S4.2.1 es detectar temprano diferencias de API sin
depender de Supabase ni cambiar el comportamiento local actual.

El skeleton:

- es seguro al importar;
- valida solo que existan funciones requeridas;
- falla explicitamente si se invoca una operacion;
- no implementa persistencia remota;
- no se conecta al CRUD activo;
- no cambia `contentService`, LocalStorage o export/import v2.

## 2. Estado actual

- [x] `@supabase/supabase-js` esta instalado de forma aislada.
- [x] El skeleton no importa ni usa la dependencia Supabase.
- [x] Existe un factory aislado en `src/integrations/supabase/client.js`.
- [x] El import y uso de `createClient` se limita a ese factory.
- [x] Ningun runtime activo o repository importa el factory.
- [x] El skeleton no lee variables de entorno.
- [x] `contentRepository.js` sigue reexportando solo
      `localContentRepository`.
- [x] `contentService.js` conserva su API publica sync.
- [x] LocalStorage sigue siendo la fuente activa y fallback.
- [x] `VITE_REMOTE_CONTENT_ENABLED` permanece sin uso runtime.

Crear estos archivos no completa los gates de Auth, RLS, fallback, conflictos,
media o migration.

## 3. Archivos del contrato

### `src/repositories/contentRepositoryContract.js`

Define:

- nombres requeridos del contrato remoto generico;
- nombres locales excluidos del contrato remoto principal;
- error estructural tipado;
- helpers para detectar funciones faltantes;
- assertion estructural sin ejecutar operaciones.

No importa repositories, Supabase, env o runtime.

### `src/repositories/remoteContentRepository.js`

Expone operaciones nombradas y un objeto congelado que cumple estructuralmente
el contrato. Cada operacion lanza un error fail-fast al invocarse.

No importa el repository local, LocalStorage, Supabase o env. Tampoco ejecuta
queries ni listeners durante el import.

### `docs/SUPABASE_REMOTE_REPOSITORY_CONTRACT.md`

Documenta alcance, exclusiones, seguridad y transicion futura. No autoriza la
activacion del skeleton.

## 4. Contrato remoto generico

Las shapes futuras conservan inicialmente la semantica local para permitir una
capa de cache/hidratacion sin cambiar componentes de golpe.

| Funcion | Proposito | Shape local / futuro | Nota de seguridad |
| --- | --- | --- | --- |
| `getCollectionItems` | Leer locales de una coleccion | `Item[]` / `Promise<Item[]>` | Lectura futura requiere Auth y RLS |
| `saveCollectionItems` | Reemplazo bulk controlado | `Item[]` / `Promise<Item[]>` | Solo migration/admin; no UI normal |
| `addCollectionItem` | Crear item local | `Item[]` / `Promise<Item[]>` | Validar `space_id` y autoria |
| `updateCollectionItem` | Editar item local | `Item[]` / `Promise<Item[]>` | Requiere conflicto/version check |
| `deleteCollectionItem` | Eliminar item local | `Item[]` / `Promise<Item[]>` | Hard delete no es default futuro |
| `getCollectionOverrides` | Leer patches base | `Record` / `Promise<Record>` | No copiar JSON base al remoto |
| `saveCollectionOverrides` | Reemplazo bulk de patches | `Record` / `Promise<Record>` | Solo migration/admin |
| `setCollectionOverride` | Crear/editar patch base | `Record` / `Promise<Record>` | `base_id` debe ser estable |
| `deleteCollectionOverride` | Restaurar base editada | `Record` / `Promise<Record>` | Auditar restauracion futura |
| `getCollectionHiddenIds` | Leer marcadores hidden | `string[]` / `Promise<string[]>` | No equivale a borrar contenido |
| `saveCollectionHiddenIds` | Reemplazo bulk hidden | `string[]` / `Promise<string[]>` | Solo migration/admin |
| `hideCollectionItem` | Ocultar item base | `string[]` / `Promise<string[]>` | Usar marker/RPC, no hard delete |
| `restoreCollectionItem` | Restaurar item base | `string[]` / `Promise<string[]>` | Retirar marker de forma auditada |

En S4.2.1 estas funciones no son `async`: todas lanzan sincronicamente
`RemoteRepositoryNotImplementedError`. Los Promises indicados son shapes
futuras, no comportamiento implementado.

## 5. Funciones locales excluidas

Estas funciones existen en el repository local, pero no pertenecen al contrato
remoto generico.

### Merge local

- `mergeCollectionWithLocal`

Combina JSON base, overrides, hidden y locales para una vista sync. Una futura
capa de hidratacion/cache debe resolver esta composicion sin convertirla en una
query del remote repository.

### Cartas legacy monthly/openWhen

- `getLegacyMonthlyLetters`
- `saveLegacyMonthlyLetters`
- `getLegacyOpenWhenLetters`
- `saveLegacyOpenWhenLetters`

Las keys legacy requieren un adaptador de migration explicito. No deben
perpetuarse como API remota ni recibir autoria inventada.

### Opened/read

- `isMonthlyLetterOpened`
- `setMonthlyLetterOpened`
- `isOpenWhenLetterOpened`
- `setOpenWhenLetterOpened`

Opened/read es estado por usuario, space e item. Su destino futuro es un dominio
separado, por ejemplo `user_content_state`, no `content_items`.

### Simulation unlocked

- `getSimulationUnlocked`
- `setSimulationUnlocked`

Es una preferencia local/dev. No es contenido romantico, permiso remoto ni
estado compartido del relationship space.

## 6. Diseno fail-fast

Importar `remoteContentRepository.js` debe ser seguro. La assertion ejecutada al
importar valida propiedades de funcion, pero nunca llama una operacion.

Invocar cualquier operacion debe lanzar inmediatamente:

```txt
name: RemoteRepositoryNotImplementedError
code: REMOTE_REPOSITORY_NOT_IMPLEMENTED
operation: nombre de la operacion invocada
```

El mensaje solo indica que el skeleton esta inactivo y no debe conectarse al
runtime. No incluye argumentos, payloads, IDs, claves o contenido privado.

No se usan:

- stubs silenciosos;
- funciones `async` que oculten el fallo dentro de un Promise rechazado;
- resultados falsos como `[]`, `{}`, `null` o `undefined`;
- errores durante import por env ausente;
- queries o listeners.

## 7. Reglas de seguridad

- El skeleton no debe importar Supabase o el factory.
- El skeleton no debe usar `createClient`.
- No leer `VITE_SUPABASE_*`.
- No leer `VITE_REMOTE_CONTENT_ENABLED`.
- No usar service role en frontend.
- No importar LocalStorage o el repository local.
- No conectar el skeleton desde `contentRepository.js` o `contentService.js`.
- No incluir argumentos o datos privados en errores.
- No usar fixtures privados.
- No activar Router, Auth, media o Realtime.
- No cambiar LocalStorage o export/import v2.

## 8. Transicion futura

Las fases siguen separadas y requieren aprobacion independiente:

1. S4.3 instalo `@supabase/supabase-js` sin usarlo en runtime.
2. S4.4 creo un cliente/factory aislado sin conectar el CRUD.
3. S4.5.1 agrego el verificador manual de aislamiento
   `node scripts/verify-supabase-isolation.mjs`; valida contrato, fail-fast y
   cero fetch sin probar backend o RLS reales.
4. S4.6 puede probar schema y RLS revisados en un entorno aislado.
5. S4.8 puede ejecutar un piloto read-only con fixtures sinteticos y sin datos
   privados reales.

Antes de reexportar un repository remoto se necesita una estrategia aprobada de
cache/hidratacion que preserve la API sync publica. La implementacion local debe
seguir disponible como fallback.

## 9. Criterios del skeleton y estado post-S4.5.1

- [x] S4.2.1 creo solo los tres archivos autorizados para el skeleton.
- [x] No existen imports runtime del skeleton.
- [x] S4.2.1 no modifico `package.json` o lockfile; S4.3 los cambio despues de
      forma aislada y controlada.
- [x] La dependencia Supabase esta instalada, pero el skeleton no la importa.
- [x] `createClient` se usa solo en el factory aislado; el skeleton no lo usa.
- [x] No se leyo env ni feature flag.
- [x] El skeleton esta inactivo y falla de forma explicita.
- [x] Importar el skeleton no ejecuta operaciones.
- [x] El verificador manual confirma contrato, fail-fast y aislamiento sin
      conectar el skeleton al CRUD.
- [x] `contentRepository.js` permanece intacto.
- [x] `contentService.js` permanece intacto.
- [x] LocalStorage y export/import v2 permanecen intactos.
- [x] React Router no fue activado.
- [x] No se tocaron App, scene controllers o JSON base.
- [x] El build pasa.

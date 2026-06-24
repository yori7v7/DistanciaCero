# Supabase Client Factory

> ESTADO: FACTORY AISLADO. No esta conectado al CRUD, no activa contenido
> remoto y no ejecuta queries durante import o construccion.

## 1. Resumen

`src/integrations/supabase/client.js` encapsula la validacion de entorno y la
creacion explicita de un cliente Supabase. Importar el modulo no crea clientes,
no hace queries y no toca Auth, Storage, Realtime, components o repositories.

La existencia del factory no habilita contenido remoto. El flag conserva su
default seguro apagado y ninguna capa del runtime activo importa este modulo.

## 2. Estado actual

- `@supabase/supabase-js@2.108.2` esta instalado de forma aislada.
- Vite esta actualizado a `8.0.16` y `npm audit` esta limpio.
- El factory existe en `src/integrations/supabase/client.js`.
- `contentRepository.js` sigue reexportando el repository local.
- `contentService.js` conserva su API publica sync.
- `remoteContentRepository.js` sigue inactivo y fail-fast.
- LocalStorage sigue siendo la fuente activa y fallback.
- SQL, migrations y RLS no se han aplicado.
- React Router sigue instalado pero inactivo.

## 3. API del factory

| Export | Proposito | Cuando puede lanzar | Seguridad |
| --- | --- | --- | --- |
| `SUPABASE_CLIENT_FACTORY_IMPLEMENTED` | Confirma que el factory aislado existe | Nunca | No implica repository remoto implementado |
| `SupabaseEnvironmentError` | Error tipado de configuracion | Al construirse no; representa fallos controlados | Solo expone codigo, estado y nombres faltantes |
| `isRemoteContentEnabled` | Comprueba opt-in remoto exacto | Nunca | Solo acepta el string `"true"` |
| `getSupabaseEnvStatus` | Resume configuracion sin valores | Nunca | No devuelve URL, key o token |
| `createSupabaseClient` | Crea un cliente nuevo bajo llamada explicita | Remoto apagado, env faltante o URL invalida | Auth pasiva; no ejecuta queries |
| `getSupabaseClient` | Obtiene singleton lazy por defecto | Mismos errores de validacion | Env custom crea un cliente aislado y no contamina el singleton |

## 4. Variables de entorno

- `VITE_REMOTE_CONTENT_ENABLED`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_ANON_KEY`

Solo el string exacto `"true"` solicita activacion remota. Cualquier otro valor
mantiene el estado `disabled`. La publishable key tiene prioridad; la anon key
se acepta solo como alias de compatibilidad cuando no existe publishable key.

La URL debe ser HTTPS, tener hostname y no incluir credenciales embebidas.

## 5. Estados de entorno

| Estado | Significado |
| --- | --- |
| `disabled` | Flag apagado; no se exige URL/key y no se crea cliente |
| `ready` | Flag activo, URL HTTPS y key publica disponibles |
| `env-missing` | Falta URL o ambas alternativas de key publica |
| `env-invalid` | La URL no es HTTPS o no es valida |

Los estados solo incluyen booleanos, fuente de key y nombres de variables
faltantes. Nunca incluyen valores reales.

## 6. Import safety

Importar el modulo:

- no crea cliente;
- no ejecuta fetch, queries o listeners;
- no toca Auth, Storage o Realtime;
- no lee LocalStorage;
- no importa components o repositories;
- no conecta el CRUD;
- no falla si el entorno esta ausente y remoto permanece apagado.

Solo `createSupabaseClient()` o `getSupabaseClient()` pueden crear un cliente,
y ambas rutas validan primero el entorno.

## 7. Seguridad

- Toda variable `VITE_*` es visible en navegador.
- Publishable/anon key no reemplaza Auth, membership o RLS.
- Service-role y secretos administrativos estan prohibidos en frontend.
- Los errores no incluyen URL, keys, tokens o contenido privado.
- No hay fallback a credenciales falsas.
- Pilotos futuros deben usar fixtures sinteticos sin datos privados reales.
- El bootstrap owner/partner requiere un flujo controlado futuro.

## 8. Relacion con repository remoto

Esta fase no conecta el factory a `remoteContentRepository.js`.

- El skeleton remoto sigue inactivo y fail-fast.
- `contentRepository.js` sigue apuntando al repository local.
- `contentService.js` sigue sync.
- Ningun componente importa el factory.
- S4.5.1 verifica el aislamiento actual; conectar estas capas requiere una fase
  futura aprobada y pruebas de integracion adicionales.

## 9. Verificador manual

S4.5.1 dejo versionada la validacion de aislamiento en
`scripts/verify-supabase-isolation.mjs`. Se ejecuta manualmente con:

```powershell
node scripts/verify-supabase-isolation.mjs
```

El verificador cubre:

- import seguro del modulo;
- constante de implementacion en `true`;
- flag ausente, `false` y `true`;
- estados `disabled`, `env-missing`, `env-invalid` y `ready`;
- error controlado cuando remoto esta apagado;
- cliente creado solo con env mock HTTPS y key publica;
- cero fetch durante import y construccion;
- ausencia de imports desde runtime activo.

Esta verificacion no prueba backend, RLS, Auth, Storage o Realtime reales y no
conecta el factory al CRUD.

## 10. Criterios de aceptacion

- [x] Solo se crean/modifican archivos autorizados.
- [x] El factory no se conecta al CRUD.
- [x] Importar no crea cliente ni ejecuta queries.
- [x] El verificador manual pasa con cero fetch y sin env reales.
- [x] No se modifica package/lock o Vite config.
- [x] No se usa service-role.
- [x] No se activa React Router.
- [x] No se aplica SQL.
- [x] El build pasa.
- [x] `npm audit` permanece limpio.

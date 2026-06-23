# Supabase Contract Tests

## 1. Resumen

Estas validaciones manuales comprueban el aislamiento entre el runtime local,
el remote repository skeleton y el Supabase client factory.

No son pruebas de integracion real con Supabase. No prueban RLS, backend,
Storage, Auth o Realtime reales y no conectan el CRUD de Distancia Cero.

## 2. Estado actual

- `@supabase/supabase-js` esta instalado de forma aislada.
- Existe un factory aislado en `src/integrations/supabase/client.js`.
- El remote repository skeleton sigue inactivo y fail-fast.
- `contentRepository.js` sigue exportando el repository local.
- `contentService.js` conserva su API publica sync.
- LocalStorage sigue siendo la fuente activa y fallback.
- SQL, migrations y RLS no se han aplicado.
- React Router sigue instalado pero inactivo.

## 3. Comando

Ejecutar desde la raiz del proyecto:

```powershell
node scripts/verify-supabase-isolation.mjs
```

El proceso termina con codigo `0` cuando todos los checks pasan y con un codigo
distinto de `0` si falla cualquier contrato o si se detecta una llamada a
`fetch`.

## 4. Que valida

- Las 13 operaciones del contrato remoto generico.
- Las 11 operaciones locales excluidas del contrato remoto.
- El fail-fast tipado y sync de `remoteContentRepository`.
- El marker que mantiene inactivo el repository remoto.
- El import seguro y lazy del Supabase factory.
- La validacion de env sintetico y del opt-in exacto `"true"`.
- La prioridad de publishable key y compatibilidad con anon key.
- Cero llamadas a `fetch` durante import y construccion de clientes sinteticos.
- El selector local activo y la API sync de `contentService`.
- La ausencia de imports Supabase desde CRUD, repositories activos,
  componentes, App o controllers.

## 5. Que NO valida

- RLS, policies o Postgres reales.
- Supabase Auth real.
- Supabase Storage o buckets reales.
- Realtime real.
- Un backend o proyecto Supabase disponible.
- Migracion de datos privados o contenido real.
- Conflictos online/offline entre Ale y Yori.
- Rendimiento, latencia o disponibilidad remota.

Pasar este verificador no autoriza conectar el factory o el repository remoto
al CRUD.

## 6. Seguridad

- El script no lee `.env.local` ni requiere variables reales.
- Usa exclusivamente URLs y keys sinteticas que no imprime.
- Intercepta `globalThis.fetch` antes de importar el factory.
- No usa service-role ni secretos administrativos.
- No usa fixtures con datos privados.
- No toca LocalStorage, componentes, export/import o JSON base.
- No crea archivos ni ejecuta queries.

## 7. Criterios de aceptacion

- [x] El verificador manual pasa.
- [x] El build pasa.
- [x] `npm audit` esta limpio.
- [x] No hay cambios de package o lockfile.
- [x] No hay nuevas dependencias o scripts npm.
- [x] El CRUD sigue local y sync.
- [x] Supabase no esta conectado al runtime.
- [x] React Router no esta activo.
- [x] SQL/RLS no se han aplicado.

## 8. Fases siguientes

- **S4.6:** entorno Supabase aislado con schema y RLS revisados.
- **S4.7:** bootstrap owner/partner controlado.
- **S4.8:** piloto read-only con fixtures sinteticos y sin datos privados.
- **S4.9:** escritura o migracion solo despues de resolver RLS, rollback y
  conflictos.

S4.5.1 solo deja disponible una verificacion reproducible de aislamiento. Las
pruebas reales de backend, RLS y datos remotos siguen pendientes.

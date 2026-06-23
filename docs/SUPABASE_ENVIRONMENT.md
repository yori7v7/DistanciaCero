# Supabase Environment

> ESTADO: CONTRATO DOCUMENTAL FUTURO. La dependencia oficial esta instalada de
> forma aislada; no existe cliente, no conecta repositories y no modifica el
> runtime local de Distancia Cero.

## 1. Resumen

Este documento define las variables de entorno previstas para una integracion
futura con Supabase. Su objetivo es fijar nombres, defaults y reglas de
seguridad antes de crear un cliente o conectarlo al runtime.

Esta fase:

- no importa ni usa `@supabase/supabase-js` en runtime;
- no crea ni importa `createClient`;
- no activa contenido remoto;
- no aplica SQL, migrations o RLS;
- no cambia el CRUD local/sync;
- no modifica `contentService`, repositories o componentes.

Vite expone al navegador cualquier variable cuyo nombre comience con `VITE_`.
Por ello, estas variables solo pueden contener configuracion publica de cliente.
Nunca deben contener secretos administrativos.

## 2. Estado actual

- [x] `@supabase/supabase-js` esta instalado de forma aislada.
- [x] Vite esta actualizado a `8.0.16` y `npm audit` esta limpio.
- [x] No existe un cliente Supabase.
- [x] No existe conexion remota.
- [x] No existen imports `@supabase` o llamadas `createClient` en `src`.
- [x] El runtime sigue siendo local y sync.
- [x] `contentService` conserva su API publica sync.
- [x] LocalStorage sigue siendo la fuente activa y fallback.
- [x] Export/import v2 sigue siendo backup offline.
- [x] `.env.example` contiene solo placeholders vacios y un flag apagado.
- [x] `.env.local` debe permanecer fuera de Git.
- [x] El patron `*.local` actual de `.gitignore` cubre `.env.local`.
- [x] React Router sigue instalado pero inactivo.

El estado actual no autoriza instalar el cliente ni conectar un repository
remoto.

## 3. Variables

| Variable | Requerida | Placeholder seguro | Uso futuro | Regla de seguridad |
| --- | --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Solo si remoto esta activo | `VITE_SUPABASE_URL=` | URL publica del proyecto Supabase | Validar HTTPS; no incluir credenciales |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Preferida si remoto esta activo | `VITE_SUPABASE_PUBLISHABLE_KEY=` | Clave publica para cliente futuro | Visible en navegador; depende de RLS |
| `VITE_SUPABASE_ANON_KEY` | Opcional, compatibilidad | `VITE_SUPABASE_ANON_KEY=` | Alias temporal si un proyecto usa nomenclatura anterior | No preferir en codigo nuevo; visible en navegador |
| `VITE_REMOTE_CONTENT_ENABLED` | No | `VITE_REMOTE_CONTENT_ENABLED=false` | Feature flag para una activacion futura explicita | Default obligatorio `false` |

Reglas de resolucion futuras:

- Preferir `VITE_SUPABASE_PUBLISHABLE_KEY` para codigo nuevo.
- Usar `VITE_SUPABASE_ANON_KEY` solo como alias de compatibilidad documentado.
- No exigir ambas claves simultaneamente.
- Si ambas existen, la publishable key debe tener prioridad.
- Nunca imprimir valores de claves en consola, errores o reportes.
- Una clave publica no reemplaza Auth, membership ni RLS.

No se definen variables para Router, SQL, migrations, service role, tokens de
usuario o credenciales administrativas.

## 4. Reglas de seguridad

- Nunca usar una service role key en frontend, Vite o archivos versionados.
- Nunca subir `.env.local` a Git.
- Nunca poner valores reales en `.env.example`.
- Tratar todas las variables `VITE_*` como informacion visible al navegador.
- No asumir que ocultar una variable en la UI la convierte en secreto.
- La anon/publishable key no reemplaza RLS.
- RLS debe validar membership del relationship space para contenido y media.
- No confiar en filtros del cliente como frontera de privacidad.
- Todo contenido romantico de Distancia Cero debe tratarse como privado.
- Pilotos futuros deben usar fixtures sinteticos sin datos privados reales.
- No registrar tokens, sesiones, cookies, URLs firmadas o contenido privado.
- Rotar inmediatamente cualquier credencial administrativa expuesta.

La configuracion de frontend nunca debe contener permisos administrativos. Los
flujos privilegiados futuros deben ejecutarse mediante RPC, Edge Function o
proceso server/admin controlado y auditado.

## 5. Feature flag remoto

`VITE_REMOTE_CONTENT_ENABLED=false` es el default seguro.

Contrato conceptual futuro:

- Solo el string exacto `"true"` puede solicitar activacion remota.
- Cualquier valor ausente, vacio o distinto de `"true"` significa desactivado.
- El flag no crea un cliente por si mismo.
- El flag no ejecuta queries ni cambia el repository activo por si mismo.
- El flag en `true` no autoriza escritura, migration, Auth o Realtime.
- Antes de usarlo deben existir cliente aislado, repository remoto, RLS probada
  y gates de readiness aprobados.
- Si la configuracion remota falla, el modo local debe permanecer disponible.

En esta fase nadie lee el flag desde runtime. Agregarlo a `.env.example` solo
documenta el contrato futuro y no cambia el comportamiento actual.

## 6. Archivos de entorno esperados

### `.env.example`

- Plantilla segura y versionada.
- Contiene nombres de variables, placeholders vacios y defaults seguros.
- No contiene URLs, claves o tokens reales.

### `.env.local`

- Contendra valores locales reales cuando una fase futura lo autorice.
- No debe versionarse.
- El patron `*.local` de `.gitignore` ya lo excluye.
- Debe limitarse a configuracion publica de cliente.

### `.env.production` o variables del host

- Son una posibilidad futura, no parte de esta fase.
- Requieren revision especifica del proveedor de despliegue.
- No deben commitearse con valores reales.
- Deben mantener el flag remoto apagado hasta un go/no-go explicito.

Ningun archivo de entorno frontend debe guardar service role, claves privadas,
credenciales de base de datos o secretos de procesos administrativos.

## 7. Validacion futura

La validacion debe ocurrir mediante una funcion aislada y sin efectos durante
el import del modulo.

Reglas conceptuales:

1. Leer `VITE_REMOTE_CONTENT_ENABLED` con default `false`.
2. Si remoto esta apagado, no exigir URL ni clave y no crear cliente.
3. Si remoto esta activo, exigir URL y una clave publica permitida.
4. Validar que la URL sea sintacticamente valida y use HTTPS.
5. Preferir publishable key y usar anon key solo como fallback compatible.
6. No revelar valores invalidos en mensajes o logs.
7. No ejecutar queries durante validacion o import.

Estados futuros sugeridos:

| Estado | Significado | Comportamiento esperado |
| --- | --- | --- |
| `disabled` | Flag apagado | Runtime local normal |
| `ready` | Flag activo y env valida | Cliente puede crearse solo bajo llamada explicita |
| `env-missing` | Falta URL o clave publica | No crear cliente; mantener fallback local |
| `env-invalid` | URL o configuracion invalida | Reportar configuracion sin exponer valores |

La ausencia de variables no debe romper el build cuando remoto esta apagado.
Si el flag esta activo y faltan variables, el estado debe ser `env-missing`, no
un crash durante import. El repository local debe seguir disponible.

## 8. Relacion con readiness checklist

Este documento no sustituye `docs/SUPABASE_READINESS_CHECKLIST.md`.

El readiness checklist sigue siendo el gate go/no-go obligatorio antes de:

- crear un cliente/factory Supabase;
- aplicar SQL, migrations o RLS;
- conectar cualquier repository remoto al CRUD;
- activar pilotos con fixtures sinteticos.

S4.3 completo la instalacion aislada de `@supabase/supabase-js`; ese hito no
autoriza por si mismo ninguna de las acciones anteriores.

Completar `.env.example` no marca automaticamente como cumplidos los gates de
RLS, Auth, bootstrap, fallback, conflictos, media o migration.

## 9. No objetivos

- No usar ni importar la dependencia Supabase desde runtime.
- No crear un cliente o factory.
- No aplicar SQL, migrations, RLS o buckets.
- No conectar el CRUD a un backend.
- No activar el repository remoto.
- No activar React Router.
- No cambiar `contentService` ni su API sync.
- No tocar LocalStorage o export/import v2.
- No modificar componentes, escenas, musica o JSON base.
- No definir secretos reales o configuracion productiva.

## 10. Checklist de aceptacion y estado post-S4.3

- [x] `.env.example` fue creado con placeholders seguros.
- [x] `docs/SUPABASE_ENVIRONMENT.md` fue creado.
- [x] `.env.local` permanece excluido por la regla `*.local` existente.
- [x] No se tocaron archivos de runtime o `src`.
- [x] No se modificaron `package.json` ni `package-lock.json`.
- [x] No se modifico `vite.config.js`.
- [x] S4.1 no instalo dependencias; S4.3 agrego despues solo la dependencia
      oficial en `package.json` y lockfile.
- [x] La dependencia Supabase sigue sin cliente, configuracion o imports runtime.
- [x] No se creo un cliente Supabase.
- [x] No se aplico SQL.
- [x] No se conectaron repositories remotos.
- [x] React Router no fue activado.
- [x] `contentService` conserva su API sync.
- [x] LocalStorage y export/import v2 siguen intactos.
- [x] El build pasa despues de esta fase documental.

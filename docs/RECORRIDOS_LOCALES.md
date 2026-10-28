# Recorridos y funcionamiento local

Comportamiento local contrastado al cerrar el plan el 10 de octubre de 2026. La validación final del 10 de octubre aprobó **50 E2E en una única corrida y un preview/PWA/offline**, sin reintentos. Incluye diez casos de interfaz y cinco tamaños en Chromium. Fechas, recuperación, fallos anteriores y límites en [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md).

El bloque posterior de compatibilidad cerró el **23 de octubre** con **100/100 E2E en una corrida: 50 WebKit y 50 Firefox**, en Windows, sin omitidas, inestables, reintentos ni errores externos. Duró 67,82 minutos y conservó los hashes de los 272 archivos observados. No repitió la validación histórica de preview/PWA ni acredita Safari/iPhone reales.

## Navegación

- `/` abre la landing; Entrar monta la experiencia en `/app`.
- Cada escena usa un hash `#/inicio`, `#/universo`, `#/cartas`, etc. Los botones de escena añaden una entrada al historial; atrás y adelante recuperan la escena correspondiente.
- Un hash válido tiene prioridad sobre la escena guardada. El formato antiguo `#cartas` se normaliza a `#/cartas`. Al entrar sin un hash válido se utiliza la última escena guardada o Inicio.
- El ajuste de visibilidad del Centro del Universo se conserva al recargar. Activarlo no sustituye la escena seleccionada.
- Los scrolls de navegación y ajustes se cancelan al cambiar su estado o desmontar la experiencia.
- Las secciones pesadas se cargan al visitarlas por primera vez y conservan montaje/estado al cambiar de escena. Su indicador de carga o error pertenece a esa escena y se oculta al salir de ella. Un fallo de descarga ofrece recargar la página.

## Teclado, scroll y movimiento

- Ajustes se cierra con Escape y devuelve el foco a su botón. La escena activa se indica en la navegación; las secciones ocultas quedan fuera del recorrido de teclado.
- El ajuste global de foco evita desplazar el control durante un gesto de puntero, para conservar su clic; mantiene el desplazamiento de teclado y foco programático después del gesto. La corrección se comprobó el 16 de octubre y se guardó en `904203f`.
- La banda sonora ocupa espacio en el documento y se alcanza desde **Ir a la banda sonora** en la navegación.
- El atajo a la banda sonora termina el scroll anterior y lleva al reproductor, en la parte superior. Abrir/volver en cartas desplaza el foco sin animación pendiente; el callback se omite si ya se enfocó otro control. Cerrar un planeta cancela el movimiento hacia el detalle antes de quitarlo y devuelve el foco al selector visible; su retorno diferido se omite si otra acción ya tomó el foco.
- Abrir una carta enfoca su título; volver al listado devuelve el foco a su control. Los lectores de planetas/fotos permiten cerrar con Escape y recuperar el foco; el universo ofrece también selectores de los mismos mundos debajo del Canvas.
- El diálogo de Razones conserva el foco dentro y permite desplazar textos largos. Con movimiento reducido, las razones se ofrecen como botones estáticos.
- Los Canvas y la física dejan de animarse al ocultar sus escenas o el documento. Con movimiento reducido, el 3D queda estático en reposo y conserva los controles manuales. La comprobación final no es una certificación WCAG completa.

## Música y archivos

- La plantilla deja vacías las canciones por escena. Añadir archivos a `public/audio/scenes/` y configurar sus rutas en `src/data/sceneMusic.json` habilita su reproducción.
- Los archivos referenciados por ruta tienen que existir. Un enlace o una ruta en el CMS no copia el archivo al proyecto.
- Las pruebas utilizan WAV sintéticos en contextos aislados. Esos archivos no se añaden al contenido real ni a los datos de la plantilla.
- La reproducción comienza con una acción del usuario. Escenas sin archivo muestran una indicación y su botón queda desactivado.
- Ambiente, playlist y música de escenas comparten coordinación exclusiva, incluidos los elementos de audio creados fuera del DOM. Iniciar uno pausa los otros.
- Una canción de playlist continúa al cambiar de escena. Para regresar a la banda sonora de la escena seleccionada, pulsar Reproducir. Al terminar una canción, solo se retoma el ambiente si estaba sonando antes de elegirla.
- Una canción en carga muestra «Cargando canción. Toca para cancelar». Otro clic en su fila cancela la solicitud; un resultado tardío no debe reanudarla. Los errores de archivo/reproducción se muestran en el reproductor correspondiente.
- Pausa, cambio rápido y salida de `/app` cancelan reproducción/transiciones pendientes. El volumen cero se conserva al pausar, reanudar y recargar.
- Las rutas públicas respetan `VITE_BASE`. Audio conserva fuentes HTTP(S), `data:audio` y `blob:`; los enlaces externos de playlist solo permiten HTTP(S).

## Compatibilidad local con Firefox y WebKit

```powershell
npx playwright install firefox webkit
npm run test:e2e:cross-browser
```

`playwright.cross-browser.config.ts` ejecuta los recorridos de desarrollo en cada motor, WebKit primero y Firefox después, con un worker y cero reintentos. El inventario actual es de **53 por motor** tras añadir ajustes, guía y plantilla entre el 26 y 27 de octubre; el cierre histórico del 23 ejecutó los 50 existentes entonces. Inicia un servidor propio en `http://127.0.0.1:5174`, sin reutilizar uno existente, con `VITE_BASE=/` y `VITE_REMOTE_CONTENT_ENABLED=false`. Los contextos son sintéticos y no utilizan el almacenamiento real del usuario. Reportes en `playwright-report/cross-browser` y artefactos en `test-results/cross-browser`.

### Ajustes generales — 26 de octubre

El panel del CMS guarda siete nombres/fechas, aplica portada y contadores sin recargar y conserva los valores al recargar. El recorrido nuevo descarga el respaldo real, cambia los ajustes, importa ese archivo y comprueba su restauración inmediata; incluye ancho de 390 px y cero errores JS. Pasó en Chromium (13,4 s), WebKit (46,0 s) y Firefox (19,9 s) de Windows. La corrida Chromium también aprobó los cinco casos existentes de respaldos: **6/6**, 227,04 s de reporte. Firefox/WebKit ejecutaron solo el caso nuevo: **2/2**, 73,67 s de reporte. No se ejecutó la suite completa de 51/102 ni se acredita Safari real.

Reproducción acotada, con dependencias y motores instalados: `npm.cmd run test:e2e -- site-settings.spec.ts content-backup.spec.ts`; después `npm.cmd run test:e2e:cross-browser -- site-settings.spec.ts`. Ejecutar por separado y congelar fuentes y documentos hasta terminar. Tipos, 382 unitarias/25 archivos y build/PWA también aprobaron mediante `npm.cmd run verify:local`; evidencia y límites en el avance.

La comprobación del 23 utilizó Playwright 1.62.1, Firefox 153.0 y WebKit 26.5 en Windows. WebKit usa el descriptor Desktop Safari con densidad 1, igual que la densidad de Chromium/Firefox en estas pruebas; no acredita pantallas Retina ni Safari de macOS/iOS. Las capacidades pueden variar por sistema y distribución del motor. [Documentación oficial de los motores de Playwright](https://playwright.dev/docs/browsers).

El audio sintético se sirve mediante un servidor HTTP efímero de loopback, con GET/HEAD, rangos y errores 404; se cierra al terminar el archivo de pruebas. En WebKit de este Windows, una respuesta interceptada no acreditó la misma carga de media que HTTP real, aunque `canPlayType` respondía `probably`. El WAV dura 300 s, más que el presupuesto del recorrido de controles, para evitar cruzar su loop durante ese recorrido. No se añade a la plantilla ni modifica el reproductor.

La investigación del 24 amplió el caso del WAV corto: ocho condiciones nativas (WAV silencioso/con tono, 8/44,1 kHz, 4/20 s, reproducción continua/pausa temprana/cerca del final y MP3 de prueba) se detuvieron en WebKit 26.5 y también 27.2 de Windows, sin error de media. Los documentos estaban visibles y con foco; el transporte HTTP y los bytes eran coherentes. Chromium 151 completó dos vueltas y avanzó con el WAV y el mismo MP3. Son 18 observaciones diagnósticas, no una suite E2E aprobada. El proyecto mantiene Playwright 1.62.1; la comparación 1.64.1 se instaló solo en un checkpoint aislado.

El loop sigue sin corregirse en esos WebKit; no se demostró un defecto del reproductor ni una causa interna. No generalizar a Safari/macOS/iPhone o todo formato/duración. La aplicación respeta el evento pause y cancela sus solicitudes: no se añadió auto-reanudar, que podría contradecir una pausa voluntaria o la salida. El WAV de 300 s sigue comprobando controles y coordinación, sin acreditar loops. La plantilla no incluye canciones locales reales; la disponibilidad de medios depende de la configuración. Resultados y procedencia de fixtures en el avance.

Los resets esperan la primera persistencia de Inicio antes de sembrar datos y después el documento nuevo con navegación de tipo `reload`, sin query. La retirada de `?reset=1` por `replaceState` precede a la recarga y no demuestra que haya terminado. Universo lleva el Canvas al viewport antes de medir dibujos activos y conserva las comprobaciones de pausa, montaje/selección y giro manual.

Las trazas conservan acciones y snapshots DOM, sin captura continua de imágenes; la captura final en caso de error se mantiene. Los presupuestos totales son: respaldo v2 240 s; CRUD WebKit 240 s, Firefox 180 s y Chromium 90/120 s según colección; controles largos de audio WebKit 240 s; Universo WebKit 300 s; cinco recorridos por tamaño WebKit 120 s y otros motores 60 s. Se conservan clics, aserciones y sus plazos; no se usan reintentos para obtener el cierre.

La corrida del 23 se ejecutó con un supervisor local que solicitó temporalmente `ES_CONTINUOUS | ES_SYSTEM_REQUIRED` mediante `SetThreadExecutionState`, después de confirmar una suspensión automática de Windows en el intento del 21. La solicitud se adquirió y restauró al finalizar; no modificó el plan de energía, no exigió pantalla encendida ni activó away mode. No impide suspensión manual. Ese supervisor y su evidencia están en el checkpoint local, no forman parte del comando npm ni viajan con Git. Ver detalles de recuperación en el avance antes de repetir una suite larga.

## Preview y PWA

`npm run dev` ejecuta desarrollo. Para comprobar la versión compilada localmente:

```powershell
npm run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort
```

El build genera un service worker con precache de la aplicación. Su registro requiere un origen seguro: HTTPS o localhost. El servidor de desarrollo no sustituye la comprobación del build y su service worker.

La PWA está configurada con `autoUpdate`, `skipWaiting`, `clientsClaim` y limpieza de caches antiguos. `main.tsx` registra además el cliente `virtual:pwa-register` mediante `registerSW({ immediate: true })`, para coordinar el refresco del documento abierto al detectar una versión nueva. La prueba de preview verifica registro/control del worker y recarga/navegación offline sobre un build; la actualización entre dos builds tiene su recorrido separado, descrito abajo.

Referencia del cliente y refresco automático: [guía oficial de vite-plugin-pwa](https://vite-pwa-org.netlify.app/guide/auto-update).

El modo sin conexión requiere haber cargado y almacenado la aplicación previamente. El contenido de localStorage queda en el mismo navegador y origen. El precache no convierte los enlaces externos, audio/video ni archivos ajenos en recursos offline: dependen de su fuente y de la disponibilidad de cada archivo. Borrar los datos del sitio elimina también contenido y caches; el respaldo JSON conserva solo el alcance descrito en [CONTENT_CONTRACT.md](CONTENT_CONTRACT.md).

Desarrollo en `localhost:5173` y preview en `127.0.0.1:4173` tienen almacenamientos distintos. Exportar/importar un respaldo permite trasladar contenido; una dirección nueva con datos vacíos no demuestra que se hayan borrado los del origen anterior.

Comprobación de preview automatizada (después de compilar):

```powershell
npm run test:e2e:preview
```

Esta configuración usa un servidor local en el puerto 4173 y un perfil de prueba aislado. Los recorridos de desarrollo usan la configuración principal y el puerto 5173; compatibilidad Firefox/WebKit usa el puerto 5174. Cada origen y contexto conserva su propio almacenamiento.

## Actualización PWA entre dos builds locales

```powershell
npm run test:e2e:pwa-update
```

El caso de `playwright.pwa-update.config.ts` utiliza Chromium en Windows, un worker, cero reintentos y el mismo origen `http://127.0.0.1:4175` para A y B. `scripts/pwa-update-server.mjs` genera sus dos builds reales en `test-results/pwa-update-builds`; no requiere compilar previamente `dist`. Un plugin exclusivo de prueba cambia en memoria una marca del entry y el título del lazy `StoryTimeline`: ambos chunks y el hash del worker difieren entre A/B. No modifica archivos de `src`, el `dist` del usuario ni infraestructura remota.

En A, el recorrido guarda una promesa desde el CMS, abre una carta para persistir progreso, conserva volumen cero y Centro visible, y añade una caché ajena como control. Al pasar el servidor a B, pide explícitamente `registration.update()` para comprobar actualizaciones sin esperar el calendario del navegador. La transición al documento B ocurre mediante el cliente de registro, sin forzar `skipWaiting`, borrar cachés, volver a sembrar datos ni recargar manualmente durante A→B.

La prueba espera después la marca B y un `timeOrigin` nuevo, conserva el hash de escena y comprueba el contenido guardado, progreso `opened`, volumen cero y Centro visible. Identidad/espacio permanecen nulos en ambos extremos; no acredita conservación de una identidad elegida. Comprueba al final chunks B presentes, entry/lazy A ausentes y caché ajena conservada. El adjunto temprano de `controllerchange` puede mostrar todavía el documento A; el evento precede a las verificaciones finales y no demuestra por sí solo que el documento o la limpieza de caché ya hayan terminado.

Con red desactivada, se abre el lazy Diario B que el documento A aún no había solicitado, se recarga B y se navega por cartas, landing y entrada, manteniendo los datos guardados. No se registraron errores JS, assets fallidos ni solicitudes Supabase; otras solicitudes externas se bloquearon deliberadamente. El caso pasó **1/1 el 23 de octubre**, en 43,94 s de reporte y 22,9 s de caso, con 275 archivos congelados. Preview/offline pasó por separado **1/1** después del build; resultados completos en el avance.

Esta comprobación local no acredita despliegue real, propagación de CDN, otros orígenes/basepaths, Firefox/WebKit/Safari para la actualización ni instalación como aplicación. Tampoco determina cuándo descubrirá una versión nueva cada navegador: la comprobación se dispara explícitamente, y lo automático probado es el refresco posterior. Conserva **datos ya guardados**, sin garantizar formularios abiertos sin guardar ni todo el estado en memoria; una autorrecarga puede descartar cambios no persistidos. Los medios remotos siguen fuera de la garantía offline.

Una pestaña antigua cargada sin el cliente virtual no contiene el nuevo código que coordina el refresco. Se infiere que necesita una primera recarga manual para incorporarlo; **esa transición legacy no se probó**. El recorrido aprobado parte de A con el cliente nuevo y acredita la actualización detectada siguiente A→B.

Durante los E2E de desarrollo no editar archivos del proyecto, incluidos documentos: el escáner de Tailwind puede provocar una recarga completa al cambiar Markdown. Las notas y resultados temporales se guardan en `.git/codex-checkpoints`; la documentación se actualiza después.

## Mantenimiento de empaquetado y caché interna

El 23 de octubre se comprobaron los grupos de React/Three y la carga diferida de sincronización: 343 unitarias/23 archivos, tipos/build/PWA, PWA A→B 1/1 y Universo compilado 1/1 (Chromium/Windows, perfiles aislados). No se repitieron los 100 de compatibilidad. Desaparecen los avisos de tamaño e import dinámico; permanece Clock desde Fiber, no una excepción JS. Rolldown puede emitir métricas variables de tiempo de plugins: no son un fallo funcional ni se suprimieron. El backend continúa desactivado.


## PWA instalada en Chrome/Windows — 25 de octubre de 2026

Comprobación separada de las suites anteriores, sobre `499f5d9`: Chrome 156.0.8078.48 instalado, perfil temporal propio y preview loopback 4179. Se instaló mediante CDP PWA.install, se eligió PWA.changeAppUserSettings con displayMode standalone y se lanzó la app. Al finalizar, PWA.uninstall y la consulta de estado confirmaron su retirada; el perfil habitual y los datos reales no se tocaron.

La asociación esencial para reconstruir el harness en otro equipo es la ventana, porque el target de PWA.launch es tab y el de cada Page es page. Con una sesión CDP del navegador y otra de la página candidata:

```js
const launch = await browserSession.send('PWA.launch', { manifestId, url })
const launchedWindow = await browserSession.send('Browser.getWindowForTarget', {
  targetId: launch.targetId,
})
const { targetInfo } = await pageSession.send('Target.getTargetInfo')
const candidateWindow = await browserSession.send('Browser.getWindowForTarget', {
  targetId: targetInfo.targetId,
})
// Seleccionar la Page del origen esperado cuyo windowId coincide.
```

Procedimiento portable: preparar el build local vigente con remoto desactivado; abrir Chrome con un directorio de perfil nuevo, confirmar que no existe esa instalación y guardar una promesa sintética en ese origen. Tras instalar/lanzar, comprobar datos y matchMedia('(display-mode: standalone)'). Recargar con context.setOffline(true) y verificar navigator.onLine=false y respuesta desde el worker. Cerrar la ventana; detener realmente el servidor loopback y verificar conexión rechazada. Relanzar la app instalada, asociar la nueva ventana, comprobar los datos guardados y el Diario lazy. Verificar controlador del worker, workerStart positivo y origen aún cerrado. Restaurar la simulación y desinstalar en finally, incluso ante errores; no añadir esta prueba con efectos de instalación a la suite/CI habitual.

No se debe usar context.setOffline como prueba de que una ventana nativa recién abierta ya está offline desde su primer request: el intento anterior no heredó esa condición. La reapertura final se acredita **sin servidor local**, con Internet del sistema disponible. No requiere apagar la red de Windows ni permite afirmar que todos los recursos externos funcionen offline. La [implementación exacta de Chrome](https://raw.githubusercontent.com/chromium/chromium/d0c02bfad08ec92a6ffcf989e53cd995e6381a4c/chrome/browser/devtools/protocol/pwa_handler.cc) explica el target tab y la preferencia de apertura de la ruta CDP; la [resolución de ventana](https://raw.githubusercontent.com/chromium/chromium/d0c02bfad08ec92a6ffcf989e53cd995e6381a4c/chrome/browser/devtools/protocol/browser_handler.cc) permite asociar ambos targets.

El recorrido final aprobó en 18,613 s, con 278 archivos conservados, guard restaurado y desinstalación confirmada. Evidencia local en `.git/codex-checkpoints/pwa-native-target-20261025/`; no se distribuye el perfil ni el checkpoint. No se reinició Chrome/Windows, no se verificó el menú de instalación del usuario, Edge ni Safari. Los resultados A→B anteriores conservan su alcance; este caso no los repite ni los extiende a otros motores.


### Configuración guiada — 26 de octubre

La guía opcional del CMS se comprobó en Chromium, WebKit y Firefox de Windows: volver conserva datos, cancelar no escribe, revisión móvil y foco funcionan, guardar actualiza portada/contadores y recargar conserva ajustes y creaciones. Dos casos Chromium (guía y ajustes) y solo el nuevo en los otros motores aprobaron. Reproducción y resultados exactos en el avance.


### Contenido y recursos — 27 de octubre

Cinco casos Chromium aprobaron CRUD de música, audio real y recuperación de archivos ausentes, junto con los pendientes de la plantilla. El caso de plantilla se repitió tras ajustar y capturar el mapa móvil. Resultados separados, sin repetir los 53/106 completos ni certificar otros motores. Instrucciones y resultados exactos en el avance.

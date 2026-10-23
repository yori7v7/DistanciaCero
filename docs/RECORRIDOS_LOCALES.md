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

`playwright.cross-browser.config.ts` ejecuta los 50 recorridos de desarrollo en cada motor, WebKit primero y Firefox después, con un worker y cero reintentos. Inicia un servidor propio en `http://127.0.0.1:5174`, sin reutilizar uno existente, con `VITE_BASE=/` y `VITE_REMOTE_CONTENT_ENABLED=false`. Los contextos son sintéticos y no utilizan el almacenamiento real del usuario. Reportes en `playwright-report/cross-browser` y artefactos en `test-results/cross-browser`.

La comprobación del 23 utilizó Playwright 1.62.1, Firefox 153.0 y WebKit 26.5 en Windows. WebKit usa el descriptor Desktop Safari con densidad 1, igual que la densidad de Chromium/Firefox en estas pruebas; no acredita pantallas Retina ni Safari de macOS/iOS. Las capacidades pueden variar por sistema y distribución del motor. [Documentación oficial de los motores de Playwright](https://playwright.dev/docs/browsers).

El audio sintético se sirve mediante un servidor HTTP efímero de loopback, con GET/HEAD, rangos y errores 404; se cierra al terminar el archivo de pruebas. En WebKit de este Windows, una respuesta interceptada no acreditó la misma carga de media que HTTP real, aunque `canPlayType` respondía `probably`. El WAV dura 300 s, más que el presupuesto del recorrido de controles, para evitar cruzar su loop durante ese recorrido. No se añade a la plantilla ni modifica el reproductor.

Una sonda independiente de la aplicación confirmó un límite con WAV de 20 s, volumen cero y `loop=true`: tras pausar/reanudar a unos 19,86 s, las promesas de reproducción se resolvieron, cruzó una vuelta y quedó en pausa nativa a tiempo cero, sin error, durante los siete segundos observados. El cruce y el síntoma están comprobados en WebKit 26.5/Windows/densidad 1; la causa interna no está explicada. Usar 300 s en el recorrido no declara corregido ese comportamiento ni lo extrapola a Safari real, otros formatos o equipos.

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

La PWA está configurada con `autoUpdate`, `skipWaiting`, `clientsClaim` y limpieza de caches antiguos. Una recarga debe cargar la versión servida por el worker activo. La prueba de preview verifica el registro/control del worker y la recarga/navegación local sin conexión sobre el build actual; no simula todavía una actualización entre dos releases.

El modo sin conexión requiere haber cargado y almacenado la aplicación previamente. El contenido de localStorage queda en el mismo navegador y origen. El precache no convierte los enlaces externos, audio/video ni archivos ajenos en recursos offline: dependen de su fuente y de la disponibilidad de cada archivo. Borrar los datos del sitio elimina también contenido y caches; el respaldo JSON conserva solo el alcance descrito en [CONTENT_CONTRACT.md](CONTENT_CONTRACT.md).

Desarrollo en `localhost:5173` y preview en `127.0.0.1:4173` tienen almacenamientos distintos. Exportar/importar un respaldo permite trasladar contenido; una dirección nueva con datos vacíos no demuestra que se hayan borrado los del origen anterior.

Comprobación de preview automatizada (después de compilar):

```powershell
npm run test:e2e:preview
```

Esta configuración usa un servidor local en el puerto 4173 y un perfil de prueba aislado. Los recorridos de desarrollo usan la configuración principal y el puerto 5173; compatibilidad Firefox/WebKit usa el puerto 5174. Cada origen y contexto conserva su propio almacenamiento.

Durante los E2E de desarrollo no editar archivos del proyecto, incluidos documentos: el escáner de Tailwind puede provocar una recarga completa al cambiar Markdown. Las notas y resultados temporales se guardan en `.git/codex-checkpoints`; la documentación se actualiza después.

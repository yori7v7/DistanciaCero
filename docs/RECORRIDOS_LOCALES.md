# Recorridos y funcionamiento local

Comportamiento local contrastado al cerrar el plan el 10 de octubre de 2026. La validación final del 10 de octubre aprobó **50 E2E en una única corrida y un preview/PWA/offline**, sin reintentos. Incluye diez casos de interfaz y cinco tamaños en Chromium. Fechas, recuperación, fallos anteriores y límites en [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md).

## Navegación

- `/` abre la landing; Entrar monta la experiencia en `/app`.
- Cada escena usa un hash `#/inicio`, `#/universo`, `#/cartas`, etc. Los botones de escena añaden una entrada al historial; atrás y adelante recuperan la escena correspondiente.
- Un hash válido tiene prioridad sobre la escena guardada. El formato antiguo `#cartas` se normaliza a `#/cartas`. Al entrar sin un hash válido se utiliza la última escena guardada o Inicio.
- El ajuste de visibilidad del Centro del Universo se conserva al recargar. Activarlo no sustituye la escena seleccionada.
- Los scrolls de navegación y ajustes se cancelan al cambiar su estado o desmontar la experiencia.
- Las secciones pesadas se cargan al visitarlas por primera vez y conservan montaje/estado al cambiar de escena. Su indicador de carga o error pertenece a esa escena y se oculta al salir de ella. Un fallo de descarga ofrece recargar la página.

## Teclado, scroll y movimiento

- Ajustes se cierra con Escape y devuelve el foco a su botón. La escena activa se indica en la navegación; las secciones ocultas quedan fuera del recorrido de teclado.
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

Esta configuración usa un servidor local en el puerto 4173 y un perfil de prueba aislado. Los recorridos de desarrollo usan la configuración principal y el puerto 5173.

Durante los E2E de desarrollo no editar archivos del proyecto, incluidos documentos: el escáner de Tailwind puede provocar una recarga completa al cambiar Markdown. Las notas y resultados temporales se guardan en `.git/codex-checkpoints`; la documentación se actualiza después.

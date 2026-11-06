# Pulido de interfaz por secciones

Etapa autorizada el 31 de octubre de 2026, después de cerrar la [validación integral local](VALIDACION_INTEGRAL_LOCAL.md). Trabajar una sección a la vez, cerrar su revisión y pruebas antes de iniciar la siguiente. Mantener la plantilla reutilizable, el modo local, Supabase desactivado y sin despliegues. Se conserva la condición de uso normal: sin cambios de modelo/modalidad, reserva, compras ni resets.

## Orden inicial

1. **Bienvenida pública (`/`, `PublicLanding`) — cerrada el 31 de octubre.** Skills `ui-ux-pro-max` y `web-design-guidelines`; se conservan paleta, tipografías y fondo cósmico existentes.
2. **Portada principal (`/app`, `Hero`) — cerrada el 1 de noviembre.** Es una sección distinta de la bienvenida pública.
3. **Navegación de escenas — cerrada el 2 de noviembre.**
4. **Reproductor — cerrado el 5 de noviembre.**
5. Continuar las secciones de la experiencia en el orden de navegación. Siguiente: Propuesta (`pregunta-oficial`, dentro de Inicio), sin iniciar. Registrar el bloque concreto antes de tocarlo; no supone añadir funciones ni rediseñar todo simultáneamente.

## Bienvenida — alcance

Baseline `9aa4703`, primer checkpoint `6a4fb6e`, corrección de la medición en `0eb663a` y cierre funcional en `a7b2304`. Capturas iniciales confirmaron 40 px de scroll innecesario y un ancho de 1165 px para títulos/nombres válidos largos en un viewport de 320 px. La plantilla mostraba un título incompleto y un corazón entre nombres vacíos. El texto auxiliar necesitaba más contraste.

Los cambios conservan la configuración: título de respaldo «nuestro universo» solo en la bienvenida cuando no hay destinatario, nombre compartido si no hay nombres individuales, descripción existente, controles accesibles y footer dentro del layout. Los nombres/títulos largos se ajustan sin truncar. Se reserva altura para las frases y se permite pausar animaciones; movimiento reducido del sistema las mantiene detenidas. No se añaden datos personales ni almacenamiento.

La medición pendiente de WebKit consultaba `document.fonts.ready` antes de que React montara el botón. Las fuentes utilizadas empezaban a cargar después: el desplazamiento de 8,05 px ocurrió todavía durante la primera frase. Ahora se espera primero el botón visible y después las fuentes; se conserva la aserción de posición y no se añaden reintentos.

La revisión final ajustó el espaciado de pantallas bajas también con fuentes externas bloqueadas. En Firefox con texto al 200 %, el foco nativo dejaba parte del botón de pausa fuera de la vista. Al recibir foco se muestra su caja completa con desplazamiento inmediato al punto más cercano y margen para el contorno. La regresión recorre Tab desde el botón principal y exige que la pausa quede completamente dentro del viewport.

## Validación final — 31 de octubre de 2026

| Comprobación | Resultado | Duración del reporte |
| --- | --- | --- |
| `types-build-complete` | Tipos y build/PWA aprobados | Salida 0 |
| `chromium-complete` | **5/5 bienvenida** | 24,17 s |
| `browsers-complete` | **10/10 bienvenida**, cinco WebKit y cinco Firefox, Windows | 60,25 s |
| `preview-complete` | **1/1 build/offline**, contenido y ajustes conservados | 11,95 s |

Los reportes finales tienen cero omitidas, fallos, inestables, reintentos y errores externos. Los cuatro supervisores conservaron los **300 archivos observados** y restauraron sus guards. No se repitieron las 414 unitarias ni las suites completas históricas; esos resultados conservan sus fechas. En ese cierre el inventario era de 55 casos de desarrollo por motor; no se ejecutó completo.

El cierre documental pasó revisión independiente, `git diff --check` y comprobación de 99 enlaces locales en 17 documentos, sin enlaces rotos.

La revisión visual final pasó **10 escenarios**: escritorio, móvil de 320/375 px, tablet, paisaje, nombres de 80 caracteres, texto al 200 % y fuentes bloqueadas. Incluye los tres motores y capturas del foco por teclado. Sin errores JS ni desbordamiento horizontal; el scroll vertical sigue disponible para contenido largo, texto ampliado y paisaje. Con contenido normal, el footer cabe en los viewports comprobados, incluso sin las fuentes externas. Capturas de móvil, fuentes bloqueadas y foco ampliado inspeccionadas.

Las skills aportaron criterios de jerarquía, contraste, ajuste de contenido, teclado y movimiento reducido; [reglas web consultadas](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). No acredita Safari real, dispositivos Apple ni una certificación completa de accesibilidad. Las otras escenas no se modificaron.

## Evidencia y reproducción

Evidencia ignorada en `.git/codex-checkpoints/ui-landing-20261031/` y `.git/codex-checkpoints/ui-landing-resume-20261031/`; no viaja con Git. Incluye capturas, mediciones de fuentes, reportes, estados y diagnósticos originales. Los intentos fallidos y experimentos no sustituyen los reportes finales. El checkpoint inicial se guardó al acercarse al límite de uso normal; al retomar se comprobó disponibilidad, rama, archivos, runners y remoto, sin usar resets ni cambiar modalidad.

Con dependencias y motores instalados, ejecutar por separado y mantener fuentes/documentos congelados durante cada runner:

```powershell
$env:VITE_REMOTE_CONTENT_ENABLED = 'false'
$env:VITE_BASE = '/'
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:e2e -- landing.spec.ts
npm.cmd run test:e2e:cross-browser -- landing.spec.ts
npm.cmd run test:e2e:preview
```

El siguiente bloque de aquel cierre fue Hero; su resultado se registra abajo. Mantener el orden y todas las restricciones locales y de uso.

## Hero — cerrado el 1 de noviembre de 2026

Baseline `d3b6856`, implementación/pruebas `ec79a00`. Se comprobó uso normal, árbol limpio, ausencia de runners y coincidencia con origin antes de editar. Se aplicaron las mismas skills y la dirección visual existente únicamente a Hero.

Se sustituyeron los grandes márgenes por espaciado adaptable, se aisló el recorte en la decoración y se ajustaron títulos/nombres largos sin truncarlos. La plantilla vacía usa «nuestro universo» y el nombre compartido, coherentes con la bienvenida. Marca, texto configurable del botón y nombres personalizados se conservan. Los iconos decorativos quedan ocultos para lectores de pantalla y el corazón entre nombres deja de animarse automáticamente.

El CTA apuntaba a `#carta`, aunque decía «Entrar al universo». Ahora abre la escena válida `#/universo`; se conserva `hero.primaryButton` sin cambiar el JSON ni los siete ajustes del CMS. El botón de audio mantiene el contexto existente: desactivado sin fuente y con activación/pausa cuando hay un archivo local configurado.

El foco de teclado mantiene los controles completos por debajo de la cabecera, también con texto al 200 %. La revisión independiente señaló que desplazar al recibir foco por ratón podía mover el enlace antes del clic: se limita la corrección a `:focus-visible`. El recorrido prueba una pulsación en el borde del CTA junto a la cabecera y después su activación con Enter.

| Comprobación final | Resultado | Duración del reporte |
| --- | --- | --- |
| `local-final` | Tipos, **20/20 unitarias relacionadas** y build/PWA | Unitarias: 6,11 s |
| `chromium-keyboard` | **7/7**, tres Hero y cuatro navegación existentes | 45,04 s |
| `browsers-keyboard` | **6/6**, tres Hero por motor, WebKit y Firefox en Windows | 56,51 s |
| `preview-keyboard` | **1/1** build/offline, contenido y ajustes conservados | 15,13 s |

Todos los reportes finales tienen cero omitidas, fallos, inestables, reintentos y errores externos. Los supervisores conservaron los **301 archivos observados** y restauraron sus guards. Los tres casos nuevos dejan el inventario en **58 por motor** (comprobado con `--list`); no se ejecutaron las suites completas de 58/116 ni se repitieron las 414 unitarias históricas.

El cierre documental pasó revisión independiente, `git diff --check` y comprobación de 103 enlaces locales en 17 documentos, sin enlaces rotos.

La matriz visual final aprobó diez escenarios en los tres motores: escritorio, móvil de 320/375 px, tablet, paisaje, nombres de 80 caracteres, texto al 200 % y fuentes bloqueadas. Sin desbordamiento horizontal ni errores JS; el foco del CTA se comprueba completamente visible y sin quedar detrás de la cabecera. Capturas de móvil y foco ampliado inspeccionadas. El scroll vertical sigue disponible cuando el contenido lo necesita. En las capturas iniciales comparables, el CTA móvil pasó de y=874 a y=513,58 y los textos largos de 2122 px a 288 px de ancho, igual al contenedor.

La prueba inicial de foco WebKit usaba `.focus()` sin entrada de teclado: al restringir el scroll a foco visible, no activaba esa modalidad. Se añadió Tab real antes de medir y se conservaron la aserción del viewport completo y la distancia a la cabecera. No se añadieron reintentos ni esperas arbitrarias. Los primeros reportes y diagnósticos se conservan en `.git/codex-checkpoints/ui-hero-20261101/`, ignorado y no portable. No se modificó el perfil habitual ni datos reales, y las fuentes de audio son WAV sintéticos aislados.

Reproducción local con remoto desactivado, una suite a la vez y sin editar fuentes/documentos durante los runners:

```powershell
$env:VITE_REMOTE_CONTENT_ENABLED = 'false'
$env:VITE_BASE = '/'
npm.cmd run typecheck
npm.cmd test -- src/__tests__/PlaylistResources.test.tsx
npm.cmd run build
npm.cmd run test:e2e -- hero.spec.ts navigation.spec.ts
npm.cmd run test:e2e:cross-browser -- hero.spec.ts
npm.cmd run test:e2e:preview
```

Al cerrar Hero, el siguiente bloque fue navegación de escenas, cuyo resultado se registra abajo. Se mantienen las restricciones locales, de infraestructura y de uso; WebKit en Windows no acredita Safari real.

## Navegación de escenas — cerrada el 2 de noviembre de 2026

Baseline `e6461cd`, implementación y pruebas `93f75f1`. Se conservaron los cambios locales iniciales de iconos/títulos y se comprobó coincidencia con origin antes de editar. Skills aplicadas: `ui-ux-pro-max`, `web-design-guidelines` y `code-review-skill`; referencias de paleta/pills y tokens existentes, sin instalar paquetes ni replantear el sistema visual. La revisión independiente final no encontró defectos adicionales.

El cierre de Ajustes medía 18 px de ancho: ahora tiene una caja centrada de **44 × 44 px**. Los enlaces reservan espacio para el contorno, conservan su radio y retiran la máscara durante el foco. En móvil, las escenas aparecen antes que las acciones, igual que en el DOM y Tab. Las flechas y el acceso a la banda sonora tienen títulos descriptivos; se conservan nombres accesibles, escena activa, historial, configuración y almacenamiento.

El foco de teclado desplaza solo el contenedor horizontal y vuelve a comprobarse en el siguiente frame si el mismo botón sigue enfocado. El centrado diferido respeta ese foco y el botón enfocado deja de animar su posición. Se conserva la protección durante pulsaciones de puntero. Al cambiar la altura de la cabecera o terminar la entrada de una escena, el controlador mantiene el control enfocado dentro del viewport; la regresión amplía texto después de enfocar el CTA de Hero, sin cambiar su diseño ni comportamiento.

| Comprobación final | Resultado | Duración del reporte |
| --- | --- | --- |
| `local-final-pass` | Tipos, **8/8 unitarias de navegación**, build/PWA | Unitarias: 4,35 s |
| `chromium-final-pass` | **9/9**, seis navegación y tres Hero | 37,60 s |
| `browsers-final-pass` | **6/6 seleccionados**, tres por motor WebKit/Firefox | 34,06 s |
| `visual-final-pass` | **11 escenarios**, tres motores | Salida 0 |
| `preview-final-pass` | **1/1** build/offline | 10,57 s |

Cero omitidas, fallos, inestables, reintentos o errores externos en los reportes finales. Los cinco supervisores conservaron **301 archivos observados** y restauraron sus guards. Los escenarios visuales incluyen 320/375 px, tablet, laptop, escritorio, paisaje, texto al 200 %, fuentes bloqueadas y movimiento normal/reducido. Sin desbordamiento horizontal de página/dropdown ni recorte del contorno en los enlaces medidos; cierre de Ajustes de 44 px. Capturas de foco móvil y Ajustes normal/ampliado inspeccionadas. El inventario es **60 casos por motor en 14 archivos**, comprobado con `--list`; no se ejecutaron las suites completas ni se repitieron las 414 unitarias históricas. No acredita Safari ni dispositivos Apple reales.

El cierre documental pasó revisión independiente, `git diff --check` y comprobación de 105 enlaces locales en 17 documentos, sin enlaces rotos.

Los diagnósticos se conservaron: la primera comprobación de tipos detectó una colisión entre `FocusEvent` DOM y React, corregida con alias; Hero reveló pérdida de visibilidad al ampliar texto con foco existente; WebKit encontró desplazamientos que dejaban enlaces fuera de la barra y el cambio de posición al terminar la animación. El primer ajuste de centrado no bastó: se completó con desplazamiento local y estabilidad del foco. Firefox midió 42,24 px durante `scale(.96)` del dropdown; la prueba espera ahora su animación finita antes de exigir 44 px, sin relajar la aserción ni añadir esperas fijas o reintentos.

La corrida inicial del 1 de noviembre había aprobado tipos, ocho unitarias, build y cuatro Chromium; no constituye el cierre. Evidencia y diagnósticos ignorados en `.git/codex-checkpoints/ui-navigation-20261101/` y `.git/codex-checkpoints/ui-navigation-20261102/`; no viajan con Git. Se usaron perfiles y datos sintéticos aislados. Se mantiene el aviso conocido de deprecación `THREE.Clock`, sin ampliar este bloque al 3D.

Reproducción, una suite a la vez y sin editar fuentes ni documentos durante runners:

```powershell
$env:VITE_REMOTE_CONTENT_ENABLED = 'false'
$env:VITE_BASE = '/'
npm.cmd run typecheck
npm.cmd test -- src/__tests__/SceneNavigation.test.tsx
npm.cmd run build
npm.cmd run test:e2e -- navigation.spec.ts hero.spec.ts
npm.cmd run test:e2e:cross-browser -- navigation.spec.ts hero.spec.ts --grep "Pulido de navegaci|nombres largos"
npm.cmd run test:e2e:preview
```

**Siguiente: reproductor, sin iniciar.** Cerrar esta entrega en Git antes de comenzar ese bloque; mantener una sección a la vez, modo local, Supabase desactivado, sin despliegues y las restricciones de uso normal.

## Antecedente: reproductor — checkpoint del 2 de noviembre de 2026

Sobre `6c12910`: estado accesible de silencio, valores de sliders y hover desactivado corregidos. Tipos, 35 unitarias AudioPlayback, build/PWA y un Chromium de audio real aprobados; detalles, evidencia y pendientes en [el punto portable](TRABAJO_ENTRE_EQUIPOS.md). Falta inspección visual/teclado, textos largos/ampliados, Firefox/WebKit y preview. No declara terminada la sección; checkpoint al 97 % del uso normal, sin resets ni cambios de modalidad.

## Reproductor — cerrado el 5 de noviembre de 2026

Checkpoint recibido `5e43900`, implementación y regresiones finales `b5d6d76`. Uso normal disponible, árbol limpio y coincidencia con origin comprobados antes de editar. Se aplicaron las skills de UI/UX, guías web y revisión de código, conservando los tokens y el estilo existentes.

Se completan el estado accesible de silencio y los valores descriptivos de progreso/volumen del checkpoint. Los metadatos largos ahora se ajustan completos; las columnas temporales y de porcentaje crecen con el texto y usan cifras tabulares. La medición inicial con 320 px y texto al 200 % encontró 1366 px de contenido dentro de 286 px y un porcentaje de 62,75 px en una columna de 44 px. Las mediciones finales no muestran desbordamiento.

Se corrigió un fallo de estado: pausar A y navegar a otra escena conservaba su progreso habilitado bajo el título nuevo. El progreso queda asociado a la fuente seleccionada; eventos tardíos de otra fuente se descartan y buscar exige un recurso coincidente. Volver a la misma fuente pausada recupera sus tiempos nativos sin reiniciar ni reclamar el audio de la playlist. Tres regresiones unitarias cubren cambio a escena distinta/vacía, playlist activa y metadatos tardíos.

Con metadatos muy largos, estrechar la ventana podía dejar el volumen enfocado fuera de la vista. El reproductor revela el control de teclado tras foco/cambio de tamaño y reserva margen para la cabecera. El observer, listeners y RAF tienen limpieza; el ajuste respeta gestos de puntero. Se mantuvo la aserción del control completamente visible, sin esperas fijas ni reintentos.

| Comprobación final | Resultado | Duración del reporte |
| --- | --- | --- |
| `local-focus` | Tipos, **38/38 AudioPlayback**, build/PWA | Unitarias: 4,65 s |
| `chromium-focus` | **4/4**, tres reproductor y audio real existente | 26,48 s |
| `browsers-final` | **6/6**, tres reproductor por motor WebKit/Firefox | 55,83 s |
| `matrix-final` | **12 escenarios visuales**, tres motores | Salida 0 |
| `preview-final` | **1/1** build/offline | 10,81 s |

Cero omitidas, fallos, inestables, reintentos o errores externos en los reportes finales; los cinco supervisores conservaron **302 archivos** y restauraron sus guards. La matriz incluye escritorio, laptop, tablet, móvil 320/375 px, paisaje, textos largos/al 200 %, fuentes bloqueadas y movimiento normal/reducido. Sin errores JS, desbordamiento de página/reproductor ni texto numérico fuera de su caja; foco visible y bajo la cabecera. Capturas de móvil y texto ampliado inspeccionadas. Los tres E2E nuevos dejan **63 casos por motor en 15 archivos**, comprobados con `--list`; no se ejecutaron completos ni se repitieron las 414 unitarias históricas. WebKit en Windows no acredita Safari real.

El cierre documental pasó comprobación de 108 enlaces locales en 17 documentos, sin enlaces rotos, y `git diff --check`.

Evidencia ignorada en `.git/codex-checkpoints/ui-player-20261102/` y `.git/codex-checkpoints/ui-player-20261105/`; no viaja con Git. El inspector pendiente del checkpoint se ejecutó al retomar. Se conservan el reporte inicial del fallo de foco y los logs de medición previa; la validación final corresponde al ajuste completo. Se usaron perfiles y WAV sintéticos aislados, sin alterar datos habituales. El aviso conocido de `THREE.Clock` sigue fuera de este bloque.

Reproducción con remoto desactivado y archivos/documentos congelados durante cada runner, por separado:

```powershell
$env:VITE_REMOTE_CONTENT_ENABLED = 'false'
$env:VITE_BASE = '/'
npm.cmd run typecheck
npm.cmd test -- src/__tests__/AudioPlayback.test.tsx
npm.cmd run build
npm.cmd run test:e2e -- player.spec.ts local-audio.spec.ts --grep "Reproductor:|audio real local"
npm.cmd run test:e2e:cross-browser -- player.spec.ts
npm.cmd run test:e2e:preview
```

**Siguiente: Propuesta (`pregunta-oficial`, escena Inicio), sin iniciar.** Mantener una sección a la vez, todo local, sin Supabase ni despliegues y las restricciones de uso normal.

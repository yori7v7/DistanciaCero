# Pulido de interfaz por secciones

Etapa autorizada el 31 de octubre de 2026, después de cerrar la [validación integral local](VALIDACION_INTEGRAL_LOCAL.md). Trabajar una sección a la vez, cerrar su revisión y pruebas antes de iniciar la siguiente. Mantener la plantilla reutilizable, el modo local, Supabase desactivado y sin despliegues. Se conserva la condición de uso normal: sin cambios de modelo/modalidad, reserva, compras ni resets.

## Orden inicial

1. **Bienvenida pública (`/`, `PublicLanding`) — cerrada el 31 de octubre.** Skills `ui-ux-pro-max` y `web-design-guidelines`; se conservan paleta, tipografías y fondo cósmico existentes.
2. **Portada principal (`/app`, `Hero`) — cerrada el 1 de noviembre.** Es una sección distinta de la bienvenida pública.
3. **Navegación de escenas — siguiente, sin iniciar.** El reproductor se revisará después, como bloque separado.
4. Continuar las secciones de la experiencia en el orden de navegación; registrar el bloque concreto antes de tocarlo. No supone añadir funciones ni rediseñar todo simultáneamente.

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

**Siguiente: navegación de escenas, sin iniciar.** El reproductor va después. No se rediseñaron esos controles ni otras secciones. Se mantienen las restricciones locales, de infraestructura y de uso; WebKit en Windows no acredita Safari real. Recibir también la entrega documental de cierre; el hash final y su push se comprueban al guardar.

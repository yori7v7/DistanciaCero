# Pulido de interfaz por secciones

Etapa autorizada el 31 de octubre de 2026, después de cerrar la [validación integral local](VALIDACION_INTEGRAL_LOCAL.md). Trabajar una sección a la vez, cerrar su revisión y pruebas antes de iniciar la siguiente. Mantener la plantilla reutilizable, el modo local, Supabase desactivado y sin despliegues. Se conserva la condición de uso normal: sin cambios de modelo/modalidad, reserva, compras ni resets.

## Orden inicial

1. **Bienvenida pública (`/`, `PublicLanding`) — cerrada el 31 de octubre.** Skills `ui-ux-pro-max` y `web-design-guidelines`; se conservan paleta, tipografías y fondo cósmico existentes.
2. **Portada principal (`/app`, `Hero`) — siguiente, sin iniciar.** Es una sección distinta de la bienvenida pública.
3. Navegación de escenas y reproductor: revisar cada control como bloque separado antes del resto de escenas.
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

Los reportes finales tienen cero omitidas, fallos, inestables, reintentos y errores externos. Los cuatro supervisores conservaron los **300 archivos observados** y restauraron sus guards. No se repitieron las 414 unitarias ni las suites completas históricas; esos resultados conservan sus fechas. El inventario actual es de 55 casos de desarrollo por motor, no una suite completa ejecutada en este bloque.

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

**Siguiente: Hero**, sin iniciar. Recibir también el commit documental de cierre antes de continuar desde otro equipo; el hash final y su envío se comprueban al entregar. Mantener el orden y todas las restricciones locales y de uso.

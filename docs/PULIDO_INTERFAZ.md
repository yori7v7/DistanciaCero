# Pulido de interfaz por secciones

Etapa autorizada el 31 de octubre de 2026, después de cerrar la [validación integral local](VALIDACION_INTEGRAL_LOCAL.md). Trabajar una sección a la vez, cerrar su revisión y pruebas antes de iniciar la siguiente. Mantener la plantilla reutilizable, el modo local, Supabase desactivado y sin despliegues. Se conserva la condición de uso normal: sin cambios de modelo/modalidad, reserva, compras ni resets.

## Orden inicial

1. **Bienvenida pública (`/`, `PublicLanding`) — en validación.** Skills `ui-ux-pro-max` y `web-design-guidelines`. Mantener paleta, tipografías y fondo cósmico existentes.
2. **Portada principal (`/app`, `Hero`) — siguiente, sin iniciar.** Es una sección distinta de la bienvenida pública.
3. Navegación de escenas y reproductor: revisar cada control como bloque separado antes del resto de escenas.
4. Continuar las secciones de la experiencia en el orden de navegación; registrar el bloque concreto antes de tocarlo. No supone añadir funciones ni rediseñar todo simultáneamente.

## Bienvenida — alcance y recuperación

Baseline `9aa4703`, rama compartida limpia y sin divergencia tras fetch. Capturas iniciales confirmaron 40 px de scroll innecesario y un ancho de 1165 px para títulos/nombres válidos largos en un viewport de 320 px. La plantilla mostraba un título incompleto y un corazón entre nombres vacíos. El texto auxiliar necesitaba más contraste.

Los cambios conservan la configuración: título de respaldo «nuestro universo» solo en la bienvenida cuando no hay destinatario, nombre compartido si no hay nombres individuales, descripción existente, controles accesibles y footer dentro del layout. Los nombres/títulos largos se ajustan sin truncar. Se reserva altura para las frases y se permite pausar animaciones; movimiento reducido del sistema las mantiene detenidas. No se añaden datos personales ni almacenamiento.

Evidencia temporal en `.git/codex-checkpoints/ui-landing-20261031/`; no viaja con Git. Capturas posteriores comprobaron escritorio, móvil, tablet, paisaje y texto al 200 %, incluidos nombres de 80 caracteres. El scroll vertical continúa disponible cuando el contenido realmente lo necesita. Tipos y compilación aprobados. Chromium final aprobó 5/5 en 23,4 s. WebKit aprobó cuatro casos, pero detectó un desplazamiento de 8,05 px del CTA al cambiar la frase; los cinco casos Firefox no se iniciaron al detenerse la cadena. El bloque sigue abierto: investigar ese desplazamiento sin retirar la aserción, repetir los casos afectados y revisar las capturas con movimiento normal antes del cierre. Los intentos previos detectaron medición antes de cargar fuentes y 15 px de scroll en pantalla baja; se ajustaron la espera y el espaciado. No se repitieron unitarias ni las suites completas históricas. No dar por cerrado el bloque hasta inspeccionar sus reportes y capturas finales.

## Checkpoint de uso — 31 de octubre

Se guarda el avance por proximidad al límite de uso normal (97 % consumido al comprobarlo), sin cambiar modelo ni usar reserva, compras o resets. No iniciar Hero. Revisiones estáticas sin hallazgos adicionales; la validación visual/interacción continúa pendiente de lo anterior. Comprobar uso, remoto y runners al retomar.

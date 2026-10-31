# Validación integral local

Etapa autorizada el 28 de octubre de 2026 después de cerrar los tres bloques anteriores. El usuario pidió corregir, verificar y revisar lo necesario antes de pasar al pulido particular con skills. Se mantiene una plantilla reutilizable sin datos personales, sin activar Supabase ni desplegar.

## Alcance

- Revisión focalizada de ajustes, guía, respaldos, recursos y audio. Corregir solo defectos reproducibles.
- Comprobar tipos, referencias, unitarias y compilación con remoto desactivado.
- Ejecutar una corrida completa de los 53 casos de desarrollo Chromium tras los cambios recientes.
- Comprobar los siete recorridos afectados por motor en Firefox/WebKit: ajustes, guía, plantilla, dos de audio y dos CRUD de música. Son 14 casos, no la suite completa de 106.
- Comprobar preview/offline y actualización PWA A→B incluyendo los ajustes generales guardados. Perfiles y datos sintéticos aislados.

## Estado inicial

Baseline `5f009d2`, rama `codex/compatibilidad-navegadores`, limpio y coincidente con origin al comenzar. La revisión de datos no encontró defectos adicionales. La revisión de flujos detectó una pista activa que quedaba sin control al retirarse su fila.

## Cierre — 31 de octubre de 2026

**Etapa terminada**, implementación y pruebas en `4e9a036`. La playlist detiene o cancela la pista si su fila desaparece por borrado, ocultación o sustitución del contenido importado. Editar una fila existente conserva su control; una selección pendiente válida tiene prioridad sobre la anterior. Cambiar de escena sigue permitiendo que la canción continúe.

Tres regresiones unitarias cubren la desaparición de la pista actual o pendiente y la conservación de selecciones válidas. El recorrido de audio real borra la canción mientras suena desde el CMS, comprueba que se detenga, vuelve a crearla y la reproduce. A→B guarda nombres y título desde el formulario y compara los ajustes antes/después; tanto ese recorrido como preview verifican el título sin conexión. Las revisiones independientes de datos y del cambio final no dejaron hallazgos accionables.

| Comprobación | Fecha | Resultado | Duración del reporte |
| --- | --- | --- | --- |
| `verify-final`: tipos, recursos, unitarias y build/PWA | 28 de octubre | **414/414 unitarias, 29 archivos**; auditor con 0 errores y 25 campos vacíos intencionales | Unitarias: 141,37 s |
| `chromium-full`: desarrollo completo | 31 de octubre | **53/53** | 1307,86 s |
| `cross-recent`: siete flujos por motor, WebKit y Firefox en Windows | 31 de octubre | **14/14** | 656,24 s |
| `preview-offline`: build, recarga y navegación sin conexión | 31 de octubre | **1/1** | 18,38 s |
| `pwa-update-settings-settled`: dos builds locales A→B y B offline | 31 de octubre | **1/1** | 40,56 s |

Son corridas distintas; no se suman para afirmar una suite única ni los 106 casos completos de Firefox/WebKit. Los cuatro reportes finales de navegador tienen cero omitidas, fallos, casos inestables, reintentos y errores externos. Todos los supervisores finales conservaron los hashes de los **299 archivos observados** y restauraron la solicitud temporal contra suspensión. No se modificó el almacenamiento real del usuario.

El cierre documental pasó revisión independiente, `git diff --check` y comprobación de **90 enlaces locales en 16 documentos**, sin enlaces rotos. Al terminar no quedaban runners propios activos; los documentos se actualizaron después de las pruebas.

## Recuperación — 31 de octubre de 2026

El supervisor del 28 quedó interrumpido durante Chromium: el log conserva 16 casos aprobados, sin reporte final ni procesos activos al retomar. No cuenta como suite terminada. Tipos, recursos, 414 unitarias en 29 archivos y build/PWA sí terminaron correctamente; también aprobó el caso aislado de audio después de acotar el selector del menú del CMS.

El primer intento aislado del 28 falló porque el selector global del CMS también encontraba los avisos de canciones sin fuente. Se limitó al menú de ajustes. El primer intento A→B del 31 falló al recoger `cachePaths()` durante la recarga automática: `Execution context was destroyed`. Se movió ese diagnóstico detrás de las comprobaciones del documento B y su nuevo `timeOrigin`, sin quitar aserciones ni forzar recarga, activación o limpieza de cachés. Solo se repitió A→B después de ese ajuste del harness y aprobó. No fue un reintento automático de Playwright.

Se conservaron los intentos originales y sus diagnósticos en `.git/codex-checkpoints/final-local-20261028/` y `.git/codex-checkpoints/final-local-20261031/`. Incluyen estados, reportes JSON, logs, hashes, trazas y artefactos; no viajan con Git. El coordinador original del 31 conserva su salida fallida; el resultado final de A→B está en `pwa-update-settings-settled`, por separado. Los archivos de aplicación y unitarias coinciden con la verificación del 28; los cambios posteriores fueron el selector E2E, el orden del diagnóstico PWA y documentación.

## Reproducción

Con dependencias y motores del lockfile instalados, ejecutar en PowerShell, una suite a la vez y con fuentes/documentos congelados durante los runners:

```powershell
$env:VITE_REMOTE_CONTENT_ENABLED = 'false'
$env:VITE_BASE = '/'
npm.cmd run verify:local
npm.cmd run test:e2e
npm.cmd run test:e2e:cross-browser -- setup-guide.spec.ts site-settings.spec.ts template-resources.spec.ts local-audio.spec.ts content-crud.spec.ts --grep "guía|ajustes|plantilla|audio real local|archivo de playlist|Música"
npm.cmd run test:e2e:preview
npm.cmd run test:e2e:pwa-update
```

Los runners locales se detuvieron ante el primer fallo y no usaron reintentos. El caso A→B genera dos builds propios en el mismo origen; no publica el proyecto ni modifica `src` o el `dist` del usuario. Preview usa el build generado por `verify:local`. El inventario permanece en 53 casos de desarrollo por motor.

## Límites y siguiente etapa

Safari/macOS/iPhone requiere equipo real; el usuario solo dispone de Windows. Clock y el loop nativo WebKit conservan sus límites documentados. Los recursos vacíos son opciones pendientes de una plantilla reutilizable, no archivos que deban inventarse. No se repitió la instalación standalone de Chrome comprobada el 25 ni se garantiza conservar formularios sin guardar al actualizar.

El alcance funcional y de validación queda cerrado. La siguiente etapa es concretar el pulido particular con skills sobre la experiencia existente. Mantener modo local, sin activar Supabase, desplegar, cambiar modelo/modalidad ni usar reserva, compras o resets. Sincronización y entrega en [TRABAJO_ENTRE_EQUIPOS.md](TRABAJO_ENTRE_EQUIPOS.md); resultados históricos en [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md).

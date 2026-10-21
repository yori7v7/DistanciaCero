# Avance del pulido local

## Estado actual

- Retoma en laptop, **20 de octubre de 2026**: recibida la rama publicada en `3be83c1`, árbol limpio y remoto sin divergencia. Nueva corrida completa: **50 WebKit aprobadas / 1 Firefox fallida al arrancar / 49 sin ejecutar**, salida 1. Instalación Firefox aislada y caso CMS **1/1** aprobados después; queda pendiente repetir y completar los 100. Detalles al final; la compatibilidad sigue abierta.
- Último paso completado: **7 — entregar una base local verificada**, cerrado el 10 de octubre de 2026. **Los siete pasos del plan están terminados.**
- Verificación final: TypeScript sin errores, **338/338 unitarias en 22 archivos**, build/PWA aprobado, **50/50 E2E en una única corrida y 1/1 preview/offline**, sin omitidas, inestables ni reintentos. Incluye diez casos de interfaz y cinco tamaños en Chromium.
- Revisión visual y mediciones del paso 5: 60 capturas y nueve ventanas sin fallos ni errores JS. No se cambiaron los estilos en el paso 7; se corrigió el scroll y se volvieron a comprobar los controles/foco en los cinco tamaños. Los registros antiguos de 44/49 y 47/49 se conservan como evidencia histórica, sin sumarlos al resultado final.
- Recuperación final: `.git/codex-checkpoints/paso-7-cerrado-20261010/`, con copias, hashes y diff del working tree. Resultados en `.git/codex-checkpoints/paso-7-validacion-final-20261010/`. No restaurar automáticamente las copias ni aplicar el stash histórico.
- Cierre en Git local del 12 de octubre: rama `codex/cierre-pulido-local`, con commits separados para skills, código/pruebas y documentación. `main`, `origin/main` y el stash histórico se preservan; consultar el registro al final. No se realizó push.
- Bloque posterior autorizado el 12 de octubre: **compatibilidad local con Firefox y WebKit, en curso** en `codex/compatibilidad-navegadores`. No forma parte de los siete pasos ya cerrados. Antes de continuar, consultar el registro de compatibilidad al final y los resultados guardados; no declarar aprobadas las pruebas aún pendientes.
- Alcance autorizado: ejecutar el plan en orden. Sin activar Supabase, desplegar ni añadir funciones nuevas.
- Condición de uso: detenerse si se agota la modalidad normal/premium. No cambiar modelo, activar reserva, comprar créditos ni consumir resets. Uso ordinario permitido al retomar el 10 de octubre: 97% restante en cinco horas y 99% semanal. No se confirma Flash por separado.

## Punto de recuperación inicial

Antes de editar se guardaron copias de los archivos del refactor, documentos de control, hashes SHA-256 y el diff inicial en:

`.git/codex-checkpoints/paso-1-inicio-20260913T232004Z/`

Referencia: `0c1e46f0d42143409a037a78ff75ed1fb0f25f21`. El working tree ya tenía cambios de Claude y documentación sin commit. `src/repositories/contentRepository.ts` ya estaba eliminado. No restaurar automáticamente el checkpoint: sirve para comparar y recuperar archivos concretos si hace falta. No aplicar el stash histórico.

## Trabajo completado del paso 1

- [x] Completar tipos y comportamiento del lector compartido y sus dos wrappers.
- [x] Corregir sincronización de simulación/progreso entre CMS, lectores y estadísticas sin remontar el CMS.
- [x] Revisar el resto del diff iniciado: audio externo, navegación de salida, repositorio y React Router.
- [x] Añadir y ejecutar pruebas de regresión pertinentes.
- [x] Ejecutar TypeScript, suite unitaria y build; comprobar el flujo integrado en navegador.
- [x] Actualizar TODO y documentación afectada; registrar resultados y cierre.

## Cómo retomar

Leer este archivo, `git status` y el diff actual. Comparar con el checkpoint para distinguir el trabajo previo. Revisar los resultados registrados antes de repetir comprobaciones. La información general y los problemas de pasos posteriores permanecen en [CONTEXTO_PROYECTO_CODEX.md](CONTEXTO_PROYECTO_CODEX.md) y [PLAN_PULIDO_LOCAL.md](PLAN_PULIDO_LOCAL.md).

## Registro de avance — 19 de septiembre (anteriores al cierre)

- Implementados tipos `LetterContent`, lector común y wrappers tipados; progreso notificado a CMS; cierre al volver a bloquear o reiniciar lectura; limpieza de temporizadores y listeners.
- El CMS actualiza simulación/estadísticas sin cambiar la key del formulario. Conserva borradores y foco.
- Se conservaron los cambios previos de enlaces HTTP(S), React Router y acceso directo al repositorio local. Corregido el comentario de navegación: salir de `/app` desmonta AuthGate/AudioProvider; la landing no contiene AuthGate.
- TypeScript pasó sin errores al retomar.
- Pruebas nuevas: **22/22 aprobadas** (16 de cartas/CMS y 6 de enlaces de audio), 21,74 s. Antes de corregir el código se reprodujeron cinco fallos con estas pruebas. Una ejecución intermedia se detuvo para acotar consultas de Testing Library a los controles pertinentes del CMS; no cuenta como validación completa.
- Revisión estática independiente sin defectos concretos; se añadió el caso de reset con carta desbloqueada que faltaba.
- Pendiente para cerrar: suite unitaria completa, build, prueba integrada nueva de Playwright, revisión final y actualización de estados/documentación.
- La sesión anterior de la suite completa ya no está disponible y no se da por aprobada. Las comprobaciones finales se guardan ahora en `.git/codex-checkpoints/paso-1-validacion-20260919/`: un `.log` y un `.json` con comando, fechas y código de salida por comprobación. Revisar esos archivos al retomar; `state: running` no acredita un resultado.
- Validación completa recuperable: TypeScript **0 errores**, suite unitaria **184/184 en 13 archivos**, 92,90 s, código de salida 0. El build y la verificación de navegador siguen pendientes de cierre.

## Cierre del paso 1

| Comprobación | Resultado final |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit` | 0 errores; salida 0 |
| `node node_modules/vitest/vitest.mjs run --pool=threads --maxWorkers=1 --no-file-parallelism` | 184/184 pruebas, 13 archivos, 92,90 s; salida 0 |
| `node node_modules/vite/bin/vite.js build` | Build y PWA aprobados; salida 0 |
| `node node_modules/@playwright/test/cli.js test --reporter=list` | 13/13 E2E, Chromium, 1,2 min; salida 0, sin reintentos |
| Revisión del diff y documentación afectada | Sin problemas de whitespace; enlaces de seguimiento verificados |

El recorrido E2E nuevo utiliza fixtures sintéticas, abre ambas clases de cartas desde la UI, alterna simulación, comprueba estadísticas, reinicia progreso sin borrar contenido y verifica persistencia e independencia de lectura tras recargar. No hubo errores JavaScript ni solicitudes detectadas a Supabase en ese recorrido. Se usó el Playwright existente del proyecto; `agent-browser` no está instalado. Los perfiles y datos del navegador del usuario no se usaron.

Los logs, códigos de salida y la captura inspeccionada se conservan en `.git/codex-checkpoints/paso-1-validacion-20260919/`. El directorio `e2e-results/letters-refactor-lectores--14b8d-n-recargar-ni-borrar-cartas-chromium/` contiene `cartas-refactor.png`.

Punto de recuperación final: `.git/codex-checkpoints/paso-1-cerrado-20260919/`, con copias de los archivos del paso, diff y manifest de hashes. Permite comparar el código validado al retomar; no es una instrucción para restaurarlo automáticamente. Los cambios previos de `package.json`, `package-lock.json` y `AudioContext.tsx` se conservaron byte a byte respecto al checkpoint inicial. No se hizo commit, push, deploy, activación remota ni cambio de modelo/modalidad.

### Límites y siguiente paso

- El paso 2 sigue pendiente: coexistencia legacy/estándar, restauración de respaldos y resurrección de cartas borradas. El paso 1 no modificó esa persistencia.
- El build conserva advertencias existentes sobre tamaño de chunks e import dinámico ineficaz del servicio remoto. Se revisarán en las fases correspondientes.
- La captura confirma el lector y sus estados. Se siguen observando superposiciones del reproductor/navegación; su pulido corresponde al paso 5, no a una regresión corregida en este bloque.
- No se probó login/logout remoto. El cambio previo de navegación se revisó estáticamente y las rutas locales pasaron E2E.
- README, memoria histórica y documentación general aún necesitan la revisión integral del paso 6; aquí se actualizaron el contrato y las instrucciones afectados por el refactor.

Al retomar, comprobar el estado de Git y los hashes antes de reutilizar esta validación. La siguiente tarea concreta es resolver el almacenamiento de cartas y sus respaldos según el paso 2 del plan.

## Registro del paso 2 — antes del cierre

- Inicio: 19 de septiembre, 17:27 (México). Uso normal permitido; 99% restante en cinco horas, 37% semanal. No cambiar modelo/modalidad si se agota.
- Se verificaron los hashes del cierre del paso 1. Checkpoint previo al paso 2: `.git/codex-checkpoints/paso-2-inicio-20260919/`.
- Alcance: fuente estándar para cartas con compatibilidad legacy; respaldos v1/v2 completos o parciales; validación antes de escribir; errores de almacenamiento visibles; actualización del CMS y recorridos reales de las nueve colecciones.
- Trabajo paralelo acotado: prueba `e2e/content-crud.spec.ts` de formularios reales y revisión de compatibilidad del almacenamiento. La implementación principal permanece en este task.
- Pendiente: implementación, pruebas de regresión, matriz E2E, TypeScript/build y documentación. Este paso aún no está cerrado.

### Recuperación del 26 de septiembre de 2026

- Implementados, aún pendientes de validación completa: unión legacy/estándar con marcador v2; escrituras de contenido que reportan errores y restauración con rollback; validador de respaldos v1/v2 y nueva integración de BackupPanel; avisos/validación de formularios, actualización por eventos y detalle actualizado de galería.
- La unión inicial conserva las cartas actualmente visibles incluso si existe el marcador v1; gana la versión estándar por ID. Las claves antiguas se conservan como archivo y dejan de leerse tras v2. No es posible distinguir borrados históricos de importaciones posteriores a v1 solo con esas claves.
- TypeScript pasó tras integrar BackupPanel el 26 de septiembre. La primera corrida del hook aprobó sus 31 casos pero también encontró copias de tests dentro de `.git`; no se considera suite completa aprobada. Usar `--exclude '**/.git/**'` al validar.
- La corrida E2E del 24 quedó incompleta y recibió cambios HMR durante las pruebas. No acredita la matriz. Registros nuevos en `.git/codex-checkpoints/paso-2-validacion-20260926/`; solo `finished` con salida 0 confirma una comprobación.
- Dos agentes se detuvieron por límite de uso. Tras el nuevo «prosigue», la consulta confirmó uso ordinario permitido: 98% restante en cinco horas, 82% semanal. No se cambió modelo/modalidad ni se consumió un reset.
- Siguiente: validar almacenamiento/respaldos y formularios reales, corregir fallos, suite completa/build y actualizar contrato/guía antes de cerrar el paso 2. Pasos 3–7 pendientes.

### Recuperación del 27 de septiembre de 2026

- Uso ordinario permitido al retomar: 97% restante en cinco horas, 65% semanal. Se mantiene el mismo modelo/modalidad.
- Resultados recuperados del 26: suite de almacenamiento/respaldos **49/49** aprobada; suite completa **245/246** (un timeout a los 5 s en integración CMS/cartas); E2E **13/23** (nueve creaciones fallaron y un recorrido v1 necesitó revisión). Estos fallos impiden dar el paso por terminado.
- Causa de las nueve creaciones: una regla CSS heredada ocultaba el formulario dentro de «Tus creaciones», aunque el panel sí era visible. Se retiró esa regla del flujo antiguo de tres acciones; el actual tiene dos.
- Añadida actualización de Razones por evento `all`, incluido el detalle abierto; prueba de regresión aprobada en la suite anterior. Galería también deriva el detalle de los datos actuales.
- Completada documentación del formato, precedencia, alcance multimedia y recuperación de errores en el contrato, CLAUDE y guía de edición. Añadida validación de campos alternativos de historia antigua.
- Verificación actual en `.git/codex-checkpoints/paso-2-validacion-20260927/`. TypeScript: salida 0. Pendientes los resultados finales de unitarias, build y recorridos corregidos.

## Cierre del paso 2 — 29 de septiembre de 2026

- [x] Unificar cartas legacy/estándar con precedencia y migración v2 documentadas; las copias archivadas no reaparecen después de borrar/restaurar.
- [x] Restaurar respaldos v1/v2 por reemplazo, conservando apartados ausentes, IDs y metadata; distinguir ausencia de vacíos explícitos.
- [x] Validar el archivo completo antes de modificar datos y recuperar escrituras previas ante errores capturados. Avisar si también falla la recuperación.
- [x] Mostrar errores de persistencia/validación conservando el borrador. Refrescar CMS, Razones y detalles de galería con los datos actuales.
- [x] Corregir los contadores de originales y la regla CSS antigua que ocultaba los formularios de «Tus creaciones».
- [x] Documentar respaldo, límites de multimedia/progreso y migración en contrato, guía y CLAUDE. Actualizar TODO y plan.

| Comprobación | Resultado final |
| --- | --- |
| TypeScript | 0 errores; salida 0 |
| Vitest, `--pool=threads --maxWorkers=1 --no-file-parallelism` | 251/251, 15 archivos, 75,47 s; salida 0 |
| Build Vite + PWA | Aprobado; salida 0; service worker y precache generados |
| Playwright, Chromium, un worker | 36/36, 17,1 min; salida 0; sin omitidas, inestables ni reintentos |
| Revisión de diff y captura | Formulario de creación visible; sin errores de whitespace |

Los 36 E2E incluyen 18 recorridos CRUD reales (crear/editar/borrar creaciones y editar/ocultar/mostrar/restaurar originales en cada una de las nueve colecciones), cinco recorridos de respaldos con archivos y descargas reales, y las 13 pruebas anteriores. Se verificó persistencia después de recargar y actualización de contenido sin recarga. Los respaldos cubren ida/vuelta, reemplazo del mismo ID, v1/v2 parciales, datos inválidos y fallo de cuota con reversión.

La captura `full-results/content-crud-Contenido-loc-65ac3-iste-y-actualiza-su-sección-chromium/cms-creacion-visible.png` dentro del directorio de validación fue inspeccionada. El error del recorrido v1 era una espera incompleta del test: ahora espera módulo/pestaña activos y panel visible. El timeout unitario anterior no se repitió; se conservaron los timeouts existentes.

Se recuperaron los estados finales y el reporter JSON el 29; ningún archivo de código/pruebas tenía modificaciones posteriores al cierre de la ejecución E2E. El wrapper de registro del build falló al imprimir caracteres Unicode en la terminal después de guardar el resultado: el comando Vite terminó con salida 0 y su log confirma PWA; no se confunde ese error de impresión con un fallo de compilación.

### Límites y recuperación

- Verificado en Chromium de escritorio con datos sintéticos y perfiles aislados; las nuevas pruebas bloquean solicitudes externas. No se tocó el almacenamiento real del usuario.
- El recorrido de música comprueba contenido; reproducción y coordinación de audio corresponden al paso 3. El modal de Razones se verifica con su prueba unitaria; su E2E comprueba el corazón por título.
- localStorage no ofrece transacciones frente a cierre abrupto o escrituras concurrentes entre pestañas. El rollback cubre fallos capturados; si falla la recuperación se indica expresamente.
- Continúan los avisos existentes de chunks grandes, import dinámico ineficaz del servicio remoto y deprecación de `THREE.Clock`. La superposición del reproductor requiere el pulido visual del paso 5.
- No hubo commit, push, despliegue ni activación de Supabase. El checkpoint final conserva archivos, hashes SHA-256 y diff. No restaurarlo automáticamente: comparar antes de recuperar archivos concretos.

Al retomar: comprobar Git y el manifest del cierre; comenzar el paso 3 del plan. No repetir todas las pruebas ya aprobadas salvo cambios, fallos o evidencia nueva.

## Paso 3 — inicio del 29 de septiembre de 2026

- Se comprobaron todos los hashes del cierre del paso 2: sin diferencias. Checkpoint previo: `.git/codex-checkpoints/paso-3-inicio-20260929/`, 13 archivos de navegación/audio/configuración y seguimiento.
- Uso ordinario permitido al iniciar: 31% restante en cinco horas y 38% semanal. No cambiar modelo/modalidad ni consumir reservas/reset si se agota.
- Alcance: navegación completa y hashes, coordinación audio de escena/playlist, errores y rutas multimedia, desmontaje, preview/PWA y límites offline. No desplegar ni activar servicios remotos.
- Pendiente: reproducir problemas, implementar correcciones con pruebas, comprobar desarrollo/preview y documentar resultados. El paso 3 aún no está cerrado.

### Reanudación del 1 de octubre

- Uso ordinario permitido: 95% restante en cinco horas, 32% semanal. Se retoma con el modelo/modalidad configurados por el usuario; no se solicitó un cambio ni se usaron reservas/reset.
- Navegación: reproducidos y corregidos el historial sustituido en cada cambio de escena y scrolls ejecutados tras desmontar. Pruebas nuevas de historial, hash/ajustes y limpieza: **3/3** aprobadas. La primera ejecución de la prueba necesitó un mock de `scrollIntoView` ausente en jsdom; la segunda reprodujo los dos fallos reales, registrada como `navigation-before-valid`.
- Implementación de audio en curso en un subbloque acotado. Problema confirmado: el reproductor de escenas solo pausaba audios del DOM, mientras playlist/ambiente usan elementos creados fuera del DOM; también existen transiciones pendientes tras pausar.
- Preparadas pruebas de navegador `local-flow.spec.ts`, `local-audio.spec.ts` (WAV sintético y datos interceptados solo en contexto de prueba) y `local-preview.spec.ts` con configuración separada de preview. Todavía no cuentan como aprobadas.
- Registros de este bloque: `.git/codex-checkpoints/paso-3-validacion-20261001/`. TypeScript y validación integrada pendientes de ejecutar tras terminar audio. Pasos 4–7 pendientes.
- Preparada la coordinación de audio para incluir elementos fuera del DOM y cancelar solicitudes anteriores; su implementación y pruebas siguen en revisión. Los mensajes de error/estado de AudioContext ahora se muestran en Hero y Playlist, donde antes no se leían.
- La prueba de preview comprueba offline sobre el build actual; no se debe afirmar que ya se probó una actualización entre releases. El alcance previsto y comandos están en `docs/RECORRIDOS_LOCALES.md`.

### Validación integrada del 1 de octubre — en curso

- Audio enfocado: 40/40 casos aprobados. Suite integrada anterior al último ajuste: 288/288 en 17 archivos, 65,10 s. TypeScript aprobado.
- La revisión encontró una canción pendiente sin cancelación desde UI: ahora `pendingTrack` permite detenerla desde su fila y muestra carga sin anunciar reproducción. Prueba de UI incluida: 35/35 casos de AudioPlayback aprobados; revisión de la corrección sin hallazgos adicionales.
- Primer E2E: los imports JSON de las pruebas necesitaban lectura compatible con Node ESM. Tras corregirlos, hubo un error de espera de escena en audio y dos fallos de navegación. Audio ahora espera el nombre actualizado antes de reproducir.
- El hash desconocido permanecía en la URL sin normalizar. La escena ahora deriva directamente de la ubicación, sin un estado duplicado sincronizado mediante efecto; la normalización tiene su propio efecto. Navegación enfocada: 4/4 aprobadas, incluido ese caso.
- Recorridos nuevos de audio real ya aprobados en la ejecución actual; navegación completa, suite final, build/PWA, preview y regresión completa siguen pendientes. Consultar JSON y logs antes de reanudar o repetir pruebas.
- Navegación completa y hashes: **2/2 E2E aprobados**, con todas las escenas y ajustes/recarga. El router instalado difería sus cambios mediante `startTransition`; configurar `useTransitions={false}` permitió aprobar el recorrido conservando las esperas. Se mantuvo la derivación de escena desde la URL y la normalización independiente.
- Verificación final preparada en `run-final.py`: TypeScript, unitarias, build, preview y 40 E2E, en secuencia; se detiene en el primer fallo y guarda JSON/log/reporter. No dar el paso por cerrado sin comprobar cada resultado. Uso ordinario permitido al iniciarla: 18% restante en cinco horas y 20% semanal.
- Resultados finales ya guardados: TypeScript salida 0; **290/290 unitarias en 17 archivos**, 73,50 s; build/PWA salida 0 con 26 entradas de precache; **1/1 preview E2E**, 20,9 s, incluido registro/control de service worker y contenido local tras navegar/recargar offline. El E2E completo de 40 sigue en ejecución.
- Checkpoint de código en verificación: `.git/codex-checkpoints/paso-3-verificacion-20261001/`, 59 archivos copiados y verificados por SHA-256. No es un cierre ni se restaura automáticamente. Las capturas de navegación y preview fueron inspeccionadas; el pulido visual general permanece en el paso 5.

### Recuperación del 4 de octubre de 2026

- Los 59 archivos coinciden con el checkpoint del 1 de octubre. Uso ordinario permitido al retomar: 70% restante en cinco horas y 92% semanal; no se solicita cambio de modelo/modalidad ni reserva/reset.
- Resultado final recuperado del E2E completo: **39/40**, 15,8 min, salida 1. Pasaron los cuatro recorridos nuevos, las nueve colecciones CRUD y los demás respaldos. Falló el primer snapshot del respaldo v2: editor base de Historia oculto mientras la captura muestra Cartas + Originales activos. No hay evidencia de pérdida de datos; hace falta identificar qué cambió el módulo.
- TypeScript, 290 unitarias, build/PWA y preview offline del 1 de octubre conservan sus resultados aprobados. No repetirlos sin cambios que los afecten.
- Diagnóstico acotado del respaldo v2 con clics, estado del CMS y trace, sin editar la app ni ejecutar suites concurrentes. Nuevos registros: `.git/codex-checkpoints/paso-3-validacion-20261004/`.
- Paso 3 continúa abierto. Antes de cerrarlo: explicar/corregir el fallo, aprobar la regresión completa y guardar el cierre/documentación. Pasos 4–7 pendientes.
- Los dos diagnósticos con trace agotaron 120 s en el cuarto snapshot tras recargar; no reprodujeron el fallo original. Los tres snapshots previos de nueve colecciones, restauraciones/exportaciones y lectores pasaron. El registro reducido tiene 70 acciones, sin destinos incorrectos ni errores JS; el nodo del CMS solo cambió con la recarga prevista. La causa del cambio de módulo original permanece sin demostrar; no se atribuye a pérdida de contenido ni a scroll.
- Se retiró la instrumentación temporal conservando copias, trazas y análisis. El recorrido de respaldo ahora selecciona módulos/acciones por teclado y comprueba ambos estados después de cada selección. Tras recargar, lee las cartas y compara una exportación completa de las nueve colecciones en lugar de repetir un cuarto recorrido completo del CMS. Se conserva el timeout de 120 s y los recorridos CRUD con clics.

## Cierre del paso 3 — 4 de octubre de 2026

- [x] Landing, entrada, diez escenas, hashes directos/antiguos/desconocidos, recarga, atrás/adelante y ajustes comprobados.
- [x] Historial conservado y escena derivada del hash; cambios de navegación sin diferirse mediante `startTransition`; temporizadores de scroll cancelados al desmontar.
- [x] Coordinación exclusiva de escena/ambiente/playlist, incluidos elementos fuera del DOM; pausa, transiciones rápidas, volumen cero, carga cancelable, errores y salida comprobados.
- [x] Rutas públicas compatibles con la base configurada; enlaces externos HTTP(S); rutas vacías de plantilla y datos reales preservados.
- [x] Build, service worker y navegación/recarga offline del build actual comprobados; reglas y límites documentados en `RECORRIDOS_LOCALES.md` y guía de edición.
- [x] Regresión completa aprobada, documentación afectada y checkpoint final guardados.

| Comprobación | Resultado final |
| --- | --- |
| TypeScript, 1 de octubre | 0 errores; salida 0 |
| Unitarias, 1 de octubre | 290/290, 17 archivos, 73,50 s; salida 0 |
| Build Vite + PWA, 1 de octubre | Salida 0; worker y 26 entradas de precache generados |
| Preview/PWA, 1 de octubre | 1/1, 20,9 s; registro/control del worker, contenido persistente y navegación offline |
| E2E completo, 4 de octubre | 40/40, 15,7 min; salida 0; 0 omitidas, inestables o reintentos |
| Revisión y recuperación | Diff sin errores de whitespace; captura final inspeccionada; copias con SHA-256 |

Al retomar se comprobó el manifest: ningún archivo de producción ni prueba unitaria cambió después de la validación del 1 de octubre. Los cambios del 4 afectan el recorrido de respaldo y seguimiento; por eso se conservaron TypeScript, unitarias, build y preview aprobados y se ejecutó nuevamente la suite E2E completa. El respaldo v2 pasó dentro de esta suite en 39,8 s, conservando el límite de 120 s.

Los recorridos nuevos utilizan Chromium y datos/WAV sintéticos en perfiles aislados, con solicitudes externas bloqueadas. Se conservaron el contenido de plantilla, el almacenamiento real del usuario, el stash y los cambios previos. No hubo commit, push, despliegue ni activación de Supabase; tampoco cambio de modelo/modalidad o uso de reserva/reset por este agente.

### Límites y siguiente paso

- El cambio de módulo del primer E2E v2 no se reprodujo en los diagnósticos; su causa queda sin demostrar. Las trazas se conservan y el test final selecciona por teclado y comprueba módulo/acción juntos. La aprobación final corresponde a la suite completa, sin reintentos.
- Offline se verificó sobre un build previamente cargado, en el mismo navegador/origen; no se simuló una actualización entre dos releases ni se garantizan archivos o enlaces externos sin conexión.
- Persisten los avisos existentes de tamaño de chunks, import dinámico ineficaz y `THREE.Clock`. El pulido visual de navegación/reproductor y la revisión de rendimiento siguen en el paso 5; la documentación general, en el 6.
- Próximo bloque: **paso 4 — completar el refactor con alcance concreto**. Comparar Git y el manifest del cierre antes de comenzar. No restaurar automáticamente el checkpoint ni aplicar el stash histórico.

## Paso 4 — inicio del 4 de octubre de 2026

- Verificados los 59 archivos y sus copias del cierre del paso 3: todos coinciden por SHA-256. Rama `main`, HEAD `0c1e46f`; cambios anteriores y stash conservados.
- Checkpoint previo a editar: `.git/codex-checkpoints/paso-4-inicio-20261004/`. Registros nuevos: `.git/codex-checkpoints/paso-4-validacion-20261004/`.
- Uso ordinario permitido al iniciar: 99% restante en cinco horas y 81% semanal. No se cambia modelo/modalidad ni se solicita reserva/reset.
- Alcance: configuración y transformaciones del CMS, código sin consumidores y limpieza demostrable de efectos; comandos locales repetibles y dependencias `latest` alineadas al lockfile actual. Se conserva la fachada síncrona de contenido y los flujos validados.
- Pendiente: concretar las extracciones, comprobar sus consumidores, validar tipos/unitarias/build y recorridos del CMS afectados, revisar diff y registrar cierre. Sin Supabase, despliegues ni funciones nuevas.
- Reproducido antes de corregir: el timer de navegación del CMS desplazaba un elemento nuevo con el mismo ID después de desmontar el panel. Prueba `cms-cleanup-before`, salida 1 por la llamada inesperada a `scrollIntoView`; no fue un timeout.
- Preparados `typecheck`, `verify:local` (tipos → unitarias → build, remoto desactivado) y `test:e2e:preview`. Vitest hereda threads/un worker/secuencia desde la configuración, también al usar `npm test` y watch. CI referencia los mismos comandos de tipos y E2E; no se ejecutó GitHub Actions.
- Las cuatro declaraciones `latest` se fijaron a las versiones ya presentes: React/React DOM 19.2.6, lucide-react 1.14.0 y plugin React 6.0.1. Solo cambió la declaración raíz del lockfile; ninguna entrada instalada cambió ni se reinstalaron paquetes.
- Retirado `scripts/verify-supabase-isolation.mjs`, sin consumidores operativos y con referencias a módulos `.js`/selector eliminados y premisas de aislamiento desactualizadas. No tenía cambios locales previos: su versión íntegra se conserva en Git (`0c1e46f`), y las notas anteriores conservan el hallazgo histórico. Corregido solo el diagrama de rutas de `IDENTITY_CONTRACT.md`; la revisión general de ese documento sigue en el paso 6.
- Extraída `centro-universo/cmsCollections.ts`: schemas, datos base, etiquetas/iconos, prefijos, IDs y transformaciones, con conversiones compartidas de cartas. Centro conserva nueve hooks explícitos y nueve paneles montados; reúne carga/reset/estadísticas/subida de imagen y retira derivados, filtros, avisos y dispatch sin consumidores. Las notificaciones activas siguen usando `contentService`.
- Comparación independiente con AST: **93 comprobaciones sin diferencias** en campos, etiquetas, IDs, opciones, datos, transformaciones y orden de hooks/selectores/paneles. El lector común ya tiene responsabilidades cohesionadas; no se dividió más ni se alteraron los controladores/audio o la fachada de contenido.
- Navegación del CMS: timer cancelado al desmontar o cambiar destino/módulo/acción/filtro. Dos regresiones nuevas cubren desmontaje, último destino y cancelación al seleccionar otro módulo/acción. Tipo de campo CRUD acotado a las cuatro variantes utilizadas; fixture existente anotado.
- Primera ejecución del comando integrado: se detuvo en TypeScript por usar `exact` en consultas `getByRole` de las pruebas nuevas (esa opción no existe en Testing Library). Retirada la opción; nueva ejecución `verify-local-integrado` en curso. El fallo y log anteriores se conservan; todavía no acreditan el cierre.
- `verify-local-integrado`: TypeScript aprobado, **291/292 unitarias**. La regresión nueva de navegación agotó 5 s: sus consultas buscaban botones en todo el CMS (18 formularios) y tardaron 24,9 s. Se acotaron a los dos grupos de selectores, manteniendo las acciones/asserts y el timeout. `verify-local-final` vuelve a ejecutar el comando integrado; build/E2E siguen pendientes.
- Revisión independiente del CMS/configuración y del bloque de comandos sin hallazgos demostrables. Son revisiones de código, no sustituyen las pruebas. Uso ordinario aún permitido antes de validar: 33% restante en cinco horas y 71% semanal.
- `npm run verify:local` final aprobado, salida 0: TypeScript sin errores, **292/292 unitarias en 17 archivos** (56,33 s) y build/PWA (26 entradas de precache). Los nuevos casos pasan conservando los 5 s. Registros `verify-local-final.json/.log`; advertencias existentes de chunks/import dinámico conservadas y aviso de tiempos del plugin de resolución, sin fallo de build.
- En curso: `npm run test:e2e -- e2e/content-crud.spec.ts e2e/content-backup.spec.ts e2e/letters-refactor.spec.ts` (24 recorridos, sin reintentos). No editar código/configuración mientras se ejecuta. Pendientes preview/PWA, resultado E2E, documentación y checkpoint de cierre. La suite completa general de 40 se reserva para el paso 7 si no aparece evidencia que justifique ampliarla aquí.
- Primera corrida de navegador: **23/24**, salida 1, 11,3 min. Pasaron los 18 CRUD, cuatro respaldos y simulación/reset. El v2 completó sus tres snapshots/restauraciones/exportaciones, pero el contador registró una solicitud de navegación cuando esperaba cero. Es un fallo distinto al cambio de módulo del paso 3; la primera ejecución no registraba la URL, así que no se conoce su origen.
- Diagnóstico v2: **1/1**, 49,6 s; sin solicitudes de navegación, `performance.timeOrigin` idéntico y mismo nodo CMS conectado. No acredita por sí solo la suite. Conservada la prueba de cero solicitudes, ahora con sus URLs en el resultado, y añadidos asserts explícitos de documento/nodo CMS conservados. El timeout y reintentos siguen iguales. Ningún código de app cambió tras tipos/unitarias/build aprobados.
- Preparada corrida final de los 24 y preview/PWA secuenciales; se detiene antes del preview si falla el CMS. Uso ordinario permitido antes del diagnóstico: 14% restante en cinco horas y 68% semanal; no cambiar modalidad ni consumir reservas/reset.

## Cierre del paso 4 — 4 de octubre de 2026

- [x] Reunir configuración de las nueve colecciones, compartir transformaciones de cartas y mantener hooks explícitos/paneles montados. Cada extracción reduce duplicación sin cambiar campos, IDs, etiquetas, datos o contratos.
- [x] Reunir estadísticas, carga, reset y subida de imágenes; retirar variables, filtros y funciones sin consumidores. Conservar las notificaciones por la fachada de contenido.
- [x] Corregir el desplazamiento pendiente demostrado y añadir regresiones de desmontaje/último destino/cambios de módulo y acción. Acotar el tipo de campo a sus cuatro variantes reales.
- [x] Dejar comandos locales repetibles, configuración de workers vigente y versiones `latest` fijadas al lock actual, sin actualizar dependencias ni reinstalar.
- [x] Retirar el verificador obsoleto, corregir el diagrama de rutas y documentar los comandos/configuración afectados.
- [x] Aprobar las comprobaciones pertinentes, revisión independiente y captura final de recuperación.

| Comprobación | Resultado final |
| --- | --- |
| `npm run verify:local` | Salida 0; tipos → unitarias → build en secuencia, remoto desactivado |
| TypeScript | 0 errores |
| Unitarias | 292/292, 17 archivos, 56,33 s; incluidas ambas regresiones nuevas |
| Build/PWA | Salida 0; service worker y 26 entradas de precache generados |
| E2E de CMS/respaldos/cartas | 24/24, 11,0 min; 0 omitidas/inestables/reintentos |
| `npm run test:e2e:preview` | 1/1, 11,5 s; registro/control del worker, recarga y navegación offline |
| Revisión y recuperación | 93 comparaciones AST sin diferencias; diff sin errores de whitespace; captura del formulario inspeccionada; archivos con SHA-256 |

Los resultados finales están en `verify-local-final.json/.log`, `e2e-cms-final.json/.log`, `cms-final-results.json`, `preview-final.json/.log` y `preview-final-results.json`. Solo estos resultados finales acreditan el cierre; se conservaron los fallos y el diagnóstico anteriores. Todos los archivos coincidían con `paso-4-verificacion-final-20261004` después de acabar las pruebas; los cambios posteriores son documentación de cierre.

El respaldo v2 final comprobó explícitamente el mismo documento (`performance.timeOrigin`), el mismo nodo CMS conectado y cero solicitudes de navegación. El diagnóstico aislado también lo comprobó. La URL de la petición inesperada de la primera corrida no se capturó, por lo que su origen sigue sin demostrar: no se atribuye a descargas, HMR ni pérdida de datos. La prueba conserva registro de URLs/documento/nodo para investigar si vuelve a ocurrir. El fallo de módulo del paso 3 tampoco reapareció.

### Límites y siguiente paso

- Navegador Chromium de escritorio, perfiles aislados y contenido sintético; no se tocó el almacenamiento real del usuario. Offline conserva el alcance del build previamente cargado, sin prueba de actualización entre releases ni garantía de medios externos.
- Se probaron los 24 recorridos afectados y preview; la suite general de 40, revisión móvil y accesibilidad completa se comprobarán en los pasos correspondientes. No se ejecutó GitHub Actions ni se reinstaló con `npm ci`; se verificó que el lock conserva todas sus entradas instaladas y coincide con las declaraciones.
- Persisten las superposiciones del reproductor/navegación y los avisos de chunks/import dinámico/`THREE.Clock`; la medición de rendimiento y el pulido visual siguen en el paso 5. Documentación general: paso 6.
- Sin commit, push, despliegue ni activación de Supabase. Modelo/modalidad y stash conservados; no se consumió reserva/reset.
- Próximo bloque: **paso 5 — pulir la experiencia existente**. Comparar Git con el manifest de `paso-4-cerrado-20261004` al retomar; no restaurar archivos automáticamente. Las pruebas aprobadas no se repiten salvo cambios o evidencia nueva.

## Paso 5 — inicio del 5 de octubre de 2026

- Comprobados los 63 archivos del cierre del paso 4 y sus copias: sin diferencias. Checkpoint previo: `.git/codex-checkpoints/paso-5-inicio-20261005/`. Registros: `.git/codex-checkpoints/paso-5-validacion-20261005/`.
- Uso ordinario permitido: 97% restante en cinco horas y 66% semanal, ventana recuperada sin solicitar reserva/reset ni cambio de modelo/modalidad.
- Alcance: todas las escenas y CMS, superposiciones de navegación/reproductor, teclado/foco/etiquetas/táctil/contraste, movimiento reducido y actividad de animaciones ocultas. Conservar el diseño espacial rosa/rojo, estados y funcionalidad de las escenas 3D.
- Tamaños de comprobación previstos: móvil 375×812 y escritorio 1440×900 para todas las escenas; 320×568, 768×1024 y 1024×768 para controles y CMS. Son tamaños elegidos para esta revisión, no dispositivos proporcionados por el usuario.
- Antes de modificar la UI: capturar geometría/controles y medir actividad de animación/carga sobre el build del paso 4. Aplicar las skills locales de UI/UX y guías web actuales; distinguir lectura de código de comprobación real.
- Paso 5 abierto; no dar por resueltos los problemas con solo cambios de CSS ni optimizar animaciones sin comparar mediciones. Sin Supabase, despliegues ni funciones nuevas.

### Retoma del 6 de octubre — implementación aún sin cerrar

- El 5 de octubre un subagente recibió un límite de uso. No se cambió modelo/modalidad ni se activaron créditos/reserva/reset. Tras la nueva instrucción del usuario, el 6 se comprobó `ordinaryUsageAllowed: true`: 97% restante en cinco horas y 50% semanal.
- Baseline de producción del paso 4 conservado en `before-survey.json/.log`, con 59 capturas y nueve ventanas de actividad. El primer intento, que acumulaba Canvas activos durante capturas, saturó el host; se conservó como `before-partial-survey` y el helper pasó a contextos nuevos por escena. No se generalizan tiempos ni FPS a otros equipos.
- Defectos observados: reproductor de 292,7 px en 375×812; controles de Inicio, CMS y planetas tapados. En 320×568 el selector Razones no pudo pulsarse por la superposición. No hubo desbordamiento horizontal del documento, pero las cartas quedaban comprimidas en tres columnas. Landing de plantilla: botón accesible en 375×812 y 320×568; su ajuste de scroll mejora tolerancia a contenido más largo, no se presenta como fallo reproducido.
- Inicio tras visitar los tres Canvas mantuvo dibujos WebGL de las tres escenas ocultas; la ventana de 2,283 s registró 396 llamadas de dibujo de Universo, 99 de Galería y 99 de Entrelazados. Reduced motion también conservaba dibujos y RAF en la versión anterior. La carga fría de Inicio descargó 20 recursos JS, entre ellos el chunk 3D `Stars` (232.682 bytes comprimidos), antes de visitar esas escenas.
- Implementados, pendientes de validación: botones/etiquetas/estado CMS accesibles; foco y Escape en detalles; lector y retorno de foco; temporizadores cancelables en Universo/Galería; placeholders de carga/error asociados a sus escenas; retorno desde Ajustes y escenas ocultas inertes. Reproductor en flujo normal con acceso desde navegación y separación calculada de la barra; cuadrícula de cartas adaptable; modal de Razones en el body con scroll interno; preferencia de movimiento en desplazamientos.
- En integración: carga inicial de cada sección pesada al visitarla, conservando su montaje posterior; pausa de animaciones ocultas y movimiento reducido; Razones estáticas y física ajustada al ancho real. Se comparten las reglas de selección de escena. No declarar aprobados estos cambios antes de tipos, unitarias, build, recorridos y comparación visual/actividad.
- Preparados recorridos nuevos en `e2e/ui-polish.spec.ts`: cinco tamaños, formularios/lectores/reproductor, teclado y modal largo, descarga diferida y recuperación de error. TypeScript pasó una comprobación intermedia anterior a la integración de animaciones; no acredita el conjunto final. Tests nuevos de accesibilidad, lectores y Razones aún pendientes de ejecución.

### Fuente integrada y validada — 6 de octubre

- Actividad compartida con lectura inicial y cambios de escena, pestaña y preferencia de movimiento; Canvas persistentes en pausa/demanda y reloj conservado. Movimiento decorativo estático bajo reduced motion, selección y OrbitControls disponibles. Razones cancela RAF con escena oculta/foco/modal, usa ancho real y cuadrícula estática con todos sus contenidos; modal portaled al body.
- Revisión independiente: corregidos desplazamiento sobre placeholder desconectado, anclaje de los corazones al contenedor medido y destino de foco al abandonar un diálogo mediante historial. El recorrido nuevo comprobará estos estados en navegador; la lectura de código no sustituye esa evidencia.
- Dos corridas intermedias fallaron: consulta de etiquetas CMS demasiado amplia (luego 5,07 s, límite 5 s) y avance de timers del lector en un único batch antes de que React montara el detalle. Se acotaron consultas/validaciones de nombres y se separó el avance entre revelación y scroll; sin aumentar timeouts. Registros `verify-integrado` y `verify-corregido` conservados.
- Pruebas dirigidas: `a11y-acotada`, salida 0, **19/19 en tres archivos**. Final integrado `verify-final`, salida 0: **TypeScript sin errores, 336/336 unitarias en 22 archivos (91,68 s), build y PWA con 26 entradas**. Advertencias conocidas de chunks/import dinámico y timings sin error de build.
- Corregido el helper E2E: habilitar Centro ya cierra Ajustes; volver a pulsar el engrane dejaba un overlay artificial abierto. Ahora no reabre el menú y no deshabilita Centro si ya está visible.
- Verificación de navegador iniciada con `browser-checks.py`: ocho recorridos UI nuevos → survey de producción comparativo → preview/PWA, en secuencia y deteniéndose si falla un bloque. Registros `ui-browser`, `after-survey` y `preview-pwa`. Revisar sus JSON/logs al retomar; un archivo con `state: running` no acredita aprobación. No editar fuente ni reconstruir mientras la cadena esté activa.
- Uso ordinario permitido antes de iniciar navegador: **7% restante en cinco horas, 35% semanal**. Sin cambio de modelo/modalidad ni reserva/reset. Paso 5 continúa abierto: faltan resultados y revisión visual comparativa; no iniciar el 6 todavía.

### Retoma del 6 de octubre por la tarde — comprobación final en curso

- La cadena anterior quedó interrumpida: su survey tenía `finishedAt: null`; no se dio por aprobado. El primer reintento conservó ocho ventanas, pero no encontró un corazón estático dentro del viewport porque el reproductor ahora ocupa espacio real arriba. El helper desplaza la cuadrícula antes de medir/pulsar. También se separaron los nombres del informe y del estado del comando, que antes colisionaban. `after-final-survey` terminó: **60 capturas, nueve ventanas, cero fallos y cero errores JS**. Los errores de recurso registrados corresponden a solicitudes externas bloqueadas deliberadamente; no se equiparan a un runtime sin fallos de red en cualquier entorno.
- Revisión visual independiente y correcciones: badges sin salto/compresión, estadísticas de cartas en dos columnas móviles y placeholders más legibles. `build-visual-final` y `ui-visual-final` pasaron: **9/9 E2E**, cinco tamaños, movimiento reducido, modal largo/historial, placeholders/errores lazy y conservación de Canvas/selección con interacción 3D. `preview-pwa-final`: **1/1**. Son resultados anteriores al ajuste adicional de acceso a planetas, no el cierre final del paso.
- `geometry-final`: 100 corazones dentro del contenedor en 320, 375 y 1440 px; ninguno recortado en esas tres muestras. No prueba todas las posiciones aleatorias. Los rótulos proyectados de planetas sí resultaron demasiado pequeños (mínimo aproximado 9,6×6,9 px). Se integraron selectores HTML en flujo para los mismos mundos, con coordenadas actuales obtenidas del objeto 3D, estado seleccionado, preparación y limpieza de handlers. La revisión detectó que el scroll antiguo al canvas ocultaría el selector enfocado al cerrar; para ese disparador se desplaza ahora el propio selector. Comprobación móvil después del timer añadida.
- El foco de campos/controles dentro de la app se revela cuando la barra fija lo cubre; navegación y escenas ocultas quedan excluidas. El observador de actividad evita enviar actualizaciones de estado cuando el valor no cambia.
- `verify-access-final` no terminó: tras reportar cuatro casos lentos quedó sin resultado final y se detuvo solo su proceso Vitest comprobado. Diagnóstico aislado `cms-unit-diagnostic`: **22/26**, los cuatro fallos son límites de 5 s, sin fallo de aserción funcional. Esos casos de integración completa del CMS usan ahora 15 s, conservando todas sus comprobaciones; el límite general sigue igual. `reader-focus-diagnostic`: **5/5** antes del guard del observador.
- Validación vigente iniciada: `verify-access-complete` → `e2e-complete-final` (suite general con nueve casos UI) → `complete-final-survey`/`complete-survey-check` → `preview-complete-final`. Fuente congelada mientras corre. Revisar estados/exit codes e informes; no acreditar comandos todavía en ejecución. Captura de recuperación en `paso-5-comprobacion-final-20261006`.
- Uso ordinario permitido al iniciar esta cadena: **23% restante en cinco horas y 22% semanal**. Sin cambio de modelo/modalidad, créditos/reserva/reset, commit, push, despliegue ni Supabase. Paso 5 sigue abierto hasta revisar estos resultados; pasos 6–7 no iniciados.

### Retoma del 7 de octubre — corrección de las esperas de navegador

- Resultado recuperado de `verify-access-complete`: **salida 0**, TypeScript sin errores, **336/336 unitarias en 22 archivos**, 266,82 s, build/PWA aprobado. La duración confirma que la corrida detenida anterior no basta para demostrar un bloqueo del runner.
- `e2e-complete-final`: **44/49 aprobadas**, 24,9 min, salida 1 y cero reintentos. Se conservaron los resultados completos y las capturas antes de repetir pruebas en `e2e-complete-final-artifacts/`, dentro del directorio de validación del paso 5. La cadena se detuvo antes del survey y preview finales.
- Respaldo v2: el diagnóstico aislado `cms-loading-probe` demostró que `enableCentro` podía devolver el placeholder lazy con ID `centro-universo` antes del CMS real. Su reemplazo desconectaba el nodo capturado sin cambiar el documento. El helper ahora espera el encabezado del editor real incluso si la sección ya es visible; el respaldo registra y comprueba que el nodo inicial contiene el panel de backup. Se conservan las comprobaciones de identidad del CMS, documento y cero solicitudes de navegación.
- Revisión independiente de los tiempos del reporte: los casos UI de 320 y 1024 px llegaron al último poll con solo 589 ms y 1 ms disponibles; el caso de 768 px aprobado necesitó 1.339 ms para ese poll. Estos recorridos completos tienen ahora 60 s. Galería pasó las comprobaciones de edición, ocultación y restauración y alcanzó la última lectura al límite total de 90 s; solo sus dos recorridos tienen ahora 120 s. Recuperar un módulo tras recargar agotó una espera local de 5 s mientras la sección seguía cargando; se espera el Canvas hasta 20 s. No se retiraron aserciones ni se añadieron reintentos.
- `failures-20261007` repite los cinco casos fallidos, con la fuente de la aplicación conservada. Las esperas ajustadas todavía no cuentan como aprobadas. Paso 5 abierto; documentación general y entrega final de los pasos 6–7 pendientes.
- Uso ordinario permitido al retomar: 97% restante en cinco horas y 100% semanal; una lectura posterior mostró 85% y 98%. No se consumió el reset disponible ni se cambió modelo/modalidad.

## Cierre del paso 5 — 7 de octubre de 2026

- [x] Reproductor en flujo normal, acceso desde la navegación, separación de la barra fija y controles/formularios alcanzables en cinco tamaños.
- [x] Foco y retorno en lectores y diálogos, Escape/Tab, navegación de escenas ocultas, etiquetas, áreas táctiles y movimiento reducido en los flujos revisados.
- [x] Carga diferida por primera visita, estados de carga/error en la escena correcta y recuperación al recargar; las escenas visitadas conservan su montaje y estado.
- [x] Animaciones y Canvas detenidos al ocultar la escena; movimiento reducido estático con interacción manual conservada en 3D.
- [x] Comparación de rendimiento antes/después y revisión visual de capturas finales; documentación afectada y copia de recuperación.

| Comprobación | Resultado y registro |
| --- | --- |
| Tipos, unitarias y build | `verify-access-complete`: salida 0, 336/336, 22 archivos, 266,82 s; PWA con 26 entradas de precache |
| E2E general | `e2e-complete-final`: 44/49; fallos y artefactos originales conservados |
| Galería, dos tamaños UI y recuperación de módulo | `failures-20261007`: esos cuatro casos aprobados, cero reintentos; el respaldo de esta corrida fue contaminado por una edición de documentación |
| Respaldo v2 congelado | `backup-frozen-20261007`: 1/1, 49,0 s; CMS real inicial, mismo nodo/documento, cero navegaciones; adjunto JSON conservado en `backup-frozen-20261007-results.json` |
| Revisión visual y medición finales | `complete-survey-check` y `complete-final-survey`: salida 0; 60 capturas, nueve ventanas, cero fallos y cero errores JS |
| Preview con service worker y offline | `preview-complete-final`: 1/1, 11,8 s; salida 0 |

Los nueve casos de `ui-polish` quedaron aprobados entre la corrida general (seis) y la enfocada (tres), con las mismas comprobaciones funcionales y geométricas. No se presenta esta combinación como una suite completa aprobada en una sola corrida. La fuente de la aplicación coincide por SHA-256 con la que pasó las 336 unitarias; después solo cambiaron las esperas/diagnóstico de E2E y la documentación.

### Recarga de desarrollo identificada y regla de verificación

El respaldo de la repetición enfocada sí registró un documento nuevo. La causa fue una edición de este documento durante el test: Tailwind 4.3.3 incluye Markdown del proyecto en su escáner y su plugin de Vite emite `full-reload` al cambiar esos archivos. El archivo se escribió a `2026-10-08T03:02:48.9568604Z` y el nuevo documento comenzó a `03:02:49.087700Z`, unos 131 ms después. El escáner instalado confirmó que este archivo se observa y que `.git/codex-checkpoints` queda excluido. La repetición sin ediciones pasó conservando todas las comprobaciones de identidad.

**Durante E2E con servidor de desarrollo no editar ningún archivo observado del proyecto, incluida la documentación.** Guardar logs y notas temporales en `.git/codex-checkpoints`, y actualizar los documentos una vez terminado el runner. Esta causa no demuestra el origen de la navegación inesperada registrada en el paso 4, cuya URL no se conservó.

### Comparación medida y límites

En Chromium, con perfiles nuevos, solicitudes externas y service worker bloqueados para comparar:

| Medición | Antes | Build final del paso 5 |
| --- | --- | --- |
| Recursos JS al entrar en Inicio | 20; 1.545.578 bytes decodificados, 432.444 comprimidos | 3; 557.196 bytes decodificados, 162.005 comprimidos |
| Dibujos de Universo/Galería/Entrelazados ocultos durante ~2,2 s | 396 / 99 / 99 | 0 / 0 / 0; cero limpiezas y callbacks RAF en esa ventana |
| Entrelazados con movimiento reducido durante ~2,2 s | 540 dibujos activo; 1.188 oculto | 0 activo y 0 oculto en reposo |
| Razones con diálogo abierto durante ~2,2 s | 8 callbacks RAF; 105 con movimiento reducido | 0 en ambos casos |

- Son ventanas instrumentadas de un equipo, no una promesa de FPS o velocidad en todos los dispositivos. El worker real sigue precargando los 26 recursos: la reducción de módulos al entrar no describe todo el tráfico de instalación de la PWA.
- Cinco tamaños: 320×568, 375×812, 768×1024, 1024×768 y 1440×900. Las capturas revisadas y las pruebas de foco no acreditan una certificación WCAG completa; un control desplazado bajo la barra se comprueba mediante foco/desplazamiento, no solo por el muestreo de una captura.
- Solicitudes externas bloqueadas deliberadamente pueden producir mensajes de recurso; los valores vacíos de plantilla permanecen. Avisos de chunks/import dinámico y `THREE.Clock` siguen visibles y no impidieron la validación.
- Offline comprobado sobre el build actual cargado previamente, sin comprobar actualización entre releases ni disponibilidad de medios externos. Perfiles sintéticos; almacenamiento real del usuario intacto.
- Sin commit, push, despliegue, activación de Supabase ni consumo de reserva/reset. Documentación general y entrega final siguen en los pasos 6–7.

## Cierre del paso 6 — 7 de octubre de 2026

- [x] README con requisitos/comandos del lockfile, arranque local, alcance del CMS, respaldo, arquitectura y estado real. Publicación/remoto como trabajo posterior, sin instrucciones de activación inmediata.
- [x] CLAUDE y AGENTS compatibles, rutas/API/contadores vigentes, memoria y migraciones antiguas como antecedentes. Corregida la afirmación sobre `JSON.parse`: la librería instalada devuelve `any`, que no valida datos externos.
- [x] Guía de edición con Ajustes → Centro del Universo, nueve colecciones, persistencia por origen, Bloqueada manual, Modo Prueba y Resetear Progreso. Aclarados los campos de secretos sin consumidor y la carta principal fuera del CMS.
- [x] Contratos locales contrastados: identity/selector/autoría ya implementados, rutas TypeScript, servicios reales, compatibilidad y apartados de backup preservados. Fases antiguas marcadas como históricas; preparación remota como propuesta.
- [x] TODO reorganizado con resultados comprobados, cierre final pendiente y límites/ideas futuras. Diferencia `openWhen.json` / `openWhenLetters` explicada sin renombrar claves; refs y stash preservados.
- [x] Auditoría de agosto e informes de septiembre enlazan el avance vigente sin reescribir su evidencia histórica.

Verificación documental: **13 documentos, cero enlaces locales rotos**, comandos contrastados con `package.json`, requisitos con el paquete instalado, revisión independiente y `git diff --check` aprobado. El bloque solo cambió Markdown; los archivos de runtime, configuración y pruebas coinciden por SHA-256 con el cierre del paso 5. No se repiten pruebas de runtime solo por estos cambios reversibles; el conjunto se verificará en el paso 7.

La revisión independiente corrigió dos detalles finales: el nombre visible **Resetear Progreso** y la descripción precisa de `docs/supabase/` (carpeta física vacía, sin documentación en el checkout). No se activaron servicios ni se publicaron cambios. Recuperación del working tree en `paso-6-cerrado-20261007`, con copias, hashes y diff; no restaurar automáticamente.

Al terminar la revisión se conservaba uso ordinario permitido; la última lectura durante el bloque mostró **9% restante en cinco horas y 86% semanal**. El reset disponible no se consumió. Antes de iniciar el paso 7, comprobar de nuevo uso y Git, mantener todos los archivos del proyecto congelados durante E2E y recoger resultados finales completos. **Paso 7 aún no iniciado; no declarar terminado todo el plan.**

## Paso 7 — inicio del 8 de octubre de 2026

- Los 83 archivos del cierre del paso 6 coinciden por SHA-256; no había runners/servidores anteriores activos. Working tree y dos eliminaciones preservados; HEAD continúa en `0c1e46f`.
- Uso ordinario permitido al retomar: **97% restante en cinco horas y 83% semanal**. La ventana anterior llegó al 100% y se detuvo el trabajo; no se consumió el reset disponible ni se cambió modelo/modalidad.
- Validación final en secuencia: `verify-final` (tipos → 336 unitarias → build) → `e2e-final` (49 E2E en una corrida, cero reintentos) → `preview-final` (PWA/offline). Registros en `.git/codex-checkpoints/paso-7-validacion-20261008/`; la cadena se detiene ante el primer fallo.
- Revisión independiente del diff de integración de escenas/foco/cancelación, de solo lectura. Mantener todos los archivos observados congelados durante pruebas; las notas temporales quedan dentro de `.git/codex-checkpoints`.
- No acreditar tareas en ejecución ni cerrar el plan hasta revisar los resultados, el diff y guardar la recuperación final. Los resultados visuales/mediciones del paso 5 siguen vigentes si no cambia su fuente.

### Corrección de scroll y comprobación final en curso — 8 de octubre

- Primera corrida congelada: `verify-final` aprobado, TypeScript sin errores, **336/336 unitarias en 22 archivos**, 141,33 s, build/PWA con 26 entradas. `e2e-final`: **47/49**, 17,96 min, cero reintentos; preview no se inició. Registros y artefactos originales preservados en `paso-7-validacion-20261008`.
- Fallos reales de geometría en 320 px (atajo a Banda sonora) y 768 px (Escape desde planeta): el foco era correcto, pero una animación de scroll anterior continuaba y ocultaba el control bajo la barra. No se aumentaron esperas para ocultar el defecto. El diagnóstico con geometría y callstacks está en `scroll-probe.json`; el contenedor `.app` permanecía con `scrollTop=0` en las comprobaciones posteriores.
- El atajo termina en la parte superior, donde está el reproductor. Cerrar un planeta detiene el scroll hacia el detalle antes de retirarlo y vuelve al selector sin animación pendiente. El lector de cartas hace instantáneo su desplazamiento de foco y omite el callback si el usuario ya enfocó otro control. Se añaden dos regresiones unitarias y una comprobación E2E más tardía de visibilidad.
- Reproducción corregida: planeta estable en 320/768 px y banda sonora estable en 320 px durante las muestras posteriores; diagnóstico comparable guardado. La revisión independiente confirmó el alcance de la corrección, sin cambiar CSS ni estado del contenido. Estos diagnósticos no sustituyen la corrida completa.
- Nueva cadena completa en `.git/codex-checkpoints/paso-7-validacion-corregida-20261008/`, con copia previa `paso-7-inicio-corregido-20261008`. Se congelan todos los archivos hasta terminar tipos/unitarias/build → 49 E2E → preview/offline. El paso 7 continúa abierto; comprobar JSON y logs antes de repetir o cerrar.
- Última lectura de uso ordinario: **18% restante en cinco horas, 71% semanal**; no se consumió reserva/reset ni se cambió modelo/modalidad.

### Retoma y revisión adicional — 10 de octubre

- El trabajo anterior se detuvo al marcar 100% de uso en la ventana de cinco horas. La cadena ya iniciada terminó el 8 de octubre: **338/338 unitarias en 22 archivos**, 108,47 s; build en 2,30 s/PWA con 26 entradas; **49/49 E2E en una corrida**, 18,64 min; **1/1 preview/offline**, 18,13 s. Todas las etapas salieron con código 0; cero omitidas, inestables o reintentos.
- Los 83 archivos coinciden por SHA-256 con `paso-7-inicio-corregido-20261008`. El adjunto `cms-document-preservation` confirma CMS real inicial/final, mismo documento y nodo, y cero solicitudes de navegación durante el respaldo v2. No quedan runners activos. HEAD y stash preservados.
- Uso ordinario permitido al retomar: **97% restante en cinco horas, 99% semanal**. No se consumió el reset disponible ni se cambió modelo/modalidad.
- La revisión independiente no encontró regresiones nuevas en el último diff. Señaló una combinación residual preexistente: el retorno de Universo, diferido 140 ms tras Escape, puede competir con un atajo a Banda sonora durante ese intervalo. Se prepara una reproducción y, si se confirma, su corrección dentro del mismo alcance antes de cerrar. Los documentos de cierre siguen provisionales; el paso 7 permanece abierto.

- Combinación adicional reproducida: `race-before`, salida 1, conserva foco pero falla la geometría del reproductor tras el retorno. La prueba ejecuta los handlers de Escape/atajo en la misma tarea del navegador, sin cambiar temporizadores, para cubrir el intervalo de 140 ms de forma determinista. Captura y trace originales preservados en `.git/codex-checkpoints/paso-7-revision-20261010/`.
- Corregido el retorno: se omite si su disparador ya no está conectado o perdió el foco ante otra acción. `race-after`: **1/1 aprobado**, caso de 8,4 s, salida 0 y cero reintentos; no acredita por sí solo la suite completa. No se cambian selección, datos ni CSS.
- Comprobación del conjunto final preparada en `.git/codex-checkpoints/paso-7-validacion-final-20261010/`: tipos → 338 unitarias → build → **50 E2E en una corrida** → preview/PWA/offline. Copia previa `paso-7-inicio-final-20261010`; todos los archivos observados se congelan hasta terminar. Los resultados de 49 casos permanecen como evidencia anterior al último guard.

## Cierre del paso 7 — 10 de octubre de 2026

**El plan local completo queda cerrado.** El refactor iniciado por Claude, el CMS y la persistencia, los recorridos/audio, el refactor focalizado, el pulido visual y la documentación conservan los cierres de los pasos 1–6. La validación final incluye las correcciones de scroll, foco y cancelación de este paso.

| Comprobación final | Resultado |
| --- | --- |
| TypeScript | Sin errores; `verify:local`, salida 0 |
| Unitarias | **338/338**, 22 archivos, 104,50 s |
| Build/PWA | Salida 0; build 8,13 s; 26 entradas de precache, 1662,91 KiB |
| E2E de desarrollo | **50/50**, 13,29 min, Chromium, un worker y una única corrida |
| Preview/PWA/offline | **1/1**, 10,90 s; worker registrado/controlando la página, recarga y navegación offline sobre el build actual |
| Reintentos/estados | Cero reintentos, omitidas, inestables o fallos inesperados en ambos reportes de navegador |

Resultados y artefactos conservados en `.git/codex-checkpoints/paso-7-validacion-final-20261010/`: `verify-final.log`, los tres estados JSON, reportes `e2e-final-results.json`/`preview-final-results.json` y copias de los artefactos de cada suite. La cadena terminó con salida 0 y sus comprobaciones de hashes aprobadas. Los **83 archivos** permanecieron idénticos a `paso-7-inicio-final-20261010` durante toda la ejecución; después se actualizaron solo los documentos de cierre.

- [x] CRUD, originales, creaciones, respaldo v1/v2, errores de escritura, lectores, simulación, progreso, hashes/historial, audio y resets comprobados en perfiles sintéticos. El almacenamiento real del usuario no se utilizó.
- [x] Diez casos de interfaz, incluidos cinco tamaños (320, 375, 768, 1024 y 1440 px), teclado/foco, movimiento reducido, conservación/pausa de Canvas, carga/error lazy y la nueva combinación Escape → Banda sonora. La regresión nueva falla antes del guard y pasa después; no se retiraron aserciones ni se habilitaron reintentos.
- [x] El respaldo v2 conserva el CMS real y su documento: adjunto `cms-document-preservation` con el mismo `timeOrigin`, nodo conservado y cero solicitudes de navegación. No se usa un placeholder como prueba del editor.
- [x] Revisión independiente de la integración y la corrección final sin regresiones nuevas tras resolver el retorno de 140 ms. La revisión por subsistemas de los pasos anteriores sigue registrada. Alcance y límites en `review-final.md`; no se declara una auditoría exhaustiva de todos los temporizadores.
- [x] README, CLAUDE, AGENTS, TODO, plan y recorridos alineados con el cierre; 13 documentos sin enlaces locales rotos y `git diff --check` aprobado. Los contratos/guía y las instantáneas históricas mantienen el alcance contrastado en el paso 6.
- [x] Copia de recuperación final en `.git/codex-checkpoints/paso-7-cerrado-20261010/`, con archivos, hashes, manifest y diff. La copia inicial del paso 1 conserva el working tree recibido de Claude; los checkpoints por paso permiten distinguir los cambios posteriores. No restaurar automáticamente ni aplicar el stash para continuar.

No se hizo commit, push, despliegue, activación remota ni cambio de modelo/modalidad. `HEAD`, `main` y `origin/main` siguen en `0c1e46f`; el stash `fbab2cc` se conserva. El reset de uso disponible no se consumió. Los cambios quedan locales y la validación no requiere Supabase.

Límites conservados: pruebas en Chromium y perfiles aislados, sin certificación WCAG ni comprobación de todos los dispositivos; offline sobre un build previamente cargado, sin simular actualización entre releases ni garantizar medios externos. Siguen los avisos de chunks/import dinámico y `THREE.Clock`; no impidieron la validación. La preparación del backend, publicación y funciones nuevas requieren otra etapa. El [TODO](../TODO.md) mantiene esas propuestas y la deuda visible separadas del plan terminado.

Para continuar, leer este estado, comprobar el diff/uso actuales y acordar el siguiente alcance. No repetir automáticamente toda la validación por cambios de Markdown ni confundir los resultados históricos fallidos con el conjunto final aprobado.

## Cierre en Git local — 12 de octubre de 2026

Después de terminar los siete pasos, el usuario eligió ordenar y guardar los cambios en commits locales. Antes de preparar el índice, una comparación independiente confirmó que los **83 archivos y sus copias** coincidían con el manifest cerrado del 10 de octubre. Las 85 rutas pendientes correspondían exactamente a esos archivos y las dos eliminaciones ya previstas; no había cambios preparados ni rutas adicionales.

La rama `codex/cierre-pulido-local` parte de `0c1e46f` y separa el trabajo en tres commits:

| Bloque | Registro |
| --- | --- |
| Adaptaciones de skills para Codex, sin duplicar las bibliotecas de Claude | `a23e811` — seis archivos |
| Refactor y pulido funcional, configuración y pruebas de regresión | `39ec09c` — 66 archivos, incluidas las dos eliminaciones |
| Contexto, guía, contratos, instantáneas y cierre documental | `docs: registrar cierre y contratos del pulido local` — 13 documentos, incluido este registro |

El código de aplicación, la configuración y los recorridos de navegador se conservan idénticos al conjunto validado el 10 de octubre. Al incluir por primera vez los archivos nuevos en el índice, `diff --check` detectó una línea vacía sobrante al final de `AudioPlayback.test.tsx` y espacios en dos líneas vacías de `AUDITORIA_ARQUITECTURA.md`; se corrigió únicamente ese formato. El contenido de la prueba y de la auditoría histórica no cambió. La otra edición de esta etapa es este registro documental.

Se conserva la validación del 10 de octubre con su fecha: **338 unitarias en 22 archivos, tipos/build/PWA, 50 E2E en una corrida y 1 preview/offline**, sin omitidas, inestables ni reintentos. No se repitieron pruebas ni se iniciaron servidores para guardar commits y corregir el formato final de una prueba.

La recuperación previa y el registro de cada commit están en `.git/codex-checkpoints/cierre-git-local-20261012/`: `files/`, `working-tree.patch`, `status-before.txt` y `state.json`. El estado registra hashes iniciales/finales, grupos, commits y el ajuste de formato; `closed` acredita el cierre con índice y working tree limpios. Esta copia y la del paso 7 permiten distinguir los cambios y recuperar archivos concretos; no restaurarlas automáticamente.

## Compatibilidad local en curso — 12 de octubre de 2026

El usuario autorizó comenzar por Firefox y WebKit antes de pasar a las otras propuestas. Rama `codex/compatibilidad-navegadores`, creada desde el cierre local `4aab097`. Configuración independiente en `playwright.cross-browser.config.ts`, comando `npm run test:e2e:cross-browser`, puerto 5174, perfiles sintéticos, remoto desactivado, un worker y cero reintentos. La suite contiene 50 recorridos por navegador, 100 en total. No acredita Safari/iPhone real ni la PWA entre versiones.

Recuperación y evidencia en `.git/codex-checkpoints/compatibilidad-20261012/`. `initial.json` conserva refs y copias iniciales; cada ejecución guarda estado, hashes de todos los archivos observados, log, reporte y artefactos. No editar archivos del proyecto, incluidos documentos, mientras un runner esté activo. Antes de retomar, consultar su `state.json`; no iniciar otro runner simultáneo.

- Instalados los motores de Playwright 1.62.1: Firefox 153.0 y WebKit 26.5 en Windows. La comprobación inicial confirmó WebGL2, `inert` y `canPlayType('audio/wav') = 'probably'`; no acreditó reproducción WAV real, como mostraron las sondas posteriores. No sustituye los recorridos completos.
- El respaldo v2 agotó los 120 segundos durante el tercer snapshot completo del CMS en Firefox. Tras aumentar solo ese caso a 240 segundos, la reproducción aislada pasó; luego volvió a pasar dentro de la suite. No se retiraron aserciones ni se cambió la aplicación.
- `todos-final` terminó con salida 1: **13 aprobadas, una fallida y 86 sin ejecutar**, cero reintentos y 270 archivos congelados sin cambios. Fechas originales agotó su presupuesto de 90 segundos; la traza muestra que restauración, recarga y comprobaciones finales completaron correctamente a los 98,98 segundos. Se ajusta a 180 segundos el presupuesto de los recorridos CRUD completos en Firefox, conservando los presupuestos anteriores en otros motores.
- `firefox-fechas-corregido` aprobó **1/1**, salida 0, cero reintentos, sin omitidas ni inestables y 270 archivos congelados sin cambios. El caso tardó aproximadamente 2,9 minutos; el runner completo, 211,53 segundos. La revisión independiente distingue el timeout total de un fallo de restauración: las aserciones se conservan.
- `todos-corregido` terminó con salida 1: **cero aprobadas, una fallida y 99 sin ejecutar**, cero reintentos y archivos congelados. El primer caso CMS agotó los 30 segundos en `page.goto('/app?reset=1')`, esperando `domcontentloaded`; el servidor registró una excepción `undefined` mediante el reenvío de consola de Vite. El mismo caso pasó en la corrida anterior. No se interpreta todavía como fallo del CMS ni se amplía su timeout sin diagnóstico.
- `firefox-carga-repro` también agotó los 30 segundos. La revisión independiente de ambas trazas confirmó que crear la página consumió 17–19 segundos antes de la aplicación; los módulos seguían cargando cuando venció el presupuesto. No hubo diálogo de reset ni recarga, ni respuestas HTTP fallidas. El error `undefined` de Vite no identifica una causa y no apareció en la reproducción. Evidencia en `firefox-carga-review.md`.
- Retoma del **16 de octubre de 2026**: uso ordinario permitido, 96% restante en cinco horas y 82% semanal; misma rama y cinco rutas pendientes. Sin runners anteriores ni servidor en 5174. `firefox-carga-retoma-20261016` pasó **1/1 sin cambios**, caso de 5,4 segundos, salida 0, cero reintentos y archivos congelados. No se amplió el presupuesto ni se cambió la aplicación para esta carga.
- `todos-final-20261016` terminó con salida 1: **30 aprobadas, una fallida y 69 sin ejecutar**, cero reintentos, 21,27 minutos y 270 archivos congelados sin cambios. Pasaron todas las colecciones, respaldos y lectores. El recorrido de audio no volvió de la playlist a Cartas al clicar Reproducir. `firefox-audio-repro-20261016` repitió el mismo fallo, sin cambiar aserciones ni tiempos.
- Corrección del 16 de octubre en `SceneModeController`: el ajuste global de foco podía desplazar un botón entre pulsar y soltar el puntero, perdiendo el clic. Se omite ese desplazamiento durante el gesto; se conserva para teclado y foco programático posterior, con limpieza en cancelación, pérdida de foco y desmontaje. Dos regresiones fallaron antes y después pasaron **8/8 pruebas de navegación**; el total unitario previsto pasa de 338 a 340, pendiente de ejecutar completo. Diagnóstico en `firefox-audio-review.md` y `pointer-focus-before.md`.
- La revisión independiente no encontró fallos en la protección del puntero y señaló una mejora de evidencia: comprobar la liberación antes del evento de teclado. Se fortalecieron ambas regresiones sin añadir casos. `verify:local` aprobó **340/340 unitarias en 22 archivos**, 114,62 segundos, tipos y build/PWA (9,48 segundos, 26 entradas). Log `verify-local-20261016.log`; se conservan los avisos ya conocidos de chunks/import dinámico.
- `ambos-audio-corregido-20261016`: Firefox **1/1 aprobado**, 24,3 segundos, con el recorrido original de audio intacto. WebKit falló al cargar el primer WAV, antes de llegar a la combinación corregida. Ambos motores compartieron archivos congelados, sin reintentos. No se acredita la suite completa.
- La sonda nativa `media-probe.mjs`, sin aplicación, mostró que WebKit 26.5 en este Windows rechaza el WAV sintético PCM 8 kHz/mono con `NotSupportedError` y error de media 4 desde blob, HTTP 200 y HTTP 206 con rangos correctos; `data:` no inició en siete segundos. `canPlayType` respondía `probably`, insuficiente para acreditar reproducción. Evidencia en `media-probe-results.json`. Se investigan variantes de frecuencia/formato; no se modificó el reproductor ni se omitieron aserciones para esconder esta limitación.
- `media-variants-probe.mjs` confirmó **6/6 rechazos** de WebKit: WAV 8 kHz mono, 44,1 kHz estéreo y 48 kHz mono, todos PCM 16 bit, tanto blob como HTTP 206 correcto. Resultado `media-variants-results.json`. El FFmpeg existente de Playwright solo ofrece codificadores PNG/VP8, sin encoder de audio; no se instaló nada ni se concluye que todos los formatos fallen. Queda pendiente probar otro codec o entorno compatible; el WAV no sirve como prueba de reproducción en este motor/equipo.
- `chromium-afectado-20261016` terminó aprobado: **16/16**, 228,97 segundos, salida 0, cero omitidas, inestables, reintentos o errores fuera de tests; 270 archivos congelados sin cambios. Incluye audio, navegación y los diez casos de interfaz. Confirmado al retomar el 18 de octubre, sin repetir la ejecución.
- Retoma del **18 de octubre**: uso normal permitido, 19% restante en cinco horas y 85% semanal. Misma rama, sin nuevos cambios recibidos. Corrección de foco y dos regresiones guardadas en el commit local **`904203f`**; no incluye la configuración de compatibilidad pendiente. Se prepara `firefox-completo-20261018` para los 50 casos, manteniendo archivos congelados. La investigación de otro codec para WebKit se limita a recursos de prueba en el checkpoint, sin instalar ni cambiar el reproductor.
- `firefox-completo-20261018` terminó con **38 aprobadas, una fallida y 11 sin ejecutar**, 28,85 minutos, cero reintentos y archivos congelados. Pasaron los dos recorridos de audio con la corrección, todas las colecciones, respaldo, lectores y navegación. La primera prueba de reset leyó almacenamiento antes de terminar la recarga y perdió su contexto. La revisión independiente confirmó la carrera de la prueba: `replaceState` retira el parámetro antes del `reload`; se exige ahora un documento completo con `PerformanceNavigationTiming.type = 'reload'`. No se modifica el reset de la aplicación.
- Retoma del **19 de octubre**: uso ordinario permitido, 99% restante en cinco horas y 82% semanal; misma rama y cambios recibidos conservados. No había runners ni servidores anteriores activos. La sonda `media-mp3-probe.mjs` mostró reproducción nativa real por HTTP de WAV y MP3, con avance de tiempo, y recuperación de error hacia MP3; el MP3 por blob siguió fallando. Repetir la comparación de respuestas interceptadas confirmó los rechazos de WAV. Estos resultados corrigen la hipótesis de codec: el WAV funciona desde HTTP real y falla por la vía interceptada en este entorno. Informes `media-mp3-results.json` y `media-probe-results.json`, con sus fechas.
- Los recursos de audio de prueba usan ahora un servidor HTTP efímero de loopback que respeta rangos, HEAD y errores 404; se conserva el WAV sintético y todos los clics/aserciones de los recorridos originales. El servidor se cierra al terminar el archivo. No se añade el MP3 externo al proyecto ni se cambia el reproductor. Audio/reset/interfaz se comprueban primero en `afectados-ambos-20261019` (28 casos), antes de la suite completa. Consultar su estado y congelar todos los archivos observados mientras esté activo.
- `afectados-ambos-20261019` terminó con **14 aprobadas en Firefox, una fallida en WebKit y 13 sin ejecutar**, 325,83 segundos, cero reintentos y 271 archivos congelados. Firefox aprobó audio, ambos resets y diez casos de interfaz. WebKit inició la reproducción WAV nativa, comprobó volumen cero y pausa, pero agotó los 90 segundos del recorrido durante Reproducir. Ninguna aserción de audio falló antes del límite. Se amplía solo el presupuesto total de ese caso en WebKit a 240 segundos; los otros motores conservan 90 segundos y todas las aserciones conservan sus plazos. Reproducción y casos pendientes en `webkit-afectados-20261019`.
- `webkit-afectados-20261019` falló después de reanudar: no había audio activo al cambiar a Música, sin agotar los 240 segundos. El diagnóstico nativo `webkit-audio-eventos-20261019` conserva los eventos: reanudación en 19,77/20 s y pausa nativa a 0,01 s sin llamada previa a `pause()`, sin error ni rechazo de `play`, antes de solicitar la siguiente fuente. La asociación con el límite del loop es una inferencia. Para este recorrido de controles/navegación, el WAV sintético pasa a 300 segundos, más que todo su presupuesto, conservando formato, clics y aserciones. El comportamiento nativo al atravesar el loop de WAV corto queda como límite observado de WebKit en este equipo, sin atribuirlo a la aplicación ni certificar su corrección.
- `webkit-audio-largo-20261019` aprobó **2/2**, 198,88 segundos, salida 0, cero omitidas, inestables o reintentos; 271 archivos congelados. Pasaron todos los controles, exclusividad de audio, cambios de escena, salida y recuperación tras 404 sin tocar el reproductor. Para los siguientes recorridos, la traza mantiene acciones y snapshots DOM, omitiendo solo la captura continua de imágenes; la captura final en caso de error se conserva. No se desactivan animaciones ni verificaciones. Audio/reset/interfaz de WebKit se repiten bajo esa configuración en `webkit-afectados-final-20261019`.
- `webkit-afectados-final-20261019` aprobó los dos casos de audio otra vez (2,3 min y 26,0 s); después falló el estado previo de reset: la escena sembrada `musica` fue sobrescrita por el efecto inicial de React con `inicio`. Se espera ahora a la primera persistencia de `inicio` antes de sembrar datos en ambos casos. Se mantienen las aserciones de datos sembrados, borrado total y escena final; no se cambia la aplicación. Salida 1, 2 aprobadas/1 fallida/11 sin ejecutar, archivos congelados. Reset e interfaz pendientes en `webkit-reset-ui-20261019`.
- `webkit-reset-ui-20261019` aprobó **ambos resets** (6,9 y 17,8 s), después falló el contador de dibujos del universo antes de interactuar. El Canvas estaba al borde inferior de la ventana; se lleva ahora a la vista antes de medir dibujo, igual que ya se hacía antes de medir movimiento reducido. Se conservan las aserciones de dibujo, pausa, conservación y giro. WebKit UI pendiente en `webkit-ui-20261019`; no se acredita todavía cobertura completa.
- `webkit-ui-20261019` superó el primer contador de dibujo tras llevar Canvas a la vista; se agotaron los 30 segundos totales después de ocultar Universo al navegar a Cartas, sin fallo de aserción. Se establece visibilidad en viewport antes de ambos contadores activos y se amplía solo este caso en WebKit a 300 segundos; los plazos de aserción y presupuestos de otros motores se conservan. Sigue pendiente terminar este recorrido y los otros nueve de interfaz. Corrida recuperable `webkit-ui-largo-20261019`; consultar su estado antes de ejecutar otro runner. Última lectura normal: 99% consumido, sin reserva/reset ni cambio de modelo.
- `webkit-ui-largo-20261019` aprobó el recorrido completo de Universo (1,5 minutos); después la prueba de 320 px agotó sus 60 segundos, sin error de aserción. Al retomar se conservaba uso normal permitido (0% consumido en la nueva ventana, 33% semanal). La configuración de WebKit pasa a densidad de pantalla **1x**, igual que Chromium/Firefox, manteniendo motor, tamaño CSS de ventana y aserciones. `webkit-320-1x-20261019` aprobó **1/1 en 50,0 segundos**, bajo el presupuesto original de 60; salida 0, archivos congelados y cero reintentos. No acredita pantallas Retina/Safari real. Se comprueban los diez casos de UI en `webkit-ui-1x-20261019`; en la futura corrida conjunta WebKit se ejecuta primero, antes de Firefox.
- `webkit-ui-1x-20261019` aprobó Universo y cuatro tamaños (320, 375, 768 y 1024 px); 1440 px agotó los 60 segundos al final, al seleccionar el planeta. Salida 1, **5 aprobadas/1 fallida/4 sin ejecutar**, cero reintentos y archivos congelados. Los cinco recorridos largos por tamaño reciben 120 segundos totales solo en WebKit (60 en los demás motores); verificaciones y sus plazos intactos. Los cinco casos pendientes se comprueban en `webkit-ui-pendiente-20261019`, sin volver a contar los anteriores como una corrida completa.
- `webkit-ui-pendiente-20261019` aprobó **5/5**, 136,41 segundos, salida 0, cero omitidas, inestables o reintentos; archivos congelados. Pasaron 1440 px, retorno inmediato a Banda sonora, diálogo por teclado, carga diferida y recuperación tras error. Los diez casos de interfaz de WebKit tienen comprobaciones satisfactorias, todavía separadas. Se inicia la corrida conjunta **`todos-final-20261019`**, con 100 recorridos (50 WebKit primero y 50 Firefox), un worker, cero reintentos y todos los archivos observados congelados. No acreditar la corrida completa hasta leer su reporte final.
- `todos-final-20261019` terminó con **8 aprobadas/1 fallida/91 sin ejecutar**, 521,25 segundos y archivos congelados. Pasaron CMS y los cinco respaldos en WebKit. Razones agotó los 90 segundos en la última recarga tras crear, editar, comprobar persistencia y borrar, sin fallo previo de aserción. Los recorridos CRUD reciben 240 segundos totales en WebKit, conservando 180 en Firefox y los anteriores en Chromium. No se amplían plazos de aserción ni se retiran pasos. Se comprueban Razones/creación, Galería/originales y Cartas/originales en `webkit-crud-muestra-20261019` antes de reiniciar la corrida conjunta.
- `webkit-crud-muestra-20261019` aprobó **3/3**, 539,32 segundos de reporte total: Razones/creaciones (3,2 min), Galería/originales (3,1 min) y Cartas/originales (2,6 min). Salida 0, cero omitidas, inestables, reintentos o errores externos; 271 archivos congelados sin cambios. Confirma la muestra con el presupuesto total de 240 s, no los 100 recorridos.
- La sonda aislada `native-loop-webkit-vol0-20261019.json` reprodujo el síntoma del WAV corto fuera de la aplicación: audio nativo, HTTP real, 20 s, volumen 0 y `loop=true`, WebKit 26.5/Windows/densidad 1. Play y Resume resolvieron sus promesas; tras pausar a 19,86 s y reanudar, cruzó un loop y emitió `pause` nativo a 0 s, sin error, permaneciendo pausado durante los siete segundos observados. El cruce y la pausa están comprobados; su causa interna no está explicada. No demuestra comportamiento en Safari real, otros formatos o equipos. Navegador/servidor cerrados y 271 archivos congelados.
- `chromium-audio-reset-20261019` aprobó **4/4**, 35,62 segundos, con los fixtures HTTP y la sincronización final del reset. Salida 0, cero omitidas, inestables, reintentos o errores externos; 271 archivos congelados. No reemplaza la validación histórica de los otros casos Chromium.
- Se prepara **`todos-final-corregido-20261019`**, otra corrida conjunta de 100 casos, WebKit primero y Firefox después, con la configuración final y todos los archivos observados congelados. **Pendiente:** completar esta corrida, actualizar documentación y guardar el commit de compatibilidad. El bloque sigue abierto; no sumar corridas parciales como si fueran una validación completa. No activar reserva/reset ni cambiar modelo para continuar. Si se interrumpe la sesión, consultar primero los estados y logs de este checkpoint antes de iniciar otro runner.

## Preparación para continuar entre equipos — 20 de octubre de 2026

El usuario pidió un flujo para alternar escritorio/laptop mediante GitHub y retomar con «prosigue». La consulta confirmó uso ordinario permitido (21% consumido al empezar), `gh` autenticado y remoto público `yori7v7/DistanciaCero`, que todavía solo tiene `main` en `0c1e46f`. La rama `codex/compatibilidad-navegadores` y sus cuatro commits hasta `904203f` no tienen upstream; tampoco se habían guardado las nueve rutas de pruebas/configuración/avance pendientes. Clonar el remoto en ese estado no lleva el trabajo reciente a la laptop.

La corrida conjunta anterior quedó interrumpida: log con **92 aprobadas (50 WebKit y 42 Firefox)**, última modificación el 19 de octubre a las 23:25:46 UTC, sin `results.json` ni salida final. La sesión 41274 ya no existe; no hay runner/navegador original ni servidor 5174 activo. El `state.json` que conserva `running` está obsoleto; no se modifica ni se interpreta como una ejecución aprobada. Ocho casos de UI Firefox siguen sin acreditar por esa corrida, y el bloque no está cerrado.

Antes de editar, los **271 archivos** coincidían con sus hashes iniciales. Snapshot de las nueve rutas, diff, refs y evidencia de interrupción en `.git/codex-checkpoints/compatibilidad-20261012/handoff-preparation-20261020/`. Se prepara un checkpoint local de continuidad con el trabajo incompleto documentado, sin afirmar 100/100 ni repetir toda la suite para redactar el procedimiento.

[TRABAJO_ENTRE_EQUIPOS.md](TRABAJO_ENTRE_EQUIPOS.md) registra la instalación de la laptop, rama, límites, pruebas pendientes y qué no viaja por Git; AGENTS incorpora la recepción por fast-forward y entrega mediante commits/push cuando esté autorizada. No se ha enviado la rama: el destino es público y la autorización de publicación inicial sigue pendiente. La petición de instrucciones no se convierte en permiso para desplegar o cambiar visibilidad. No se añadieron funciones ni se alteró el código de aplicación.

`main` y `origin/main` permanecen en `0c1e46f`; el stash `fbab2cc` se conserva sin aplicar ni borrar. No se hizo push, despliegue, activación de Supabase, cambio de modelo/modalidad ni consumo de reserva/reset. Los commits contienen el cierre local y los checkpoints posteriores; no amplían el alcance a funciones nuevas o infraestructura remota.

## Retoma en laptop — 20 de octubre de 2026

- Uso ordinario permitido al comenzar: 38% restante en cinco horas y 90% semanal. `git fetch origin` y consulta de rama en GitHub confirmaron `3be83c1`; sin cambios locales, divergencia ni runners del proyecto. No hubo commits nuevos que recibir por fast-forward. El usuario autorizó commits y push normal a la misma rama; la primera publicación ya estaba realizada, corrigiendo el estado histórico anterior.
- Dependencias instaladas coincidentes con el lockfile; Node **24.22.0**, npm **11.19.1**, Playwright **1.62.1**, Firefox **153.0** y WebKit **26.5**, Windows x64. npm requirió añadir su directorio al PATH solo del proceso. Se instalaron los motores faltantes, sin modificar dependencias ni lockfile.
- `laptop-compatibilidad-20261020`: **50 aprobadas WebKit, 1 fallida Firefox, 49 sin ejecutar**, 2917,40 s, salida 1, cero reintentos/inestables. Los **272 archivos** conservaron sus hashes. Reporte JSON, log, estado final, hashes y artefactos en `.git/codex-checkpoints/laptop-compatibilidad-20261020/`. El error externo del reporte comunica la parada por `max-failures=1`; no acredita 100/100 ni cierre.
- El fallo Firefox fue `browserType.launch: spawn UNKNOWN`, antes de abrir la aplicación. La ejecución directa de Firefox también falló; el registro Windows `SideBySide` 33 señala el ensamblado `mozglue`. Una nueva instalación oficial del mismo motor en `clean-browsers/` sí arrancó. Comparación completa: **63 archivos idénticos**, incluidos ejecutable y DLL; no se modificaron binarios, políticas ni configuración del sistema. La causa de la diferencia por ubicación/entorno no está establecida.
- `firefox-smoke`: caso CMS crear/leer/editar/borrar **1/1**, 11,04 s, salida 0, sin omitidas/inestables/reintentos/errores externos ni cambios de hashes. Usa la caché aislada; no se suma a las 50 anteriores para declarar una corrida completa. Los mensajes React de descarga fallida durante el último caso WebKit pertenecen al fallo inducido y su recuperación comprobada. El aviso conocido de `THREE.Clock` permanece.
- Pendiente inmediato: nueva corrida conjunta de 100 con la caché aislada, misma configuración y archivos congelados; después, si aprueba, documentación general, revisión y cierre. La interrupción histórica de 92 permanece sin completar. No se repitieron tipos/unitarias/build en este bloque ni se cambió código de aplicación o pruebas.

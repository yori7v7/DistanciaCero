# Plan de cierre y pulido local

Plan del 13 de septiembre de 2026; estado actualizado el 10 de octubre: **pasos 1–7 completados**. Consultar [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md) para recuperación, resultados y límites.

## Objetivo acordado

El usuario explicó que Claude Code dejó un refactor incompleto al agotarse sus tokens. La prioridad es terminar ese trabajo, corregir los flujos existentes, mejorar la experiencia local y actualizar la documentación. Antes de implementar, pidió este orden de trabajo.

Esta etapa termina con una versión local comprobada y mantenible. Vercel, Supabase, despliegues, sincronización remota y funciones nuevas quedan para otra etapa. Entrelazados conserva su funcionalidad actual durante el pulido; ampliar su concepto es trabajo posterior.

La evidencia inicial está en [CONTEXTO_PROYECTO_CODEX.md](CONTEXTO_PROYECTO_CODEX.md). Esa revisión encontró 15 errores de TypeScript en el lector compartido, defectos reproducidos en cartas y simulación, 162 pruebas unitarias aprobadas con un worker threads, un build aprobado y una suite E2E con 11 aprobadas y un timeout que pasó aisladamente. Son resultados de esa instantánea, no resultados de este plan.

## Forma de trabajar

- Revisar el diff existente antes de cada bloque y preservar los cambios que el usuario ya tenía. No aplicar ni descartar el stash histórico para intentar recuperar trabajo: el refactor pendiente está en el working tree actual.
- Trabajar en bloques pequeños con resultado funcional comprobable. Actualizar los pendientes y la documentación afectada al cerrar cada bloque; la fase 6 consolida su coherencia final.
- Usar contenido sintético y contextos de navegador aislados para pruebas de importación, borrado, reset y progreso. No limpiar el almacenamiento del navegador del usuario.
- Añadir pruebas de regresión donde se corrigen comportamientos importantes; ejecutar las verificaciones relevantes durante el trabajo, no posponerlas todas al final.
- Aplicar buenas prácticas cuando mejoren claridad, tipos, mantenimiento o comportamiento. Conservar la API síncrona de contenido, los IDs y el modelo de originales/overrides/creaciones. Evaluar cada propuesta de la auditoría anterior contra el código.
- Mantener el modo remoto desactivado. Verificar que el uso local no depende de credenciales ni contacta Supabase; dejar los defectos propios del remoto documentados para su etapa.

## 1. Cerrar el refactor que quedó a medias

**Completado el 19 de septiembre de 2026.** TypeScript sin errores, 184 pruebas unitarias, 13 E2E y build con PWA aprobados. El recorrido de simulación/reset se comprobó también mediante controles reales en navegador. El cierre y sus límites están registrados en el documento de avance.

**Trabajo:**

- Completar `LetterCollectionSection.tsx` y su integración con `MonthlyLetters.tsx` y `OpenWhenSection.tsx`.
- Corregir los tipos del modelo combinado, conservando los campos de ambas clases de carta y evitando ocultar los errores con conversiones indiscriminadas a `any`.
- Comprobar selección, volver al listado, bloqueo, lectura, contador, originales, overrides y creaciones locales en ambas secciones.
- Revisar juntos los cambios de `CentroUniversoSection`: reemplazar una recarga requiere actualizar el estado del CMS y sus lectores. Resolver la regresión de Modo Prueba y reset de progreso dentro de este bloque.
- Verificar el resto del diff iniciado: enlaces de playlist, navegación de salida, import directo del repositorio local y cambio de React Router.
- Marcar en `TODO.md` el foco local y retirar de “hecho” las afirmaciones que aún no estén comprobadas.

**Cierre:** TypeScript sin errores; ambos lectores conservan sus comportamientos; activar y desactivar simulación, leer y reiniciar progreso refrescan UI y contadores sin una recarga manual. Pruebas de regresión pertinentes aprobadas.

## 2. Hacer fiable el contenido y el CMS

**Completado el 29 de septiembre de 2026.** TypeScript sin errores, 251 unitarias, 36 E2E y build/PWA aprobados. Cierre y recuperación en [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md).

**Trabajo:**

- Corregir la convivencia entre almacenamiento legacy y estándar de cartas, con una regla clara de precedencia y migración que preserve contenido existente.
- Corregir importación/restauración: una versión importada debe reflejarse conforme a la semántica de restauración; borrar una carta no debe hacer reaparecer una copia antigua.
- Comprobar respaldos v1/v2, originales personalizados, ocultos y creaciones en las nueve colecciones. Validar el archivo completo antes de modificar almacenamiento para evitar una restauración parcial por entrada inválida.
- Conservar las colecciones ausentes de un respaldo v1 o v2 incompleto, como exige el contrato actual; distinguir ausencia de una colección y una colección explícitamente vacía. Preservar IDs y metadata compatibles.
- Comprobar que exportar e importar conserva los datos incluidos en el formato. Documentar exactamente qué incluye el respaldo y qué no, especialmente progreso y archivos multimedia.
- Recorrer creación, edición, borrado, ocultación y restauración desde formularios reales; verificar actualización inmediata, cambios de sección y persistencia tras recargar.
- Revisar mensajes de éxito/error y validaciones del CMS, incluidos datos vacíos e importaciones inválidas. Los fallos de almacenamiento deben comunicarse sin simular un guardado exitoso.

**Cierre:** una matriz de las nueve colecciones pasa los recorridos aplicables; las pruebas cubren los fallos reproducidos y la compatibilidad de cartas antiguas; una importación inválida no altera contenido previo y un respaldo incompleto no borra colecciones ausentes.

## 3. Comprobar los recorridos locales completos

**Completado el 4 de octubre de 2026.** Navegación y audio corregidos; TypeScript, 290 unitarias, build/PWA, 40 E2E de desarrollo y un recorrido de preview/offline aprobados. Cierre y límites en [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md).

**Trabajo:**

- Recorrer landing, entrada, escenas, enlaces directos por hash, recarga, atrás/adelante y ajustes.
- Comprobar la coordinación entre música de escenas y playlist: reproducción, pausa, cambio de escena, volumen y regreso, usando audio de prueba local.
- Unificar el tratamiento de rutas de audio cuando sea necesario; comprobar archivos ausentes y enlaces inválidos. Conservar el comportamiento previsto para enlaces externos sin introducir servicios nuevos.
- Revisar montaje/desmontaje, listeners y temporizadores en los flujos tocados, incluidos los que entran o salen de escenas lazy.
- Comprobar desarrollo y preview del build en localhost. Revisar que la PWA y su caché no dejen una versión incoherente tras recargar; definir y documentar el alcance real del funcionamiento offline.

**Cierre:** los recorridos acordados funcionan sin errores de consola no explicados, música simultánea involuntaria ni dependencia de Auth/Storage remotos. Los datos permanecen al recargar.

## 4. Completar el refactor con alcance concreto

**Completado el 4 de octubre de 2026.** Configuración tipada del CMS, transformaciones compartidas de cartas, limpieza de código sin consumidores y cancelación de navegación diferida. Comandos locales repetibles y cuatro `latest` fijados al lock existente. TypeScript, 292 unitarias, build/PWA, 24 E2E afectados y un preview/offline aprobados; revisión y límites en el documento de avance.

**Trabajo:**

- Revisar las responsabilidades del CMS, del lector y de los controladores que se hayan tocado; extraer lógica o configuración cuando reduzca duplicación y haga el flujo más fácil de seguir.
- Ordenar tipos, helpers de rutas, notificaciones de contenido y limpieza de efectos donde exista un problema demostrado.
- Eliminar imports y código obsoletos solo tras comprobar sus consumidores. Mantener la fachada `contentService` y los contratos que sí aportan estabilidad.
- Revisar scripts y comandos de verificación. Preparar comprobaciones locales repetibles de tipos, pruebas y build; recoger la configuración de workers que funcione en este entorno.
- Revisar declaraciones `latest` y reproducibilidad con el lockfile, sin convertir esta etapa en una actualización general de dependencias.

**Cierre:** cada extracción tiene un propósito explicado; los cambios conservan comportamiento y pasan las pruebas correspondientes. No quedan imports rotos ni comandos presentados como operativos que apunten a archivos eliminados.

## 5. Pulir la experiencia existente

**Completado el 7 de octubre de 2026.** Reproductor y navegación, foco/teclado, tamaños móviles, carga diferida, pausa de Canvas y movimiento reducido revisados. TypeScript, 336 unitarias, build/PWA, 60 capturas/nueve ventanas y preview/offline aprobados; los cinco fallos de espera del E2E general pasaron en comprobaciones enfocadas. La suite completa final en una sola corrida se registra en el paso 7. Detalle, causas y límites en el documento de avance.

**Trabajo:**

- Revisar todas las escenas y el CMS en escritorio y móvil: espaciado, texto, formularios, botones, modales, scroll y estados vacíos/de carga/error.
- Resolver las superposiciones observadas entre navegación, reproductor y Entrelazados; comprobar que las mismas piezas no tapan otras escenas o formularios.
- Revisar teclado, foco, etiquetas, contraste, áreas táctiles y preferencia de movimiento reducido en los flujos existentes.
- Medir carga inicial y actividad de animaciones al ocultar escenas. Optimizar lo que la medición justifique, preservando los estados y transiciones de las escenas 3D.
- Mantener la dirección visual del proyecto y distinguir los valores vacíos intencionales de la plantilla de los defectos de interfaz.

**Cierre:** recorridos esenciales utilizables en los tamaños acordados; controles accesibles y sin contenido tapado; comparaciones antes/después para los cambios de rendimiento realizados.

## 6. Alinear documentación y pendientes

**Completado el 7 de octubre de 2026.** Guías y contratos contrastados con código/lockfile, límites del CMS y cartas corregidos, notas antiguas marcadas como históricas y backlog local separado de propuestas futuras. Trece documentos sin enlaces locales rotos, revisión independiente y ningún cambio de runtime en este bloque. Recuperación y resultados en el documento de avance.

**Trabajo:**

- Actualizar `README.md`: instalación y ejecución local, requisitos, arquitectura breve y estado real del proyecto.
- Alinear `CLAUDE.md` y `AGENTS.md` para que ambos agentes sigan instrucciones compatibles, con rutas y comandos vigentes.
- Revisar `GUIA_PARA_EDITAR.md` desde el uso real del CMS: contenido editable, persistencia, cartas bloqueadas, simulación y límites del respaldo.
- Actualizar los contratos de contenido/identidad donde el código local haya cambiado; resolver o explicar diferencias de nombres como `openWhen.json` y `openWhenLetters`.
- Rehacer el estado del `TODO.md`: terminado con evidencia, pendiente local concreto e ideas futuras. Quitar tareas Git obsoletas sin borrar ramas, tags o stash por esa sola razón.
- Marcar `AUDITORIA_ARQUITECTURA.md` y las notas históricas como instantáneas cuando corresponda. Corregir enlaces rotos y separar hechos comprobados de propuestas.
- Mantener los informes de septiembre como evidencia histórica; enlazar un estado de cierre actualizado para no presentarlos como la versión vigente indefinidamente.

**Cierre:** una persona puede arrancar, usar, personalizar y respaldar la versión local siguiendo las guías; los documentos principales coinciden con el código y no dan por activo un despliegue o backend sin comprobarlo.

## 7. Cerrar y entregar una base local verificada

**Completado el 10 de octubre de 2026.** TypeScript, 338 unitarias en 22 archivos, build/PWA, 50 E2E en una única corrida y un preview/offline aprobados, sin reintentos. Corregidos los desplazamientos de foco reproducidos en móvil/tablet y la cancelación del retorno al planeta cuando otra acción ya tomó el foco. Los 83 archivos coinciden con la copia validada antes de actualizar los documentos de cierre; revisión final y recuperación registradas en el avance.

- [x] TypeScript sin errores.
- [x] Pruebas unitarias y de regresión aprobadas con un comando reproducible.
- [x] Suite E2E completa aprobada; fallos previos investigados y corregidos, sin sustituir el resultado por la suma de corridas.
- [x] CRUD y respaldo comprobados mediante recorridos de UI, además de pruebas de almacenamiento.
- [x] Build y preview local aprobados; navegación directa y recargas comprobadas.
- [x] Revisión visual de los recorridos acordados en escritorio y móvil; cinco tamaños comprobados de nuevo por E2E.
- [x] Modo local independiente de Supabase; ninguna activación ni despliegue realizado.
- [x] Documentación y lista de pendientes actualizadas con resultados reales.
- [x] Diff final revisado; cambios existentes y cambios de esta etapa identificables.

La entrega registra qué se terminó, cómo se verificó y las limitaciones conocidas. No quedan pendientes necesarios para los flujos locales acordados dentro de este plan. Las revisiones en otros navegadores, actualización de PWA entre releases y medios externos conservan sus límites explícitos.

## Después de este cierre

Se podrá decidir la siguiente ampliación —por ejemplo Entrelazados, nuevas interacciones o personalización— sobre una base estable. La activación de infraestructura remota y cualquier publicación requieren una etapa posterior solicitada por el usuario. Este plan no las inicia.

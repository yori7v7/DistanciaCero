# Distancia Cero entre escritorio y laptop

Guía preparada el **20 de octubre de 2026**; punto de continuación actualizado el **23 de octubre de 2026** al cerrar compatibilidad y actualización PWA local en el escritorio. Este documento acompaña al código para que otro chat pueda continuar sin depender del historial de una computadora. Actualizar el punto de continuación al entregar un bloque.

## Destino y primera entrega

- Repositorio configurado: `https://github.com/yori7v7/DistanciaCero.git`, **público** al comprobarlo el 20 de octubre.
- Rama de continuidad: `codex/compatibilidad-navegadores`. `main` conserva el punto anterior del proyecto.
- Al preparar inicialmente esta guía, el remoto solo tenía `main` en `0c1e46f`. Esa situación es histórica: el 20 de octubre la laptop recibió `codex/compatibilidad-navegadores` en `3be83c1`, idéntico al checkout limpio y sin divergencia tras `git fetch origin`.
- La rama ya está publicada. El usuario autorizó commits y push normal de los avances de este trabajo a esa misma rama del repositorio indicado. Conservar el destino y la visibilidad; sin force-push, merge a `main`, despliegues ni activación de Supabase.
- Los cuatro commits locales previos incluyen un correo de autor/committer que no es `noreply`; su metadata también será visible si se publican en este destino. La comprobación acotada no encontró credenciales concretas en sus líneas añadidas ni en los dos archivos nuevos de pruebas, pero no constituye una auditoría completa del historial. No se reescribió metadata.
- El workflow `.github/workflows/ci.yml` ejecuta validación en push a `main` o PR hacia `main`, sin un paso de deploy. Esto no descarta integraciones externas. `npm run deploy` sí publica mediante `gh-pages`: no forma parte de sincronizar.

Guardar commits permite traspasar trabajo incompleto si su estado está documentado. Un checkpoint no declara terminada la compatibilidad ni sustituye su validación final.

## Preparar la laptop una sola vez

Los comandos siguientes son para **PowerShell en Windows** y guardan el proyecto en **Descargas**, en la carpeta física `Downloads\DistanciaCero` del perfil del usuario. Si la carpeta de Descargas está redirigida, ajustar `$downloadsPath` a su ubicación. Usar Node 22.13 o posterior de la rama 22, o Node 24 o posterior, para satisfacer las dependencias completas del lockfile; CI utiliza la rama 22. El mínimo de Vite por sí solo no basta para todas las dependencias. Si el equipo usa otro sistema, conservar el flujo Git y adaptar la ruta.

Si faltan herramientas, este primer bloque las instala mediante WinGet. Después de instalar, cerrar por completo la ventana de PowerShell y abrir otra para cargar el PATH actualizado:

```powershell
& {
    $ErrorActionPreference = 'Stop'
    $toolsToInstall = @(
        @{ Command = 'git'; Package = 'Git.Git' }
        @{ Command = 'gh'; Package = 'GitHub.cli' }
        @{ Command = 'node'; Package = 'OpenJS.NodeJS.LTS' }
    )
    foreach ($tool in $toolsToInstall) {
        if (-not (Get-Command $tool.Command -ErrorAction SilentlyContinue)) {
            if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
                throw 'Falta WinGet: instala o actualiza App Installer desde Microsoft Store.'
            }
            winget install --id $tool.Package --exact --source winget --accept-source-agreements --accept-package-agreements
            if ($LASTEXITCODE -ne 0) { throw "No se pudo instalar $($tool.Package)." }
        }
    }
    Write-Host 'Cierra esta ventana de PowerShell y abre otra para continuar.'
}
```

**Ejecutar el clone solo después de que la rama esté publicada.** El bloque comprueba los errores antes de continuar y no sobrescribe una carpeta existente:

```powershell
& {
    $ErrorActionPreference = 'Stop'
    node -e "const [major,minor]=process.versions.node.split('.').map(Number);if(!((major===22&&minor>=13)||major>=24))process.exit(1)"
    if ($LASTEXITCODE -ne 0) { throw 'Usa Node 22.13+ de la rama 22 o Node 24+ para las dependencias del lockfile.' }
    gh auth login --hostname github.com --git-protocol https --web
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar sesión en GitHub.' }
    gh auth setup-git
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar Git.' }
    $downloadsPath = Join-Path $env:USERPROFILE 'Downloads'
    $projectPath = Join-Path $downloadsPath 'DistanciaCero'
    New-Item -ItemType Directory -Force -Path $downloadsPath | Out-Null
    if (Test-Path -LiteralPath $projectPath) { throw "La carpeta ya existe: $projectPath" }
    git clone --branch codex/compatibilidad-navegadores https://github.com/yori7v7/DistanciaCero.git $projectPath
    if ($LASTEXITCODE -ne 0) { throw 'La rama no se pudo clonar. Verifica que ya se haya publicado.' }
    Set-Location -LiteralPath $projectPath
    git config --local pull.ff only
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo configurar fast-forward.' }
    npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'No terminó la instalación de dependencias.' }
    git status --short --branch
}
```

Si se va a ejecutar E2E, instalar una vez los motores de la versión del lockfile con `npx.cmd playwright install chromium firefox webkit`. No es necesario descargar motores solo para leer o editar documentación. Para el trabajo local actual no hacen falta credenciales de Supabase. Se usa `npm.cmd`/`npx.cmd` para evitar depender del permiso de ejecución de wrappers PowerShell.

En Codex, añadir/abrir la carpeta clonada como proyecto local. No basta iniciar sesión con la misma cuenta: sincronizar conversaciones no copia el directorio del código. Se puede abrir un chat nuevo en esa carpeta y escribir:

> Lee AGENTS.md y docs/TRABAJO_ENTRE_EQUIPOS.md, verifica el remoto y prosigue con el pendiente documentado. Estoy en la laptop.

Prompts completos para copiar, dentro de un chat abierto en el proyecto:

**Primera continuación en la laptop:**

```text
Estoy en mi laptop, en el proyecto Distancia Cero que cloné en Descargas. Lee AGENTS.md, CLAUDE.md, docs/TRABAJO_ENTRE_EQUIPOS.md y el estado más reciente de docs/AVANCE_PULIDO_LOCAL.md. Trabaja en codex/compatibilidad-navegadores del remoto https://github.com/yori7v7/DistanciaCero.git. Comprueba el uso normal disponible, los cambios locales y el remoto antes de editar; recibe los cambios por fast-forward cuando sea posible y conserva cualquier trabajo pendiente. Prosigue con el siguiente pendiente documentado, sin dar por terminada la compatibilidad interrumpida. No actives Supabase ni despliegues. Detente si se agota el uso normal; no cambies modelo/modalidad ni uses reserva, compras o resets. Yo indicaré cuándo cambiar de equipo. Antes de entregar, actualiza el estado portable y guarda commits revisados. Si la primera publicación de esta rama ya está comprobada, te autorizo a enviar los avances normales a esa misma rama con push sin force; no publiques otras ramas, no hagas merge a main ni cambies visibilidad. Si la primera publicación sigue pendiente, informa ese estado sin afirmar que ya podemos intercambiar cambios.
```

**Al salir de cualquiera de los dos equipos:**

```text
Voy a cambiar de equipo. Deja este bloque en un punto recuperable: no inicies otro trabajo largo; comprueba si hay pruebas activas y conserva su estado real. Si hay un E2E activo, espera a que termine antes de editar cualquier archivo observado, incluida la documentación. Actualiza docs/TRABAJO_ENTRE_EQUIPOS.md y el avance con lo terminado, lo pendiente y las comprobaciones reales. Revisa y guarda los cambios de este trabajo en commits. Te autorizo a enviarlos con push normal a origin/codex/compatibilidad-navegadores del repositorio ya usado para esta sincronización. Conserva cualquier trabajo ajeno; sin force-push, merge a main ni despliegues. Confirma si la entrega quedó realmente enviada e indica el commit que debe recibir el otro equipo.
```

**Al volver al otro equipo:**

```text
Ya estoy en mi computadora de escritorio [o: en mi laptop]. Antes de editar, lee AGENTS.md, verifica el estado local y recibe de GitHub los últimos cambios de codex/compatibilidad-navegadores mediante fast-forward si es posible. Conserva cualquier cambio local y resuelve la divergencia sin borrar ni forzar el historial. Lee el punto de continuación actualizado en docs/TRABAJO_ENTRE_EQUIPOS.md y el avance, confirma el commit recibido y prosigue con el pendiente documentado. Mantén las restricciones de trabajo local y uso normal. Yo indicaré el próximo cambio de equipo.
```

GitHub/Git y las conexiones de plugins se autentican en cada equipo. Si Git pide identidad para crear commits, configurar el nombre y correo propios del usuario; no inferirlos ni copiar claves privadas.

## Rutina al cambiar de equipo

Una sola computadora trabaja en esta rama a la vez. Con la publicación ya autorizada y configurada, Codex puede realizar estos pasos al recibir «prosigue»:

1. Comprobar uso normal, rama, cambios locales y procesos de pruebas; consultar GitHub mediante `git fetch origin`.
2. Comparar la rama local con `origin/codex/compatibilidad-navegadores`. Con árbol limpio, integrar solo fast-forward (`git pull --ff-only`). Si hay commits locales por enviar o cambios de ambos equipos, conservarlos y evaluar la integración antes de editar. No borrar cambios ni forzar el historial para aparentar sincronización.
3. Leer este punto de continuación y el avance, trabajar dentro del alcance y ejecutar las comprobaciones necesarias.
4. Actualizar el estado portable, revisar el diff y crear commits locales explícitos. Si está autorizada la publicación, enviar con `git push` normal; comprobar que el remoto tiene el mismo commit antes de anunciar la entrega.
5. En la otra computadora, recibir la rama antes de trabajar. Reinstalar dependencias con `npm.cmd ci` en PowerShell si cambió el lockfile o si todavía no existen.

En un clon limpio con upstream configurado, los comandos manuales de la rutina son:

```powershell
git status --short --branch
git pull --ff-only
# Trabajar; revisar y guardar los cambios en commits.
git push
```

La rama ya tiene upstream en el clon de la laptop; usar push normal al destino autorizado. No se necesita merge a `main` ni publicar la web para trasladar código. Sin Internet o con una entrega sin enviar no se puede confirmar que el otro equipo tiene lo último; informar esa situación sin inventar sincronización.

## Qué viaja y qué se queda en cada equipo

Viajan código, lockfile, pruebas, `AGENTS.md`, esta guía, el avance y las skills versionadas en `.agents/skills` y `.claude/skills`. Cada equipo instala sus dependencias y motores de navegador.

No viajan `.env.local`, credenciales, `node_modules`, `dist`, reportes ignorados, configuración global de Codex ni `.git/codex-checkpoints`. Tampoco viajan el localStorage del CMS, cartas y ajustes que solo existan en el navegador. Para trasladar ese contenido usar el respaldo JSON de la aplicación y su importación; transferirlo privadamente, sin añadirlo al repo público. Las pruebas usan perfiles sintéticos.

Las conversaciones pueden tener otra disponibilidad según cliente/configuración. La continuidad del proyecto se apoya en estos archivos versionados; no exige que aparezca este mismo chat ni copiar la carpeta global de Codex.

## Punto de continuación — compatibilidad y PWA local cerradas, 23 de octubre de 2026

**Compatibilidad, PWA local y avisos de aplicación cerrados. Siguiente trabajo autorizado: audio WebKit.** Sobre `bff3bb4` se corrigió la carga diferida con caché compartida y reset síncrono. Tipos/build/PWA, 343 unitarias/23 archivos, PWA A→B 1/1 y Universo compilado 1/1 aprobados; 277 archivos congelados y guards restaurados. Clock permanece como deprecación externa de Fiber: estable 9.8.2 consultada sin instalar todavía la usa. No parchear dependencias ni ocultar avisos. Leer el cierre en el avance; evidencia solo local en `.git/codex-checkpoints/warnings-imports-20261023/`. Recibir el commit de esta entrega realmente publicado, no confundirlo con el baseline. No iniciar funciones nuevas como parte de este cierre ni activar Supabase o desplegar. Conservar la condición de parar al agotarse el uso normal/premium, sin reserva, compras, resets ni cambios de modelo/modalidad.

**Resultado PWA portable confirmado:** después del cierre de compatibilidad, el bloque A→B aprobó **1/1 en Chromium/Windows**, 43,94 s de reporte/22,9 s de caso; tipos, **340 unitarias/22 archivos** y build/PWA también aprobaron, y preview/offline **1/1**, 19,85 s de reporte/9,1 s de caso. Los recorridos conservaron los **275 archivos observados**, sin omitidas/inestables/reintentos/errores externos; guard temporal restaurado y validador aprobado. La corrección añade `registerSW({ immediate: true })` en `main.tsx` y los tipos del cliente virtual para refrescar el documento al detectar una versión nueva. Conserva contenido/progreso ya guardados y comprueba B offline; no garantiza formularios sin guardar ni medios remotos. Identidad/espacio permanecieron nulos, sin acreditar una identidad seleccionada.

**Para reproducir PWA en otro equipo:** preparar dependencias y Chromium y ejecutar `npm.cmd run test:e2e:pwa-update`. El servidor genera sus dos builds propios y los sirve en el mismo origen local, puerto 4175; no necesita el `dist` del escritorio ni modifica `src`/`dist` al generar fixtures. La prueba solicita explícitamente revisar actualizaciones y luego acredita el refresco automático A→B, los chunks nuevos/limpieza final y datos guardados. No acredita instalación, otros motores ni despliegue real; el primer refresco de una pestaña legacy sin el cliente se mantiene como límite inferido, no recorrido verificado. El adjunto temprano de `controllerchange` puede seguir mostrando A; las aserciones posteriores y el adjunto final acreditan B. Detalles centralizados en [RECORRIDOS_LOCALES.md](RECORRIDOS_LOCALES.md) y [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md).

**Código recibido y punto de entrega:** la recepción del escritorio incorporó `ac07ed6` por fast-forward; la compatibilidad se ejecutó sobre **`c1015bc`** y su cierre quedó registrado en **`a56941c`**, baseline del bloque PWA. La nueva corrección y su documentación se guardan después de ese punto; el hash definitivo y el envío se comprueban al crear y publicar el commit, antes de anunciar otra entrega. No confundir los hashes anteriores con el nuevo commit PWA. El destino autorizado sigue siendo `origin/codex/compatibilidad-navegadores`, sin force-push, merge a `main`, despliegue ni cambio de visibilidad.

**Resultado de compatibilidad anterior, separado:** `desktop-awake-20261023` aprobó **100/100 en una corrida, 50 WebKit y 50 Firefox**, salida 0, 4069,33 s (67,82 min), cero omitidas/inestables/reintentos/errores externos y **272 archivos congelados**. Ambos respaldos conservaron documento/CMS real y cero navegaciones. Motores Playwright 1.62.1 en Windows, WebKit con densidad 1 y puerto 5174; guard temporal restaurado. Ese resultado no se repitió ni se suma al caso PWA para anunciar una nueva corrida mayor. Sus límites de Safari y WAV corto permanecen en el avance.

**Para continuar en otro equipo:** recibir por fast-forward el commit de entrega realmente enviado y verificar que coincide con el remoto. Leer el avance y este punto antes de otro bloque. No repetir los 100 automáticamente por Markdown ni tratar estados `running` históricos como procesos activos. Las comprobaciones Chromium del 16 y 19 conservan sus fechas; tipos/unitarias/build se comprobaron de nuevo el 23 para PWA. Reportes/checkpoints del bloque actual quedan en `.git/codex-checkpoints/pwa-update-20261023/` del escritorio y no viajan con pull; el snapshot final se guarda en `closed/`. Las instrucciones de reproducción y este resumen portable permiten retomar sin esos archivos.

### Antecedentes del escritorio antes del cierre

La corrida `desktop-final-20261021` terminó con **61 aprobadas, una fallida y 38 sin ejecutar**, 4154,61 s, salida 1, cero reintentos/inestables y 272 archivos sin cambios. Pasaron los 50 WebKit. Firefox agotó el presupuesto de 180 s en Promesas/originales; el caso duró 27,9 minutos porque Windows entró en suspensión automática por `System Idle`. Los eventos del sistema registran suspensión a **2026-10-22 01:29:34 UTC** y reactivación a **01:57:18 UTC**, dentro del caso. No atribuir la espera interrumpida a un movimiento continuo del botón ni corregir React/CSS sin otra evidencia.

El 23 de octubre, `firefox-promesas-20261023` repitió el caso **sin cambios en aplicación ni pruebas**: **1/1 aprobado**, caso 38,6 s, reporte total 48,70 s, salida 0, cero omitidas/inestables/reintentos/errores externos y hashes de los 272 archivos conservados. No se suma a los 61 para declarar una corrida completa.

**Preparación previa del 23:** `desktop-awake-20261023`, los 100 recorridos con la misma configuración. El supervisor local solicita temporalmente a Windows `ES_CONTINUOUS | ES_SYSTEM_REQUIRED` mediante `SetThreadExecutionState` y restaura el estado anterior al terminar. No cambia el plan de energía ni exige mantener la pantalla encendida; tampoco bloquea una suspensión manual. La solicitud/restauración se comprobó con la API real antes de lanzar la suite. Runner y evidencia siguen solo en `.git/codex-checkpoints/compatibilidad-20261012/` de este escritorio. Su resultado completo se registra arriba; este párrafo conserva la preparación, no una instrucción de iniciar otro runner. En futuras suites, congelar también los documentos hasta terminar. El agotamiento del modelo no obliga a matar un runner local que puede guardar su reporte por sí mismo.

La retoma anterior dejaba pendiente la corrida completa y el cierre; el resultado del 23 resuelve esa validación. Se conserva el criterio de investigar el primer fallo y no declarar 100/100 a partir de parciales. La entrega de laptop siguiente permanece como antecedente fechado.

**Entrega al salir de la laptop:** el usuario indicó cambiar de equipo el 21 de octubre. Antes de editar se comprobó uso normal disponible, árbol limpio, ausencia de runners E2E/Vite/Vitest del proyecto y ausencia de servidor en 5174. `git fetch origin` confirmó local y remoto en **`c666f64`**, sin divergencia ni avances nuevos que recibir por fast-forward. Ese commit y `7732df8` ya estaban publicados. Este bloque solo actualiza y revisa documentación; no inicia pruebas, servidores ni otro trabajo funcional. Recibir también el commit documental de esta entrega, cuyo hash se comunica al confirmar el push, y verificar que `HEAD` coincide con el remoto antes de trabajar desde el destino.

**Resultados comprobados de la laptop, ejecutados el 20 de octubre:**

- Primer intento conjunto: salida 1, **50 WebKit aprobadas, primer Firefox fallido al arrancar y 49 sin ejecutar**, 2917,40 s. Los 272 archivos observados conservaron sus hashes. Firefox no abrió la aplicación; Windows registró `SideBySide` 33 para el ensamblado `mozglue`.
- Instalación limpia del mismo Firefox 153.0 en caché aislada: arrancó, aunque sus 63 archivos son idénticos a la caché estándar. La causa de esa diferencia por ubicación/entorno sigue sin explicar. Caso CMS Firefox aislado **1/1**, salida 0, 11,04 s, sin cambios de archivos.
- Repetición `final-clean`: **10 aprobadas WebKit**, detenida deliberadamente al 98% de uso normal consumido. Estado `interrupted`, 272 archivos sin cambios y **sin reporte final de Playwright**. La salida del proceso terminado no acredita un resultado de suite. Sus otros 90 casos no están acreditados.

No sumar estas corridas entre sí ni con las 92 históricas para declarar `100/100`. Los reportes, logs y caché comprobada permanecen solo en la laptop bajo `.git/codex-checkpoints/laptop-compatibilidad-20261020/`, con subdirectorios `firefox-smoke/`, `final-clean/` y `clean-browsers/`. El destino no los recibe con pull ni debe asumir que dispone de ellos.

**Acción indicada en la entrega de laptop del 21 (antecedente):** después de recibir la entrega por fast-forward y comprobar uso, cambios locales y runners, preparar las dependencias del lockfile si faltan y los motores Firefox/WebKit de Playwright 1.62.1. Si se utiliza caché aislada, fijar `PLAYWRIGHT_BROWSERS_PATH` a una ruta local de ese equipo y mantenerla tanto durante `npx.cmd playwright install firefox webkit` como durante las pruebas. Comprobar que ambos motores arrancan antes de lanzar la suite larga; la diferencia de caché observada en la laptop no garantiza ni impide su arranque en el destino. Obtener una corrida conjunta completa de los 100 casos con la configuración actual, guardando reporte y logs; congelar código y documentos hasta que termine. La recepción y el intento del escritorio se registran arriba; no tratar esta instrucción histórica como otro runner que deba iniciarse en paralelo.

Los puntos siguientes conservan los antecedentes recibidos del escritorio:

- Los pasos 1–7 terminaron el 10 de octubre y su cierre Git local es `4aab097`. La corrección posterior de foco durante gestos de puntero está en `904203f`.
- Aplicación validada el 16 de octubre: TypeScript, **340 unitarias/22 archivos**, build/PWA y **16 E2E Chromium** afectados. No presentar estas fechas como comprobaciones recién ejecutadas en la laptop.
- Las pruebas de compatibilidad usan HTTP loopback real para el WAV sintético de 300 s, esperan la recarga del reset y la primera persistencia antes de sembrar datos, y llevan Canvas al viewport. Configuración Firefox/WebKit: un worker, cero reintentos, WebKit densidad 1, puerto 5174. Presupuestos totales ampliados según [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md), sin omitir clics ni aserciones.
- El 19 de octubre pasaron por separado la muestra CRUD WebKit **3/3** y Chromium audio/reset con los fixtures finales **4/4**. Una sonda nativa de WebKit/Windows reprodujo pausa al reiniciar un WAV de 20 s fuera de la app; no certifica Safari real ni explica la causa interna.
- La corrida conjunta `todos-final-corregido-20261019` se interrumpió **sin reporte final**. El log termina con **92 aprobadas: 50 WebKit y 42 Firefox**. Quedan sin acreditar los ocho últimos casos de interfaz Firefox en esa corrida. No declarar `100/100`, salida 0 ni archivos congelados hasta un término que no existe.
- El 20 de octubre se verificó que los **271 archivos** seguían coincidiendo con los hashes iniciales de esa corrida. Su sesión anterior ya no existe y no quedan el navegador/runner original ni servidor 5174. El `state.json` histórico todavía dice `running`: es un estado obsoleto, no un proceso activo. No sobrescribirlo para fabricar un resultado.
- Comando de validación final en un checkout preparado: `npm.cmd run test:e2e:cross-browser -- --max-failures=1` en PowerShell ejecuta los 100 casos. Guardar el reporte y congelar todos los archivos observados durante la ejecución, incluidos Markdown. Los runners auxiliares y logs de cada equipo permanecen en su propio `.git`; no dar por hecho que existen en el destino.
- El traspaso anterior pedía actualizar README/CLAUDE/TODO/RECORRIDOS/AVANCE y guardar el cierre después de aprobar la corrida completa. Aquel checkpoint de continuidad no era el cierre; la comprobación completa del 23 y la actualización documental se registran ahora arriba.

Evidencia detallada del escritorio en `.git/codex-checkpoints/compatibilidad-20261012/`; snapshot previo a este traspaso en `handoff-preparation-20261020/`. Los resultados anteriores, límites y contratos permanecen en el [avance](AVANCE_PULIDO_LOCAL.md). No restaurar snapshots ni aplicar el stash histórico automáticamente.

## Referencias

- [Proyectos, carpetas y conversaciones de Codex](https://learn.chatgpt.com/docs/projects): sincronización de conversación y acceso a archivos son distintos; el contexto durable puede guardarse en AGENTS/documentación versionada.
- [GitHub CLI: autenticación](https://cli.github.com/manual/gh_auth_login) y [clonar](https://cli.github.com/manual/gh_repo_clone).
- [GitHub CLI en Windows](https://github.com/cli/cli/blob/trunk/docs/install_windows.md); identificadores de WinGet [Git.Git](https://github.com/microsoft/winget-pkgs/tree/master/manifests/g/Git/Git) y [OpenJS.NodeJS.LTS](https://github.com/microsoft/winget-pkgs/tree/master/manifests/o/OpenJS/NodeJS/LTS).
- [Git: pull y fast-forward](https://git-scm.com/docs/git-pull).
- [Windows: solicitud temporal de actividad](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-setthreadexecutionstate).

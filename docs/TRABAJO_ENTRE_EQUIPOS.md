# Distancia Cero entre escritorio y laptop

Estado preparado el **20 de octubre de 2026**. Este documento acompaña al código para que otro chat pueda continuar sin depender del historial de una computadora. Actualizar el punto de continuación al entregar un bloque.

## Destino y primera entrega

- Repositorio configurado: `https://github.com/yori7v7/DistanciaCero.git`, **público** al comprobarlo el 20 de octubre.
- Rama de continuidad: `codex/compatibilidad-navegadores`. `main` conserva el punto anterior del proyecto.
- Al preparar esta guía, el remoto solo tenía `main` en `0c1e46f`. Los cuatro commits hasta `904203f`, las adaptaciones de skills y el trabajo de compatibilidad posterior seguían en escritorio. Clonar `main` en ese estado no trae ese avance.
- La primera publicación de esta rama **no se ha realizado**. Antes de enviarla hay que confirmar el destino público y que ninguna integración externa vaya a desplegarla. Se puede elegir un repositorio privado en vez del destino actual; no cambiar visibilidad ni crear repositorios sin autorización.
- Los cuatro commits locales previos incluyen un correo de autor/committer que no es `noreply`; su metadata también será visible si se publican en este destino. La comprobación acotada no encontró credenciales concretas en sus líneas añadidas ni en los dos archivos nuevos de pruebas, pero no constituye una auditoría completa del historial. No se reescribió metadata.
- El workflow `.github/workflows/ci.yml` ejecuta validación en push a `main` o PR hacia `main`, sin un paso de deploy. Esto no descarta integraciones externas. `npm run deploy` sí publica mediante `gh-pages`: no forma parte de sincronizar.

Guardar commits permite traspasar trabajo incompleto si su estado está documentado. Un checkpoint no declara terminada la compatibilidad ni sustituye su validación final.

## Preparar la laptop una sola vez

Los comandos siguientes son para **PowerShell en Windows** y guardan el proyecto en **Descargas**, en la carpeta física `Downloads\DistanciaCero` del perfil del usuario. Si la carpeta de Descargas está redirigida, ajustar `$downloadsPath` a su ubicación. Usar Node 22.12 o posterior de la rama 22 para coincidir con CI; una LTS posterior también satisface el requisito de Vite documentado en [CLAUDE.md](../CLAUDE.md). Si el equipo usa otro sistema, conservar el flujo Git y adaptar la ruta.

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
    node -e "const [major,minor]=process.versions.node.split('.').map(Number);if(!((major===20&&minor>=19)||(major===22&&minor>=12)||major>22))process.exit(1)"
    if ($LASTEXITCODE -ne 0) { throw 'Node es demasiado antiguo para Vite. Instala una LTS reciente antes de continuar.' }
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

El primer envío desde escritorio, una vez revisado y autorizado, será `git push --set-upstream origin codex/compatibilidad-navegadores`. Este documento no lo ejecuta ni autoriza. No se necesita merge a `main` ni publicar la web para trasladar código. Sin Internet o con una entrega sin enviar no se puede confirmar que el otro equipo tiene lo último; informar esa situación sin inventar sincronización.

## Qué viaja y qué se queda en cada equipo

Viajan código, lockfile, pruebas, `AGENTS.md`, esta guía, el avance y las skills versionadas en `.agents/skills` y `.claude/skills`. Cada equipo instala sus dependencias y motores de navegador.

No viajan `.env.local`, credenciales, `node_modules`, `dist`, reportes ignorados, configuración global de Codex ni `.git/codex-checkpoints`. Tampoco viajan el localStorage del CMS, cartas y ajustes que solo existan en el navegador. Para trasladar ese contenido usar el respaldo JSON de la aplicación y su importación; transferirlo privadamente, sin añadirlo al repo público. Las pruebas usan perfiles sintéticos.

Las conversaciones pueden tener otra disponibilidad según cliente/configuración. La continuidad del proyecto se apoya en estos archivos versionados; no exige que aparezca este mismo chat ni copiar la carpeta global de Codex.

## Punto de continuación — 20 de octubre de 2026

**Compatibilidad abierta; no empezar PWA entre versiones, limpieza de warnings ni funciones nuevas.** No activar Supabase ni desplegar. Conservar la condición de parar al agotarse el uso normal/premium, sin reserva, compras, resets ni cambios de modelo/modalidad.

- Los pasos 1–7 terminaron el 10 de octubre y su cierre Git local es `4aab097`. La corrección posterior de foco durante gestos de puntero está en `904203f`.
- Aplicación validada el 16 de octubre: TypeScript, **340 unitarias/22 archivos**, build/PWA y **16 E2E Chromium** afectados. No presentar estas fechas como comprobaciones recién ejecutadas en la laptop.
- Las pruebas pendientes usan HTTP loopback real para el WAV sintético de 300 s, esperan la recarga del reset y la primera persistencia antes de sembrar datos, y llevan Canvas al viewport. Configuración Firefox/WebKit: un worker, cero reintentos, WebKit densidad 1, puerto 5174. Presupuestos totales ampliados según [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md), sin omitir clics ni aserciones.
- El 19 de octubre pasaron por separado la muestra CRUD WebKit **3/3** y Chromium audio/reset con los fixtures finales **4/4**. Una sonda nativa de WebKit/Windows reprodujo pausa al reiniciar un WAV de 20 s fuera de la app; no certifica Safari real ni explica la causa interna.
- La corrida conjunta `todos-final-corregido-20261019` se interrumpió **sin reporte final**. El log termina con **92 aprobadas: 50 WebKit y 42 Firefox**. Quedan sin acreditar los ocho últimos casos de interfaz Firefox en esa corrida. No declarar `100/100`, salida 0 ni archivos congelados hasta un término que no existe.
- El 20 de octubre se verificó que los **271 archivos** seguían coincidiendo con los hashes iniciales de esa corrida. Su sesión anterior ya no existe y no quedan el navegador/runner original ni servidor 5174. El `state.json` histórico todavía dice `running`: es un estado obsoleto, no un proceso activo. No sobrescribirlo para fabricar un resultado.
- Siguiente trabajo funcional: obtener una validación final completa con la configuración actual. En un checkout preparado, `npm.cmd run test:e2e:cross-browser -- --max-failures=1` en PowerShell ejecuta los 100 casos. Guardar el reporte y congelar todos los archivos observados durante la ejecución, incluidos Markdown; no tocar documentación hasta que termine. El script durable anterior y los logs están solo en el checkpoint del escritorio; no dar por hecho que existen en la laptop.
- Después de aprobar la corrida completa, actualizar README/CLAUDE/TODO/RECORRIDOS/AVANCE, revisar enlaces y guardar el cierre de compatibilidad. El trabajo aquí guardado es un checkpoint de continuidad, no ese cierre.

Evidencia detallada del escritorio en `.git/codex-checkpoints/compatibilidad-20261012/`; snapshot previo a este traspaso en `handoff-preparation-20261020/`. Los resultados anteriores, límites y contratos permanecen en el [avance](AVANCE_PULIDO_LOCAL.md). No restaurar snapshots ni aplicar el stash histórico automáticamente.

## Referencias

- [Proyectos, carpetas y conversaciones de Codex](https://learn.chatgpt.com/docs/projects): sincronización de conversación y acceso a archivos son distintos; el contexto durable puede guardarse en AGENTS/documentación versionada.
- [GitHub CLI: autenticación](https://cli.github.com/manual/gh_auth_login) y [clonar](https://cli.github.com/manual/gh_repo_clone).
- [GitHub CLI en Windows](https://github.com/cli/cli/blob/trunk/docs/install_windows.md); identificadores de WinGet [Git.Git](https://github.com/microsoft/winget-pkgs/tree/master/manifests/g/Git/Git) y [OpenJS.NodeJS.LTS](https://github.com/microsoft/winget-pkgs/tree/master/manifests/o/OpenJS/NodeJS/LTS).
- [Git: pull y fast-forward](https://git-scm.com/docs/git-pull).

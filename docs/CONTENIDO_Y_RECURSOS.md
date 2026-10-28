# Contenido y recursos de la plantilla

Inventario del 26 de octubre de 2026. El usuario eligió conservar una plantilla reutilizable sin datos personales. Los 15 JSON incluyen 127 ejemplos en las nueve colecciones, siete planetas, tres recuerdos sin imagen, cinco canciones sin enlace, 14 entradas de audio de escena vacías y una lista de frases vacía. Los nombres y fechas de ejemplo no representan una historia real.

| Contenido | Dónde cambiarlo |
| --- | --- |
| Siete nombres y fechas | CMS: Configura tu universo o Ajustes generales |
| Nueve colecciones | CMS: Originales o Tus creaciones |
| Audio de ambiente | `src/data/siteConfig.json`, `audio.backgroundTrackPath` |
| Audio por escena | `src/data/sceneMusic.json`; la navegación elige `musicSectionId` en `scenes.json` |
| Dos puntos y distancia | `siteConfig.json`, `distanceMap.point1/point2` y `kilometers` |
| Pregunta y su fecha | `src/data/proposal.json` |
| Carta principal | `src/components/MainLetter.tsx` |
| Textos, tamaño y colores de planetas | `src/data/universe.json` |

La plantilla deja sin configurar ambiente, enlaces de canciones y ubicaciones. Sus controles muestran pendientes; no abren destinos ficticios ni solicitan un MP3 inexistente. Todas las canciones, incluida la primera, usan su propia fila; el ambiente es independiente. Los enlaces de canciones/mapa deben ser HTTP(S). La distancia se introduce manualmente, no se consulta ni calcula en Maps.

Para audio local, copiar un archivo propio a `public/audio/` y configurar `/audio/nombre.mp3`. Ejemplo de ambiente: guardar `public/audio/background.mp3` y establecer `audio.backgroundTrackPath` a `/audio/background.mp3`. Una ruta guardada en el CMS no copia el archivo. Las fotos pueden tener una ruta/URL o pegarse como Data URL. El campo de video se conserva como enlace en el respaldo; el lector actual no lo reproduce.

Para música por escena, ejecutar desde la raíz en PowerShell:

```powershell
.\scripts\agregar-cancion.ps1 -SectionId historia -FilePath "$env:USERPROFILE\Downloads\mi-cancion.mp3" -Title "Mi canción" -Artist "Artista" -Volume 0.7
```

Usar el ID exacto de `sceneMusic.json`, incluido `entrelazados`. El script valida antes de copiar y recupera audio/configuración ante fallos capturados; conservar los originales. La prueba aislada se ejecuta con `pwsh -NoProfile -File scripts/test-agregar-cancion.ps1` o `powershell.exe -NoProfile -File scripts/test-agregar-cancion.ps1`.

`npm.cmd run check:resources` comprueba referencias configuradas sin acceder a Internet: distingue pendientes de archivos ausentes, rechaza rutas fuera de `public/` e informa enlaces externos sin verificar su disponibilidad. Si las rutas ya incluyen una base distinta de `/`, proporcionar el mismo `VITE_BASE`. `verify:local` incluye esta comprobación entre tipos y unitarias. No valida medios añadidos solo al almacenamiento del navegador ni garantiza formatos reproducibles.

Campos reservados sin efecto actual: apodos/nombres completos, metadata de repositorio, `siteConfig.dates.proposalDate`, `audio.afterMainPlaylistName/Link`, `sceneMusic.plannedSrc` y claves narrativas de `secret`. Las órbitas, velocidades y anillos los define `ORBIT_CONFIGS` de `UniverseSection.tsx`; `orbit`, `duration`, `delay` y `hasRing` del JSON no los controlan. Se conservan por compatibilidad.

El respaldo traslada contenido y siete ajustes generales, no archivos físicos, mapa ni configuración de audio. Compartirlo privadamente, sin añadir datos personales al repositorio público. La respuesta a la pregunta no bloquea escenas y la plantilla local no restringe acceso mediante nombres.


Cierre del 27 de octubre: tipos, auditor sin errores, 411 unitarias/29 archivos y build/PWA aprobados. Cinco E2E Chromium y el caso móvil final aprobaron en corridas separadas. Importador: siete grupos aprobados en PowerShell 5.1 y 7. Resultados y límites en [AVANCE_PULIDO_LOCAL.md](AVANCE_PULIDO_LOCAL.md).

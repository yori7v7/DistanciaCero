# Distancia Cero

Plantilla de un universo romántico con cartas, recuerdos, música y escenas 3D. Funciona localmente con React, archivos JSON y contenido guardado en el navegador.

Los siete pasos del refactor y pulido local quedaron cerrados el 10 de octubre de 2026. La validación final aprobó tipos, 338 unitarias, 50 recorridos de navegador y preview/offline. El [documento de avance](docs/AVANCE_PULIDO_LOCAL.md) conserva resultados, límites y puntos de recuperación. El backend permanece desactivado y la aplicación no se ha publicado en esta etapa.

La etapa posterior de compatibilidad quedó cerrada el **23 de octubre de 2026**: **100/100 recorridos en una sola corrida, 50 en Firefox y 50 en WebKit**, en Windows, sin omitidas, inestables ni reintentos. El [punto de continuación entre equipos](docs/TRABAJO_ENTRE_EQUIPOS.md) separa ese cierre de los trabajos futuros.

Ese mismo día se comprobó por separado la actualización PWA entre dos builds locales A→B en Chromium/Windows, conservando datos guardados y funcionando offline en B. Los [recorridos locales](docs/RECORRIDOS_LOCALES.md) explican su alcance y límites.

## Ejecutar localmente

Para seguir esta guía, utilizar Node.js 22.13 o posterior de la rama 22, o Node 24 o posterior, y npm. El lockfile de jsdom exige al menos 22.13 en la rama 22; el mínimo de Vite por sí solo (22.12 en esa rama) no basta para todas las dependencias. CI utiliza Node 22.

```powershell
npm ci
npm run dev
```

Abrir `http://localhost:5173/` y pulsar **Entrar al universo**. `/app` abre directamente la experiencia; `/app#/cartas` abre la escena de cartas. `npm ci` instala las versiones del lockfile. Si el puerto está ocupado, comprobar la dirección que muestra el servidor.

Para ver el build local:

```powershell
npm run build
npm run preview
```

Preview utiliza normalmente `http://localhost:4173/`. El contenido del navegador pertenece a cada origen: cambiar de puerto, de `localhost` a `127.0.0.1`, o de navegador muestra otro almacenamiento. Para trasladar contenido, exportar e importar un respaldo desde el CMS.

## Personalizar y respaldar

En `/app`, abrir **Ajustes → Centro del Universo**. El panel edita nueve colecciones: razones, promesas, fechas, sueños, historia, galería, playlist, cartas mensuales y cartas «Abrir cuando». **Originales** permite personalizar, ocultar y restaurar datos base; **Tus creaciones** permite crear, editar y eliminar contenido local.

Las ediciones del panel se guardan en ese navegador, sin cambiar los archivos del proyecto. Exportar un respaldo JSON permite conservar creaciones, personalizaciones y ocultos; no incluye progreso, identidad, ajustes ni archivos multimedia externos. La importación acepta v1/v2, valida antes de escribir y conserva los apartados ausentes de un respaldo parcial.

La configuración general y los planetas se editan en archivos:

| Archivo | Contenido |
| --- | --- |
| `src/data/siteConfig.json` | Nombres, fechas, portada, claves narrativas y audio de ambiente |
| `src/data/universe.json` | Centro y planetas del universo 3D |
| `src/data/sceneMusic.json` | Música de cada escena |
| `src/data/scenes.json` | Escenas y navegación |
| Otros JSON en `src/data/` | Contenido base de las nueve colecciones, propuesta y frases |

`openWhen.json` es el archivo base de la colección `openWhenLetters`; la diferencia de nombres se conserva por compatibilidad. La carta principal tiene su texto en `src/components/MainLetter.tsx`.

Guardar imágenes/audio/video propios en `public/` y utilizar sus rutas. La plantilla referencia `/audio/background.mp3` sin incluir ese archivo y deja vacía la música de escenas. Pegar una ruta en el CMS no copia un archivo al proyecto.

La [guía de edición](GUIA_PARA_EDITAR.md) explica bloqueos manuales, simulación, archivos y respaldo. Los [recorridos locales](docs/RECORRIDOS_LOCALES.md) describen navegación, foco, audio y límites offline. Las claves y las identidades locales son parte de la experiencia; no constituyen autenticación privada de un servidor.

## Comprobar cambios

```powershell
npm run verify:local       # Tipos → unitarias → build; remoto desactivado
npm run test:e2e           # Recorridos de desarrollo, Chromium
npm run test:e2e:preview   # Build ya generado; PWA y offline en preview
npm run test:e2e:cross-browser # Recorridos de desarrollo, Firefox y WebKit
npm run test:e2e:pwa-update # Dos builds locales A→B; genera sus propios fixtures
```

En una instalación nueva, preparar Chromium con `npx playwright install chromium` y los motores adicionales con `npx playwright install firefox webkit`. Se descargan los motores de la versión de Playwright del lockfile. Para pruebas individuales: `npm test -- src/__tests__/contentService.test.ts`.

La validación final del 10 de octubre aprobó **338 unitarias en 22 archivos, los 50 E2E en una sola corrida y un recorrido de preview/PWA/offline**, sin reintentos de navegador. Incluye los diez casos de interfaz y cinco tamaños de pantalla en Chromium. La corrección posterior de foco/puntero se comprobó el 16 de octubre con **340 unitarias en 22 archivos, tipos/build/PWA y 16 E2E Chromium afectados**; el 19 pasaron los cuatro casos Chromium de audio/reset con los fixtures finales. Son comprobaciones distintas, conservadas con sus fechas.

El 23 de octubre, Firefox y WebKit aprobaron juntos los **100 E2E**, en 67,82 minutos, con perfiles sintéticos y 272 archivos congelados sin cambios. WebKit se ejecutó con densidad de pantalla 1. Esta cobertura en Windows no acredita Safari/macOS/iPhone reales, certificación WCAG ni PWA entre versiones. No se ejecutó CI desde este trabajo local. Resultados y límites en el [avance](docs/AVANCE_PULIDO_LOCAL.md) y los [recorridos](docs/RECORRIDOS_LOCALES.md).

El bloque PWA posterior aprobó **1/1 A→B y 1/1 preview/offline**, además de TypeScript, **340 unitarias en 22 archivos** y build/PWA. Son comprobaciones separadas de los 100 de compatibilidad.

Durante E2E de desarrollo, dejar congelados también los documentos: el escáner de Tailwind puede recargar la página al editar Markdown. Actualizar notas después de terminar las pruebas.

## Arquitectura y estado

React 19, TypeScript 7, Vite 8, Tailwind CSS 4 y Three.js con React Three Fiber/Drei. El flujo de contenido es `componentes → contentService → localContentRepository → localContentStore → localStorage`. El CMS comparte configuración y formularios; los dos lectores comparten `LetterCollectionSection`. Las secciones pesadas se cargan en su primera visita y conservan estado al ocultarse.

La PWA conserva la aplicación previamente cargada y el nuevo cliente de registro coordina el refresco del documento al detectar una actualización. Se comprobó A→B localmente en Chromium/Windows, con contenido y progreso ya guardados; no garantiza formularios sin guardar, instalación, medios remotos ni despliegue real. El código remoto de Supabase sigue fuera de esta etapa y no se considera listo para producción. Los archivos de publicación existentes no acreditan un despliegue actual.

Para trabajar en el código, leer [CLAUDE.md](CLAUDE.md) y [AGENTS.md](AGENTS.md), que comparten reglas de arquitectura y alcance. Contratos vigentes: [contenido](docs/CONTENT_CONTRACT.md) e [identidad](docs/IDENTITY_CONTRACT.md). La [auditoría de agosto](AUDITORIA_ARQUITECTURA.md) y los informes de septiembre son históricos.

## Uso

Libre para uso personal y portafolio. Modifica, comparte y adapta como quieras.

El mantenimiento local del 23 de octubre resolvió los avisos de tamaño de chunks e import dinámico: tipos, 343 unitarias/23 archivos, build/PWA y regresiones PWA/Universo aprobados. Clock permanece como deprecación de Fiber, sin ocultarla ni cambiar dependencias. Estado y límites en el avance.

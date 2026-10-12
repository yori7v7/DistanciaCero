# Distancia Cero

Plantilla de un universo romántico con cartas, recuerdos, música y escenas 3D. Funciona localmente con React, archivos JSON y contenido guardado en el navegador.

Los siete pasos del refactor y pulido local quedaron cerrados el 10 de octubre de 2026. La validación final aprobó tipos, 338 unitarias, 50 recorridos de navegador y preview/offline. El [documento de avance](docs/AVANCE_PULIDO_LOCAL.md) conserva resultados, límites y puntos de recuperación. El backend permanece desactivado y la aplicación no se ha publicado en esta etapa.

## Ejecutar localmente

Requisitos: Node.js 22.12 o posterior de la rama 22 y npm. El Vite instalado también admite Node 20.19 o posterior; CI utiliza Node 22.

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
```

En una instalación nueva, preparar el navegador de pruebas con `npx playwright install chromium`. Para pruebas individuales: `npm test -- src/__tests__/contentService.test.ts`.

La validación final del 10 de octubre aprobó **338 unitarias en 22 archivos, los 50 E2E en una sola corrida y un recorrido de preview/PWA/offline**, sin reintentos de navegador. Incluye los diez casos de interfaz y cinco tamaños de pantalla en Chromium. Resultados exactos y límites en el [avance](docs/AVANCE_PULIDO_LOCAL.md); no se ha ejecutado CI ni comprobado otros navegadores en esta etapa.

Durante E2E de desarrollo, dejar congelados también los documentos: el escáner de Tailwind puede recargar la página al editar Markdown. Actualizar notas después de terminar las pruebas.

## Arquitectura y estado

React 19, TypeScript 7, Vite 8, Tailwind CSS 4 y Three.js con React Three Fiber/Drei. El flujo de contenido es `componentes → contentService → localContentRepository → localContentStore → localStorage`. El CMS comparte configuración y formularios; los dos lectores comparten `LetterCollectionSection`. Las secciones pesadas se cargan en su primera visita y conservan estado al ocultarse.

La PWA conserva la aplicación previamente cargada; no garantiza medios externos ni se ha comprobado una actualización entre releases. El código remoto de Supabase sigue fuera de esta etapa y no se considera listo para producción. Los archivos de publicación existentes no acreditan un despliegue actual.

Para trabajar en el código, leer [CLAUDE.md](CLAUDE.md) y [AGENTS.md](AGENTS.md), que comparten reglas de arquitectura y alcance. Contratos vigentes: [contenido](docs/CONTENT_CONTRACT.md) e [identidad](docs/IDENTITY_CONTRACT.md). La [auditoría de agosto](AUDITORIA_ARQUITECTURA.md) y los informes de septiembre son históricos.

## Uso

Libre para uso personal y portafolio. Modifica, comparte y adapta como quieras.

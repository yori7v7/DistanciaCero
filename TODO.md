# Pendientes — Distancia Cero

Estado del **25 de octubre de 2026**. Los siete pasos de [el plan de pulido local](docs/PLAN_PULIDO_LOCAL.md) cerraron el 10 de octubre; compatibilidad Firefox/WebKit y actualización PWA local cerraron después, el 23. Los resultados conservan sus fechas y recuperación en [AVANCE_PULIDO_LOCAL.md](docs/AVANCE_PULIDO_LOCAL.md); el [traspaso](docs/TRABAJO_ENTRE_EQUIPOS.md) registra cómo continuar entre equipos.

## Trabajo local terminado

- [x] **Paso 1 — refactor pendiente de Claude:** lector compartido, tipos, simulación/progreso y cambios previos comprobados.
- [x] **Paso 2 — contenido y respaldos:** migración v2, restauración validada/recuperable, nueve colecciones y errores de persistencia comprobados.
- [x] **Paso 3 — recorridos locales:** hash/historial, audio exclusivo y cancelable, archivos ausentes y preview/offline comprobados.
- [x] **Paso 4 — refactor focalizado:** configuración tipada del CMS, conversiones compartidas, cancelación de timers, limpieza y comandos reproducibles.
- [x] **Paso 5 — experiencia existente:** reproductor en flujo, cinco tamaños, teclado/foco, cargas/errores, selectores de planetas y movimiento reducido. Comparación medida de carga y animaciones ocultas.
- [x] TypeScript y **338 unitarias en 22 archivos**, junto con build/PWA, aprobados en la validación final del paso 7.
- [x] Nombres `openWhen.json` / `openWhenLetters` documentados: archivo base y colección persistida respectivamente; se conservan por compatibilidad.
- [x] Revisadas responsabilidades de CMS/lectores/controladores dentro del alcance. La auditoría de agosto se conserva como histórica.
- [x] **Paso 6 — documentación:** README, contexto de agentes, guía, contratos y pendientes alineados; 13 documentos sin enlaces locales rotos. Revisión independiente y reglas de recuperación documentadas.
- [x] **Paso 7 — entrega final:** 338 unitarias, tipos/build, **50 E2E en una sola corrida y 1 preview/offline**, sin reintentos. Scrolls de foco corregidos y comprobados, diff revisado y copia final de recuperación guardada.

## Compatibilidad posterior terminada — 23 de octubre

- [x] Corrección de foco durante gestos de puntero y dos regresiones: **340 unitarias/22 archivos, tipos/build/PWA y 16 Chromium afectados**, comprobados el 16 de octubre. Los cuatro casos Chromium de audio/reset con los fixtures finales pasaron el 19.
- [x] **100/100 E2E en una corrida**, 50 WebKit y 50 Firefox, 67,82 min, cero omitidas/inestables/reintentos/errores externos y 272 archivos congelados. Documento y CMS conservados en ambos respaldos; guard temporal de suspensión restaurado al finalizar.

## Actualización PWA local terminada — 23 de octubre

- [x] Cliente de registro para refrescar el documento al detectar una versión nueva; regresión A→B **1/1 en Chromium/Windows**, preservando datos guardados y comprobando B offline con chunks nuevos. Dos builds propios en el mismo origen, sin modificar `src`/`dist` ni desplegar.
- [x] TypeScript, **340 unitarias/22 archivos**, build/PWA y **1/1 preview/offline** aprobados después de la corrección. Los recorridos de navegador conservaron los 275 archivos observados, sin reintentos. Límites en [RECORRIDOS_LOCALES.md](docs/RECORRIDOS_LOCALES.md).

## Investigación de audio delimitada — 24 de octubre

- [x] Matriz nativa de 18 observaciones: 16 pausas estables en WebKit 26.5/27.2 y dos controles Chromium con dos vueltas y avance (WAV/MP3). Sin React, datos reales, cambios en el reproductor ni dependencias del proyecto.
- [ ] El loop nativo de esos WebKit/Windows sigue siendo una limitación; no se conoce su causa interna ni se acredita Safari real. No implementar autoresume ante pause para ocultarlo.

## Tipado focalizado terminado — 25 de octubre

- [x] Retirados cinco casts de datos base en `App` que ya satisfacen los contratos de cartas/colecciones; inferencia del filtro de escenas y mapa `LucideIcon` en el controlador. Siete usos innecesarios de `any`, sin cambiar el contrato dinámico del CMS.
- [x] `verify:local`: tipos, **343/343 unitarias en 23 archivos** y build/PWA aprobados; 277 archivos conservados durante el runner. Los dos TSX producen el mismo JavaScript transformado y los 24 assets JS compilados coinciden con la referencia bajo la misma configuración local. No se repitieron E2E por estos cambios exclusivamente de tipos.

## Trabajo local pendiente

Los pasos 1–7, compatibilidad, PWA, avisos de aplicación y este bloque acotado de tipado están terminados. La investigación inicial del audio quedó delimitada el 24 de octubre: el loop continúa sin corregirse en los WebKit/Windows probados, sin defecto de aplicación demostrado. Permanecen Clock y los límites siguientes; no se declara tipado estricto de toda la aplicación.

- [ ] Validar en dispositivos reales cuando estén disponibles: Safari/macOS/iPhone y, si se usa, instalación PWA. Los motores de Playwright en Windows no sustituyen esas comprobaciones. No hay un dispositivo Apple disponible en esta sesión ni se ha iniciado esa validación.

Cualquier ampliación de funciones, infraestructura o refactor del contenido dinámico requiere acordar su alcance. Durante Vite/E2E se congelan también los documentos para evitar recargas de Tailwind.

## Límites y deuda visible

- La cobertura de desarrollo incluye Chromium (comprobaciones del 10/16/19) y Firefox/WebKit de Playwright en Windows (23), con cinco tamaños y WebKit densidad 1. No acredita Safari/macOS/iPhone reales, otros dispositivos ni certificación WCAG completa.
- WebKit 26.5 en este Windows reprodujo fuera de la aplicación una pausa nativa al cruzar el loop de un WAV de 20 s, con volumen cero y pausa/reanudación cerca del final. El síntoma está observado; su causa interna no está explicada. El WAV de 300 s de las pruebas evita ese límite durante los controles, sin declarar corregido el loop ni extrapolar a otros formatos/equipos.
- La actualización PWA A→B se comprobó localmente en Chromium/Windows y el mismo origen; no acredita instalación, Safari ni despliegue real. Conserva datos guardados, sin garantizar formularios sin guardar o medios externos offline. La primera recarga de pestañas antiguas sin el nuevo cliente se mantiene como límite inferido, no como recorrido verificado.
- El aviso de chunks grandes se resolvió con grupos React/Three en el build local: máximo 372,57 kB, sin subir el umbral. El import dinámico también quedó corregido mediante caché compartida y carga diferida, con 343 unitarias/23 archivos y regresiones PWA/Universo. Clock permanece como deprecación externa de Fiber, incluida en su estable 9.8.2 consultada sin instalar.
- Algunas estructuras de contenido conservan campos dinámicos y casts históricos; el CMS y el lector compartido tienen tipos concretos. Ampliar tipado solo con un alcance y regresiones claros.
- `siteConfig.secret` conserva campos de plantilla sin una sección consumidora actual; no hay autenticación privada mediante esas claves.
- El inventario Git de septiembre es histórico. `main`, los tags y el stash WIP se preservaron; no hace falta aplicarlos ni eliminarlos para cerrar el trabajo local. Cualquier decisión de limpieza requiere un encargo posterior.

## Ideas para otra etapa

Estas propuestas no forman parte del cierre local y no están activadas:

- Ampliar Entrelazados y sus interacciones después de acordar su concepto.
- Rediseñar el CMS o las transiciones por una dirección visual nueva; el pulido funcional actual ya está comprobado.
- Añadir onboarding, revelado gradual o generación asistida de contenido.
- Revisar infraestructura remota: repositorio, Auth/UUIDs, aislamiento, sincronización, archivos y migración. El código existente no acredita preparación de producción; habilitar Supabase requiere otra etapa solicitada.
- Elegir y preparar una publicación futura. Los scripts de GitHub Pages y la configuración Vercel existentes no acreditan un despliegue actual.

Las propuestas futuras no se consideran realizadas ni forman parte de la validación del cierre local.

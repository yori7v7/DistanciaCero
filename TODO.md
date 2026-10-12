# Pendientes — Distancia Cero

Estado del 10 de octubre de 2026. Los siete pasos de [el plan de pulido local](docs/PLAN_PULIDO_LOCAL.md) están cerrados. Los resultados y las copias de recuperación están en [AVANCE_PULIDO_LOCAL.md](docs/AVANCE_PULIDO_LOCAL.md).

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

## Trabajo local pendiente

No quedan tareas abiertas dentro del alcance acordado de los pasos 1–7. Los límites siguientes se mantienen visibles y cualquier ampliación requiere acordar su alcance. Durante Vite/E2E se congelan también los documentos para evitar recargas de Tailwind.

## Límites y deuda visible

- La cobertura visual/teclado se comprobó en Chromium y cinco tamaños; queda una revisión futura en navegadores y dispositivos reales, sin declarar certificación WCAG completa.
- La PWA se comprobó con el build actual previamente cargado. Falta probar una actualización entre releases; medios externos no tienen garantía offline.
- Se conservan avisos de tamaño de chunks/import dinámico y de `THREE.Clock`. No impidieron los recorridos locales; valorar su limpieza en un bloque acotado posterior.
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

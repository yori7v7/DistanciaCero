# TODO — DistanciaCero

Backlog vivo del proyecto. Se actualiza con cada feature, bug, o idea. Claude lee esto al iniciar sesión.

**Leyenda**: `🔥 urgente` · `🔨 en progreso` · `💡 idea` · `🐛 bug` · `✅ hecho`

---

## 🔨 En progreso

- [ ] **Entrelazados Phase 2+** — expandir los dos cubos conscientes (visión completa en mi cabeza)
- [ ] **Polish UI/UX incremental** — mejoras orgánicas que voy detectando al usar la app

---

## 🚀 Features planeadas

- [ ] **Migrar deploy a Vercel** — `vercel.json` ya existe, base path ya es `/` por defecto. Quitar dependencia de `gh-pages`
- [ ] **Push integral del repo** — 289+ commits locales sin push. Sincronizar `origin/main` con todo el historial real
- [ ] **Reescribir `GUIA_PARA_EDITAR.md`** — actualizarla a estado actual: CMS-first para la usuaria final, quitar referencias a JSONs inexistentes, enfoque no-técnico
- [ ] **Activar Supabase (Fase S5)** — cuando haya datos reales de la relación. Gate: tener pareja y contenido real que sincronizar
  - [ ] Crear proyecto Supabase real (no lab desechable)
  - [ ] Implementar `remoteContentRepository` (actualmente es skeleton)
  - [ ] Mapping de UUIDs locales → Auth real
  - [ ] Storage para media (fotos, audio)
  - [ ] Activar feature flag `VITE_REMOTE_CONTENT_ENABLED=true`

---

## 🎨 UI/UX — Ideas de polish

*Ideas que van surgiendo al usar la app. Sin urgencia — se priorizan cuando hay inspiración.*

- [ ] **CMS (CrudEditorPanel)** — pulir para que sea intuitivo y bonito (es lo que usará la usuaria final)
- [ ] **Animaciones de transición entre secciones** — más fluidez tipo "apple keynote"
- [ ] **Universo 3D** — más magia visual, partículas, interactividad en los planetas
- [ ] **Landing (`/`)** — primera impresión wow, blur/sizing optimizado
- [ ] **Responsive/mobile** — verificar que todo funcione en móvil (ella probablemente lo abrirá en el teléfono)

---

## 🐛 Bugs conocidos

*Reportar aquí cuando algo no funcione como esperas.*

- *(vacío por ahora — agregar según surjan)*

---

## 🧱 Deuda técnica

- [ ] **Limpiar branches locales** — 43 branches, todos mergeados a `main`. Se pueden borrar para reducir ruido
- [ ] **Alinear `GUIA_PARA_EDITAR.md` con datos reales** — referencia ~10 JSONs que ya no existen
- [ ] **`openWhen.json` vs `openWhenLetters`** — el archivo y la colección tienen nombres distintos. Unificar o documentar
- [ ] **Stash WIP** — hay un stash sin aplicar ("debug: temporarily remove lazy loading to isolate crash"). Resolver o descartar
- [x] TypeScript 0 errores ✅
- [x] 162 tests pasando ✅
- [x] Clean Architecture implementada ✅
- [x] Design system con catálogo visual ✅

---

## 💡 Ideas a futuro

*Parking lot de ideas que pueden o no hacerse. Sin compromiso.*

- [ ] **Generación de contenido con IA** — Claude ayuda a crear cartas, razones, misiones en lote (yo curo, él escribe JSONs)
- [ ] **Onboarding interactivo** — tutorial para la usuaria final la primera vez que entra
- [ ] **Modo "sorpresa"** — revelar secciones gradualmente (gamificación de la experiencia)
- [ ] **Más metáforas cuánticas** — entrelazados, superposición, observador... como narrativa visual

---

*Última actualización: 2026-08-06 · Formato inspirado en el grill session 🔥*

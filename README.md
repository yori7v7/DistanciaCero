# Distancia Cero 🌌

**Plantilla de universo digital romántico.** Una SPA interactiva con cartas, recuerdos, música 3D, misiones y secretos — diseñada para ser personalizada y desplegada fácilmente.

> 💡 **Ideal para:** regalo romántico, portafolio de desarrollo, o base para proyectos interactivos con React + Three.js.

---

## 🚀 Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Build producción
npm run deploy     # Deploy a GitHub Pages
```

---

## 🎨 Cómo personalizar

Todo el contenido editable está en `src/data/`. El archivo principal:

📄 **`src/data/siteConfig.json`** — nombres, fechas, contraseñas, audio.

Luego cada sección tiene su propio JSON:
- `timeline.json` — línea de tiempo
- `playlist.json` — canciones / playlist
- `reasons.json` — razones / lista
- `promises.json` — promesas
- `openWhen.json` — cartas "abrir cuando..."
- `monthlyLetters.json` — cartas mensuales
- `futureDreams.json` — sueños futuros
- `importantDates.json` — fechas importantes
- `blackHoleGallery.json` — galería de fotos
- `universe.json` — planetas del universo 3D
- `proposal.json` — sección de propuesta/pregunta
- `sceneMusic.json` — música por escena

🖼️ **Media**: coloca tus imágenes en `public/images/`, audio en `public/audio/`, videos en `public/videos/`.

📖 **Guía detallada**: revisa `GUIA_PARA_EDITAR.md`.

---

## 🏗️ Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 + Vite 8 |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Datos | JSON locales + localStorage |
| Estilos | CSS puro (~20 archivos) |
| Deploy | GitHub Pages / Vercel |

---

## 📁 Estructura clave

```
src/
├── App.jsx                 # Componente raíz (~16 secciones)
├── components/             # ~40 componentes React
├── data/                   # JSON con TODO el contenido editable
├── services/               # Lógica de negocio
├── context/                # AudioContext (música de fondo)
├── constants/              # Usuarios locales, config
└── styles/                 # CSS por sección
```

---

## 🔧 Modo local vs Supabase

Por defecto la app funciona en **modo local** (sin backend). Los datos se guardan en `localStorage` del navegador.

El proyecto tiene preparada la integración con Supabase para modo multiusuario. Para activarla:

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en `.env.local`
3. Cambia `VITE_REMOTE_CONTENT_ENABLED=false` a `true`
4. Aplica el schema de `docs/supabase/`

Ver `docs/` para más detalles de la arquitectura.

---

## 📄 Licencia

Libre para uso personal y portafolio. Modifica, comparte y adapta como quieras.

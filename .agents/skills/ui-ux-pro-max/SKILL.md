---
name: ui-ux-pro-max
description: "Diseña y mejora interfaces de Distancia Cero con la biblioteca local de estilos, colores, tipografía, accesibilidad y patrones React. Úsala para trabajo de UI/UX y diseño visual."
---

# UI/UX Pro Max para Codex

Lee la [guía original](../../../.claude/skills/ui-ux-pro-max/SKILL.md) y reutiliza sus datos y scripts. Aplica estas adaptaciones a su flujo:

- Resuelve los enlaces internos de la guía desde `.claude/skills/ui-ux-pro-max/`. Las rutas `skills/ui-ux-pro-max/...` de sus ejemplos deben apuntar a `.claude/skills/ui-ux-pro-max/...` desde la raíz del repositorio.
- Este proyecto usa React, Vite y Tailwind. Elige `--stack react` para patrones de componentes y `--stack html-tailwind` para consultas de estilos; no cambies el stack por el valor predeterminado del ejemplo.
- Antes de proponer cambios visuales, consulta los componentes existentes, los tokens de `src/styles/tailwind.css` y las referencias pertinentes de `design-system/`. Conserva la dirección visual solicitada por el usuario.
- Usa `--design-system` cuando se necesite definir o replantear un sistema visual. Para una corrección puntual basta una búsqueda del dominio relevante. Las recomendaciones de la base de datos son insumos de diseño, no una orden de reemplazar el diseño existente.
- Ejecuta búsquedas con el Python disponible. En este Windows está disponible `py -3.12`; en otros entornos localiza `python3` o `python`. Los scripts usan la biblioteca estándar. Si falta Python, usa las guías y los CSV como referencia e informa la limitación.
- `--persist` escribe archivos: úsalo cuando guardar el sistema forme parte del encargo. El script actual escribe bajo `design-system/<project-slug>/MASTER.md` y `pages/` dentro de esa carpeta. Comprueba el destino y los archivos existentes antes de guardar.
- Usa las herramientas de navegador o documentación disponibles en la sesión; una mención de un MCP en la guía no implica que esté conectado.

Desde la raíz del proyecto, ejemplos de consultas sin persistencia:

```powershell
py -3.12 -B .claude/skills/ui-ux-pro-max/scripts/search.py "focus keyboard reduced motion" --domain ux -n 3
py -3.12 -B .claude/skills/ui-ux-pro-max/scripts/search.py "state effects rendering" --stack react -n 3
py -3.12 -B .claude/skills/ui-ux-pro-max/scripts/search.py "romantic space glassmorphism claymorphism" --design-system -p "Distancia Cero"
```

Aplica los controles de accesibilidad e interacción de la guía que correspondan al cambio. Distingue la inspección del código de la validación efectuada en el navegador.

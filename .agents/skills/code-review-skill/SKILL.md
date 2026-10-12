---
name: code-review-skill
description: "Revisa cambios y código de Distancia Cero para detectar bugs, regresiones y problemas de arquitectura, rendimiento o seguridad. Úsala para code review, revisión de PR o auditorías solicitadas."
---

# Code Review para Codex

Lee la [guía original](../../../.claude/skills/code-review-skill/SKILL.md). Sus referencias y scripts se conservan en `.claude/skills/code-review-skill/`; resuelve sus enlaces desde esa carpeta.

## Adaptación del flujo

- `Read`, `Grep`, `Glob`, `Bash` y `WebFetch` describen capacidades de Claude. Usa las herramientas reales de lectura, búsqueda, terminal y web disponibles. El campo `allowed-tools` del original no configura permisos en Codex.
- Determina primero el alcance y el diff pertinente, incluidos cambios sin commit cuando corresponda. Comprueba la rama base antes de usar ejemplos con `main...HEAD`.
- Revisa un diff grande por subsistemas; sugerir una división puede ser útil, pero no es motivo para interrumpir la revisión solicitada.
- Carga solo las referencias aplicables: normalmente React, TypeScript y CSS; añade arquitectura, rendimiento o seguridad cuando el encargo o los cambios lo justifiquen. Verifica los ejemplos contra las versiones y el código del proyecto.
- Prioriza fallos demostrables sobre preferencias. Explica el caso que dispara cada problema, su consecuencia y la ubicación exacta. No inventes hallazgos ni elogios para llenar una plantilla.
- Ejecuta las comprobaciones pertinentes al cambio cuando aporten evidencia. Distingue lo observado de lo inferido y comunica límites relevantes de la revisión.
- Entrega primero los hallazgos, ordenados por severidad, con enlaces locales absolutos y líneas verificadas. Usa comentarios en línea de Codex cuando corresponda. Si no hay hallazgos, indícalo.
- Los estados Approve/Comment/Request Changes del original son recomendaciones de revisión; publicar una revisión en GitHub depende del encargo del usuario.

Para análisis opcional de complejidad, el script existente es:

```powershell
py -3.12 -B .claude/skills/code-review-skill/scripts/pr-analyzer.py --diff-file RUTA_DEL_DIFF --stats
```

Sustituye `RUTA_DEL_DIFF` por un archivo de diff existente del alcance acordado. También admite el diff por entrada estándar. Sus métricas ayudan a priorizar la lectura; no demuestran que el código tenga defectos. La carpeta `.hive/` no forma parte de este flujo.

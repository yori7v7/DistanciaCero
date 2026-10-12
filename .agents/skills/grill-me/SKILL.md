---
name: grill-me
description: "Entrada explícita para cuestionar a fondo un plan o decisión. Úsala cuando el usuario invoque $grill-me, /grill-me o pida que se cuestione su propuesta."
metadata:
  author: mattpocock
  version: "1.0.0"
---

# Grill Me para Codex

Adaptación de la [entrada original de Claude](../../../.claude/skills/grill-me/SKILL.md). Conserva su activación explícita mediante `agents/openai.yaml`.

Identifica el tema o plan de la petición, lee [grilling](../grilling/SKILL.md) y sigue ese protocolo con el contexto del usuario. No hay que invocar un `Skill tool`: leer la skill e incorporar sus instrucciones es la equivalencia en Codex. No abras una segunda entrevista si ya está en curso.

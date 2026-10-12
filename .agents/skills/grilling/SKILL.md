---
name: grilling
description: "Entrevista por rondas para profundizar en un plan y sus decisiones dependientes. Úsala cuando el usuario pida cuestionar, poner a prueba o explorar su propuesta, o desde grill-me."
metadata:
  author: mattpocock
  version: "1.0.0"
---

# Grilling para Codex

Lee el [protocolo original](../../../.claude/skills/grilling/SKILL.md). Conserva el árbol de decisiones, las rondas de preguntas independientes y la recomendación razonada por pregunta, con estas adaptaciones:

- El `Agent` tool del original equivale a las herramientas de colaboración disponibles. Delega investigación acotada cuando pueda avanzar en paralelo; investiga directamente cuando sea más adecuado. Busca en el proyecto los hechos comprobables antes de preguntarlos al usuario.
- Mantén la entrevista dentro del plan y del nivel de profundidad solicitado. Agrupa las decisiones que ya pueden resolverse; deja las preguntas dependientes para después de sus respuestas. Evita convertir detalles de implementación rutinarios en decisiones obligatorias del usuario.
- Usa la herramienta de preguntas disponible cuando corresponda y respeta su formato y límites. El formato con emojis del original es orientativo si la interfaz representa las preguntas de otra manera. Mientras esperas, avanza en la investigación que no dependa de las respuestas.
- Las preguntas en paralelo no son respuestas: mantén abiertas las decisiones pendientes y no presupongas aprobación por tiempo transcurrido.
- Al cerrar la entrevista, resume las decisiones y las incertidumbres restantes. Si el usuario solo pidió explorar el plan, la entrega es ese entendimiento compartido. Si ya pidió implementar después de la entrevista y las decisiones necesarias están resueltas, continúa conforme a esa autorización; no añadas una reconfirmación rutinaria.

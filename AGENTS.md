# Codex — Distancia Cero

## Contexto del proyecto

Para continuar desde otra computadora, leer primero [TRABAJO_ENTRE_EQUIPOS.md](docs/TRABAJO_ENTRE_EQUIPOS.md). Incluye la rama compartida, el punto de continuación portable y el procedimiento para recibir y entregar cambios. Una conversación sincronizada no sustituye los archivos del repositorio.

Lee [CLAUDE.md](CLAUDE.md) al comenzar a trabajar en este repositorio: contiene el contexto compartido, los comandos y las reglas de arquitectura. Aunque su título mencione Claude, esas instrucciones del proyecto también sirven para Codex.

Contrasta las versiones, rutas, conteos y estados descritos allí con el código actual y `package.json`; la documentación y la memoria pueden estar desactualizadas. Consulta [CONTENT_CONTRACT.md](docs/CONTENT_CONTRACT.md) o [IDENTITY_CONTRACT.md](docs/IDENTITY_CONTRACT.md) cuando el trabajo afecte esos contratos.

Para retomar el análisis del 13 de septiembre de 2026, consulta [CONTEXTO_PROYECTO_CODEX.md](docs/CONTEXTO_PROYECTO_CODEX.md): arquitectura real, historial, cambios locales en curso, resultados de pruebas y problemas reproducidos. Es una instantánea de `0c1e46f` más el working tree de esa fecha; vuelve a comprobar el estado antes de aplicar sus conclusiones.

Prioridad indicada por el usuario después de esa revisión: cerrar el refactor incompleto de Claude, corregir y pulir la experiencia local y actualizar documentación antes de añadir funciones. El usuario autorizó ejecutar [PLAN_PULIDO_LOCAL.md](docs/PLAN_PULIDO_LOCAL.md) en orden, cerrando cada paso antes del siguiente y comenzando por el paso 1. Consultar [AVANCE_PULIDO_LOCAL.md](docs/AVANCE_PULIDO_LOCAL.md) para estado, recuperación y resultados. En esta etapa no activar Supabase ni realizar despliegues en Vercel u otros servicios. Detenerse si se agota el uso normal/premium; no cambiar modelo/modalidad, activar reserva, comprar créditos ni consumir resets para continuar.

La memoria local en [.claude/memory/MEMORY.md](.claude/memory/MEMORY.md) es contexto histórico opcional. Lee solo los archivos pertinentes que existan; no representa memoria automática de Codex ni prueba del estado actual.

Los pasos 1–7 quedaron cerrados el 10 de octubre de 2026; resultados finales, límites y recuperación se registran en el documento de avance. Antes de iniciar otro trabajo, comprobar el estado actual y el alcance pedido. La auditoría de agosto y los informes de septiembre conservan sus fechas como instantáneas. No usar sus conteos, rutas o propuestas como descripción vigente sin comprobarlos.

Al ejecutar E2E con Vite de desarrollo, congelar todos los archivos observados, incluidos Markdown y documentación. Tailwind puede enviar una recarga completa al editar esos documentos. Guardar logs/notas temporales en `.git/codex-checkpoints` y actualizar los documentos al terminar el runner. Las pruebas de reset/importación usan perfiles aislados, no el almacenamiento real del usuario.

## Continuación entre escritorio y laptop

Al recibir «prosigue» o retomar trabajo, comprobar uso normal disponible, directorio, rama, estado local y runners activos. Consultar `origin` con `git fetch origin` antes de modificar código; revisar la rama remota esperada y su divergencia. Si hay un runner activo, esperar su término antes de integrar cambios. Con el árbol limpio y sin divergencia, actualizar solo mediante fast-forward. Volver a leer el estado portable después de recibir cambios. Si hay trabajo local pendiente, conservarlo y distinguirlo antes de integrar; no usar stash automático, `reset --hard` ni force-push. Si no se puede consultar el remoto, informar que no se ha verificado la última versión antes de continuar en esa rama compartida.

Al terminar un bloque, actualizar el punto de continuación, las pruebas realmente ejecutadas y sus pendientes en la documentación versionada, y guardar los cambios revisados en commits locales del alcance autorizado. Enviar esos commits con push normal solo cuando el usuario haya autorizado el destino y la publicación. El 20 de octubre autorizó los avances de este trabajo en `origin/codex/compatibilidad-navegadores`; comprobar su estado en el documento de traspaso. No afirmar que otro equipo puede recibir cambios que solo están locales. La sincronización no autoriza merge a `main`, despliegues ni cambios de infraestructura.

Trabajar en una computadora a la vez sobre la rama compartida. Antes de cambiar de equipo, comprobar que la entrega se envió y que no quedan cambios sin commit; en el equipo de destino comprobar que se recibió el mismo commit. Las credenciales, `.env.local`, almacenamiento del navegador, dependencias, reportes y checkpoints bajo `.git` no viajan con clone/pull. Registrar el estado necesario para retomar dentro de `docs/`, sin secretos ni rutas absolutas propias de un equipo. No copiar íntegramente el perfil global de Codex.

## Skills del proyecto

Las entradas compatibles con Codex están en `.agents/skills/`. Reutilizan las guías, scripts y datos de `.claude/skills/` mediante rutas relativas, sin duplicar sus bibliotecas. Al actualizar una skill original, revisa si su adaptación sigue siendo necesaria.

| Skill | Cuándo usarla |
| --- | --- |
| [ui-ux-pro-max](.agents/skills/ui-ux-pro-max/SKILL.md) | Diseñar o mejorar interfaces, consultar estilos, accesibilidad y patrones React. |
| [web-design-guidelines](.agents/skills/web-design-guidelines/SKILL.md) | Revisar una interfaz contra las guías web de Vercel. |
| [code-review-skill](.agents/skills/code-review-skill/SKILL.md) | Revisar cambios, bugs, arquitectura, rendimiento o seguridad dentro del alcance pedido. |
| [grill-me](.agents/skills/grill-me/SKILL.md) | Entrada explícita para cuestionar un plan con el usuario. |
| [grilling](.agents/skills/grilling/SKILL.md) | Protocolo de entrevista por rondas para profundizar en decisiones. |

Carga solo la skill pertinente y sus referencias necesarias. Usa las entradas de `.agents/skills/` para aplicar sus equivalencias de herramientas y rutas. `grill-me` conserva su activación explícita; las entrevistas se usan cuando el usuario pide cuestionar o explorar un plan.

Ejemplos: `$ui-ux-pro-max mejora esta sección`, `$code-review-skill revisa estos cambios`, `$grill-me cuestiona mi propuesta`.

Los permisos y hooks de `.claude/settings*.json` pertenecen a Claude Code; no configuran ni conceden permisos a Codex. Los archivos `.hive/` dentro de la biblioteca de revisión son material del paquete original, no instrucciones del proyecto.

`skills-lock.json` conserva el historial del instalador externo. Una entrada allí no prueba que la skill siga instalada: comprueba su `SKILL.md`. En esta adaptación no se modifica ese registro ni se descargan paquetes adicionales.

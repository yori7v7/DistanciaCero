# Guía para editar Distancia Cero

Esta guía explica cómo llenar el universo con contenido real. Las nueve colecciones y los siete ajustes generales se editan desde el **Centro del Universo**, un panel visual. La configuración restante, los planetas y algunos textos se cambian en los archivos indicados abajo. Apartados de ajustes y respaldo actualizados el 26 de octubre de 2026; el resto conserva la revisión del 7 de octubre.

---

## El Centro del Universo (CMS)

Entrar a `/app`, abrir **Ajustes** (el engrane de la navegación) y activar **Centro del Universo**. El panel aparece debajo de la escena seleccionada y puede tardar un momento en cargar la primera vez. El ajuste se conserva al recargar; desactivarlo oculta el panel y conserva tus datos.

### ¿Qué puedes editar?

| Sección | Qué contiene |
|---|---|
| Cartas Mensuales | Cartas organizadas por mes, con bloqueo manual opcional |
| Abrir Cuando | Cartas temáticas (cuando me extrañes, cuando estés triste, etc.) |
| 100 Razones | Razones para amar (corazones flotantes) |
| Promesas | Promesas de la relación |
| Fechas Importantes | Aniversarios, cumpleaños, momentos clave |
| Wishlist / Sueños | Sueños y planes futuros juntos |
| Historia | Línea de tiempo / diario de la relación |
| Galería | Recuerdos con fotos (agujero negro 3D) |
| Música | Playlist compartida |

### Cómo funciona

Elegir la colección y después **Originales** o **Tus creaciones**:

**1. Originales** — El contenido base que viene incluido. Puedes:
- **Editar** (crea una copia personalizada sin modificar el original)
- **Ocultar** (esconder items que no quieras mostrar)
- **Restaurar** (quitar la personalización y volver al contenido base)
- **Mostrar** (volver a mostrar un original oculto, conservando su personalización)

**2. Tus creaciones** — Contenido que agregas tú. Puedes:
- **Crear** nuevos items
- **Editar** los que ya creaste
- **Eliminar** los que ya no quieras

Estas ediciones pertenecen al navegador y a la dirección donde abriste la app. No cambian los archivos JSON del proyecto ni se comparten automáticamente con otra persona. Cambiar de navegador, puerto o de `localhost` a `127.0.0.1` utiliza otro almacenamiento. Exporta un respaldo para trasladarlas. Borrar los datos del sitio o aceptar el reset elimina lo guardado en ese origen.

### Respaldo Local

En la parte superior del CMS hay un panel de **Respaldo Local**:
- **Exportar**: Descarga un respaldo v2 `.json` con tus creaciones, ediciones de originales, elementos ocultos de las nueve colecciones y ajustes generales.
- **Importar**: Valida el archivo antes de pedir confirmación. Después reemplaza los apartados incluidos y actualiza las secciones sin recargar. También acepta respaldos v1 de cartas.
- Si el respaldo es parcial, los apartados ausentes conservan su contenido actual. Un apartado explícitamente vacío borra sus creaciones, ediciones u ocultos, según corresponda; no modifica los archivos originales del proyecto.
- Los respaldos antiguos sin ajustes generales conservan los actuales. Un apartado `settings: {}` restaura los ajustes de plantilla. Ajustes y contenido incluidos se recuperan juntos si ocurre un fallo capturado al guardar. Para recuperar nombres y fechas en otro equipo, usar una versión de la app con este panel; las versiones anteriores no conocen esos campos del respaldo.
- Se conservan los IDs, etiquetas y datos de autoría compatibles. Restaurar una carta con el mismo ID reemplaza su contenido actual.
- El archivo no incluye progreso de lectura, Modo Prueba, identidad ni ajustes de música/escenas. Tampoco incluye archivos físicos de audio o video: sus rutas/enlaces necesitan seguir disponibles. Las fotos pegadas como base64 sí quedan dentro del JSON.
- Si el navegador no puede guardar por espacio o permisos, aparece un error. Una restauración fallida intenta recuperar el estado previo y avisa expresamente si esa recuperación también falla. Conserva el archivo de respaldo para poder reintentar.

Los formularios muestran errores sin vaciar lo que estabas escribiendo. Los campos obligatorios deben contener algo más que espacios.

💡 **Recomendación**: Exporta un respaldo antes de hacer cambios grandes.

### Modo Prueba

El botón **"Activar Modo Prueba"** permite abrir temporalmente todas las cartas sin cambiar su campo de bloqueo. Al desactivarlo, vuelve a aplicarse el bloqueo guardado. Los lectores y las estadísticas se actualizan sin recargar; si estabas viendo una carta que vuelve a quedar bloqueada, se cierra su lector.

Las cartas **no se desbloquean automáticamente por fecha**. Su disponibilidad depende de **Bloqueada** en el formulario (o `locked` en el JSON); el mes es una etiqueta. Para habilitar una carta definitivamente, editar su bloqueo y guardar.

Abrir una carta marca su progreso en ese navegador. **Resetear Progreso** borra las marcas de lectura de ambas colecciones y actualiza las estadísticas; conserva el contenido, las personalizaciones y los borradores del CMS.

---

## Primera configuración guiada

En el CMS, abre **Configura tu universo → Empezar guía** (o **Revisar con la guía** si ya guardaste ajustes). Recorre Nombres, Fechas y Revisar; **Anterior** conserva el borrador. Solo **Guardar configuración** persiste los datos. Cancelar pide confirmación si cambiaste valores. Revisa las fechas de plantilla antes de confirmar. Si llegan otros ajustes, carga los actuales antes de continuar. Se conservan creaciones e identidades; los datos guardados usan el mismo respaldo de ajustes generales. El borrador sin guardar no sobrevive a una recarga.

## Configuración general

Abre **Ajustes → Centro del Universo → Ajustes generales**. Puedes cambiar:

- Tu nombre, el de tu pareja y el nombre compartido.
- El nombre en portada; vacío usa el nombre de tu pareja.
- El día en que se conocieron, el inicio de la relación y el próximo encuentro.

Pulsa **Guardar ajustes** para aplicarlos sin recargar. Los nombres admiten hasta 80 caracteres; el nombre compartido es obligatorio. Las fechas deben ser días reales, pueden ser futuras y no desbloquean cartas. **Restaurar plantilla** pide confirmación y conserva cartas y demás creaciones. Si falla guardar, se conserva tu borrador; si llegan ajustes desde otra pestaña o un respaldo mientras editas, puedes descartarlo y cargar los valores actuales. Estos nombres no cambian las identidades locales ni la autoría.

Los cambios pertenecen a este navegador y se incluyen en el respaldo. El archivo siguiente sigue definiendo la plantilla y los campos no expuestos en el panel:

```
src/data/siteConfig.json
```

Aquí puedes cambiar:

- Nombre del proyecto
- Nombres de la pareja y apodos
- Fechas importantes (cuándo se conocieron, aniversario, próxima fecha para verse)
- Canción de fondo y su volumen

La carta principal de Inicio se edita en `src/components/MainLetter.tsx`. No forma parte de las nueve colecciones del CMS. `openWhen.json` es el contenido base de «Abrir cuando»; su nombre de colección interna es `openWhenLetters`.

---

## Canción de fondo

Sube tu canción a:

```
public/audio/background.mp3
```

La ruta y el volumen se configuran en `src/data/siteConfig.json`:

```json
"audio": {
  "backgroundTrackPath": "/audio/background.mp3",
  "defaultVolume": 0.45
}
```

La plantilla referencia ese archivo, pero no lo incluye: debes copiarlo al proyecto para poder escucharlo. El botón inicia la canción; si la ruta falta o falla, aparece un mensaje.

La música por escena se configura aparte en `src/data/sceneMusic.json`; sus rutas están vacías en la plantilla. Puedes guardar los archivos en `public/audio/scenes/` y asignar sus rutas. Iniciar una canción de playlist pausa la música de escena; cambiar de escena conserva esa canción hasta que pulses Reproducir en la banda sonora. Durante la carga puedes cancelar desde la misma fila de la playlist.

Consulta [Recorridos y funcionamiento local](docs/RECORRIDOS_LOCALES.md) para las reglas de audio, navegación y alcance sin conexión. El respaldo JSON conserva las rutas; no contiene los archivos físicos.

---

## Planetas del universo 3D

Archivo:

```
src/data/universe.json
```

Ahí puedes cambiar:

- Nombre del planeta
- Descripción
- Colores, tamaño, órbita y velocidad
- Si tiene anillo o no

---

## Campos de secretos de la plantilla

En `src/data/siteConfig.json`, busca la sección `"secret"`:

```json
"secret": {
  "passwords": [
    "tu-contraseña-aqui"
  ]
}
```

Estos campos se conservan en la configuración, pero la versión local actual no tiene una sección que solicite esas contraseñas. No cambian el bloqueo de cartas ni restringen la entrada a la app. Las identidades del panel son locales y no son cuentas privadas con contraseña.

---

## Correr localmente

Con Node.js y las dependencias instalados según [README.md](README.md):

```powershell
npm run dev
```

Abre `http://localhost:5173/` en tu navegador.

---

## Comprobar la versión compilada

Para revisar el build en tu computadora:

```powershell
npm run build
npm run preview
```

Preview normalmente abre en `http://localhost:4173/`, un origen distinto del servidor de desarrollo. Importa tu respaldo si necesitas llevar allí tus ediciones. La publicación y la activación de servicios remotos quedan para una etapa posterior.

---

## Recomendación

No intentes llenar todo de golpe. Empieza por:

1. Nombres y fechas reales (CMS → Ajustes generales)
2. Carta principal
3. Canciones que signifiquen algo para ustedes
4. Planetas personalizados
5. Cartas mensuales

Así la página se vuelve personal sin abrumarte.

---

## ¿Necesitas ayuda?

Si algo no funciona o tienes una idea para mejorar la página, avísale a la persona que te dio este universo. El código está vivo y se puede adaptar a lo que necesites. 💫

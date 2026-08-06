# Guía para editar Distancia Cero

Esta guía es para ti — la persona que va a llenar este universo con contenido real. **No necesitas saber programar.** Todo se hace desde el Centro del Universo, un panel visual dentro de la página.

---

## El Centro del Universo (CMS)

El **Centro del Universo** es el panel de administración donde puedes editar TODO el contenido sin tocar código. Se accede desde el botón **"Centro"** en la navegación de la app.

### ¿Qué puedes editar?

| Sección | Qué contiene |
|---|---|
| Cartas Mensuales | Cartas que se desbloquean mes a mes |
| Abrir Cuando | Cartas temáticas (cuando me extrañes, cuando estés triste, etc.) |
| 100 Razones | Razones para amar (corazones flotantes) |
| Promesas | Promesas de la relación |
| Fechas Importantes | Aniversarios, cumpleaños, momentos clave |
| Wishlist / Sueños | Sueños y planes futuros juntos |
| Historia | Línea de tiempo / diario de la relación |
| Galería | Recuerdos con fotos (agujero negro 3D) |
| Música | Playlist compartida |

### Cómo funciona

Cada sección tiene dos pestañas:

**1. Originales** — El contenido base que viene incluido. Puedes:
- **Editar** (crea una copia personalizada sin modificar el original)
- **Ocultar** (esconder items que no quieras mostrar)
- **Restaurar** (volver al valor original si editaste algo)

**2. Tus creaciones** — Contenido que agregas tú. Puedes:
- **Crear** nuevos items
- **Editar** los que ya creaste
- **Eliminar** los que ya no quieras

### Respaldo Local

En la parte superior del CMS hay un panel de **Respaldo Local**:
- **Exportar**: Descarga todo tu contenido en un archivo `.json`
- **Importar**: Restaura un respaldo anterior

💡 **Recomendación**: Exporta un respaldo antes de hacer cambios grandes.

### Modo Prueba

El botón **"Activar Modo Prueba"** desbloquea temporalmente todas las cartas para que puedas previsualizar cómo se verían sin esperar a las fechas reales. Al desactivarlo, todo vuelve a la normalidad.

---

## Configuración general

Si quieres cambiar los nombres, fechas, o contraseñas, edita este archivo:

```
src/data/siteConfig.json
```

Aquí puedes cambiar:

- Nombre del proyecto
- Nombres de la pareja y apodos
- Fechas importantes (cuándo se conocieron, aniversario, próxima fecha para verse)
- Contraseñas secretas para acceder a secciones bloqueadas
- Canción de fondo y su volumen

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

## Contraseñas secretas

En `src/data/siteConfig.json`, busca la sección `"secret"`:

```json
"secret": {
  "passwords": [
    "tu-contraseña-aqui"
  ]
}
```

Agrega o quita contraseñas. La pista que aparece en pantalla se configura en el mismo archivo.

---

## Correr localmente

Si quieres ver la página en tu computadora antes de subirla:

```powershell
npm run dev
```

Abre `http://localhost:5173/` en tu navegador.

---

## Subir a internet (deploy)

Cuando quieras publicar los cambios:

```powershell
git add .
git commit -m "Actualización de contenido"
git push
npm run deploy
```

---

## Recomendación

No intentes llenar todo de golpe. Empieza por:

1. Nombres y fechas reales (`siteConfig.json`)
2. Carta principal
3. Canciones que signifiquen algo para ustedes
4. Planetas personalizados
5. Cartas mensuales

Así la página se vuelve personal sin abrumarte.

---

## ¿Necesitas ayuda?

Si algo no funciona o tienes una idea para mejorar la página, avísale a la persona que te dio este universo. El código está vivo y se puede adaptar a lo que necesites. 💫

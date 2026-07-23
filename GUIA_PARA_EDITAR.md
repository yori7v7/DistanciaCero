# Guía para editar Distancia Cero

Esta guía es para que puedas actualizar la página sin perderte entre archivos.

## 1. Configuración general

Archivo:

```txt
src/data/siteConfig.json
```

Aquí cambias:

- nombre del proyecto
- nombres de la pareja
- apodos
- fecha de inicio
- fecha para verse
- contraseña secreta
- texto principal del inicio
- ruta de la canción principal

## 2. Canción principal

Sube tu canción a:

```txt
public/audio/main-theme.mp3
```

La ruta se configura en:

```txt
src/data/siteConfig.json
```

En esta parte:

```json
"audio": {
  "backgroundTrackPath": "/audio/main-theme.mp3",
  "defaultVolume": 0.45
}
```

## 3. Canciones

Archivo:

```txt
src/data/songs.json
```

Para canciones locales usa:

```json
{
  "sourceType": "local",
  "src": "/audio/song-01.mp3"
}
```

Y sube el archivo a:

```txt
public/audio/song-01.mp3
```

Para Spotify o YouTube usa:

```json
{
  "sourceType": "external",
  "link": "https://open.spotify.com/"
}
```

## 4. Planetas del universo

Archivo:

```txt
src/data/universe.json
```

Ahí cambias:

- nombre del planeta
- descripción
- detalles
- colores
- tamaño
- órbita
- velocidad
- si tiene anillo o no

## 5. Cartas mensuales

Archivo:

```txt
src/data/monthlyLetters.json
```

Cambia los textos de ejemplo por cartas reales o previews reales.

## 6. Cartas “abrir cuando...”

Archivo:

```txt
src/data/openWhen.json
```

Útil para cartas como:

- abrir cuando me extrañes
- abrir cuando estés triste
- abrir cuando no puedas dormir
- abrir cuando dudes

## 7. Fechas importantes

Archivo:

```txt
src/data/importantDates.json
```

Agrega:

- aniversario
- cumpleaños
- San Valentín
- Navidad
- Año Nuevo
- fechas internas de ustedes

## 8. Cápsula del tiempo

Archivo:

```txt
src/data/timeCapsules.json
```

Sirve para mensajes que quieras preparar y abrir después.

## 9. Regalos digitales

Archivo:

```txt
src/data/digitalGifts.json
```

Ideas:

- fondos de pantalla
- cartas PDF
- imágenes generadas con IA
- links secretos
- videos especiales

## 10. Festividades

Archivo:

```txt
src/data/festivities.json
```

Aquí van secciones futuras para:

- San Valentín
- Navidad
- cumpleaños
- aniversario
- Año Nuevo

## 11. Videos

Archivo:

```txt
src/data/videoMemories.json
```

Sube videos a:

```txt
public/videos/
```

Después se puede adaptar el componente para reproducir videos reales.

## 12. Scrapbook / polaroids

Archivo:

```txt
src/data/scrapbook.json
```

Aquí van recuerdos tipo álbum.

Más adelante puedes cambiar los placeholders por imágenes reales.

## 13. Diccionario

Archivo:

```txt
src/data/dictionary.json
```

Agrega palabras internas, apodos, bromas o conceptos de ustedes.

## 14. Misiones de pareja

Archivo:

```txt
src/data/missions.json
```

El progreso se guarda en el navegador con localStorage.

## 15. Mensajes de emergencia emocional

Archivo:

```txt
src/data/emergencyMessages.json
```

Sirve para el botón flotante “Necesito un abrazo”.

## 16. Razones por las que te amo

Archivo:

```txt
src/data/reasons.json
```

Agrega todas las razones reales que quieras.

## 17. Galería

Archivo:

```txt
src/data/gallery.json
```

Sube imágenes a:

```txt
public/images/
```

Y después podemos modificar el componente para usar rutas reales.

## 18. Contraseñas secretas

Archivo:

```txt
src/data/siteConfig.json
```

Busca:

```json
"secret": {
  "passwords": [
    "contraseña1",
    "contraseña2"
  ]
}
```

Agrega o quita contraseñas ahí.

## 19. Correr localmente

```powershell
npm run dev
```

Abre:

```txt
http://localhost:5173/
```

## 20. Subir a GitHub Pages

Primero asegúrate de que en `package.json` esté:

```json
"homepage": "https://TU-USUARIO.github.io/TU-REPO"
```

Luego:

```powershell
git add .
git commit -m "Actualizacion de Distancia Cero"
git push
npm run deploy
```

## 21. Recomendación

No llenes todo de golpe.

Primero cambia:

1. Carta principal
2. Fechas reales
3. Canciones reales
4. Planetas
5. Sección secreta
6. Scrapbook
7. Cartas mensuales

Así la página se vuelve personal sin que te abrumes.

---

## 15. Centro del Universo (CMS)

El **Centro del Universo** es el panel de administración donde puedes editar TODO el contenido sin tocar código. Se accede desde el botón "Centro" en la navegación.

### ¿Qué puedes editar?

| Sección | Qué contiene |
|---|---|
| Cartas Mensuales | Cartas que se desbloquean mes a mes |
| Abrir Cuando | Cartas temáticas (nostalgia, días especiales, etc.) |
| 100 Razones | Razones para amar (corazones flotantes) |
| Promesas | Promesas de la relación |
| Fechas Importantes | Aniversarios, momentos clave |
| Wishlist / Sueños | Sueños y planes futuros |
| Historia | Línea de tiempo / diario de la relación |
| Galería | Recuerdos con fotos (agujero negro 3D) |
| Música | Playlist personalizada |

### Cómo funciona

Cada sección tiene dos pestañas:

1. **Originales**: Los datos que vienen del archivo JSON. Puedes:
   - **Editar** (crea una copia personalizada sin modificar el original)
   - **Ocultar** (esconder items que no quieras mostrar)
   - **Restaurar** (volver al valor original si editaste)

2. **Tus creaciones**: Contenido que agregas tú. Puedes:
   - **Crear** nuevos items
   - **Editar** los que ya creaste
   - **Eliminar** los que ya no quieras

### Respaldo

En la parte superior del CMS hay un panel de **Respaldo Local**:
- **Exportar**: Descarga todo tu contenido en un archivo JSON
- **Importar**: Restaura un respaldo anterior

Usa esto antes de hacer cambios grandes o para respaldar tus personalizaciones.

### Modo Prueba

El botón **Activar Modo Prueba** desbloquea temporalmente todas las cartas para que puedas previsualizar cómo se verían sin esperar a las fechas reales. Al desactivarlo, todo vuelve a la normalidad.
# Guía para editar Distancia Cero

Esta guía es para que puedas actualizar la página sin perderte entre archivos.

## 1. Configuración general

Archivo:

```txt
src/data/siteConfig.json
```

Aquí cambias:

- nombre del proyecto
- nombres de Ale y Yori
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

## 13. Diccionario Ale & Yori

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
    "milanesa",
    "alecita",
    "ale",
    "yori"
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
http://localhost:5173/alecitabbcitabblin/
```

## 20. Subir a GitHub Pages

Primero asegúrate de que en `package.json` esté:

```json
"homepage": "https://yori7v7.github.io/alecitabbcitabblin"
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
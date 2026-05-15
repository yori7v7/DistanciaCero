# Distancia Cero

**Distancia Cero** es una página web romántica, personalizada y expandible para Ale & Yori.

La idea no es que sea una carta estática, sino un universo digital vivo que pueda crecer con el tiempo: cartas, canciones, recuerdos, imágenes, videos, fechas especiales, regalos digitales, cápsulas del tiempo, festividades y secretos.

## Tecnologías

- React
- Vite
- CSS personalizado
- JSON local como fuente de datos
- GitHub Pages para publicación

## Correr localmente

```powershell
npm install
npm run dev
```

Abrir:

```txt
http://localhost:5173/alecitabbcitabblin/
```

## Construir versión final

```powershell
npm run build
```

## Publicar en GitHub Pages

```powershell
npm run deploy
```

## Estructura importante

```txt
src/data/
```

Aquí está casi todo el contenido editable.

```txt
public/audio/
```

Aquí van canciones locales.

```txt
public/images/
```

Aquí van imágenes.

```txt
public/videos/
```

Aquí van videos.

## Archivo principal de configuración

```txt
src/data/siteConfig.json
```

Desde ahí puedes cambiar nombres, fechas, contraseñas y audio principal.

## Guía de edición

Revisa:

```txt
GUIA_PARA_EDITAR.md
```

Ahí está explicado dónde editar cada cosa.
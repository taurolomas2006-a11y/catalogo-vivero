# Catálogo del Vivero

Catálogo frontend responsive creado con React, Vite y Tailwind CSS. Lee un CSV público de Google Sheets desde el navegador; no incluye carrito, pagos, pedidos ni cuentas.

## Crear el proyecto desde cero

Si prefieres partir de una carpeta nueva, usa el scaffold oficial de Vite:

```bash
npm create vite@latest catalogo-vivero -- --template react
cd catalogo-vivero
npm install
npm install -D tailwindcss @tailwindcss/vite
```

Después, reemplaza los archivos generados por los de este proyecto. Tailwind se configura mediante el plugin en `vite.config.js` y la línea `@import "tailwindcss";` de `src/index.css`; no hace falta crear `tailwind.config.js` para esta configuración.

## Ejecutar este proyecto

Desde esta carpeta:

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la URL local de desarrollo.

## Conectar Google Sheets

En `src/App.jsx`, reemplaza únicamente esta línea:

```js
const SHEET_CSV_URL = "URL_AQUI";
```

por la URL pública del CSV. La primera fila de la hoja debe contener exactamente estas columnas:

```text
Nombre,Categoria,Stock,Precio,Imagen_URL
```

El parser admite espacios adicionales, campos vacíos, textos entre comillas y comas dentro de esos textos. `Stock` se convierte a número; un valor vacío o inválido queda como `0`. `Precio` admite valores como `4500`, `4.500` o `$ 4.500,50` y se muestra en pesos argentinos; si falta o es inválido, no se muestra. Una fila sin `Nombre` se descarta. La columna de imagen también admite los encabezados `Imagen.URL` e `Imagen-URL`.

### Verificar la publicación CSV

1. En Google Sheets, abre **Archivo → Compartir → Publicar en la web**.
2. Elige la hoja deseada, selecciona **Valores separados por comas (.csv)** y publícala.
3. Copia la URL generada y ábrela en una ventana de incógnito. Debe descargarse o verse como texto CSV sin pedir una cuenta de Google.
4. Pégala en `SHEET_CSV_URL`. Si el catálogo muestra un error, confirma que la hoja siga publicada y que el enlace devuelva CSV, no una página de inicio de sesión o de permisos.

Una URL publicada normalmente tiene una forma parecida a:

```text
https://docs.google.com/spreadsheets/d/e/ID_PUBLICADO/pub?gid=0&single=true&output=csv
```

Las imágenes se cargan desde `Imagen_URL`. Si la celda está vacía o la imagen falla, la tarjeta muestra un placeholder natural y accesible.

## Usar imágenes JPG locales en un formulario

`ImageUploader` convierte un JPG local en una `data:` URL sin subir nada a un servidor. Las tarjetas continúan aceptando tanto esas `data:image/jpeg;base64,...` como URL remotas HTTP(S).

```jsx
import ImageUploader from "./components/ImageUploader";

<ImageUploader
  maxSizeInMB={5}
  onChange={(dataUrl, fileName) => {
    // Guarda dataUrl junto a tu formulario; fileName es opcional.
  }}
/>;
```

Como el catálogo actual solo lee Google Sheets y no tiene formulario de edición, una imagen subida de esta forma es local y temporal: no se guarda en la hoja ni persiste tras recargar. Para mantenerla permanentemente, usa una URL pública en la columna de imagen o incorpora este componente en un futuro formulario con almacenamiento.

## Pruebas

```bash
npm test
```

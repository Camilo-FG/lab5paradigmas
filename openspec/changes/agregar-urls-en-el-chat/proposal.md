## Why

El chat solo muestra el texto que el usuario escribe. Una URL de imagen o de video queda como texto plano, así que hay que abrirla fuera del chat. Este cambio permite pegar esa URL en el mismo campo de mensaje y ver el contenido dentro de la conversación.

## What Changes

- El campo de texto del chat acepta URLs junto con el texto normal.
- Si el mensaje es una URL de imagen, el chat muestra la imagen.
- Si el mensaje es una URL de video de YouTube, el chat inserta un reproductor.
- Si el mensaje no es ninguna de esas URLs, se muestra como texto.
- Las reglas de aceptación se escriben en estilo BDD (Given / When / Then).

## Capabilities

### New Capabilities

- `chat-urls`: detectar una URL de imagen o de video de YouTube en un mensaje y representarla como imagen o reproductor dentro del chat.

### Modified Capabilities

- Ninguna. No hay specs previas.

## Impact

- `libs/unalib.js`: validación de URL de imagen, validación de URL de YouTube y transformación del mensaje.
- `server.js`: el mensaje pasa por esa validación antes de reenviarse.
- `index.html`: el campo de texto ya envía el mensaje; el cliente debe pintar el HTML de la imagen o del reproductor.
- `test/test.js`: pruebas Mocha que cubren los escenarios BDD de imagen, video y texto.
- Supuesto: "video" significa una URL de YouTube (`youtube.com` o `youtu.be`). Otros sitios de video quedan fuera de este cambio.
- Supuesto: una imagen es una URL `http` o `https` que termina en `.jpg`, `.jpeg`, `.png`, `.gif` o `.bmp`.

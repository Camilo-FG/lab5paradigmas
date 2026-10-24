## Why

El chat actual funciona, pero su interfaz es plana: todos los mensajes son líneas de texto sin autor visible, sin hora, sin burbujas y sin estado de conexión. Además, el nombre del usuario se inserta sin sanear en el HTML, el envío de mensajes vacíos no se controla y el usuario no recibe ninguna señal cuando el socket se desconecta. Esto hace que la conversación sea difícil de leer y poco confiable en un salón de clases o en una demo.

## What Changes

- Reemplazar la lista de líneas por burbujas de mensaje con avatar, nombre del autor, hora local y distinción visual de los mensajes propios.
- Mostrar el estado de la conexión (Conectado / Desconectado / Reconectando) en un encabezado del chat y actualizarlo con los eventos del socket.
- Validar la composición del mensaje: no enviar mensajes vacíos ni solo espacios, recortar espacios, mantener el foco en el campo y deshabilitar el botón cuando no hay texto.
- Gestionar el desplazamiento: seguir automáticamente el último mensaje solo si el usuario está cerca del final y, si no, ofrecer un botón "Nuevos mensajes" para saltar al final.
- Mostrar un estado vacío mientras no exista ningún mensaje y ocultarlo con el primero.
- Sanear el nombre y el color del autor en el servidor, con valores por defecto y límites de longitud.
- Mejorar la accesibilidad y la presentación de medios: región `aria-live`, etiquetas de formulario, `alt` en imágenes y `title` en el reproductor de YouTube, con medios responsivos.
- Mantener sin cambios el contrato del socket (`Evento-Mensaje-Server`), los ids `#nombre`, `#m`, `#messages`, el botón "Send" y el soporte existente de URLs de imagen y YouTube.

## Capabilities

### New Capabilities

- `chat-ux`: experiencia de conversación en el cliente y normalización segura de los datos del autor en el servidor (composición, presentación de mensajes, estado de conexión, desplazamiento, estado vacío y accesibilidad).

### Modified Capabilities

- Ninguna. El comportamiento de `chat-urls` no cambia; solo se ajusta su presentación visual.

## Impact

- `index.html`: nuevo marcado y estilos del chat y lógica de renderizado, composición, conexión y desplazamiento.
- `libs/unalib.js`: normalización de `nombre` y `color` dentro de `validateMessage`.
- `server.js`: exportar `app`, `http` e `io` para pruebas de integración sin iniciar el puerto automáticamente; `npm start` conserva el comportamiento actual.
- `test/`: pruebas unitarias de la normalización y cobertura de las ramas de `unalib`; pruebas de integración reales con `socket.io-client`.
- `tests/e2e/`: escenarios de burbujas, hora, estado de conexión, envío vacío y accesibilidad.
- `playwright.config.js`: `webServer` para levantar el chat durante las pruebas E2E y ejecución headless.
- `package.json`: scripts separados para unitarias, integración y E2E, y `snyk` como dependencia de desarrollo.
- Supuesto: la "hora local" se calcula en el navegador al recibir el mensaje; no se persiste historial entre recargas.
- Supuesto: "mensajes propios" son los que coinciden con el nombre escrito en el campo `#nombre` al momento de enviar.

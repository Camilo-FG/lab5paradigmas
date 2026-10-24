## Context

Ver `proposal.md` para la motivación. El cliente actual es un único `index.html` con jQuery y el cliente de Socket.IO cargados desde CDN, un `<ul>` sin contenedor de scroll y un renderizado que concatena HTML con el nombre sin sanear. El servidor es un `server.js` monolítico que escucha en el puerto al ser importado, lo que impide reutilizarlo en pruebas de integración. `libs/unalib.js` valida y transforma el mensaje, pero solo sanea `mensaje`, no `nombre` ni `color`.

Restricciones relevantes:

- No hay build step ni framework; el cliente debe seguir siendo HTML/CSS/JS servido por Express.
- El contrato del socket (`Evento-Mensaje-Server` con JSON `{nombre, mensaje, color}`) y los ids usados por las pruebas (`#nombre`, `#m`, `#messages`, botón `Send`) no deben romperse.
- La cobertura de Jest exige 90% en ramas, funciones, líneas y sentencias para `libs/unalib.js`.
- Las pruebas E2E deben poder ejecutarse sin red externa ni servidor levantado a mano.

## Goals / Non-Goals

**Goals:**

- Renderizar burbujas con autor, hora y distinción de mensajes propios usando DOM seguro.
- Normalizar `nombre` y `color` en el servidor como única fuente de verdad.
- Hacer que el cliente dependa solo de activos servidos por la propia aplicación.
- Cubrir composición, conexión, desplazamiento, estado vacío y accesibilidad con pruebas automatizadas.

**Non-Goals:**

- Historial persistente, autenticación real, salas múltiples o mensajes privados.
- Cambiar el formato de transporte del socket o el esquema de validación de URLs de imagen/YouTube.
- Sustituir Express o Socket.IO por otro stack.

## Decisions

### 1. Normalizar autor y color en `validateMessage`

`validateMessage` añadirá una normalización aditiva sobre el objeto ya parseado:

- `nombre`: convertir a cadena, recortar, escapar con `escapeHtml`, aplicar `Anónimo` si queda vacío y truncar a 30 caracteres.
- `color`: aceptar solo `#RGB` o `#RRGGBB`; en caso contrario usar `#4f46e5`.
- `clienteId`: conservar una cadena de hasta 64 caracteres para identificar el origen del mensaje en el cliente.

Se hace en el servidor porque todos los clientes reciben el mismo valor saneado, se evita duplicar la política de seguridad y se mantiene el cliente simple. Alternativa descartada: sanear solo en el cliente, que deja la API vulnerable para cualquier otro consumidor del socket.

El truncado se aplica después de recortar y antes de escapar, de modo que un nombre con entidades no supere el límite visible.

### 2. Renderizado con DOM y whitelist de HTML

El cliente creará las burbujas con `document.createElement` y usará `textContent` para hora y etiquetas. El nombre se insertará con `innerHTML` porque el servidor ya lo entrega escapado; el contenido (`mensaje`) se inserta con `innerHTML` porque el servidor solo produce etiquetas `img`/`iframe` controladas o texto escapado. El color se aplica como variable CSS validada previamente como hexadecimal.

Alternativa descartada: seguir concatenando todo el `<li>` en una cadena, que reproduce el XSS actual y dificulta añadir metadatos.

### 3. Cliente sin CDN

Se elimina jQuery y se carga Socket.IO desde `/socket.io/socket.io.js`, que el propio servidor de Socket.IO expone. El código pasa a JavaScript vanilla con `fetch`-free DOM API. Esto elimina dos dependencias externas en tiempo de ejecución y permite que las pruebas E2E funcionen sin Internet.

### 4. Estado de conexión basado en eventos del socket

El indicador arranca en `Conectando…` y escucha `connect`, `disconnect` y `connect_error` para mostrar `Conectado`, `Desconectado` y `Reconectando…` respectivamente. El estado se expone también en `window.chatSocket` para poder simular desconexiones en pruebas sin acoplarse a la UI.

### 5. Scroll con umbral y control explícito

El área de mensajes será el contenedor de scroll (`flex: 1; overflow-y: auto`). Antes de añadir un mensaje se calcula `scrollHeight - scrollTop - clientHeight <= 80`; si el usuario está dentro del umbral se hace scroll al final; si no, se muestra el botón `Nuevos mensajes` con contador. El botón hace scroll suave al final y se oculta. Este umbral evita saltos cuando el usuario está leyendo.

### 6. Refactor mínimo de `server.js` para pruebas

`server.js` exportará `{ app, http, io, start }` e iniciará el listener solo cuando `require.main === module`. `start(port)` devuelve el servidor HTTP. Así las pruebas de integración levantan el servidor real en un puerto efímero y usan `socket.io-client` para verificar el recorrido completo, sin cambiar el arranque con `npm start`.

### 7. Estrategia de pruebas en tres capas

- **Unitarias (Jest)**: ramas de `unalib` y normalización de autor/color, incluyendo entradas no válidas y límites.
- **Integración (Jest + supertest + socket.io-client)**: servidor real exportado; se verifica `GET /`, el eco del mensaje, el saneamiento del nombre y la transformación de imagen/video.
- **E2E (Playwright)**: `webServer` levanta `node server.js`, navegador headless; se conservan los escenarios de URL y XSS y se añaden composición vacía, burbujas, hora, estado de conexión y control de mensajes nuevos.

`npm test` ejecuta unitarias + integración con cobertura. `npm run test:e2e` ejecuta Playwright. `npm run test:all` encadena las tres capas.

## Risks / Trade-offs

- **Detección de mensajes propios**: comparar solo el nombre falla con nombres duplicados. → Se usa `clienteId` como señal primaria y el nombre normalizado como respaldo.
- **Nombres escapados**: insertar el nombre con `innerHTML` depende de que el servidor lo escape. → Se cubre con pruebas unitarias, de integración y E2E de XSS; el cliente nunca inserta el nombre sin pasar por el servidor.
- **Hora solo en cliente**: no hay historial, así que la hora se pierde al recargar. → Aceptado; el alcance excluye persistencia.
- **Scroll en contenedor interno**: cambia el comportamiento de `window.scrollTo`. → Las pruebas E2E verifican el nuevo contenedor y el botón de salto.
- **Cobertura 90%**: añadir ramas de normalización puede bajar el porcentaje. → Se amplían las unitarias para cubrir cada rama y valor límite.
- **Dependencia de Snyk**: el análisis puede requerir autenticación. → Se instala como devDependency y se documenta el resultado; si falta token, se reporta como limitación del entorno, no como fallo de la aplicación.

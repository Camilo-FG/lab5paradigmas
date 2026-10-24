## Context

El cliente envía el texto del campo como JSON (`nombre`, `mensaje`, `color`) por el evento `Evento-Mensaje-Server`. El servidor pasa ese JSON por `libs/unalib.js` y reenvía el resultado. El cliente inserta `mensaje` como HTML. Ver `proposal.md` para el motivo y `specs/chat-urls/spec.md` para el comportamiento.

## Goals / Non-Goals

**Goals:**

- Clasificar el mensaje completo en imagen, video de YouTube o texto antes de mostrarlo.
- Devolver HTML de imagen o de reproductor solo para los dos primeros casos.
- Cubrir cada escenario de la spec con una prueba Mocha escrita en estilo BDD (Given / When / Then).

**Non-Goals:**

- Reproductores para sitios distintos de YouTube.
- Detectar una URL incrustada en medio de una frase.
- Cambiar el protocolo del socket ni agregar dependencias.

## Decisions

### Clasificar en el servidor, dentro de `validateMessage`

La clasificación ocurre en `unalib.validateMessage` antes del `io.emit`. Todos los clientes reciben el mismo HTML y las pruebas pueden ejercer la librería sin abrir el navegador.

Alternativa considerada: clasificar en `index.html`. Se descartó porque cada cliente repetiría la regla y las pruebas BDD no podrían afirmar el resultado sin el DOM.

### Imagen primero, YouTube después, texto al final

`validateMessage` prueba la URL de imagen y, si no coincide, la de YouTube. Una URL no puede cumplir las dos formas a la vez; el orden deja el texto como caso residual.

La imagen debe coincidir con la cadena completa (`http` o `https`, y extensión `.jpg`, `.jpeg`, `.png`, `.gif` o `.bmp`). `is_valid_url_image` e `is_valid_yt_video` aplican su expresión al argumento `url`.

Alternativa considerada: buscar la URL en cualquier parte del mensaje. Se descartó porque la spec exige que el mensaje completo sea la URL.

### Reproductor con el iframe de YouTube

Un video válido se convierte en un `iframe` cuyo `src` es `https://www.youtube.com/embed/` más el identificador de 11 caracteres. Una imagen válida se convierte en un `img` con esa URL. El cliente ya pinta HTML, así que no hace falta un componente nuevo.

Alternativa considerada: un elemento `video` con la URL original. Se descartó porque YouTube no entrega el archivo de video en esa URL.

### Pruebas Mocha en estilo BDD

No se agrega Cucumber. Cada escenario de `specs/chat-urls/spec.md` es un `it` de Mocha. El título nombra el escenario y el cuerpo separa Given, When y Then: arma el JSON de entrada, llama a `validateMessage` y afirma el HTML o el texto resultante.

## Risks / Trade-offs

- [El cliente pinta HTML, así que un falso positivo insertaría una etiqueta] → La imagen y el video solo coinciden con la cadena completa y un conjunto cerrado de formas.
- [Una URL de YouTube con parámetros extra puede no coincidir] → Se aceptan las formas `watch?v=`, `youtu.be/` y `embed/` descritas en la spec; el resto queda como texto.
- [El texto normal pasa por el escape HTML ya existente] → `hola` no cambia. Un mensaje con `<` no se muestra crudo; eso queda fuera de los escenarios de esta spec.

## Migration Plan

No hay datos que migrar. El cambio vive en la librería y en las pruebas. Para revertir, se restaura `libs/unalib.js` y `test/test.js`.

## Open Questions

Ninguna. El alcance de "video" (solo YouTube) y el de "imagen" (extensiones concretas) quedó cerrado en la propuesta y en la spec.

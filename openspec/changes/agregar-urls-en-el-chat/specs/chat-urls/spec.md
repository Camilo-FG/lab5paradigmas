## Purpose

Permite que un mensaje del chat con una URL de imagen o de video de YouTube se vea dentro de la conversación, en lugar de quedar como texto plano.

## ADDED Requirements

### Requirement: Aceptar una URL en el campo de texto
El chat SHALL aceptar una URL escrita en el mismo campo de texto que un mensaje normal y SHALL enviarla como el contenido del mensaje.

#### Scenario: El usuario pega una URL
- **GIVEN** un usuario con el chat abierto
- **WHEN** escribe una URL en el campo de texto y envía el mensaje
- **THEN** el chat trata esa URL como el contenido del mensaje

### Requirement: Mostrar una imagen
El chat SHALL mostrar la imagen cuando el mensaje completo es una URL `http` o `https` que termina en `.jpg`, `.jpeg`, `.png`, `.gif` o `.bmp`.

#### Scenario: URL de imagen jpg
- **GIVEN** un mensaje cuyo contenido es `http://image.com/image.jpg`
- **WHEN** el chat procesa el mensaje
- **THEN** el mensaje mostrado es una imagen con esa URL como origen

#### Scenario: URL de imagen gif
- **GIVEN** un mensaje cuyo contenido es `http://image.com/image.gif`
- **WHEN** el chat procesa el mensaje
- **THEN** el mensaje mostrado es una imagen con esa URL como origen

#### Scenario: URL que no es una imagen
- **GIVEN** un mensaje cuyo contenido es `http://image.com/image.txt`
- **WHEN** el chat procesa el mensaje
- **THEN** el mensaje se muestra como texto y no como imagen

### Requirement: Insertar un reproductor de video
El chat SHALL insertar un reproductor de YouTube cuando el mensaje completo es una URL de `youtube.com` o `youtu.be` con un identificador de video. El reproductor SHALL usar ese identificador. Otros sitios de video MUST permanecer como texto.

#### Scenario: URL de YouTube watch
- **GIVEN** un mensaje cuyo contenido es `https://www.youtube.com/watch?v=qYwlqx-JLok`
- **WHEN** el chat procesa el mensaje
- **THEN** el mensaje mostrado es un reproductor de YouTube del video `qYwlqx-JLok`

#### Scenario: URL corta de YouTube
- **GIVEN** un mensaje cuyo contenido es `https://youtu.be/qYwlqx-JLok`
- **WHEN** el chat procesa el mensaje
- **THEN** el mensaje mostrado es un reproductor de YouTube del video `qYwlqx-JLok`

#### Scenario: URL que no es un video de YouTube
- **GIVEN** un mensaje cuyo contenido es `https://vimeo.com/123456789`
- **WHEN** el chat procesa el mensaje
- **THEN** el mensaje se muestra como texto y no como reproductor

### Requirement: Conservar el texto normal
El chat SHALL mostrar sin cambios un mensaje que no es una URL de imagen ni una URL de video de YouTube.

#### Scenario: Mensaje de texto
- **GIVEN** un mensaje cuyo contenido es `hola`
- **WHEN** el chat procesa el mensaje
- **THEN** el mensaje mostrado es el texto `hola`

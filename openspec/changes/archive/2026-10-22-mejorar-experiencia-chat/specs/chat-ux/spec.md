## Purpose

Define una experiencia de chat clara, segura y accesible: mensajes legibles con autor y hora, estado de conexión visible, composición sin mensajes vacíos, desplazamiento controlado y datos del autor saneados antes de mostrarse.

## ADDED Requirements

### Requirement: Componer y enviar mensajes
El chat SHALL enviar únicamente mensajes con contenido visible, SHALL recortar los espacios al inicio y al final y SHALL mantener el foco en el campo de mensaje después de enviar.

#### Scenario: Enviar un mensaje con texto
- **WHEN** el usuario escribe `  hola  ` y envía el mensaje
- **THEN** el contenido enviado es `hola` y el campo de mensaje queda vacío y con el foco

#### Scenario: Intentar enviar un mensaje vacío
- **WHEN** el campo de mensaje está vacío o contiene solo espacios y el usuario intenta enviar
- **THEN** no se emite ningún mensaje y el campo conserva el foco

#### Scenario: Botón de envío deshabilitado
- **WHEN** el campo de mensaje está vacío o contiene solo espacios
- **THEN** el botón de envío está deshabilitado

#### Scenario: Enviar con la tecla Enter
- **WHEN** el usuario escribe un mensaje y presiona Enter
- **THEN** el mensaje se envía una sola vez

### Requirement: Presentar los mensajes como burbujas
El chat SHALL mostrar cada mensaje dentro de una burbuja que incluya el nombre del autor y la hora local de recepción en formato de 24 horas, y SHALL distinguir visualmente los mensajes propios del resto.

#### Scenario: Mensaje de otro usuario
- **WHEN** llega un mensaje de un autor distinto al nombre configurado en el cliente
- **THEN** la burbuja muestra el nombre del autor y una hora en formato `HH:MM` y se alinea como mensaje recibido

#### Scenario: Mensaje propio
- **WHEN** llega un mensaje cuyo autor coincide con el nombre configurado en el cliente
- **THEN** la burbuja se marca como mensaje propio, se alinea a la derecha y muestra la etiqueta `Tú`

#### Scenario: Hora local
- **WHEN** el cliente recibe un mensaje
- **THEN** la hora mostrada corresponde a la hora local del navegador del usuario

### Requirement: Mostrar el estado de la conexión
El chat SHALL mostrar un indicador con el estado de la conexión y SHALL actualizarlo cuando el socket se conecta, se desconecta o se reconecta.

#### Scenario: Conexión establecida
- **WHEN** el socket del cliente se conecta al servidor
- **THEN** el indicador muestra `Conectado`

#### Scenario: Conexión perdida
- **WHEN** el socket del cliente se desconecta
- **THEN** el indicador muestra `Desconectado`

#### Scenario: Reconexión
- **WHEN** el socket del cliente vuelve a conectarse después de una desconexión
- **THEN** el indicador vuelve a mostrar `Conectado`

### Requirement: Controlar el desplazamiento ante mensajes nuevos
El chat SHALL desplazarse al último mensaje cuando el usuario está cerca del final y, si el usuario está leyendo mensajes anteriores, SHALL ofrecer un control para saltar a los mensajes nuevos sin mover la vista automáticamente.

#### Scenario: Seguir el último mensaje
- **WHEN** el usuario está cerca del final de la conversación y llega un mensaje nuevo
- **THEN** la vista se desplaza automáticamente hasta el mensaje nuevo

#### Scenario: El usuario está leyendo mensajes anteriores
- **WHEN** el usuario está desplazado hacia arriba y llega un mensaje nuevo
- **THEN** la vista no se mueve y aparece el control `Nuevos mensajes`

#### Scenario: Saltar a los mensajes nuevos
- **WHEN** el usuario activa el control `Nuevos mensajes`
- **THEN** la vista se desplaza al final y el control desaparece

### Requirement: Mostrar el estado vacío
El chat SHALL mostrar un mensaje de bienvenida mientras la conversación no tenga mensajes y SHALL ocultarlo cuando llegue el primer mensaje.

#### Scenario: Conversación vacía
- **WHEN** el usuario abre el chat y no hay mensajes
- **THEN** se muestra el texto `Aún no hay mensajes` y no se muestra ninguna burbuja

#### Scenario: Primer mensaje
- **WHEN** llega el primer mensaje de la conversación
- **THEN** el estado vacío desaparece y la burbuja del mensaje se muestra

### Requirement: Saneamiento de los datos del autor
El servidor SHALL normalizar el nombre y el color del autor antes de reenviar el mensaje: SHALL recortar y escapar el nombre, SHALL usar `Anónimo` cuando el nombre esté vacío o no sea una cadena, SHALL limitar el nombre a 30 caracteres y SHALL aceptar el color solo en formato hexadecimal, usando un color por defecto en caso contrario.

#### Scenario: Nombre con HTML
- **WHEN** el cliente envía el nombre `<img src=x onerror=alert(1)>`
- **THEN** el nombre reenviado no contiene etiquetas HTML ejecutables

#### Scenario: Nombre vacío
- **WHEN** el cliente envía un nombre vacío o ausente
- **THEN** el nombre reenviado es `Anónimo`

#### Scenario: Nombre demasiado largo
- **WHEN** el cliente envía un nombre de más de 30 caracteres
- **THEN** el nombre reenviado tiene como máximo 30 caracteres

#### Scenario: Color no válido
- **WHEN** el cliente envía un color que no es hexadecimal
- **THEN** el mensaje reenviado usa un color hexadecimal por defecto

### Requirement: Accesibilidad de los medios y de la conversación
El chat SHALL anunciar los mensajes nuevos a las tecnologías de asistencia, SHALL etiquetar los campos del formulario y SHALL proporcionar texto alternativo a las imágenes y un título a los reproductores de video.

#### Scenario: Anuncio de mensajes
- **WHEN** llega un mensaje nuevo
- **THEN** la lista de mensajes pertenece a una región `aria-live` de tipo `polite`

#### Scenario: Imagen accesible
- **WHEN** el mensaje mostrado es una imagen
- **THEN** la imagen tiene un atributo `alt` no vacío y se adapta al ancho disponible

#### Scenario: Video accesible
- **WHEN** el mensaje mostrado es un reproductor de YouTube
- **THEN** el reproductor tiene un atributo `title` no vacío y se adapta al ancho disponible

#### Scenario: Formulario etiquetado
- **WHEN** el usuario navega el formulario con un lector de pantalla
- **THEN** los campos de usuario y de mensaje tienen etiquetas accesibles y el botón de envío tiene un nombre accesible

### Requirement: Compatibilidad con el contrato del chat
El chat SHALL conservar el evento `Evento-Mensaje-Server`, los identificadores `#nombre`, `#m` y `#messages`, el botón con texto `Send` y el soporte existente de URLs de imagen y de video de YouTube.

#### Scenario: Mensaje de imagen
- **WHEN** el usuario envía `http://image.com/image.jpg`
- **THEN** la conversación muestra una imagen con ese origen dentro de una burbuja

#### Scenario: Mensaje de video
- **WHEN** el usuario envía `https://www.youtube.com/watch?v=qYwlqx-JLok`
- **THEN** la conversación muestra un reproductor de YouTube dentro de una burbuja

#### Scenario: Mensaje de texto
- **WHEN** el usuario envía `hola`
- **THEN** la conversación muestra el texto `hola` escapado dentro de una burbuja

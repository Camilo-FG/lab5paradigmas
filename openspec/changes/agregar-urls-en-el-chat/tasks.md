## 1. Clasificación del mensaje

- [ ] 1.1 Hacer que `is_valid_url_image` evalúe el argumento `url` y acepte solo la cadena completa `http` o `https` terminada en `.jpg`, `.jpeg`, `.png`, `.gif` o `.bmp`
- [ ] 1.2 Hacer que `is_valid_yt_video` evalúe el argumento `url` y acepte una URL completa de `youtube.com` o `youtu.be` con identificador de video
- [ ] 1.3 Hacer que `validateMessage` convierta una imagen en `img`, un video de YouTube en un `iframe` con ese identificador, y conserve el resto como texto

## 2. Pruebas BDD

- [ ] 2.1 Agregar en `test/test.js` un escenario Mocha Given/When/Then por cada caso de imagen de `specs/chat-urls/spec.md`: jpg, gif y una URL que no es imagen
- [ ] 2.2 Agregar un escenario Mocha Given/When/Then por cada caso de video: `watch?v=`, `youtu.be` y un sitio que no es YouTube
- [ ] 2.3 Agregar el escenario de texto normal `hola`, que debe conservarse
- [ ] 2.4 Ejecutar `npm test` y dejar en verde las pruebas nuevas y las que ya existían

## 3. Campo de texto del chat

- [ ] 3.1 Confirmar que el campo de texto envía la URL como `mensaje` y que el cliente pinta el HTML de la imagen o del reproductor

## 1. Servidor y normalización

- [x] 1.1 En `libs/unalib.js`, normalizar `nombre` (recorte, escape, `Anónimo`, máximo 30 caracteres), validar `color` como hexadecimal con `#4f46e5` por defecto y conservar `clienteId` como cadena de hasta 64 caracteres dentro de `validateMessage`
- [x] 1.2 Refactorizar `server.js` para exportar `app`, `http`, `io` y `start(port)`, e iniciar el listener solo con `require.main === module`
- [x] 1.3 Verificar manualmente que `npm start` sigue sirviendo el chat en `http://localhost:3000`

## 2. Interfaz del chat

- [x] 2.1 Reescribir el marcado y los estilos de `index.html` con encabezado, indicador de conexión, área de scroll, estado vacío, botón `Nuevos mensajes` y formulario accesible
- [x] 2.2 Implementar el renderizado de burbujas con avatar, nombre saneado, hora local `HH:MM`, etiqueta `Tú` para mensajes propios y soporte de imagen/video/texto
- [x] 2.3 Implementar la composición: recorte, bloqueo de mensajes vacíos, botón deshabilitado, Enter, limpieza y retorno del foco
- [x] 2.4 Implementar el estado de conexión (`Conectando…`, `Conectado`, `Desconectado`) con los eventos del socket y exponer `window.chatSocket`
- [x] 2.5 Implementar el auto-scroll con umbral, el control `Nuevos mensajes`, el estado vacío y los atributos de accesibilidad (`aria-live`, etiquetas, `alt`, `title`)
- [x] 2.6 Eliminar jQuery y la carga de Socket.IO desde CDN, usando `/socket.io/socket.io.js`

## 3. Pruebas unitarias e integración

- [x] 3.1 Corregir las aserciones de escape HTML en `test/integration.test.js` para comprobar entidades (`&lt;`, `&gt;`) en lugar de caracteres literales
- [x] 3.2 Ampliar `test/test.js` con casos de normalización, entradas inválidas, límites de longitud, color, `clienteId`, sanitización y helpers de URL hasta superar el 90% de cobertura de `libs/unalib.js`
- [x] 3.3 Agregar `test/socket.integration.test.js` que levante el servidor exportado en un puerto efímero y valide con `socket.io-client` el eco, el saneamiento del autor y la transformación de imagen/video
- [x] 3.4 Agregar scripts `test:unit`, `test:integration`, `test:e2e` y `test:all` en `package.json`
- [x] 3.5 Ejecutar `npm run test:unit` y `npm run test:integration` sin fallos y con cobertura ≥ 90%

## 4. Pruebas E2E

- [x] 4.1 Configurar `webServer` en `playwright.config.js` y ejecución headless para levantar `node server.js`
- [x] 4.2 Conservar y adaptar los escenarios E2E existentes de imagen, video y XSS
- [x] 4.3 Agregar escenarios E2E de burbuja con autor y hora, mensaje propio, envío vacío bloqueado, estado vacío, estado de conexión y control `Nuevos mensajes`
- [x] 4.4 Ejecutar `npm run test:e2e` y dejar todos los escenarios en verde

## 5. Seguridad y cierre

- [x] 5.1 Instalar `snyk` como dependencia de desarrollo y ejecutar el análisis de dependencias del proyecto
- [x] 5.2 Documentar en `README.md` los comandos de prueba, el flujo de Snyk y el resultado del análisis
- [x] 5.3 Ejecutar `openspec validate mejorar-experiencia-chat --strict` y corregir cualquier hallazgo
- [x] 5.4 Ejecutar toda la suite (`npm run test:all`) una última vez y archivar el cambio sincronizando la spec `chat-ux`

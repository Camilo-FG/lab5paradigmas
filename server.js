
// npm install para descargar los paquetes...

// libreriuas
var validation = require('./libs/unalib');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// root: presentar html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// escuchar una conexion por socket
io.on('connection', function(socket){
  // si se escucha "chat message"
  socket.on('Evento-Mensaje-Server', function(msg){

    msg =  validation.validateMessage(msg);
    // volvemos a emitir el mismo mensaje
    io.emit('Evento-Mensaje-Server', msg);
  });
});

// Inicia el listener HTTP. Se exporta para que las pruebas de integración
// puedan levantar el servidor en un puerto efímero.
function start(listenPort, callback) {
  var selectedPort = listenPort === undefined ? port : listenPort;
  return http.listen(selectedPort, callback);
}

// Solo escucha automáticamente cuando se ejecuta con `node server.js`.
if (require.main === module) {
  start(port, function(){
    console.log('listening on *:' + port);
  });
}

module.exports = {
  app: app,
  http: http,
  io: io,
  start: start
};

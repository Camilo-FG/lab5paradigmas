const { io: createClient } = require('socket.io-client');
const { start, io } = require('../server');

describe('Socket integration - Evento-Mensaje-Server', () => {
  let httpServer;
  let client;
  let baseUrl;

  beforeAll(async () => {
    httpServer = await new Promise((resolve) => {
      const instance = start(0, () => resolve(instance));
    });

    baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
    client = createClient(baseUrl, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false
    });

    await new Promise((resolve, reject) => {
      client.once('connect', resolve);
      client.once('connect_error', reject);
    });
  });

  afterAll(async () => {
    if (client) {
      client.close();
    }
    await new Promise((resolve) => io.close(resolve));
  });

  function sendAndReceive(payload) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('No se recibio el mensaje reenviado por el servidor'));
      }, 5000);

      client.once('Evento-Mensaje-Server', (msg) => {
        clearTimeout(timer);
        resolve(JSON.parse(msg));
      });

      client.emit('Evento-Mensaje-Server', JSON.stringify(payload));
    });
  }

  it('deberia reenviar un mensaje de texto y sanear el autor', async () => {
    const salida = await sendAndReceive({
      nombre: '  <img src=x onerror=alert(1)>  ',
      mensaje: '<script>alert(1)</script>',
      color: 'expression(alert(1))',
      clienteId: '  cliente-integracion  '
    });

    expect(salida.nombre).not.toContain('<img');
    expect(salida.nombre).toContain('&lt;img');
    expect(salida.mensaje).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(salida.color).toBe('#4f46e5');
    expect(salida.clienteId).toBe('cliente-integracion');
  });

  it('deberia transformar una URL de imagen en una etiqueta img', async () => {
    const salida = await sendAndReceive({
      nombre: 'Ana',
      mensaje: 'http://image.com/integracion.jpg',
      color: '#abc'
    });

    expect(salida.mensaje).toContain('<img');
    expect(salida.mensaje).toContain('http://image.com/integracion.jpg');
    expect(salida.nombre).toBe('Ana');
    expect(salida.color).toBe('#abc');
  });

  it('deberia transformar una URL de YouTube en un iframe', async () => {
    const salida = await sendAndReceive({
      nombre: 'Ana',
      mensaje: 'https://www.youtube.com/watch?v=qYwlqx-JLok',
      color: '#4f46e5'
    });

    expect(salida.mensaje).toContain('<iframe');
    expect(salida.mensaje).toContain('youtube.com/embed/qYwlqx-JLok');
  });

  it('deberia aplicar el nombre por defecto cuando falta', async () => {
    const salida = await sendAndReceive({
      mensaje: 'hola'
    });

    expect(salida.nombre).toBe('Anónimo');
    expect(salida.color).toBe('#4f46e5');
  });
});

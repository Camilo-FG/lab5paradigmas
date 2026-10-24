const request = require('supertest');
const http = require('http');
const express = require('express');

// Build the Express app without starting the HTTP server automatically
const app = express();

// Replicate the routes from server.js
app.get('/', function(req, res){
  res.sendFile(require('path').resolve(__dirname + '/../index.html'));
});

// Create a server that we can control
const server = http.createServer(app);

const validation = require('../libs/unalib');

describe('Integration Tests - Express API', () => {
  beforeAll((done) => {
    server.listen(0, done); // let the OS assign a free port
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /', () => {
    it('deberia servir el archivo index.html', async () => {
      const res = await request(server).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Chat Socket.IO UNA');
    });
  });

  describe('Validation Integration', () => {
    describe('is_valid_phone', () => {
      it('deberia validar telefonos con formato correcto', () => {
        expect(validation.is_valid_phone('8297-8547')).toBe(true);
        expect(validation.is_valid_phone('+1-829-78547')).toBe(true);
        expect(validation.is_valid_phone('8297 8547')).toBe(true);
      });

      it('deberia rechazar telefonos con letras', () => {
        expect(validation.is_valid_phone('8297p-8547')).toBe(false);
        expect(validation.is_valid_phone('abc-1234')).toBe(false);
      });
    });

    describe('is_valid_url_image', () => {
      it('deberia validar URLs de imagenes jpg', () => {
        expect(validation.is_valid_url_image('http://image.com/image.jpg')).toBe(true);
        expect(validation.is_valid_url_image('https://example.com/pic.jpeg')).toBe(true);
      });

      it('deberia rechazar URLs no imagenes', () => {
        expect(validation.is_valid_url_image('http://example.com/page')).toBe(false);
        expect(validation.is_valid_url_image('http://example.com/document.pdf')).toBe(false);
      });
    });

    describe('is_valid_yt_video', () => {
      it('deberia validar URLs de videos de YouTube', () => {
        expect(validation.is_valid_yt_video('https://www.youtube.com/watch?v=qYwlqx-JLok')).toBe(true);
        expect(validation.is_valid_yt_video('http://youtu.be/dQw4w9WgXcQ')).toBe(true);
      });

      it('deberia rechazar URLs no de YouTube', () => {
        expect(validation.is_valid_yt_video('http://example.com/video')).toBe(false);
      });
    });

    describe('validateMessage', () => {
      it('deberia neutralizar scripts HTML en el mensaje', () => {
        const entrada = JSON.stringify({
          nombre: 'usuario',
          mensaje: '<script>alert(1)</script>',
          color: '#000000'
        });

        const salida = JSON.parse(validation.validateMessage(entrada));
        // El script debe ser escapado: no debe aparecer literal <script>
        // Las entidades HTML &lt; y &gt; reemplazan a los caracteres literales
        expect(salida.mensaje).not.toContain('<script>');
        expect(salida.mensaje).toContain('&lt;');
        expect(salida.mensaje).toContain('&gt;');
      });

      it('deberia convertir URLs de imagenes en etiquetas img', () => {
        const entrada = JSON.stringify({
          nombre: 'usuario',
          mensaje: 'http://image.com/image.jpg',
          color: '#000000'
        });

        const salida = JSON.parse(validation.validateMessage(entrada));
        expect(salida.mensaje).toContain('<img');
        expect(salida.mensaje).toContain('image.jpg');
      });

      it('deberia convertir URLs de videos de YouTube en codigo embedded', () => {
        const entrada = JSON.stringify({
          nombre: 'usuario',
          mensaje: 'https://www.youtube.com/watch?v=qYwlqx-JLok',
          color: '#000000'
        });

        const salida = JSON.parse(validation.validateMessage(entrada));
        expect(salida.mensaje).toContain('iframe');
        expect(salida.mensaje).toContain('youtube');
      });

      it('deberia escapar texto HTML', () => {
        const entrada = JSON.stringify({
          nombre: 'usuario',
          mensaje: 'Hola <mundo>',
          color: '#000000'
        });

        const salida = JSON.parse(validation.validateMessage(entrada));
        // Las entidades HTML se añaden: el output contiene &lt; y &gt;
        expect(salida.mensaje).toContain('Hola');
        expect(salida.mensaje).toContain('&lt;');
        expect(salida.mensaje).toContain('&gt;');
      });

      it('deberia sanear el nombre y el color del autor', () => {
        const salida = JSON.parse(validation.validateMessage(JSON.stringify({
          nombre: '<img src=x onerror=alert(1)>',
          mensaje: 'hola',
          color: 'expression(alert(1))'
        })));

        expect(salida.nombre).not.toContain('<img');
        expect(salida.nombre).toContain('&lt;img');
        expect(salida.color).toBe('#4f46e5');
      });
    });
  });
});
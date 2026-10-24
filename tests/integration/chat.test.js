const request = require('supertest');
const http = require('http');
const express = require('express');
const validation = require('../../libs/unalib');

// Build Express app similar to server.js
const app = express();

app.get('/', function(req, res){
  res.sendFile(require('path').resolve(__dirname + '/../../index.html'));
});

// Create HTTP server
const server = http.createServer(app);

describe('Integration Tests - Chat API', () => {
  beforeAll((done) => {
    server.listen(0, done);
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

  describe('Validation Integration - una-lib', () => {
    describe('is_valid_phone', () => {
      it('deberia validar telefonos con formato correcto', () => {
        expect(validation.is_valid_phone('8297-8547')).toBe(true);
        expect(validation.is_valid_phone('+1-829-78547')).toBe(true);
      });

      it('deberia rechazar telefonos con letras', () => {
        expect(validation.is_valid_phone('8297p-8547')).toBe(false);
      });
    });

    describe('is_valid_url_image', () => {
      it('deberia validar URLs de imagenes jpg', () => {
        expect(validation.is_valid_url_image('http://image.com/image.jpg')).toBe(true);
      });

      it('deberia rechazar URLs no imagenes', () => {
        expect(validation.is_valid_url_image('http://example.com/page')).toBe(false);
      });
    });

    describe('is_valid_yt_video', () => {
      it('deberia validar URLs de videos de YouTube', () => {
        expect(validation.is_valid_yt_video('https://www.youtube.com/watch?v=qYwlqx-JLok')).toBe(true);
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
        expect(salida.mensaje).not.toContain('<script>');
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
    });
  });
});
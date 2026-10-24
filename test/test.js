var val = require('../libs/unalib');
var assert = require('assert');


describe('unalib', function(){


  describe('funcion is_valid_phone', function(){

    it('deberia devolver true para 8297-8547', function(){

      assert.equal(val.is_valid_phone('8297-8547'), true);

    });

    it('deberia devolver false para 8297p-8547', function(){

      assert.equal(val.is_valid_phone('8297p-8547'), false);

    });

    it('deberia devolver false para valores que no son cadenas', function(){

      assert.equal(val.is_valid_phone(undefined), false);
      assert.equal(val.is_valid_phone(null), false);

    });

  });


  describe('funcion containsDangerousContent', function(){

    it('deberia detectar etiquetas script', function(){

      assert.equal(val.containsDangerousContent('<script>alert(1)</script>'), true);

    });

    it('deberia detectar manejadores de eventos', function(){

      assert.equal(val.containsDangerousContent('<img src=x onerror=alert(1)>'), true);

    });

    it('deberia devolver false para texto normal', function(){

      assert.equal(val.containsDangerousContent('hola mundo'), false);

    });

    it('deberia devolver false para valores que no son cadenas', function(){

      assert.equal(val.containsDangerousContent(null), false);

    });

  });


  describe('funcion sanitizeContent', function(){

    it('deberia eliminar scripts y escapar el resto', function(){

      assert.equal(
        val.sanitizeContent('<script>alert(1)</script>hola'),
        'hola'
      );

    });

    it('deberia eliminar manejadores de eventos', function(){

      assert.equal(val.sanitizeContent('onclick=alert(1)'), 'alert(1)');

    });

    it('deberia escapar texto normal', function(){

      assert.equal(val.sanitizeContent('hola <mundo>'), 'hola &lt;mundo&gt;');

    });

    it('deberia devolver valores que no son cadenas sin cambios', function(){

      assert.equal(val.sanitizeContent(123), 123);

    });

  });


  describe('funcion is_valid_url_image', function(){

    it('deberia devolver true para http://image.com/image.jpg', function(){

      assert.equal(val.is_valid_url_image('http://image.com/image.jpg'), true);

    });

    it('deberia devolver true para http://image.com/image.gif', function(){

      assert.equal(val.is_valid_url_image('http://image.com/image.gif'), true);

    });

    it('deberia devolver true para una URL https con svg', function(){

      assert.equal(val.is_valid_url_image('https://example.com/logo.svg'), true);

    });

    it('deberia devolver false para una URL que no es imagen', function(){

      assert.equal(val.is_valid_url_image('http://image.com/image.txt'), false);

    });

    it('deberia devolver false para contenido peligroso', function(){

      assert.equal(
        val.is_valid_url_image('http://image.com/image.jpg<script>alert(1)</script>'),
        false
      );

    });

    it('deberia devolver false para valores que no son cadenas', function(){

      assert.equal(val.is_valid_url_image(null), false);

    });

  });


  describe('funcion is_valid_yt_video', function(){

    it('deberia devolver true para youtube.com/watch', function(){

      assert.equal(val.is_valid_yt_video('https://www.youtube.com/watch?v=qYwlqx-JLok'), true);

    });

    it('deberia devolver true para youtu.be', function(){

      assert.equal(val.is_valid_yt_video('https://youtu.be/qYwlqx-JLok'), true);

    });

    it('deberia devolver true para youtube.com/embed', function(){

      assert.equal(val.is_valid_yt_video('https://www.youtube.com/embed/qYwlqx-JLok'), true);

    });

    it('deberia devolver false para un sitio que no es YouTube', function(){

      assert.equal(val.is_valid_yt_video('https://vimeo.com/123456789'), false);

    });

    it('deberia devolver false para contenido peligroso', function(){

      assert.equal(
        val.is_valid_yt_video('https://youtu.be/qYwlqx-JLok javascript:alert(1)'),
        false
      );

    });

    it('deberia devolver false para valores que no son cadenas', function(){

      assert.equal(val.is_valid_yt_video(null), false);

    });

  });


  describe('funcion getYTVideoId', function(){

    it('deberia extraer el identificador de una URL watch', function(){

      assert.equal(
        val.getYTVideoId('https://www.youtube.com/watch?v=qYwlqx-JLok'),
        'qYwlqx-JLok'
      );

    });

    it('deberia extraer el identificador de una URL corta', function(){

      assert.equal(val.getYTVideoId('https://youtu.be/qYwlqx-JLok'), 'qYwlqx-JLok');

    });

  });


  describe('funcion getEmbeddedCode', function(){

    it('deberia generar un iframe con el identificador del video', function(){

      var code = val.getEmbeddedCode('https://www.youtube.com/watch?v=qYwlqx-JLok');

      assert.equal(code.indexOf('<iframe') !== -1, true);
      assert.equal(code.indexOf('youtube.com/embed/qYwlqx-JLok') !== -1, true);

    });

  });


  describe('funcion getImageTag', function(){

    it('deberia generar una etiqueta img para una URL valida', function(){

      var tag = val.getImageTag('http://image.com/image.jpg');

      assert.equal(tag.indexOf('<img src="http://image.com/image.jpg"') === 0, true);

    });

    it('deberia generar una etiqueta sin origen para una URL invalida', function(){

      assert.equal(val.getImageTag('http://image.com/image.txt'), '<img src="" style="max-height: 400px;max-width: 400px;">');

    });

  });


  describe('funcion escapeHtml', function(){

    it('deberia escapar los caracteres especiales de HTML', function(){

      assert.equal(
        val.escapeHtml('<a href="x">\'&\'</a>'),
        '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;'
      );

    });

  });


  describe('funcion normalizeAuthorName', function(){

    it('deberia devolver Anónimo cuando el nombre no es una cadena', function(){

      assert.equal(val.normalizeAuthorName(undefined), 'Anónimo');
      assert.equal(val.normalizeAuthorName(123), 'Anónimo');

    });

    it('deberia devolver Anónimo cuando el nombre esta vacio', function(){

      assert.equal(val.normalizeAuthorName(''), 'Anónimo');
      assert.equal(val.normalizeAuthorName('   '), 'Anónimo');

    });

    it('deberia recortar los espacios externos', function(){

      assert.equal(val.normalizeAuthorName('  Ana  '), 'Ana');

    });

    it('deberia escapar HTML en el nombre', function(){

      assert.equal(val.normalizeAuthorName('<b>Ana</b>'), '&lt;b&gt;Ana&lt;/b&gt;');

    });

    it('deberia limitar el nombre a 30 caracteres', function(){

      assert.equal(val.normalizeAuthorName('a'.repeat(40)).length, 30);

    });

    it('no deberia dejar entidades HTML incompletas al recortar', function(){

      var name = val.normalizeAuthorName('<'.repeat(100));

      assert.equal(name.length <= 30, true);
      assert.equal(name.charAt(name.length - 1), ';');

    });

  });


  describe('funcion normalizeColor', function(){

    it('deberia usar el color por defecto para valores invalidos', function(){

      assert.equal(val.normalizeColor(undefined), '#4f46e5');
      assert.equal(val.normalizeColor(123), '#4f46e5');
      assert.equal(val.normalizeColor('red'), '#4f46e5');
      assert.equal(val.normalizeColor('#12345'), '#4f46e5');
      assert.equal(val.normalizeColor('#ggg'), '#4f46e5');

    });

    it('deberia aceptar colores hexadecimales de 3 y 6 digitos', function(){

      assert.equal(val.normalizeColor('#abc'), '#abc');
      assert.equal(val.normalizeColor('#A1B2C3'), '#A1B2C3');
      assert.equal(val.normalizeColor('  #fff  '), '#fff');

    });

  });


  describe('funcion normalizeClientId', function(){

    it('deberia devolver una cadena vacia para valores invalidos', function(){

      assert.equal(val.normalizeClientId(undefined), '');
      assert.equal(val.normalizeClientId(123), '');

    });

    it('deberia recortar espacios y limitar la longitud', function(){

      assert.equal(val.normalizeClientId('  abc  '), 'abc');
      assert.equal(val.normalizeClientId('x'.repeat(100)).length, 64);

    });

  });


  describe('funcion validateMessage', function(){

    it('deberia devolver un mensaje vacio para entradas invalidas', function(){

      assert.equal(val.validateMessage(null), JSON.stringify({ mensaje: '' }));
      assert.equal(val.validateMessage(undefined), JSON.stringify({ mensaje: '' }));
      assert.equal(val.validateMessage(''), JSON.stringify({ mensaje: '' }));
      assert.equal(val.validateMessage(123), JSON.stringify({ mensaje: '' }));

    });

    it('deberia neutralizar la inyeccion de scripts', function(){

      var entrada = JSON.stringify({
        nombre: 'usuario',
        mensaje: '<script>alert(1)</script>',
        color: '#000000'
      });

      var salida = JSON.parse(val.validateMessage(entrada));

      assert.equal(salida.mensaje, '&lt;script&gt;alert(1)&lt;/script&gt;');
      assert.equal(salida.mensaje.indexOf('<script'), -1);

    });

    it('deberia conservar el texto normal y los datos del autor', function(){

      var salida = JSON.parse(val.validateMessage(JSON.stringify({
        nombre: '  Ana  ',
        mensaje: 'hola',
        color: '#abc',
        clienteId: '  cliente-1  '
      })));

      assert.equal(salida.nombre, 'Ana');
      assert.equal(salida.mensaje, 'hola');
      assert.equal(salida.color, '#abc');
      assert.equal(salida.clienteId, 'cliente-1');

    });

    it('deberia convertir una URL de imagen en una etiqueta img', function(){

      var salida = JSON.parse(val.validateMessage(JSON.stringify({
        nombre: 'Ana',
        mensaje: 'http://image.com/image.jpg',
        color: '#000000'
      })));

      assert.equal(salida.mensaje.indexOf('<img') === 0, true);
      assert.equal(salida.mensaje.indexOf('image.jpg') !== -1, true);

    });

    it('deberia convertir una URL de YouTube en un iframe', function(){

      var salida = JSON.parse(val.validateMessage(JSON.stringify({
        nombre: 'Ana',
        mensaje: 'https://www.youtube.com/watch?v=qYwlqx-JLok',
        color: '#000000'
      })));

      assert.equal(salida.mensaje.indexOf('<iframe') === 0, true);
      assert.equal(salida.mensaje.indexOf('youtube.com/embed/qYwlqx-JLok') !== -1, true);

    });

    it('deberia sanear el nombre del autor', function(){

      var salida = JSON.parse(val.validateMessage(JSON.stringify({
        nombre: '<img src=x onerror=alert(1)>',
        mensaje: 'hola'
      })));

      assert.equal(salida.nombre.indexOf('<img') === -1, true);
      assert.equal(salida.nombre.indexOf('&lt;img') === 0, true);
      assert.equal(salida.nombre.length <= 30, true);

    });

    it('deberia aplicar valores por defecto al autor ausente', function(){

      var salida = JSON.parse(val.validateMessage(JSON.stringify({
        mensaje: 'hola'
      })));

      assert.equal(salida.nombre, 'Anónimo');
      assert.equal(salida.color, '#4f46e5');
      assert.equal(salida.clienteId, '');

    });

    it('deberia ignorar un mensaje que no es una cadena', function(){

      var salida = JSON.parse(val.validateMessage(JSON.stringify({
        nombre: 'Ana',
        mensaje: 123
      })));

      assert.equal(salida.mensaje, '');

    });

    it('deberia devolver un mensaje vacio para un JSON que no es un objeto', function(){

      assert.equal(val.validateMessage('"hola"'), JSON.stringify({ mensaje: '' }));
      assert.equal(val.validateMessage('[]'), JSON.stringify({ mensaje: '' }));
      assert.equal(val.validateMessage('null'), JSON.stringify({ mensaje: '' }));

    });

    it('deberia escapar el contenido original cuando el JSON es invalido', function(){

      assert.equal(
        val.validateMessage('{no-json'),
        JSON.stringify({ mensaje: '{no-json' })
      );

    });

  });

});

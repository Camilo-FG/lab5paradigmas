// modulo de ejemplo.

module.exports = {

    // Valores por defecto para los datos del autor
    DEFAULT_AUTHOR_NAME: 'Anónimo',
    DEFAULT_AUTHOR_COLOR: '#4f46e5',
    MAX_AUTHOR_NAME_LENGTH: 30,
    MAX_CLIENT_ID_LENGTH: 64,

    // logica que valida si un telefono esta correcto...
    is_valid_phone: function (phone) {
      // inicializacion lazy
      var isValid = false;
      // expresion regular copiada de StackOverflow
      var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i;

      // validacion Regex
      try {
        isValid = re.test(phone);
      } catch (e) {
        console.log(e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },

    // Expresiones regulares mejoradas para validación segura
    // Patrones peligrosos que deben ser bloqueados
    dangerousPatterns: [
      // Script tags
      /<script[^>]*>.*?<\/script>/gi,
      // Event handlers
      /on\w+\s*=/gi,
      // Protocol handlers que pueden ser peligrosos
      /javascript:/gi,
      /data:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
    ],

    // Función para verificar si un contenido contiene patrones peligrosos
    containsDangerousContent: function (text) {
      if (typeof text !== 'string') return false;
      return this.dangerousPatterns.some(function (pattern) {
        pattern.lastIndex = 0;
        return pattern.test(text);
      });
    },

    // Función para limpiar contenido de patrones peligrosos
    sanitizeContent: function (text) {
      if (typeof text !== 'string') return text;
      
      var sanitized = text;
      // Remover patrones de script
      this.dangerousPatterns.forEach(function (pattern) {
        sanitized = sanitized.replace(pattern, '');
      });
      // Usar la función escapeHtml existente para consistencia
      return this.escapeHtml(sanitized);
    },

    is_valid_url_image: function (url) {

      // inicializacion lazy
      var isValid = false;
      // expresion regular para validar URLs de imagenes
      var re = /^(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|bmp|svg)$/i;

      // validacion Regex
      try {
        // Primero verificar que no haya contenido peligroso
        if (this.containsDangerousContent(url)) {
          return false;
        }
        isValid = re.test(url);
      } catch (e) {
        console.log(e);
      } finally {
          return isValid;
      }
    },

    is_valid_yt_video: function (url) {

      // inicializacion lazy
      var isValid = false;
      // expresion regular mejorada para validar videos de YouTube
      var re = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})$/i;

      // validacion Regex
      try {
        // Primero verificar que no haya contenido peligroso
        if (this.containsDangerousContent(url)) {
          return false;
        }
        isValid = re.test(url);
      } catch (e) {
        console.log(e);
      } finally {
          return isValid;
      }
    },

    getYTVideoId: function(url){

      return url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
    },

    getEmbeddedCode: function (url){

      var id = this.getYTVideoId(url);
      var code = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+id+ '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      return code;
    },

    getImageTag: function(url){
      // Validar que la URL sea segura antes de generar la etiqueta
      if (!this.is_valid_url_image(url)) {
        return '<img src="" style="max-height: 400px;max-width: 400px;">';
      }
      var tag = '<img src="'+url+'" style="max-height: 400px;max-width: 400px;">';
      return tag;
    },

    // Función de escape HTML - using char codes to avoid single quote syntax issues
    escapeHtml: function (text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    // Normaliza el nombre del autor: recorta, escapa y limita su longitud.
    normalizeAuthorName: function (name) {
      if (typeof name !== 'string') {
        return this.DEFAULT_AUTHOR_NAME;
      }

      var trimmed = name.trim();
      if (trimmed.length === 0) {
        return this.DEFAULT_AUTHOR_NAME;
      }

      var escaped = this.escapeHtml(trimmed);
      if (escaped.length <= this.MAX_AUTHOR_NAME_LENGTH) {
        return escaped;
      }

      // Recorta sin dejar una entidad HTML incompleta (por ejemplo "&l").
      var cut = escaped.slice(0, this.MAX_AUTHOR_NAME_LENGTH);
      var lastAmpersand = cut.lastIndexOf('&');
      if (lastAmpersand !== -1 && cut.indexOf(';', lastAmpersand) === -1) {
        cut = cut.slice(0, lastAmpersand);
      }
      return cut.length > 0 ? cut : this.DEFAULT_AUTHOR_NAME;
    },

    // Acepta únicamente colores hexadecimales de 3 o 6 dígitos.
    normalizeColor: function (color) {
      if (typeof color !== 'string') {
        return this.DEFAULT_AUTHOR_COLOR;
      }

      var trimmed = color.trim();
      var re = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
      return re.test(trimmed) ? trimmed : this.DEFAULT_AUTHOR_COLOR;
    },

    // Conserva un identificador de cliente acotado y sin espacios externos.
    normalizeClientId: function (clienteId) {
      if (typeof clienteId !== 'string') {
        return '';
      }
      return clienteId.trim().slice(0, this.MAX_CLIENT_ID_LENGTH);
    },

    // Validación mejorada de mensajes
    validateMessage: function(msg){
      // Handle invalid input
      if (!msg || typeof msg !== 'string') {
        return JSON.stringify({ mensaje: '' });
      }

      try {
        var obj = JSON.parse(msg);

        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
          return JSON.stringify({ mensaje: '' });
        }

        // Los datos del autor se normalizan aquí: es la única fuente de verdad
        // para todos los clientes conectados al socket.
        obj.nombre = this.normalizeAuthorName(obj.nombre);
        obj.color = this.normalizeColor(obj.color);
        obj.clienteId = this.normalizeClientId(obj.clienteId);

        if (typeof obj.mensaje !== 'string') {
          obj.mensaje = '';
        }

        if(this.is_valid_url_image(obj.mensaje)){
          console.log("Es una imagen!")
          obj.mensaje = this.getImageTag(obj.mensaje);
        }
        else if(this.is_valid_yt_video(obj.mensaje)){
          console.log("Es un video!")
          obj.mensaje = this.getEmbeddedCode(obj.mensaje);
        }
        else{
          console.log("Es un texto!")
          obj.mensaje = this.escapeHtml(obj.mensaje);
        }
        
        return JSON.stringify(obj);
      } catch (e) {
        console.log('Error processing message:', e);
        // En caso de error, escapar el mensaje original
        return JSON.stringify({ mensaje: this.escapeHtml(msg) });
      }
    }
  


// fin del modulo
  };
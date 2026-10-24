# Guía de desarrollo — UNA Chat

## TL;DR

- **Primero la especificación, después el código:** propuesta → specs → diseño → tareas → implementación → archivo.
- **Ningún cambio se considera terminado sin pruebas:** unitarias, integración y E2E en verde.
- **Corre la línea base antes de tocar código** para distinguir fallos previos de regresiones nuevas.
- **Arregla la causa, no el síntoma:** si una prueba falla, reproduce el escenario y confirma el origen antes de cambiar aserciones.
- **Aísla el entorno de pruebas:** puerto propio para E2E, servidor levantado por el runner, navegador headless y un solo worker cuando hay estado compartido.
- **El servidor es la única fuente de verdad para sanear datos** que se muestran a todos los clientes.
- **Escapa todo lo que venga del usuario** y usa HTML solo para contenido producido por una lista blanca del servidor.
- **No rompas contratos existentes:** evento `Evento-Mensaje-Server`, ids `#nombre`, `#m`, `#messages` y botón `Send` se conservan.
- **Sin CDN en runtime:** sirve los activos desde la propia aplicación para evitar dependencias externas y fallos sin Internet.
- **Accesibilidad por defecto:** etiquetas, `aria-live`, foco, `alt`, `title` y estados visibles.
- **Dependencias mínimas y auditadas:** separa runtime de desarrollo, fija versiones y revisa `npm audit`/Snyk.
- **Documenta los límites:** si una herramienta no pudo ejecutarse por credenciales, dilo y registra el fallback.
- **Cierra el ciclo:** valida con OpenSpec, archiva el cambio, sincroniza specs y deja el árbol de trabajo limpio.

---

## 1. Flujo de trabajo con OpenSpec

### 1.1 Proponer antes de implementar

Crear un cambio con nombre en kebab-case y generar todos los artefactos:

```bash
openspec new change "mejorar-experiencia-chat"
openspec status --change "mejorar-experiencia-chat" --json
openspec instructions proposal --change "mejorar-experiencia-chat" --json
openspec instructions specs    --change "mejorar-experiencia-chat" --json
openspec instructions design   --change "mejorar-experiencia-chat" --json
openspec instructions tasks    --change "mejorar-experiencia-chat" --json
```

Buenas prácticas:

- La **propuesta** explica el problema y el alcance, no la implementación.
- Las **specs** describen comportamiento observable con `SHALL`/`MUST` y escenarios `#### Scenario:` con `WHEN`/`THEN`.
- El **diseño** justifica decisiones técnicas y alternativas descartadas.
- Las **tareas** son pequeñas, verificables y usan el formato `- [ ] X.Y`.
- Registrar supuestos explícitos cuando algo no está definido (por ejemplo, hora local calculada en el navegador).

### 1.2 Implementar contra las specs

- Leer todos los `contextFiles` antes de escribir código.
- Marcar cada tarea como completada inmediatamente después de verificarla.
- Si la implementación revela un problema de diseño, actualizar los artefactos en lugar de improvisar.

### 1.3 Archivar y sincronizar

```bash
openspec validate "mejorar-experiencia-chat" --strict
openspec archive "mejorar-experiencia-chat" --yes --json
openspec validate --specs --strict
```

Verificar que:

- La spec principal exista en `openspec/specs/<capability>/spec.md`.
- El cambio se haya movido a `openspec/changes/archive/YYYY-MM-DD-<nombre>/`.
- Todas las tareas del cambio archivado estén marcadas.

---

## 2. Estrategia de pruebas

### 2.1 Tres capas, tres responsabilidades

| Capa | Herramienta | Qué valida |
| --- | --- | --- |
| Unitaria | Jest | Funciones puras, ramas, límites y saneamiento |
| Integración | Jest + Supertest + socket.io-client | Express, socket real y recorrido servidor → cliente |
| E2E | Playwright | Comportamiento visible en el navegador |

### 2.2 Reglas

- **Corre la línea base primero.** En esta sesión había 2 fallos previos por aserciones incorrectas; se corrigieron antes de continuar.
- **Cubre ramas, no solo caminos felices:** entradas inválidas, tipos incorrectos, límites de longitud, valores por defecto y contenido peligroso.
- **Mantén el umbral de cobertura** (90% en el proyecto) y revisa las líneas no cubiertas.
- **Prueba el servidor real** en integración: exportar `app`, `http`, `io` y `start(port)` permite levantar el servidor en un puerto efímero sin duplicar rutas.
- **No dupliques la lógica de producción en las pruebas** si puedes importar el módulo real.
- **Los tests E2E deben ser deterministas:**
  - `webServer` levanta la aplicación automáticamente.
  - Puerto dedicado (`3100`) para no reutilizar un servidor viejo en `3000`.
  - `headless: true`.
  - `workers: 1` cuando el servidor difunde mensajes a todas las páginas.
  - Bloquear peticiones externas para no depender de Internet.
- **Evita esperas arbitrarias**; usa `expect(...).toHaveText`, `toHaveCount`, `expect.poll` y esperas por condición.
- **Prueba los contratos públicos** (evento, ids, botón) además de la funcionalidad nueva.

### 2.3 Comandos del proyecto

```bash
npm run test:unit          # Unitarias + cobertura
npm run test:integration   # Express + socket real
npm run test:e2e           # Playwright headless
npm run test:all           # Las tres capas
npm test                   # Jest con cobertura
```

### 2.4 Diagnóstico de fallos

Antes de cambiar una prueba:

1. Leer el mensaje completo y el snapshot de Playwright.
2. Reproducir el caso de forma aislada.
3. Comprobar procesos y puertos (`Get-NetTCPConnection -LocalPort 3000,3100`).
4. Confirmar si el fallo es del código, de la prueba o del entorno.
5. Corregir la causa y volver a ejecutar toda la suite.

Ejemplo real: dos fallos E2E provenían de un servidor antiguo escuchando en `3000`. La solución no fue tocar la prueba, sino aislar E2E en `3100` y arrancar siempre un servidor nuevo.

---

## 3. Seguridad

### 3.1 Validación y saneamiento

- **Sanear en el servidor**, no solo en el cliente. Todos los clientes reciben el mismo valor seguro.
- **Escapar** texto antes de insertarlo en HTML (`&`, `<`, `>`, `"`, `'`).
- **Validar por lista blanca:**
  - URLs de imagen con esquema `http`/`https` y extensión permitida.
  - URLs de YouTube con identificador válido.
  - Colores solo en formato hexadecimal.
  - Longitudes máximas para nombre e identificadores.
- **No confiar en el cliente** para decidir si un mensaje es texto, imagen o video.
- **Usar `textContent`** para datos planos y reservar `innerHTML` para HTML producido por el servidor tras validación.
- **Evitar concatenar HTML con datos del usuario.**

### 3.2 Controles aplicados en esta sesión

- Nombre del autor: recorte, escape, valor por defecto `Anónimo` y límite de 30 caracteres.
- Color: solo `#RGB` o `#RRGGBB`; fallback `#4f46e5`.
- `clienteId`: cadena acotada a 64 caracteres.
- Mensaje: texto escapado o etiquetas `img`/`iframe` generadas por el servidor.
- Pruebas específicas de XSS en unitarias, integración y E2E.

### 3.3 Dependencias

- Separar `dependencies` (runtime) de `devDependencies` (pruebas y herramientas).
- Fijar versiones con rangos explícitos; evitar `"*"`.
- Revisar y actualizar dependencias vulnerables:

```bash
npm audit
npm audit fix --dry-run
npm run snyk
```

- Los `overrides` de npm sirven para forzar versiones corregidas de dependencias transitivas, por ejemplo `ws` y `socket.io-parser`.
- Eliminar dependencias no usadas (en esta sesión se retiró `mocha`, porque las pruebas usan Jest).

### 3.4 Snyk

```bash
npx snyk auth          # o definir SNYK_TOKEN
npx snyk test --severity-threshold=low
```

- Snyk requiere autenticación. Si el entorno no tiene credenciales, el comando devuelve `401 SNYK-0005`.
- No ocultar el fallo: documentar el resultado y usar `npm audit` como respaldo local.
- Registrar el antes/después de vulnerabilidades para demostrar el impacto de las actualizaciones.

---

## 4. Diseño de la interfaz y UX

### 4.1 Principios

- **Claridad antes que adornos:** autor, hora y contenido legibles en cada mensaje.
- **Feedback inmediato:** estado de conexión, botón deshabilitado, mensajes vacíos bloqueados.
- **No interrumpir la lectura:** auto-scroll solo si el usuario está al final; si no, mostrar `Nuevos mensajes`.
- **Estado vacío informativo:** explicar qué hacer, no dejar un área en blanco.
- **Consistencia visual:** burbujas, espaciado, colores y tipografía con variables CSS.
- **Responsive real:** `100dvh`, flexbox, medios que no desbordan y ajustes para móvil.

### 4.2 Accesibilidad

- `aria-live="polite"` en la lista de mensajes.
- Etiquetas asociadas a los campos (`label for`).
- Botón con nombre accesible (`Send`).
- `alt` descriptivo en imágenes y `title` en iframes.
- Foco visible y retorno del foco al campo de mensaje tras enviar.
- Respetar `prefers-reduced-motion`.
- No depender solo del color para transmitir información.

### 4.3 Comportamiento del scroll

- Medir la distancia al final con `scrollHeight - scrollTop - clientHeight`.
- Usar un umbral (80 px en este proyecto) para considerar que el usuario está al final.
- Auto-scroll instantáneo al recibir ráfagas de mensajes.
- Scroll suave solo cuando el usuario pulsa explícitamente `Nuevos mensajes`.
- No usar `scroll-behavior: smooth` global si interfiere con la lógica de seguimiento.

---

## 5. Código y compatibilidad

- **Cambios mínimos y enfocados.** No reescribir módulos completos si basta una función.
- **Mantener el contrato del socket y los ids existentes.** Los cambios nuevos deben ser aditivos.
- **Exportar para probar sin cambiar el arranque:** `require.main === module` permite que `node server.js` siga funcionando igual.
- **Funciones pequeñas y nombradas** para normalización (`normalizeAuthorName`, `normalizeColor`, `normalizeClientId`).
- **Valores por defecto explícitos** en constantes, no dispersos en el código.
- **Comentarios que expliquen el porqué**, no lo obvio.
- **Manejo de errores:** validar entradas, capturar JSON inválido y registrar sin filtrar datos sensibles.
- **Sin dependencias innecesarias en el cliente.** Preferir APIs nativas del navegador.

---

## 6. Documentación

- Mantener `README.md` con:
  - Requisitos e instalación.
  - Comandos de ejecución y pruebas.
  - Funcionalidad y accesibilidad.
  - Seguridad: Snyk, autenticación y resultado de `npm audit`.
  - Estructura del proyecto.
- Documentar supuestos y límites en la propuesta o el diseño.
- Registrar comandos exactos y resultados, no descripciones vagas.
- Mantener las tareas del cambio actualizadas; son la fuente de progreso de OpenSpec.

---

## 7. Higiene del repositorio

- `.gitignore` para `node_modules/`, `coverage/`, `playwright-report/`, `test-results/` y `.env`.
- No dejar procesos de servidor corriendo tras las pruebas.
- Verificar puertos antes de levantar un servidor:

```powershell
Get-NetTCPConnection -LocalPort 3000,3100 -State Listen -ErrorAction SilentlyContinue
```

- Revisar `git status` antes de cerrar para distinguir cambios propios de artefactos generados.
- No commitear credenciales ni tokens.

---

## 8. Checklist de cierre

- [ ] La propuesta, specs, diseño y tareas existen y son coherentes.
- [ ] `openspec validate <cambio> --strict` pasa.
- [ ] `npm run test:unit` pasa y la cobertura cumple el umbral.
- [ ] `npm run test:integration` pasa con servidor y socket reales.
- [ ] `npm run test:e2e` pasa en headless y sin depender de Internet.
- [ ] `npm run test:all` pasa completo.
- [ ] No hay procesos escuchando en los puertos de desarrollo/pruebas.
- [ ] `npm audit` revisado y hallazgos documentados.
- [ ] Snyk ejecutado o limitación de credenciales documentada.
- [ ] `README.md` actualizado.
- [ ] Cambio archivado y specs principales sincronizadas.
- [ ] `git status` revisado y artefactos temporales ignorados.

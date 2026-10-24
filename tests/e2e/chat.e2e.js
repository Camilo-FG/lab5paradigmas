const { test, expect } = require('@playwright/test');

async function sendMessage(page, name, text) {
  if (name !== undefined) {
    await page.fill('#nombre', name);
  }
  await page.fill('#m', text);
  await page.getByRole('button', { name: 'Send' }).click();
}

async function emitAs(page, payload) {
  await page.evaluate((data) => {
    window.chatSocket.emit('Evento-Mensaje-Server', JSON.stringify(data));
  }, payload);
}

test.describe('UNA Chat E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Evita depender de red externa para imagenes, videos y fuentes.
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith('http://127.0.0.1:3100') || url.startsWith('http://localhost:3100')) {
        return route.continue();
      }
      return route.abort();
    });

    await page.goto('/');
    await page.waitForSelector('#m', { state: 'visible', timeout: 5000 });
  });

  test('muestra una burbuja con autor y hora local', async ({ page }) => {
    await emitAs(page, { nombre: 'otro', mensaje: 'hola desde otro cliente', color: '#10b981' });

    const message = page.locator('#messages li').filter({ hasText: 'hola desde otro cliente' });
    await expect(message).toHaveCount(1);
    await expect(message.locator('.message__author')).toHaveText('otro');
    await expect(message.locator('.message__time')).toHaveText(/^\d{2}:\d{2}$/);
    await expect(message).not.toHaveClass(/message--own/);
  });

  test('distingue los mensajes propios con la etiqueta Tú', async ({ page }) => {
    await sendMessage(page, 'ana', 'mensaje propio');

    const message = page.locator('#messages li').filter({ hasText: 'mensaje propio' });
    await expect(message).toHaveClass(/message--own/);
    await expect(message.locator('.message__badge')).toHaveText('Tú');
  });

  test('envia una URL de imagen y verifica que se muestra', async ({ page }) => {
    await sendMessage(page, 'img-e2e', 'http://image.com/image.jpg');

    const image = page
      .locator('#messages li')
      .filter({ hasText: 'img-e2e' })
      .locator('img');
    await expect(image).toHaveAttribute('src', 'http://image.com/image.jpg');
    await expect(image).toHaveAttribute('alt', /Imagen compartida por img-e2e/);
  });

  test('envia una URL de video y verifica que aparece el reproductor', async ({ page }) => {
    await sendMessage(page, 'video-e2e', 'https://www.youtube.com/watch?v=qYwlqx-JLok');

    const frame = page
      .locator('#messages li')
      .filter({ hasText: 'video-e2e' })
      .locator('iframe');
    await expect(frame).toHaveAttribute('src', /youtube\.com\/embed\/qYwlqx-JLok/);
    await expect(frame).toHaveAttribute('title', /Video de YouTube compartido por video-e2e/);
  });

  test('sanea un script y no ejecuta dialogos', async ({ page }) => {
    let dialogOpened = false;
    page.on('dialog', async (dialog) => {
      dialogOpened = true;
      await dialog.dismiss();
    });

    await sendMessage(page, 'xss-e2e', '<script>alert(1)</script>');

    const message = page.locator('#messages li').filter({ hasText: 'xss-e2e' });
    await expect(message).toBeVisible();
    await expect(message.locator('script')).toHaveCount(0);
    await expect(message).toContainText('alert(1)');

    await page.waitForTimeout(300);
    expect(dialogOpened).toBe(false);
  });

  test('sanea el nombre del autor', async ({ page }) => {
    await sendMessage(page, '<img src=x onerror=alert(1)>', 'hola con nombre peligroso');

    const message = page
      .locator('#messages li')
      .filter({ hasText: 'hola con nombre peligroso' });
    await expect(message.locator('.message__meta img')).toHaveCount(0);
    await expect(message.locator('.message__author')).toContainText('<img');
  });

  test('bloquea mensajes vacios y recorta los espacios', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: 'Send' });

    await expect(sendButton).toBeDisabled();
    await page.fill('#m', '   ');
    await expect(sendButton).toBeDisabled();

    await page.press('#m', 'Enter');
    await expect(page.locator('#messages li')).toHaveCount(0);
    await expect(page.locator('#m')).toBeFocused();

    await page.fill('#m', '  hola  ');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    const content = page.locator('#messages li .message__content');
    await expect(content).toHaveText('hola');
  });

  test('muestra y oculta el estado vacio', async ({ page }) => {
    await expect(page.locator('#empty-state')).toBeVisible();
    await expect(page.locator('#messages li')).toHaveCount(0);

    await sendMessage(page, 'ana', 'primer mensaje');

    await expect(page.locator('#empty-state')).toBeHidden();
    await expect(page.locator('#messages li')).toHaveCount(1);
  });

  test('actualiza el estado de la conexion', async ({ page }) => {
    const label = page.locator('#connection-label');

    await expect(label).toHaveText('Conectado');

    await page.evaluate(() => {
      window.chatSocket.disconnect();
      return true;
    });
    await expect(label).toHaveText('Desconectado');

    await page.evaluate(() => {
      window.chatSocket.connect();
      return true;
    });
    await expect(label).toHaveText('Conectado', { timeout: 15000 });
  });

  test('ofrece saltar a los mensajes nuevos sin mover la vista', async ({ page }) => {
    await page.evaluate(() => {
      for (let i = 0; i < 18; i += 1) {
        window.chatSocket.emit(
          'Evento-Mensaje-Server',
          JSON.stringify({ nombre: 'bulk', mensaje: 'mensaje ' + i, color: '#4f46e5' })
        );
      }
    });

    await expect(page.locator('#messages li')).toHaveCount(18);

    await page.evaluate(() => {
      document.getElementById('chat-body').scrollTop = 0;
    });
    await page.waitForTimeout(150);

    await emitAs(page, { nombre: 'otro', mensaje: 'mensaje nuevo', color: '#ef4444' });

    const jumpButton = page.getByRole('button', { name: /Nuevos mensajes/ });
    await expect(jumpButton).toBeVisible();
    await expect(page.locator('#jump-count')).toHaveText('1');

    const scrollTop = await page.evaluate(() => document.getElementById('chat-body').scrollTop);
    expect(scrollTop).toBeLessThan(50);

    await jumpButton.click();
    await expect(jumpButton).toBeHidden();

    await expect
      .poll(() =>
        page.evaluate(() => {
          const body = document.getElementById('chat-body');
          return body.scrollHeight - body.scrollTop - body.clientHeight;
        })
      )
      .toBeLessThan(20);
  });

  test('expone una region accesible para los mensajes', async ({ page }) => {
    await expect(page.locator('#messages')).toHaveAttribute('aria-live', 'polite');
    await expect(page.getByLabel('Nombre de usuario')).toBeVisible();
    await expect(page.getByLabel('Mensaje')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
  });
});

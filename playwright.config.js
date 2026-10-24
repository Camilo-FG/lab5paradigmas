/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests/e2e',
  testMatch: /.*\.e2e\.[jt]s/,
  // Un solo worker: el servidor difunde cada mensaje a todas las paginas y las
  // pruebas de scroll/estado vacio necesitan una conversacion aislada.
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { output: 'playwright-report', open: 'never' }]],
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node server.js',
    // Puerto propio: evita reutilizar un `npm start` con código viejo.
    env: { PORT: '3100' },
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 30000,
  },
};

module.exports = config;

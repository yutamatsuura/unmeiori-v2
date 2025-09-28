module.exports = {
  testDir: '.',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    headless: false, // ブラウザを表示してテストを確認
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
    ['html']
  ],
};
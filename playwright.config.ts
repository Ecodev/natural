import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './e2e/',
    outputDir: __dirname + '/logs/tests/e2e/',
    retries: 2,
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4201/',
        headless: true,
        viewport: {width: 1280, height: 720},
        ignoreHTTPSErrors: true,
        screenshot: 'on',
        video: {
            mode: 'on',
            size: {
                width: 1280,
                height: 720,
            },
        },
        trace: 'on-all-retries',
    },
    webServer: {
        command: 'pnpm dev',
        port: 4201,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
    },
});

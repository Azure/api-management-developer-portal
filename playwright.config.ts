import { defineConfig } from '@playwright/test';

export default defineConfig({
    retries: 2,
    use: {
        video: 'retain-on-failure'
    },
    expect: {
        toMatchSnapshot: {
            maxDiffPixels: 20
        },
    },
});
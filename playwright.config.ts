import { defineConfig } from '@playwright/test';

export default defineConfig({
  testIgnore: 'playwright/*',
  //timeout: 30_000,
  use: {
    video: 'retain-on-failure'
  }
});
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testIgnore: 'playwright/*',
  //timeout: 50_000,
  use: {
    video: 'retain-on-failure'
  }
});
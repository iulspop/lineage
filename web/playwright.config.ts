import { defineConfig, devices } from "@playwright/test"

// Ensure the test runner process uses UTC, matching the browser (timezoneId)
// and the dev server (webServer.env.TZ).
process.env.TZ = "UTC"

const isCI = Boolean(process.env.CI)
const isIsolatedRun = process.env.E2E_ISOLATED === "true"
const useBuiltServer = isCI && !isIsolatedRun
const localPort = 5251
const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/e2e.db"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Look for tests in the playwright directory */
  testDir: "./playwright",
  /* Match tests with the .e2e.ts extension */
  testMatch: "*.e2e.ts",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL:
      process.env.APP_URL ??
      (useBuiltServer
        ? "http://localhost:3000"
        : `http://localhost:${localPort}`),
    trace: isCI ? "on-first-retry" : "retain-on-failure",
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: useBuiltServer
      ? "pnpm start"
      : `pnpm exec react-router dev --port ${localPort}`,
    env: { DATABASE_URL: databaseUrl, NODE_ENV: "test", TZ: "UTC" },
    port: useBuiltServer ? 3000 : localPort,
    reuseExistingServer: false,
  },
  /* Opt out of parallel tests. */
  workers: 1,
})

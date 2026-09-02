import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

import {
  getVerificationCode,
  loginAsTestUser,
  setupTestUser,
} from "../auth-utils"
import { getPath } from "../utils"

async function openEmailSignIn(page: Page) {
  await page.getByRole("button", { name: /email me a sign-in link/i }).click()
}

test.describe("authentication", () => {
  test("given: unauthenticated user visiting /, should: show the public home page", async ({
    page,
  }) => {
    await page.goto("/")

    expect(getPath(page)).toBe("/")
  })

  test("given: valid email on login, should: redirect to /verify", async ({
    page,
  }) => {
    await page.goto("/auth/signin")
    await openEmailSignIn(page)

    await page
      .getByPlaceholder("you@example.com")
      .fill("verify-redirect@example.com")
    await page.getByRole("button", { name: /send magic link/i }).click()

    await page.waitForURL("**/verify**")
    expect(getPath(page)).toContain("/verify")
    expect(getPath(page)).toContain("target=verify-redirect%40example.com")
  })

  test("given: valid code on verify (new user), should: create the account and continue", async ({
    page,
  }) => {
    await page.goto("/auth/signin")
    await openEmailSignIn(page)
    const email = `new-user-${Date.now()}@example.com`

    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByRole("button", { name: /send magic link/i }).click()
    await page.waitForURL("**/verify**")

    const code = await getVerificationCode(email)
    await page.getByPlaceholder("ABC123").fill(code)
    await page.getByRole("button", { name: /verify/i }).click()

    await page.waitForURL("**/today")
    expect(getPath(page)).toBe("/today")
  })

  test("given: another new email, should: create a distinct account", async ({
    page,
  }) => {
    await page.goto("/auth/signin")
    await openEmailSignIn(page)
    const email = `onboard-${Date.now()}@example.com`

    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByRole("button", { name: /send magic link/i }).click()
    await page.waitForURL("**/verify**")

    const code = await getVerificationCode(email)
    await page.getByPlaceholder("ABC123").fill(code)
    await page.getByRole("button", { name: /verify/i }).click()

    await page.waitForURL("**/today")
    expect(getPath(page)).toBe("/today")
  })

  test("given: returning user with valid code, should: continue to Today", async ({
    page,
  }) => {
    const { email } = await setupTestUser()

    await page.goto("/auth/signin")
    await openEmailSignIn(page)
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByRole("button", { name: /send magic link/i }).click()
    await page.waitForURL("**/verify**")

    const code = await getVerificationCode(email)
    await page.getByPlaceholder("ABC123").fill(code)
    await page.getByRole("button", { name: /verify/i }).click()

    await page.waitForURL("**/today")
    expect(getPath(page)).toBe("/today")
  })

  test("given: invalid code, should: show error message", async ({ page }) => {
    await page.goto("/auth/signin")
    await openEmailSignIn(page)
    const email = `invalid-code-${Date.now()}@example.com`

    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByRole("button", { name: /send magic link/i }).click()
    await page.waitForURL("**/verify**")

    await page.getByPlaceholder("ABC123").fill("WRONG1")
    await page.getByRole("button", { name: /verify/i }).click()

    await expect(page.getByRole("alert")).toHaveText(/invalid code/i)
  })

  test("given: authenticated user visiting sign in, should: redirect to Today", async ({
    page,
  }) => {
    await loginAsTestUser(page)
    await page.goto("/auth/signin")

    expect(getPath(page)).toBe("/today")
  })

  test("given: logout submission, should: invalidate the browser session", async ({
    page,
  }) => {
    await loginAsTestUser(page)

    const response = await page.context().request.post("/logout")
    expect(response.url()).toContain("/auth/signin")

    await page.goto("/today")
    expect(getPath(page)).toBe("/auth/signin")
  })

  test("given: the login page, should: have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/auth/signin")
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})

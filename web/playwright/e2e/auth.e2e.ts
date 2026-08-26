import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import {
  getVerificationCode,
  loginAsTestUser,
  setupTestUser,
} from "../auth-utils"
import { getPath } from "../utils"

test.describe("authentication", () => {
  test("given: unauthenticated user visiting /, should: redirect to /login", async ({
    page,
  }) => {
    await page.goto("/")

    expect(getPath(page)).toBe("/login")
  })

  test("given: valid email on login, should: redirect to /verify", async ({
    page,
  }) => {
    await page.goto("/login")

    await page
      .getByPlaceholder("you@example.com")
      .fill("verify-redirect@example.com")
    await page.getByRole("button", { name: /send magic link/i }).click()

    await page.waitForURL("**/verify**")
    expect(getPath(page)).toContain("/verify")
    expect(getPath(page)).toContain("target=verify-redirect%40example.com")
  })

  test("given: valid code on verify (new user), should: redirect to /onboarding", async ({
    page,
  }) => {
    await page.goto("/login")
    const email = `new-user-${Date.now()}@example.com`

    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByRole("button", { name: /send magic link/i }).click()
    await page.waitForURL("**/verify**")

    const code = await getVerificationCode(email)
    await page.getByPlaceholder("XXXXXX").fill(code)
    await page.getByRole("button", { name: /verify/i }).click()

    await page.waitForURL("**/onboarding**")
    expect(getPath(page)).toContain("/onboarding")
  })

  test("given: name on onboarding, should: create user and redirect to /", async ({
    page,
  }) => {
    await page.goto("/login")
    const email = `onboard-${Date.now()}@example.com`

    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByRole("button", { name: /send magic link/i }).click()
    await page.waitForURL("**/verify**")

    const code = await getVerificationCode(email)
    await page.getByPlaceholder("XXXXXX").fill(code)
    await page.getByRole("button", { name: /verify/i }).click()
    await page.waitForURL("**/onboarding**")

    await page.getByPlaceholder(/your name/i).fill("Test User")
    await page.getByRole("button", { name: /create account/i }).click()

    await page.waitForURL("/")
    expect(getPath(page)).toBe("/")
  })

  test("given: returning user with valid code, should: skip onboarding and go to /", async ({
    page,
  }) => {
    const { email } = await setupTestUser()

    await page.goto("/login")
    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByRole("button", { name: /send magic link/i }).click()
    await page.waitForURL("**/verify**")

    const code = await getVerificationCode(email)
    await page.getByPlaceholder("XXXXXX").fill(code)
    await page.getByRole("button", { name: /verify/i }).click()

    await page.waitForURL("/")
    expect(getPath(page)).toBe("/")
  })

  test("given: invalid code, should: show error message", async ({ page }) => {
    await page.goto("/login")
    const email = `invalid-code-${Date.now()}@example.com`

    await page.getByPlaceholder("you@example.com").fill(email)
    await page.getByRole("button", { name: /send magic link/i }).click()
    await page.waitForURL("**/verify**")

    await page.getByPlaceholder("XXXXXX").fill("WRONG1")
    await page.getByRole("button", { name: /verify/i }).click()

    await expect(page.getByRole("alert")).toHaveText(/invalid code/i)
  })

  test("given: authenticated user visiting /login, should: redirect to /", async ({
    page,
  }) => {
    await loginAsTestUser(page)
    await page.goto("/login")

    expect(getPath(page)).toBe("/")
  })

  test("given: clicking logout, should: redirect to /login", async ({
    page,
  }) => {
    await loginAsTestUser(page)
    await page.goto("/")

    await page.getByRole("button", { name: /log out/i }).click()

    await page.waitForURL("**/login")
    expect(getPath(page)).toBe("/login")
  })

  test("given: the login page, should: have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/login")
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})

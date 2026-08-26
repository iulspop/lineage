import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { deleteAllTodos, loginAsTestUser } from "../auth-utils"

test.describe("todos page", () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTodos()
    await loginAsTestUser(page)
  })

  test("given: the todos page, should: display the page title", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Todos")
  })

  test("given: a new todo, should: create it and display it in the list", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Buy groceries")
    await page.getByPlaceholder(/description/i).fill("Milk, eggs, bread")
    await page.getByRole("button", { name: /add todo/i }).click()

    await expect(page.getByText("Buy groceries")).toBeVisible()
    await expect(page.getByText("Milk, eggs, bread")).toBeVisible()
  })

  test("given: an existing todo, should: toggle its completion", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Toggle me")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Toggle me")).toBeVisible()

    await page.getByRole("button", { name: /toggle toggle me/i }).click()

    await expect(page.getByText("Toggle me")).toHaveClass(/line-through/)
  })

  test("given: an existing todo, should: delete it from the list", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Delete me")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Delete me")).toBeVisible()

    await page.getByRole("button", { name: /delete delete me/i }).click()

    await expect(page.getByText("Delete me")).not.toBeVisible()
  })

  test("given: active filter, should: show only active todos", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Active task")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Active task")).toBeVisible()

    await page.getByPlaceholder(/what needs to be done/i).fill("Done task")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Done task")).toBeVisible()

    await page.getByRole("button", { name: /toggle done task/i }).click()
    await expect(page.getByText("Done task")).toHaveClass(/line-through/)

    await page.getByRole("link", { name: /active/i }).click()

    await expect(page.getByText("Active task")).toBeVisible()
    await expect(page.getByText("Done task")).not.toBeVisible()
  })

  test("given: completed filter, should: show only completed todos", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Active task")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Active task")).toBeVisible()

    await page.getByPlaceholder(/what needs to be done/i).fill("Done task")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Done task")).toBeVisible()

    await page.getByRole("button", { name: /toggle done task/i }).click()
    await expect(page.getByText("Done task")).toHaveClass(/line-through/)

    await page.getByRole("link", { name: /^completed$/i }).click()

    await expect(page.getByText("Done task")).toBeVisible()
    await expect(page.getByText("Active task")).not.toBeVisible()
  })

  test("given: returning to all filter, should: show all todos", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Task one")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Task one")).toBeVisible()

    await page.getByRole("link", { name: /active/i }).click()
    await expect(page.getByText("Task one")).toBeVisible()

    await page.getByRole("link", { name: /^all$/i }).click()
    await expect(page.getByText("Task one")).toBeVisible()
  })

  test("given: completed todos, should: clear them when clicking clear completed", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Completed task")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Completed task")).toBeVisible()

    await page.getByRole("button", { name: /toggle completed task/i }).click()
    await expect(page.getByText("Completed task")).toHaveClass(/line-through/)

    await page.getByRole("button", { name: /clear completed/i }).click()

    await expect(page.getByText("Completed task")).not.toBeVisible()
  })

  test("given: no completed todos, should: not show clear completed button", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Active task")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Active task")).toBeVisible()

    await expect(
      page.getByRole("button", { name: /clear completed/i }),
    ).not.toBeVisible()
  })

  test("given: submitting with empty title, should: display validation error message", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByRole("button", { name: /add todo/i }).click()

    await expect(page.getByRole("alert")).toHaveText(/title is required/i)
  })

  test("given: an existing todo, should: edit title and save", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Original title")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Original title")).toBeVisible()

    await page.getByRole("button", { name: /edit original title/i }).click()

    const titleInput = page.locator('input[name="title"]').last()
    await titleInput.clear()
    await titleInput.fill("Updated title")
    await page.getByRole("button", { name: /save/i }).click()

    await expect(page.getByText("Updated title")).toBeVisible()
    await expect(page.getByText("Original title")).not.toBeVisible()
  })

  test("given: editing a todo, should: cancel edit and revert", async ({
    page,
  }) => {
    await page.goto("/")

    await page.getByPlaceholder(/what needs to be done/i).fill("Keep this")
    await page.getByRole("button", { name: /add todo/i }).click()
    await expect(page.getByText("Keep this")).toBeVisible()

    await page.getByRole("button", { name: /edit keep this/i }).click()

    const titleInput = page.locator('input[name="title"]').last()
    await titleInput.clear()
    await titleInput.fill("Changed")
    await page.getByRole("button", { name: /cancel/i }).click()

    await expect(page.getByText("Keep this")).toBeVisible()
    await expect(page.getByText("Changed")).not.toBeVisible()
  })

  test("given: the todos page, should: have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/")
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})

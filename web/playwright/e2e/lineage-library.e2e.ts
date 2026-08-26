import { expect, test } from "@playwright/test"

import { loginAsTestUser, setupLineageCorpus } from "../auth-utils"
import { getPath } from "../utils"

test.describe("Lineage daily workspace", () => {
  test("given: an empty account, should: show first-run guidance on Today and Library", async ({
    page,
  }) => {
    await loginAsTestUser(page)

    await page.goto("/today")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await expect(
      page.getByRole("heading", { name: "Start your memory library" }),
    ).toBeVisible()

    const libraryHref = await page
      .getByRole("link", { name: "Library" })
      .first()
      .getAttribute("href")
    expect(libraryHref).toBe("/library")
    await page.goto(libraryHref as string)
    await expect(page).toHaveURL(/\/library$/)
    await expect(
      page.getByRole("heading", { name: "Your library is empty" }),
    ).toBeVisible()
  })

  test("given: an imported corpus, should: browse its memories from the Library", async ({
    page,
  }) => {
    const user = await loginAsTestUser(page)
    await setupLineageCorpus(user.id)

    await page.goto("/library")
    await expect(page.getByRole("progressbar")).toBeHidden()
    const corpusHref = await page
      .getByRole("link", { name: /powers of i/i })
      .getAttribute("href")
    expect(corpusHref).toBe("/library/powers-of-i")
    await page.goto(corpusHref as string)
    await expect(page).toHaveURL(/\/library\/powers-of-i$/)

    expect(getPath(page)).toBe("/library/powers-of-i")
    await expect(
      page.getByRole("heading", { name: "powers of i" }),
    ).toBeVisible()
    const download = page.waitForEvent("download")
    await page.getByRole("link", { name: "Export" }).click()
    await expect((await download).suggestedFilename()).toBe(
      "powers-of-i.lineage.json",
    )

    await page.goto("/library/powers-of-i?tab=memories&q=squared&status=active")
    await expect(page).toHaveURL(/tab=memories/)
    await expect(page.getByText("What is i squared?")).toBeVisible()

    const memoryHref = await page
      .getByRole("link", { name: /what is i squared/i })
      .getAttribute("href")
    expect(memoryHref).toBe("/library/powers-of-i/memories/powers-i-2")
    await page.goto(memoryHref as string)
    await expect(
      page.getByRole("heading", { name: "powers-i-2" }),
    ).toBeVisible()
    await expect(page.getByText("-1", { exact: true })).toBeHidden()
    await page.getByRole("button", { name: "Reveal resolution" }).click()
    await expect(page.getByText("-1", { exact: true })).toBeVisible()
  })

  test("given: a manual draft, should: preview, save, revise, and suspend a memory", async ({
    page,
  }) => {
    await loginAsTestUser(page)

    await page.goto("/create/manual")
    await page.getByLabel("Corpus").fill("calculus")
    await page.getByLabel("Stable memory ID").fill("derivative")
    await page.getByLabel("Challenge").fill("What is a derivative?")
    await page
      .getByLabel("Answer")
      .fill("The instantaneous rate of change of a function.")
    await page.getByRole("button", { name: "Validate and preview" }).click()
    await expect(
      page.getByRole("complementary").getByText("What is a derivative?"),
    ).toBeVisible()
    await page.getByRole("button", { name: "Approve and save memory" }).click()

    await expect(page).toHaveURL(/\/library\/calculus\/memories\/derivative$/)
    await expect(
      page.getByRole("heading", { name: "derivative" }),
    ).toBeVisible()
    await page.getByRole("link", { name: "Revise" }).click()
    await expect(page).toHaveURL(/\/edit$/)
    await page.getByLabel("Challenge").fill("What does a derivative measure?")
    await page.getByRole("button", { name: "Validate and preview" }).click()
    await page.getByRole("button", { name: "Approve and save memory" }).click()

    await expect(page.getByText(/revision 2/)).toBeVisible()
    await page.getByRole("button", { name: "Suspend" }).click()
    await expect(page.getByText(/revision 3 · suspended/)).toBeVisible()
  })

  test("given: a due memory, should: start review from Today", async ({
    page,
  }) => {
    const user = await loginAsTestUser(page)
    await setupLineageCorpus(user.id, `review-${Date.now()}`)

    await page.goto("/today")
    await expect(page.getByRole("progressbar")).toBeHidden()
    const reviewHref = await page
      .getByRole("link", { name: "Start review" })
      .getAttribute("href")
    expect(reviewHref).toBe("/review")
    await page.goto(reviewHref as string)
    await expect(page).toHaveURL(/\/review$/)

    expect(getPath(page)).toBe("/review")
    await expect(page.getByText("What is i squared?")).toBeVisible()
  })
})

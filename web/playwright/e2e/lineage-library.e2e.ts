import AxeBuilder from "@axe-core/playwright"
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
    const archiveDownload = page.waitForEvent("download")
    await page.getByRole("link", { name: "Export .lineage" }).click()
    const archive = await archiveDownload
    expect(archive.suggestedFilename()).toBe("powers-of-i.lineage")
    const archivePath = await archive.path()
    if (!archivePath) throw new Error("Exported archive has no local path")

    await loginAsTestUser(page)
    await page.goto("/create/archive")
    await expect(
      page.getByRole("heading", { name: "Import a portable corpus" }),
    ).toBeVisible()
    await page.waitForTimeout(250)
    const archiveInput = page.getByLabel("Portable corpus archive")
    await archiveInput.setInputFiles(archivePath)
    await expect
      .poll(() =>
        archiveInput.evaluate((input: HTMLInputElement) => input.files?.length),
      )
      .toBe(1)
    await page.getByLabel("Import this archive after all checks pass.").check()
    const importResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === "/create/archive",
    )
    await page.getByRole("button", { name: "Verify and import" }).click()
    expect((await importResponse).status()).toBe(200)
    await expect(
      page.getByRole("heading", { name: "Corpus imported" }),
    ).toBeVisible()

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
    await expect(
      page.getByRole("heading", { name: "Create a memory" }),
    ).toBeVisible()
    await page.waitForTimeout(250)
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

  test("given: an AI brief, should: generate, edit, select, and accept a memory", async ({
    page,
  }) => {
    await loginAsTestUser(page)

    await page.goto("/create/ai")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await page.waitForTimeout(250)
    await expect(
      page.getByRole("heading", { name: "Generate memories with AI" }),
    ).toBeVisible()
    await page
      .getByRole("combobox", { exact: true, name: "Corpus" })
      .fill("calculus-ai")
    await page.getByLabel("Topic or learning goal").fill("derivatives")
    await page
      .getByLabel("Source text (optional)")
      .fill("A derivative is the instantaneous rate of change of a function.")
    await page.getByLabel("Memory count").selectOption("1")
    await expect(
      page.getByRole("combobox", { exact: true, name: "Corpus" }),
    ).toHaveValue("calculus-ai")
    await expect(page.getByLabel("Topic or learning goal")).toHaveValue(
      "derivatives",
    )
    await page
      .getByRole("button", { name: "Generate candidate memories" })
      .click()

    await expect(
      page.getByRole("checkbox", { name: /include basic memory/i }),
    ).toBeChecked()
    await page
      .getByLabel("Challenge")
      .last()
      .fill("What does a derivative measure?")
    await page.getByRole("button", { name: "Accept selected memories" }).click()

    await expect(page).toHaveURL(/\/library\/calculus-ai\?tab=memories$/)
    await expect(
      page.getByText("What does a derivative measure?"),
    ).toBeVisible()
  })

  test("given: durable data, should: show insights and export complete recovery data", async ({
    page,
  }) => {
    const user = await loginAsTestUser(page)
    await setupLineageCorpus(user.id, `insights-${Date.now()}`)

    await page.goto("/insights")
    await expect(
      page.getByRole("heading", { name: "Understand your learning workload" }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Complete review timeline" }),
    ).toBeVisible()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto("/settings/data")
    await expect(
      page.getByRole("heading", {
        name: "Export and recover your Lineage data",
      }),
    ).toBeVisible()
    const hasHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    )
    expect(hasHorizontalOverflow).toBe(false)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

    const exportDownload = page.waitForEvent("download")
    await page.getByRole("link", { name: "Download complete export" }).click()
    const download = await exportDownload
    await expect(download.suggestedFilename()).toBe("lineage-user-data.lineage")
    expect(await download.path()).not.toBeNull()
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
    await page.keyboard.press("Space")
    await expect(page.getByText("-1", { exact: true })).toBeVisible()
    await page.keyboard.press("3")
    await expect(page.getByText("No reviews due")).toBeVisible()
    await expect(page.getByRole("listitem").getByText("good")).toBeVisible()
  })
})

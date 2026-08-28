import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { loginAsTestUser, setupLineageCorpus } from "../auth-utils"
import { getPath } from "../utils"

async function createWorkspace(
  page: import("@playwright/test").Page,
  corpusId: string,
) {
  await page.goto("/settings/workspace")
  await expect(
    page.getByRole("heading", { exact: true, name: "Workspace" }),
  ).toBeVisible()
  await page.waitForTimeout(250)
  await page.getByLabel("Workspace ID").fill(corpusId)
  await page
    .getByLabel(
      "I understand this creates and activates a separate empty workspace.",
    )
    .check()
  await page.getByRole("button", { name: "Create workspace" }).click()
  await expect(page.getByRole("status")).toContainText(
    `${corpusId} is now your active workspace.`,
  )
}

test.describe("Lineage daily workspace", () => {
  test("given: an empty account, should: show first-run guidance on Today and Library", async ({
    page,
  }) => {
    await loginAsTestUser(page)

    await page.goto("/today")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await expect(
      page.getByRole("heading", { name: "Create your first workspace" }),
    ).toBeVisible()

    const libraryHref = await page
      .getByRole("link", { name: "Library" })
      .first()
      .getAttribute("href")
    expect(libraryHref).toBe("/library")
    await page.goto(libraryHref as string)
    await expect(page).toHaveURL(/\/settings\/workspace$/)
    await expect(
      page.getByRole("heading", { exact: true, name: "Workspace" }),
    ).toBeVisible()
  })

  test("given: an imported corpus, should: browse its memories from the Library", async ({
    page,
  }) => {
    const user = await loginAsTestUser(page)
    await setupLineageCorpus(user.id)

    await page.goto("/library")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await expect(page).toHaveURL(/\/library\/powers-of-i\?tab=memories$/)

    expect(getPath(page)).toBe("/library/powers-of-i?tab=memories")
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
    await page.getByLabel(/Import this archive after all checks pass/).check()
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

  test("given: quick syntax, should: create basic and cloze memories immediately", async ({
    page,
  }) => {
    await loginAsTestUser(page)
    await createWorkspace(page, "polypan")

    await page.goto("/create/manual?corpusId=ignored")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await page.waitForTimeout(250)
    await page.getByLabel("Quick capture").fill(`\`\`\`text
In quadratic standard form, what is the quadratic term? >> ax²
\`\`\`

\`\`\`
In quadratic standard form, what is the linear term? >> bx
In quadratic standard form, what symbol is the constant term? >> c
\`\`\``)
    await page.getByRole("button", { name: "Create memories" }).click()
    await expect(page).toHaveURL("/library/polypan?tab=memories")
    await expect(
      page.getByText("In quadratic standard form, what is the quadratic term?"),
    ).toBeVisible()
    await expect(
      page.getByText("In quadratic standard form, what is the linear term?"),
    ).toBeVisible()
    await expect(
      page.getByText(
        "In quadratic standard form, what symbol is the constant term?",
      ),
    ).toBeVisible()

    await page.goto("/create/manual?corpusId=ignored")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await page.waitForTimeout(250)
    await page
      .getByLabel("Quick capture")
      .fill("The derivative of {{x²}} is {{2x}}.")
    await page.getByRole("button", { name: "Create memories" }).click()
    await expect(page).toHaveURL("/library/polypan?tab=memories")
    await expect(page.getByText("The derivative of […] is 2x.")).toBeVisible()
    await expect(page.getByText("The derivative of x² is […].")).toBeVisible()
  })

  test("given: a manual draft, should: preview, save, revise, and suspend a memory", async ({
    page,
  }) => {
    await loginAsTestUser(page)
    await createWorkspace(page, "polypan")

    await page.goto("/create/manual")
    await expect(
      page.getByRole("heading", { name: "Create a memory" }),
    ).toBeVisible()
    await page.waitForTimeout(250)
    await expect(page.getByLabel("Corpus")).toHaveCount(0)
    await page.getByText("More options").click()
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

    await expect(page).toHaveURL(/\/library\/polypan\/memories\/derivative$/)
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

  test("given: an image, should: create and review an occlusion memory", async ({
    page,
  }) => {
    await loginAsTestUser(page)
    await createWorkspace(page, "polypan")

    await page.goto("/create/image-occlusion")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await page.waitForTimeout(250)
    await expect(
      page.getByRole("heading", { name: "Create image occlusion" }),
    ).toBeVisible()
    await expect(page.getByLabel("Corpus")).toHaveCount(0)
    await page.getByLabel("Stable memory ID").fill("heart-location")
    await page.locator('input[name="image"]').setInputFiles({
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=",
        "base64",
      ),
      mimeType: "image/png",
      name: "heart.png",
    })
    await page
      .getByLabel("Image accessibility description")
      .fill("A simplified anatomy diagram")
    await page.getByLabel("Challenge").fill("Which organ is concealed?")
    await page.getByLabel("Answer").fill("The heart")
    await page.getByLabel("Region label").fill("Heart")
    await page
      .getByLabel("Region accessibility description")
      .fill("The concealed heart region")
    await page.getByRole("button", { name: "Validate and preview" }).click()
    await expect(
      page.getByRole("img", { name: "A simplified anatomy diagram" }),
    ).toBeVisible()
    await page.getByRole("button", { name: "Approve and save" }).click()

    await expect(page).toHaveURL(
      /\/library\/polypan\/memories\/heart-location$/,
    )
    await expect(page.getByText("image-occlusion")).toBeVisible()
  })

  test("given: a corpus, should: create and link a durable source", async ({
    page,
  }) => {
    const user = await loginAsTestUser(page)
    await setupLineageCorpus(user.id)

    await page.goto("/library/powers-of-i/knowledge")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await page.waitForTimeout(250)
    await expect(
      page.getByRole("heading", { name: "Manage sources and materials" }),
    ).toBeVisible()
    await page.getByLabel("Stable source ID").fill("complex-numbers-text")
    await page.getByLabel("Title").fill("Complex numbers notes")
    await page
      .getByLabel("Source text or citation")
      .fill("The powers of i repeat in a cycle of four.")
    await page
      .getByRole("group", { name: "Link memories" })
      .first()
      .getByRole("checkbox", { name: "What is i squared?" })
      .check()
    await expect(page.getByLabel("Stable source ID")).toHaveValue(
      "complex-numbers-text",
    )
    await expect(page.getByLabel("Title")).toHaveValue("Complex numbers notes")
    await page.getByRole("button", { name: "Preview source changes" }).click()
    await expect(
      page.getByRole("heading", { name: "Approval preview" }),
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Approve and save" }),
    ).toBeVisible()
    await page.getByRole("button", { name: "Approve and save" }).click()

    await expect(page).toHaveURL(/\/library\/powers-of-i\?tab=sources$/)
    await expect(page.getByText("Complex numbers notes")).toBeVisible()
  })

  test("given: an AI brief, should: generate, edit, select, and accept a memory", async ({
    page,
  }) => {
    await loginAsTestUser(page)
    await createWorkspace(page, "polypan")

    await page.goto("/create/ai")
    await expect(page.getByRole("progressbar")).toBeHidden()
    await page.waitForTimeout(250)
    await expect(
      page.getByRole("heading", { name: "Generate memories with AI" }),
    ).toBeVisible()
    await expect(
      page.getByRole("combobox", { exact: true, name: "Corpus" }),
    ).toHaveCount(0)
    await page.getByLabel("Topic or learning goal").fill("derivatives")
    await page
      .getByLabel("Source text (optional)")
      .fill("A derivative is the instantaneous rate of change of a function.")
    await page.getByLabel("Memory count").selectOption("1")
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

    await expect(page).toHaveURL(/\/library\/polypan\?tab=memories$/)
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
    await expect(page.getByRole("progressbar")).toBeHidden()
    await expect(page.getByText("What is i squared?")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Show answer" }),
    ).toBeVisible()
    await page.keyboard.press("Space")
    await expect(page.getByText("-1", { exact: true })).toBeVisible()
    await page.keyboard.press("3")
    await expect(page.getByText("No reviews due")).toBeVisible()
    await expect(page.getByRole("listitem").getByText("good")).toBeVisible()
  })
})

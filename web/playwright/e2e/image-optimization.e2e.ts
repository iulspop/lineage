import { expect, test } from "@playwright/test"

test.describe("image optimization", () => {
  test("given: the login page, should: render optimized image via /api/images", async ({
    page,
  }) => {
    await page.goto("/login")

    const picture = page.locator("picture").first()
    await expect(picture).toBeVisible()

    const source = picture.locator("source").first()
    const srcset = await source.getAttribute("srcset")
    expect(srcset).toContain("/api/images")
    expect(srcset).toContain("format=")
  })

  test("given: a direct request to /api/images, should: return image with cache headers", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/images?src=%2Fimages%2Flogo.png&w=48&h=48",
    )

    expect(response.status()).toEqual(200)
    expect(response.headers()["cache-control"]).toEqual(
      "public, max-age=31536000, immutable",
    )
    expect(response.headers()["content-type"]).toContain("image/")
  })

  test("given: /api/images without src param, should: return 400", async ({
    request,
  }) => {
    const response = await request.get("/api/images")

    expect(response.status()).toEqual(400)
  })
})

import { describe, expect, test } from "vitest"

import { getImgSrc } from "./get-img-src"

const optimizerEndpoint = "/api/images"

describe("getImgSrc()", () => {
  test("given: src starting with optimizer endpoint, should: append w/h params to existing query", () => {
    const actual = getImgSrc({
      height: 100,
      optimizerEndpoint,
      src: "/api/images?src=%2Fimages%2Flogo.png",
      width: 200,
    })
    const expected = "/api/images?src=%2Fimages%2Flogo.png&w=200&h=100"

    expect(actual).toEqual(expected)
  })

  test("given: src starting with optimizer endpoint and fit/format, should: include all params", () => {
    const actual = getImgSrc({
      fit: "cover",
      format: "webp",
      height: 100,
      optimizerEndpoint,
      src: "/api/images?src=%2Fimages%2Flogo.png",
      width: 200,
    })

    expect(actual).toContain("w=200")
    expect(actual).toContain("h=100")
    expect(actual).toContain("fit=cover")
    expect(actual).toContain("format=webp")
  })

  test("given: src NOT starting with optimizer endpoint, should: delegate to defaultGetSrc", () => {
    const actual = getImgSrc({
      height: 100,
      optimizerEndpoint,
      src: "/images/logo.png",
      width: 200,
    })
    const expected = "/api/images?src=%2Fimages%2Flogo.png&w=200&h=100"

    expect(actual).toEqual(expected)
  })

  test("given: external URL src, should: encode full URL in src param", () => {
    const actual = getImgSrc({
      height: 50,
      optimizerEndpoint,
      src: "https://example.com/photo.jpg",
      width: 50,
    })

    expect(actual).toContain("src=https%3A%2F%2Fexample.com%2Fphoto.jpg")
    expect(actual).toContain("w=50")
    expect(actual).toContain("h=50")
  })
})

import { describe, expect, test } from "vitest"

import { getServerTimeHeader, makeTimings, time } from "./timing.server"

describe("makeTimings()", () => {
  test("given: a type and description, should: create timings with a start entry", () => {
    const timings = makeTimings("loader", "root loader")

    expect(timings.loader).toHaveLength(1)
    expect(timings.loader[0].desc).toEqual("root loader")
    expect(timings.loader[0].start).toEqual(expect.any(Number))
  })

  test("given: timings object, should: have a toString that returns Server-Timing header", () => {
    const timings = makeTimings("loader")

    const actual = timings.toString()

    expect(actual).toContain("loader")
    expect(actual).toContain("dur=")
  })
})

describe("time()", () => {
  test("given: a sync function and timings, should: measure duration and return result", async () => {
    const timings = makeTimings("loader")

    const actual = await time(() => 42, {
      desc: "test computation",
      timings,
      type: "compute",
    })

    expect(actual).toEqual(42)
    expect(timings.compute).toHaveLength(1)
    expect(timings.compute[0].time).toEqual(expect.any(Number))
  })

  test("given: an async function and timings, should: measure duration and return result", async () => {
    const timings = makeTimings("loader")

    const actual = await time(async () => "hello", {
      timings,
      type: "fetch",
    })

    expect(actual).toEqual("hello")
    expect(timings.fetch).toHaveLength(1)
  })

  test("given: no timings object, should: still return the result without tracking", async () => {
    const actual = await time(() => 99, {
      type: "compute",
    })

    expect(actual).toEqual(99)
  })
})

describe("getServerTimeHeader()", () => {
  test("given: undefined timings, should: return empty string", () => {
    const actual = getServerTimeHeader(undefined)
    const expected = ""

    expect(actual).toEqual(expected)
  })

  test("given: timings with completed entries, should: return formatted Server-Timing header", () => {
    const timings = { db: [{ desc: "query users", time: 12.3 }] }

    const actual = getServerTimeHeader(timings)

    expect(actual).toContain("db")
    expect(actual).toContain('desc="query users"')
    expect(actual).toContain("dur=12.3")
  })

  test("given: timings with special characters in key, should: sanitize the key", () => {
    const timings = { "cache:users": [{ time: 5.0 }] }

    const actual = getServerTimeHeader(timings)

    expect(actual).toContain("cache_users")
    expect(actual).not.toContain("cache:users")
  })
})

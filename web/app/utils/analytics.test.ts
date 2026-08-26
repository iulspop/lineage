import { describe, expect, test } from "vitest"

import { createAnalyticsConfig } from "./analytics"

describe("createAnalyticsConfig()", () => {
  test("given: no PostHog key, should: disable analytics", () => {
    const actual = createAnalyticsConfig({
      apiHost: "https://us.i.posthog.com",
      apiKey: "",
      mode: "production",
    })
    const expected = {
      apiHost: "https://us.i.posthog.com",
      apiKey: "",
      isEnabled: false,
      shouldCapturePageviews: false,
      shouldCaptureReplay: false,
    }

    expect(actual).toEqual(expected)
  })

  test("given: production PostHog key, should: enable analytics and replay", () => {
    const actual = createAnalyticsConfig({
      apiHost: "https://us.i.posthog.com",
      apiKey: "phc_test",
      mode: "production",
    })
    const expected = {
      apiHost: "https://us.i.posthog.com",
      apiKey: "phc_test",
      isEnabled: true,
      shouldCapturePageviews: true,
      shouldCaptureReplay: true,
    }

    expect(actual).toEqual(expected)
  })

  test("given: development PostHog key, should: disable replay", () => {
    const actual = createAnalyticsConfig({
      apiHost: "https://us.i.posthog.com",
      apiKey: "phc_test",
      mode: "development",
    })
    const expected = {
      apiHost: "https://us.i.posthog.com",
      apiKey: "phc_test",
      isEnabled: true,
      shouldCapturePageviews: true,
      shouldCaptureReplay: false,
    }

    expect(actual).toEqual(expected)
  })
})

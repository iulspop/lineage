import { describe, expect, test } from "vitest"

import {
  getThemePreference,
  resolveTheme,
  serializeThemePreference,
} from "./theme-preference"

describe("theme preference", () => {
  test("uses the saved cookie preference when present", () => {
    const request = new Request("https://lineage.example/settings", {
      headers: { cookie: "session=abc; app-theme=dark" },
    })

    expect(getThemePreference(request)).toEqual("dark")
    expect(resolveTheme(getThemePreference(request), "light")).toEqual("dark")
  })

  test("uses the color-scheme client hint for the default system preference", () => {
    const request = new Request("https://lineage.example/")

    expect(getThemePreference(request)).toEqual("system")
    expect(resolveTheme("system", "dark")).toEqual("dark")
    expect(resolveTheme("system", "light")).toEqual("light")
  })

  test("serializes a long-lived same-site preference cookie", () => {
    expect(serializeThemePreference("system")).toEqual(
      "app-theme=system; Path=/; Max-Age=31536000; SameSite=Lax",
    )
  })
})

import { afterEach, describe, expect, test } from "vitest"

import { AppearanceControl } from "./appearance-control"
import { darkThemeClass, lightThemeClass } from "~/design-system/theme.css"
import { render, screen, userEvent } from "~/test/react-test-utils"

afterEach(() => {
  window.localStorage.clear()
  document.cookie = "app-theme=; Path=/; Max-Age=0"
  document.documentElement.classList.remove(darkThemeClass)
  document.documentElement.classList.add(lightThemeClass)
})

describe("AppearanceControl", () => {
  test("given: light mode is active, should: persist and apply dark mode", async () => {
    const user = userEvent.setup()
    render(<AppearanceControl />)

    await user.click(screen.getByRole("button", { name: "Dark" }))

    expect(window.localStorage.getItem("app-theme")).toEqual("dark")
    expect(document.cookie).toContain("app-theme=dark")
    expect(document.documentElement.classList.contains(darkThemeClass)).toEqual(
      true,
    )
    expect(
      document.documentElement.classList.contains(lightThemeClass),
    ).toEqual(false)
  })
})

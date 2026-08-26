import { useEffect, useState } from "react"

import * as s from "./appearance-control.css"
import { darkThemeClass, lightThemeClass } from "~/design-system/theme.css"
import { cx } from "~/utils/class-name"

type ThemePreference = "dark" | "light" | "system"

const THEME_STORAGE_KEY = "app-theme"

function applyTheme(preference: ThemePreference) {
  const useDark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  document.documentElement.classList.remove(lightThemeClass, darkThemeClass)
  document.documentElement.classList.add(
    useDark ? darkThemeClass : lightThemeClass,
  )
}

export function AppearanceControl() {
  const [preference, setPreference] = useState<ThemePreference>("light")

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(THEME_STORAGE_KEY)
    const initialPreference =
      savedPreference === "dark" || savedPreference === "system"
        ? savedPreference
        : "light"

    setPreference(initialPreference)
    applyTheme(initialPreference)
  }, [])

  useEffect(() => {
    if (preference !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const updateSystemTheme = () => applyTheme("system")
    mediaQuery.addEventListener("change", updateSystemTheme)
    return () => mediaQuery.removeEventListener("change", updateSystemTheme)
  }, [preference])

  const selectPreference = (nextPreference: ThemePreference) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference)
    setPreference(nextPreference)
    applyTheme(nextPreference)
  }

  return (
    <fieldset className={s.fieldset}>
      <legend className={s.legend}>Color theme</legend>
      <p className={s.description}>
        Use the light interface, switch to dark, or follow your device.
      </p>
      <div className={s.options}>
        {(["light", "dark", "system"] as const).map((option) => (
          <button
            aria-pressed={preference === option}
            className={cx(s.option, preference === option && s.optionActive)}
            key={option}
            onClick={() => selectPreference(option)}
            type="button"
          >
            <span
              aria-hidden="true"
              className={s.preview}
              data-theme={option}
            />
            <span>{option[0]?.toUpperCase() + option.slice(1)}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}

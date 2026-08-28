export type ThemePreference = "dark" | "light" | "system"
export type ResolvedTheme = "dark" | "light"

export const themeCookieName = "app-theme"
export const themeStorageKey = "app-theme"

export function getThemePreference(request: Request): ThemePreference {
  const cookieHeader = request.headers.get("cookie") ?? ""
  const value = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([name]) => name === themeCookieName)?.[1]

  return value === "dark" || value === "light" || value === "system"
    ? value
    : "system"
}

export function resolveTheme(
  preference: ThemePreference,
  colorSchemeHint: string | undefined,
): ResolvedTheme {
  if (preference !== "system") return preference
  return colorSchemeHint === "dark" ? "dark" : "light"
}

export function serializeThemePreference(preference: ThemePreference) {
  return `${themeCookieName}=${preference}; Path=/; Max-Age=31536000; SameSite=Lax`
}

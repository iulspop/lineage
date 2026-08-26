export type AnalyticsConfig = {
  apiHost: string
  apiKey: string
  isEnabled: boolean
  shouldCapturePageviews: boolean
  shouldCaptureReplay: boolean
}

type CreateAnalyticsConfigInput = {
  apiHost: string | undefined
  apiKey: string | undefined
  mode: string | undefined
}

const defaultPostHogApiHost = "https://us.i.posthog.com"

export function createAnalyticsConfig({
  apiHost = defaultPostHogApiHost,
  apiKey = "",
  mode = "development",
}: CreateAnalyticsConfigInput): AnalyticsConfig {
  const isEnabled = apiKey.length > 0
  const isProduction = mode === "production"

  return {
    apiHost,
    apiKey,
    isEnabled,
    shouldCapturePageviews: isEnabled,
    shouldCaptureReplay: isEnabled && isProduction,
  }
}

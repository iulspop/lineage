import posthog from "posthog-js"

import type { AnalyticsConfig } from "./analytics"

export function initAnalytics({
  apiHost,
  apiKey,
  isEnabled,
  shouldCapturePageviews,
  shouldCaptureReplay,
}: AnalyticsConfig) {
  if (!isEnabled) {
    return
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    capture_pageview: shouldCapturePageviews,
    defaults: "2025-05-24",
    disable_session_recording: !shouldCaptureReplay,
  })
}

import * as Sentry from "@sentry/react-router"

const tracesSampleRate = Number.parseFloat(
  process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1",
)

const sensitiveQueryParameters = new Set([
  "access_token",
  "client_secret",
  "code",
  "code_verifier",
  "refresh_token",
  "token",
])

function redactUrl(value) {
  if (!value) return value
  try {
    const url = new URL(value)
    for (const parameter of sensitiveQueryParameters) {
      if (url.searchParams.has(parameter))
        url.searchParams.set(parameter, "[REDACTED]")
    }
    return url.toString()
  } catch {
    return value
  }
}

Sentry.init({
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.Authorization
      delete event.request.headers.cookie
      delete event.request.headers.Cookie
    }
    if (event.request?.url) event.request.url = redactUrl(event.request.url)
    return event
  },
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate:
    Number.isFinite(tracesSampleRate) &&
    tracesSampleRate >= 0 &&
    tracesSampleRate <= 1
      ? tracesSampleRate
      : 0.1,
})

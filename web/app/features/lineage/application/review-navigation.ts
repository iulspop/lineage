export const createReviewContinuationUrl = (requestUrl: string) => {
  const searchParams = new URL(requestUrl).searchParams
  const requestedLimit = Number(searchParams.get("limit"))
  const requestedCompleted = Number(searchParams.get("completed"))
  const completed =
    Number.isInteger(requestedCompleted) && requestedCompleted > 0
      ? requestedCompleted
      : 0
  const continuation = new URLSearchParams()

  if ([10, 20, 50].includes(requestedLimit))
    continuation.set("limit", String(requestedLimit))
  continuation.set("completed", String(completed + 1))

  return `/review?${continuation.toString()}`
}

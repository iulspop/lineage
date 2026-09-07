const reviewSessionSearch = (requestUrl: string) => {
  const searchParams = new URL(requestUrl).searchParams
  const requestedLimit = Number(searchParams.get("limit"))
  const requestedCompleted = Number(searchParams.get("completed"))
  const continuation = new URLSearchParams()

  if ([10, 20, 50].includes(requestedLimit))
    continuation.set("limit", String(requestedLimit))
  if (Number.isInteger(requestedCompleted) && requestedCompleted > 0)
    continuation.set("completed", String(requestedCompleted))

  return continuation
}

export const createReviewAfterDeletionUrl = (requestUrl: string) => {
  const continuation = reviewSessionSearch(requestUrl)
  const search = continuation.toString()
  return search ? `/review?${search}` : "/review"
}

export const createReviewContinuationUrl = (requestUrl: string) => {
  const continuation = reviewSessionSearch(requestUrl)
  const completed = Number(continuation.get("completed") ?? 0)
  continuation.set("completed", String(completed + 1))

  return `/review?${continuation.toString()}`
}

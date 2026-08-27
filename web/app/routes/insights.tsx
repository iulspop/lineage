import { redirect } from "react-router"

import type { Route } from "./+types/insights"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"
import { InsightsPage } from "~/features/lineage/application/insights-page"
import { projectInsights } from "~/features/lineage/application/insights-projection"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import { listCorpusReviewHistory } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const url = new URL(request.url)
  const resolution = await resolveActiveCorpus(userId)
  if (resolution.status === "empty") throw redirect("/settings/workspace")
  const corpus = parseCorpusDocument(
    JSON.parse(resolution.snapshot.canonicalJson),
  )
  const requestedCollectionId = url.searchParams.get("collectionId") ?? ""
  const collectionId = corpus.collections.some(
    (collection) => collection.id === requestedCollectionId,
  )
    ? requestedCollectionId
    : ""
  const promptIds = collectionId
    ? new Set(
        corpus.collectionMemberships
          .filter((membership) => membership.collectionId === collectionId)
          .map((membership) => membership.promptId),
      )
    : null
  const filteredCorpus = promptIds
    ? {
        ...corpus,
        prompts: corpus.prompts.filter((prompt) => promptIds.has(prompt.id)),
      }
    : corpus
  const [user, reviews] = await Promise.all([
    retrieveUserFromDatabaseById(userId),
    listCorpusReviewHistory({ corpusId: corpus.corpusId, userId }),
  ])
  const filteredReviews = promptIds
    ? reviews.filter((review) => promptIds.has(review.promptId))
    : reviews
  return {
    collections: corpus.collections,
    insights: projectInsights({
      corpora: [filteredCorpus],
      reviews: filteredReviews,
    }),
    query: {
      assessment: url.searchParams.get("assessment") ?? "",
      collectionId,
    },
    userEmail: user?.email ?? "",
  }
}

export const meta: Route.MetaFunction = () => [{ title: "Insights | Lineage" }]

export default function InsightsRoute({ loaderData }: Route.ComponentProps) {
  return <InsightsPage {...loaderData} />
}

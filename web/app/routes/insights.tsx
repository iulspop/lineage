import type { Route } from "./+types/insights"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { InsightsPage } from "~/features/lineage/application/insights-page"
import { projectInsights } from "~/features/lineage/application/insights-projection"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { listUserReviewHistory } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const url = new URL(request.url)
  const [user, snapshots, reviews] = await Promise.all([
    retrieveUserFromDatabaseById(userId),
    corpusSnapshotStore.listLatest(userId),
    listUserReviewHistory({ userId }),
  ])
  return {
    insights: projectInsights({
      corpora: snapshots.map((snapshot) =>
        parseCorpusDocument(JSON.parse(snapshot.canonicalJson)),
      ),
      reviews,
    }),
    query: {
      assessment: url.searchParams.get("assessment") ?? "",
      corpusId: url.searchParams.get("corpusId") ?? "",
    },
    userEmail: user?.email ?? "",
  }
}

export const meta: Route.MetaFunction = () => [{ title: "Insights | Lineage" }]

export default function InsightsRoute({ loaderData }: Route.ComponentProps) {
  return <InsightsPage {...loaderData} />
}

import type { Route } from "./+types/library"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { LibraryPage } from "~/features/lineage/application/library-page"
import { loadWorkspaceSummary } from "~/features/lineage/application/workspace-summary.server"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { reviewRecordStore } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? ""
  const [user, summary] = await Promise.all([
    retrieveUserFromDatabaseById(userId),
    loadWorkspaceSummary({
      ownerId: userId,
      reviewStore: reviewRecordStore,
      snapshotStore: corpusSnapshotStore,
    }),
  ])
  const normalizedQuery = query.toLocaleLowerCase()
  const corpora = normalizedQuery
    ? summary.corpora.filter((corpus) =>
        corpus.corpusId.toLocaleLowerCase().includes(normalizedQuery),
      )
    : summary.corpora

  return { corpora, query, userEmail: user?.email ?? "" }
}

export const meta: Route.MetaFunction = () => [{ title: "Library | Lineage" }]

export default function LibraryRoute({ loaderData }: Route.ComponentProps) {
  return <LibraryPage {...loaderData} />
}

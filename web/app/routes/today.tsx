import type { Route } from "./+types/today"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { TodayPage } from "~/features/lineage/application/today-page"
import { loadWorkspaceSummary } from "~/features/lineage/application/workspace-summary.server"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { reviewRecordStore } from "~/features/lineage/infrastructure/review-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const [user, summary] = await Promise.all([
    retrieveUserFromDatabaseById(userId),
    loadWorkspaceSummary({
      ownerId: userId,
      reviewStore: reviewRecordStore,
      snapshotStore: corpusSnapshotStore,
    }),
  ])

  return { summary, userEmail: user?.email ?? "" }
}

export const meta: Route.MetaFunction = () => [{ title: "Today | Lineage" }]

export default function TodayRoute({ loaderData }: Route.ComponentProps) {
  return (
    <TodayPage summary={loaderData.summary} userEmail={loaderData.userEmail} />
  )
}

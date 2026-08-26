import { data } from "react-router"

import type { Route } from "./+types/settings.data"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { DataPortabilityPage } from "~/features/lineage/application/data-portability-page"
import {
  exportUserData,
  restoreUserData,
} from "~/features/lineage/application/user-data-portability.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"
import { getErrorMessage } from "~/utils/get-error-message"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const user = await retrieveUserFromDatabaseById(userId)
  return { userEmail: user?.email ?? "" }
}

export async function action({ request }: Route.ActionArgs) {
  const ownerId = await requireUserId(request)
  const formData = await request.formData()
  const intent = formData.get("intent")
  try {
    if (intent === "export") {
      const bytes = await exportUserData(ownerId)
      return new Response(bytes as BodyInit, {
        headers: {
          "Content-Disposition":
            'attachment; filename="lineage-user-data.lineage"',
          "Content-Type": "application/zip",
        },
      })
    }
    if (intent === "restore") {
      if (formData.get("confirmed") !== "on")
        return data(
          { error: "Confirm recovery before continuing." },
          { status: 400 },
        )
      const archive = formData.get("archive")
      if (!(archive instanceof File))
        return data(
          { error: "Choose a Lineage export archive." },
          { status: 400 },
        )
      const restored = await restoreUserData({
        bytes: new Uint8Array(await archive.arrayBuffer()),
        conflict: "reject",
        ownerId,
        validator: lineageRuntime,
      })
      return data({ restored })
    }
    return data({ error: "Unknown data action." }, { status: 400 })
  } catch (error) {
    return data({ error: getErrorMessage(error) }, { status: 400 })
  }
}

export const meta: Route.MetaFunction = () => [{ title: "Data | Lineage" }]

export default function DataSettingsRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <DataPortabilityPage
      actionData={actionData}
      userEmail={loaderData.userEmail}
    />
  )
}

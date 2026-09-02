import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { IntegrationsPage } from "./integrations-page"
import { render, screen } from "~/test/react-test-utils"

describe("IntegrationsPage", () => {
  test("shows connected applications and revocation control", () => {
    const RouterStub = createRoutesStub([
      {
        Component: () => (
          <IntegrationsPage
            clients={[]}
            grants={[
              {
                appName: "Study Assistant",
                createdAt: "2026-09-01T00:00:00.000Z",
                id: "grant-id",
                lastUsedAt: null,
                scope: "memories:write",
              },
            ]}
            isOwner={false}
          />
        ),
        path: "/settings/integrations",
      },
    ])

    render(<RouterStub initialEntries={["/settings/integrations"]} />)

    expect(screen.getByText("Study Assistant")).toBeInTheDocument()
    expect(screen.getByText(/can create memories/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /revoke/i })).toBeInTheDocument()
    expect(screen.queryByText(/approved clients/i)).not.toBeInTheDocument()
  })

  test("shows client registration only to the owner", () => {
    const RouterStub = createRoutesStub([
      {
        Component: () => <IntegrationsPage clients={[]} grants={[]} isOwner />,
        path: "/settings/integrations",
      },
    ])

    render(<RouterStub initialEntries={["/settings/integrations"]} />)

    expect(
      screen.getByRole("heading", { name: /approved clients/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/application name/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /register client/i }),
    ).toBeInTheDocument()
  })
})

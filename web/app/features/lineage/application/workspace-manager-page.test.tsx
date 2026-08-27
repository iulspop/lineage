import { render, screen } from "@testing-library/react"
import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { WorkspaceManagerPage } from "./workspace-manager-page"

describe("WorkspaceManagerPage", () => {
  test("shows the active workspace and keeps switching deliberate", () => {
    const RoutesStub = createRoutesStub([
      {
        Component: () => (
          <WorkspaceManagerPage
            workspaces={[
              { active: true, corpusId: "polypan", memoryCount: 42 },
              { active: false, corpusId: "archive", memoryCount: 7 },
            ]}
          />
        ),
        path: "/",
      },
    ])

    render(<RoutesStub initialEntries={["/"]} />)

    expect(
      screen.getByRole("heading", { name: "Workspace" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText("polypan contains 42 memories."),
    ).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Switch workspace" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/creates and activates a separate empty workspace/i),
    ).toBeInTheDocument()
  })
})

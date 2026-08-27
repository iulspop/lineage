import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { AppShell } from "./app-shell"

describe("AppShell", () => {
  test("given: a regular user, should: render product navigation and account controls", () => {
    const RoutesStub = createRoutesStub([
      {
        Component: () => (
          <AppShell chatUnreadCount={3} userEmail="user@example.com">
            <h1>Workspace</h1>
          </AppShell>
        ),
        path: "/",
      },
    ])

    render(<RoutesStub initialEntries={["/"]} />)

    expect(screen.getAllByRole("link", { name: "Today" })).toHaveLength(2)
    expect(screen.getAllByRole("link", { name: "Library" })).toHaveLength(2)
    expect(screen.getAllByRole("link", { name: "Create" })).toHaveLength(2)
    expect(screen.getAllByRole("link", { name: "Insights" })).toHaveLength(2)
    expect(screen.getByRole("link", { name: "Lineage home" })).toHaveAttribute(
      "href",
      "/today",
    )
    expect(
      screen.getAllByRole("link", { name: "Help & feedback 3" }),
    ).toHaveLength(2)
    expect(screen.getAllByText("user@example.com")).toHaveLength(2)
    expect(screen.getByLabelText("Open account menu")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Workspace" }),
    ).toBeInTheDocument()
  })

  test("given: the keyboard shortcut, should: open searchable quick actions", async () => {
    const user = userEvent.setup()
    const RoutesStub = createRoutesStub([
      {
        Component: () => (
          <AppShell userEmail="user@example.com">
            <h1>Workspace</h1>
          </AppShell>
        ),
        path: "/",
      },
    ])

    render(<RoutesStub initialEntries={["/"]} />)
    await user.keyboard("{Meta>}k{/Meta}")

    expect(
      screen.getByRole("dialog", { name: "Quick actions" }),
    ).toBeInTheDocument()
    await user.type(
      screen.getByPlaceholderText("Go to a page or start an action…"),
      "data",
    )
    expect(
      screen.getByRole("button", { name: "Data portability" }),
    ).toBeInTheDocument()
  })

  test("given: owner access from the root loader, should: expose support inbox and owner setup navigation", async () => {
    const RoutesStub = createRoutesStub([
      {
        Component: () => (
          <AppShell userEmail="owner@example.com">
            <h1>Workspace</h1>
          </AppShell>
        ),
        id: "root",
        loader: () => ({
          ownerAccess: { canClaimOwner: true, isOwner: true },
        }),
        path: "/",
      },
    ])

    render(<RoutesStub initialEntries={["/"]} />)

    for (const link of await screen.findAllByRole("link", {
      name: "Support inbox",
    })) {
      expect(link).toHaveAttribute("href", "/owner/chats")
    }
    expect(
      await screen.findByRole("link", { name: "Set up owner access" }),
    ).toHaveAttribute("href", "/owner/claim")
  })
})

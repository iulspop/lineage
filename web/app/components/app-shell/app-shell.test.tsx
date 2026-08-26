import { render, screen } from "@testing-library/react"
import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { AppShell } from "./app-shell"

describe("AppShell", () => {
  test("given: a regular user with unread chat, should: render primary navigation and account controls", () => {
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

    expect(screen.getAllByRole("link", { name: "Todos" })).toHaveLength(2)
    expect(
      screen.getAllByRole("link", { name: "Chat with founder 3" }),
    ).toHaveLength(2)
    expect(screen.getAllByText("user@example.com")).toHaveLength(2)
    expect(screen.getByLabelText("Open navigation menu")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Workspace" }),
    ).toBeInTheDocument()
  })

  test("given: an owner-eligible account, should: expose dashboard and owner setup navigation", () => {
    const RoutesStub = createRoutesStub([
      {
        Component: () => (
          <AppShell canClaimOwner isOwner userEmail="owner@example.com">
            <h1>Workspace</h1>
          </AppShell>
        ),
        path: "/",
      },
    ])

    render(<RoutesStub initialEntries={["/"]} />)

    for (const link of screen.getAllByRole("link", {
      name: "Chat dashboard",
    })) {
      expect(link).toHaveAttribute("href", "/owner/chats")
    }
    expect(
      screen.getByRole("link", { name: "Set up owner access" }),
    ).toHaveAttribute("href", "/owner/claim")
  })
})

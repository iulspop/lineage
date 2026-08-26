import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { LandingPageComponent } from "./landing-page"
import { render, screen } from "~/test/react-test-utils"

describe("LandingPageComponent", () => {
  test("given: a logged-out visitor, should: present Lineage and its primary actions", () => {
    const RouterStub = createRoutesStub([
      {
        Component: () => <LandingPageComponent />,
        path: "/",
      },
    ])

    render(<RouterStub initialEntries={["/"]} />)

    expect(
      screen.getByRole("heading", {
        name: /your knowledge should outlive the app/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /start building your corpus/i }),
    ).toHaveAttribute("href", "/auth/signup")
    expect(
      screen.getByRole("link", { name: /continue reviewing/i }),
    ).toHaveAttribute("href", "/auth/signin")
    expect(screen.getByLabelText(/lineage review preview/i)).toBeInTheDocument()
  })
})

import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { LandingPageComponent } from "./landing-page"
import { render, screen } from "~/test/react-test-utils"

describe("LandingPageComponent", () => {
  test("given: a logged-out visitor, should: present the todo app offer and primary signup CTA", () => {
    const RouterStub = createRoutesStub([
      {
        Component: () => <LandingPageComponent />,
        path: "/",
      },
    ])

    render(<RouterStub initialEntries={["/"]} />)

    expect(
      screen.getByRole("heading", {
        name: /turn scattered tasks into a clear plan/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /create your todo list/i }),
    ).toHaveAttribute("href", "/auth/signup")
    expect(
      screen.getByRole("link", { name: /i already have an account/i }),
    ).toHaveAttribute("href", "/auth/signin")
    expect(screen.getByLabelText(/todo list preview/i)).toBeInTheDocument()
  })
})

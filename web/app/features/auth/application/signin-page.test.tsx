import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { SignInPageComponent } from "./signin-page"
import { render, screen, userEvent } from "~/test/react-test-utils"

describe("SignInPageComponent", () => {
  test("given: the sign in page, should: render sign in labeled passkey and magic link options", () => {
    const path = "/auth/signin"
    const RouterStub = createRoutesStub([
      {
        Component: () => <SignInPageComponent />,
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(
      screen.getByRole("heading", { name: /^sign in$/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
    const passkeyButton = screen.getByRole("button", {
      name: /sign in with passkey/i,
    })
    expect(passkeyButton.querySelector("svg")).toBeInTheDocument()
    const magicLinkButton = screen.getByRole("button", {
      name: /email me a sign-in link/i,
    })
    expect(magicLinkButton).toHaveAttribute("data-variant", "ghost")
    expect(magicLinkButton.querySelector("svg")).toBeInTheDocument()
    expect(
      screen.queryByPlaceholderText("you@example.com"),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/auth/signup",
    )
  })

  test("given: clicking email sign in, should: reveal the magic-link form", async () => {
    const user = userEvent.setup()
    const path = "/auth/signin"
    const RouterStub = createRoutesStub([
      {
        Component: () => <SignInPageComponent />,
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)
    await user.click(
      screen.getByRole("button", { name: /email me a sign-in link/i }),
    )

    expect(screen.getByPlaceholderText("you@example.com")).toHaveAttribute(
      "autocomplete",
      "email",
    )
    expect(
      screen.getByRole("button", { name: /send magic link/i }),
    ).toBeInTheDocument()
  })
})

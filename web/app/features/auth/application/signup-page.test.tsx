import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { SignUpPageComponent } from "./signup-page"
import { render, screen } from "~/test/react-test-utils"

describe("SignUpPageComponent", () => {
  test("given: the signup page, should: require email verification before offering passkeys", () => {
    const path = "/auth/signup"
    const RouterStub = createRoutesStub([
      {
        Component: () => <SignUpPageComponent />,
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(
      screen.getByRole("heading", { name: /sign up/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/verify your email to create your account/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/add a passkey after signing in/i),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      "autocomplete",
      "email",
    )
    expect(
      screen.getByRole("button", { name: /continue with email/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /passkey/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "/auth/signin",
    )
  })

  test("given: an email signup error, should: preserve the email-first form and show the error", () => {
    const path = "/auth/signup"
    const RouterStub = createRoutesStub([
      {
        Component: () => (
          <SignUpPageComponent
            actionData={{ error: "Enter a valid email", success: false }}
          />
        ),
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email")
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /continue with email/i }),
    ).toBeInTheDocument()
  })
})

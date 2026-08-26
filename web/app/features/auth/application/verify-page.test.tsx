import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { VerifyPageComponent } from "./verify-page"
import { render, screen } from "~/test/react-test-utils"

describe("VerifyPageComponent", () => {
  test("given: the verify page, should: render code input and submit button", () => {
    const path = "/verify"
    const RouterStub = createRoutesStub([
      {
        Component: () => (
          <VerifyPageComponent target="alice@example.com" type="login" />
        ),
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByPlaceholderText("ABC123")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /verify code/i }),
    ).toBeInTheDocument()
  })

  test("given: a target email, should: display it in the description", () => {
    const path = "/verify"
    const RouterStub = createRoutesStub([
      {
        Component: () => (
          <VerifyPageComponent target="alice@example.com" type="login" />
        ),
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByText(/alice@example\.com/i)).toBeInTheDocument()
  })

  test("given: actionData with error, should: display error message", () => {
    const path = "/verify"
    const RouterStub = createRoutesStub([
      {
        Component: () => (
          <VerifyPageComponent
            actionData={{ error: "invalidCode", success: false }}
            target="alice@example.com"
            type="login"
          />
        ),
        path,
      },
    ])

    render(<RouterStub initialEntries={[path]} />)

    expect(screen.getByRole("alert")).toHaveTextContent(/invalid code/i)
  })
})

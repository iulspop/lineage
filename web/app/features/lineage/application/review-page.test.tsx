import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { ReviewPage } from "./review-page"
import { render, screen } from "~/test/react-test-utils"

const loaderData = {
  corpora: [{ corpusId: "lineage-demo", formatVersion: 1 }],
  corpusId: "lineage-demo",
  due: true,
  dueAt: null,
  history: [],
  presentation: ["What is the capital of France?"],
  prompt: { id: "capital-of-france", revision: 1 },
  reviewCount: 0,
  snapshotDigest: "demo-digest",
  userEmail: "learner@example.com",
}

describe("ReviewPage", () => {
  test("shows only the challenge before resolution", () => {
    const Router = createRoutesStub([
      {
        Component: () => (
          <ReviewPage actionData={undefined} loaderData={loaderData} />
        ),
        path: "/review",
      },
    ])
    const { container } = render(<Router initialEntries={["/review"]} />)

    expect(
      screen.getByText("What is the capital of France?"),
    ).toBeInTheDocument()
    expect(screen.queryByText("Paris")).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Show answer" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Corpus")).toHaveValue("lineage-demo")
    expect(container.querySelector('input[name="promptId"]')).toHaveValue(
      "capital-of-france",
    )
    expect(container.querySelector('input[name="promptRevision"]')).toHaveValue(
      "1",
    )
    expect(container.querySelector('input[name="snapshotDigest"]')).toHaveValue(
      "demo-digest",
    )
  })

  test("shows the resolution and assessment controls after an attempt", () => {
    const Router = createRoutesStub([
      {
        Component: () => (
          <ReviewPage
            actionData={{
              attempt: "Paris",
              completed: false,
              presentation: ["What is the capital of France?", "Paris"],
            }}
            loaderData={loaderData}
          />
        ),
        path: "/review",
      },
    ])
    render(<Router initialEntries={["/review"]} />)

    expect(screen.getAllByText("Paris")).toHaveLength(2)
    expect(screen.getByRole("button", { name: "Good" })).toBeInTheDocument()
  })
})

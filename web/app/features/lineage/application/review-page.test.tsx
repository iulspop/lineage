import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { ReviewPage } from "./review-page"
import { render, screen } from "~/test/react-test-utils"

const loaderData = {
  assessmentPreviews: { again: 1, easy: 8640, good: 10, hard: 6 },
  captureResponse: true,
  corpora: [{ corpusId: "lineage-demo", formatVersion: 1 }],
  corpusId: "lineage-demo",
  due: true,
  dueAt: null,
  dueCount: 4,
  history: [],
  presentation: ["What is the capital of France?"],
  prompt: { id: "capital-of-france", revision: 1 },
  reviewCount: 0,
  reviewedAt: "2026-08-26T12:00:00.000Z",
  sessionCompleted: 0,
  sessionLimit: null,
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

  test("supports recall and self-assessment without typed response capture", () => {
    const Router = createRoutesStub([
      {
        Component: () => (
          <ReviewPage
            actionData={undefined}
            loaderData={{ ...loaderData, captureResponse: false }}
          />
        ),
        path: "/review",
      },
    ])
    render(<Router initialEntries={["/review"]} />)

    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument()
    expect(
      screen.getByText(
        "Recall the answer, then reveal it and assess yourself.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Show answer" }),
    ).toBeInTheDocument()
  })

  test("given: every Prompt is scheduled for the future, should: show no review card", () => {
    const Router = createRoutesStub([
      {
        Component: () => (
          <ReviewPage
            actionData={undefined}
            loaderData={{
              ...loaderData,
              assessmentPreviews: null,
              captureResponse: false,
              due: false,
              dueAt: "2026-08-29T12:00:00.000Z",
              presentation: [],
              prompt: null,
            }}
          />
        ),
        path: "/review",
      },
    ])
    render(<Router initialEntries={["/review"]} />)

    const noReviewsDue = screen.getByText("No reviews due")

    expect(noReviewsDue).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Show answer" })).toBeNull()
    expect(noReviewsDue.parentElement).toHaveTextContent("Next review")
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
    expect(
      screen.getByRole("button", { name: /Good.*10 min/i }),
    ).toBeInTheDocument()
    expect(document.querySelector('input[name="reviewedAt"]')).toHaveValue(
      "2026-08-26T12:00:00.000Z",
    )
  })
})

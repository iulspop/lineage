import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { ReviewPage } from "./review-page"
import { fireEvent, render, screen } from "~/test/react-test-utils"

const loaderData = {
  assessmentPreviews: { again: 1, easy: 8640, good: 10, hard: 6 },
  captureResponse: true,
  corpusId: "lineage-demo",
  due: true,
  dueAt: null,
  dueCount: 4,
  history: [],
  presentation: ["What is the capital of France?"],
  prompt: {
    challenge: ["What is the capital of France?"],
    id: "capital-of-france",
    kind: "basic" as const,
    resolution: ["Paris"],
    response: "text" as const,
    revision: 1,
    withheld: ["Paris"],
  },
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
      screen.getByRole("button", { name: /Show answer/ }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText("Corpus")).not.toBeInTheDocument()
    expect(container.querySelector('input[name="corpusId"]')).toHaveValue(
      "lineage-demo",
    )
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

  test("conceals every image region and highlights only the atomic target", () => {
    const Router = createRoutesStub([
      {
        Component: () => (
          <ReviewPage
            actionData={undefined}
            loaderData={{
              ...loaderData,
              captureResponse: false,
              prompt: {
                ...loaderData.prompt,
                kind: "image-occlusion" as const,
                occlusionRegions: [
                  {
                    accessibleDescription: "The target region",
                    geometry: {
                      height: 0.2,
                      type: "rectangle" as const,
                      width: 0.2,
                      x: 0.1,
                      y: 0.1,
                    },
                    id: "target-region",
                    label: "Target",
                  },
                  {
                    accessibleDescription: "Another concealed region",
                    geometry: {
                      height: 0.2,
                      type: "rectangle" as const,
                      width: 0.2,
                      x: 0.6,
                      y: 0.6,
                    },
                    id: "other-region",
                    label: "Other",
                  },
                ],
                sourceAsset: "anatomy-image",
              },
            }}
          />
        ),
        path: "/review",
      },
    ])
    const { container } = render(<Router initialEntries={["/review"]} />)

    expect(container.querySelectorAll("[data-occlusion-target]")).toHaveLength(
      2,
    )
    expect(
      container.querySelectorAll('[data-occlusion-target="true"]'),
    ).toHaveLength(1)
    expect(
      container.querySelectorAll('[data-occlusion-target="false"]'),
    ).toHaveLength(1)
    expect(
      container.querySelector('[data-occlusion-target="true"]')?.textContent,
    ).toBe("?")
    expect(
      container.querySelector('[data-occlusion-target="false"]')?.textContent,
    ).toBe("")
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
      screen.getByRole("button", { name: /Show answer/ }),
    ).toBeInTheDocument()
  })

  test("opens the in-review immutable editor from the keyboard", () => {
    const Router = createRoutesStub([
      {
        Component: () => (
          <ReviewPage actionData={undefined} loaderData={loaderData} />
        ),
        path: "/review",
      },
    ])
    const { container } = render(<Router initialEntries={["/review"]} />)

    fireEvent.keyDown(window, { key: "e" })

    expect(
      screen.getByRole("heading", { name: "Revise without leaving review" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Challenge")).toHaveValue(
      "What is the capital of France?",
    )
    expect(screen.getByLabelText("Answer")).toHaveValue("Paris")
    expect(container.querySelector('input[name="intent"]')).toHaveValue(
      "revise",
    )
    expect(container.querySelector('input[name="promptId"]')).toHaveValue(
      "capital-of-france",
    )

    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.queryByLabelText("Challenge")).not.toBeInTheDocument()
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

    expect(screen.getByText("Paris")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Good.*10 min/i }),
    ).toBeInTheDocument()
    expect(document.querySelector('input[name="reviewedAt"]')).toHaveValue(
      "2026-08-26T12:00:00.000Z",
    )
  })
})

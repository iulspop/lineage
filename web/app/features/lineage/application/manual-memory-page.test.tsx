import userEvent from "@testing-library/user-event"
import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { ManualMemoryPage } from "./manual-memory-page"
import { render, screen } from "~/test/react-test-utils"

const draft = {
  answer: "(a - b)^2",
  challenge: "What does $a^2 - 2ab + b^2$ factor into?",
  corpusId: "polypan",
  kind: "basic" as const,
  promptId: "memory-id",
  responseMode: "self-check" as const,
}

function renderPage() {
  const Router = createRoutesStub([
    {
      Component: () => (
        <ManualMemoryPage
          actionData={{
            draft,
            preview: {
              canonicalJson: '{"preview":true}',
              document: {
                prompts: [
                  {
                    challenge: [draft.challenge],
                    resolution: [draft.answer],
                  },
                ],
              },
            },
            valid: true,
          }}
          baseDigest="snapshot-digest"
          collections={[]}
          initialDraft={draft}
          mode="edit"
          selectedCorpusId="polypan"
          userEmail="learner@example.com"
        />
      ),
      path: "/library/polypan/memories/memory-id/edit",
    },
  ])

  render(
    <Router initialEntries={["/library/polypan/memories/memory-id/edit"]} />,
  )
}

describe("ManualMemoryPage", () => {
  test("given: an approved preview, should: invalidate it when the draft changes", async () => {
    const user = userEvent.setup()
    renderPage()

    expect(
      screen.getByRole("button", { name: "Approve and save memory" }),
    ).toBeInTheDocument()

    const challenge = document.querySelector('textarea[name="challenge"]')
    if (!(challenge instanceof HTMLTextAreaElement)) {
      throw new Error("Challenge textarea was not rendered")
    }
    await user.clear(challenge)
    await user.type(challenge, "What is i^0?")

    expect(
      screen.queryByRole("button", { name: "Approve and save memory" }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/the draft changed\. validate it again/i),
    ).toBeInTheDocument()
  })
})

import userEvent from "@testing-library/user-event"
import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { ManualMemoryPage } from "./manual-memory-page"
import { render, screen, within } from "~/test/react-test-utils"

const draft = {
  answer: "Target answer",
  challenge: "Target challenge",
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
                    id: draft.promptId,
                    resolution: [draft.answer],
                  },
                  {
                    challenge: ["Wrong challenge from another memory"],
                    id: "another-memory",
                    resolution: ["Wrong answer"],
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

    const preview = screen
      .getByRole("heading", { name: "Approval preview" })
      .closest("aside")
    if (!preview) {
      throw new Error("Approval preview was not rendered")
    }
    expect(within(preview).getByText("Target challenge")).toBeInTheDocument()
    expect(
      within(preview).queryByText("Wrong challenge from another memory"),
    ).not.toBeInTheDocument()
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

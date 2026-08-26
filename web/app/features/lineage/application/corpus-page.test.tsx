import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { CorpusPage } from "./corpus-page"
import { render, screen } from "~/test/react-test-utils"

function renderPage(
  actionData?: Parameters<typeof CorpusPage>[0]["actionData"],
) {
  const Router = createRoutesStub([
    {
      Component: () => (
        <CorpusPage actionData={actionData} userEmail="learner@example.com" />
      ),
      path: "/corpora",
    },
  ])
  render(<Router initialEntries={["/corpora"]} />)
}

describe("CorpusPage", () => {
  test("offers owner-scoped import and export controls", () => {
    renderPage()

    expect(screen.getByLabelText("Canonical corpus JSON")).toBeInTheDocument()
    expect(screen.getByLabelText("Corpus ID")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Validate and import" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Download latest snapshot" }),
    ).toBeInTheDocument()
  })

  test("reports a successful validated import", () => {
    renderPage({
      corpusId: "language-learning",
      digest: "abc123",
      imported: true,
      promptCount: 2,
    })

    expect(screen.getByRole("status")).toHaveTextContent(
      "Imported 2 prompts into language-learning",
    )
  })
})

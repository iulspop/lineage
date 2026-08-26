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

  test("requires explicit acceptance after candidate validation", () => {
    renderPage({
      preview: {
        canonicalJson: '{"format":"lineage.corpus"}\n',
        diagnostics: [],
        document: { corpusId: "generated-corpus", prompts: [{}] },
        repairCount: 1,
      },
      valid: true,
    })

    expect(screen.getByText("Human approval preview")).toBeInTheDocument()
    expect(
      screen.getByText(/Applied 1 localized repair pass/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", {
        name: "Accept and persist canonical corpus",
      }),
    ).toBeInTheDocument()
  })

  test("renders stable diagnostic codes and paths", () => {
    renderPage({
      candidateJson: "{}",
      diagnostics: [
        {
          code: "revision.non-positive",
          message: "Prompt revisions begin at one.",
          path: "/prompts/0/revision",
          severity: "error",
        },
      ],
      valid: false,
    })

    expect(screen.getByText("Validation diagnostics")).toBeInTheDocument()
    expect(screen.getByText("revision.non-positive")).toBeInTheDocument()
    expect(screen.getByText("/prompts/0/revision")).toBeInTheDocument()
  })
})

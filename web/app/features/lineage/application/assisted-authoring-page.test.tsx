import { createRoutesStub } from "react-router"
import { describe, expect, test } from "vitest"

import { parseCorpusDocument } from "../domain/corpus"
import { AssistedAuthoringPage } from "./assisted-authoring-page"
import { render, screen } from "~/test/react-test-utils"

const input = {
  corpusId: "calculus",
  depth: "introductory" as const,
  desiredCount: 3,
  intent: "topic" as const,
  memoryKinds: ["basic" as const],
  topic: "derivatives",
}

function renderPage(
  actionData?: Parameters<typeof AssistedAuthoringPage>[0]["actionData"],
) {
  const Router = createRoutesStub([
    {
      Component: () => (
        <AssistedAuthoringPage
          actionData={actionData}
          initialInput={input}
          userEmail="learner@example.com"
        />
      ),
      path: "/create/ai",
    },
  ])
  render(<Router initialEntries={["/create/ai"]} />)
}

describe("AssistedAuthoringPage", () => {
  test("offers topic, source, expansion, and improvement generation modes", () => {
    renderPage()

    expect(
      screen.getByRole("heading", { name: "Generate memories with AI" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Mode")).toHaveValue("topic")
    expect(document.querySelector('input[name="corpusId"]')).toHaveValue(
      "calculus",
    )
    expect(
      screen.getByRole("button", { name: "Generate candidate memories" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/saves nothing until you approve/i),
    ).toBeInTheDocument()
  })

  test("shows editable selectable memories before explicit acceptance", () => {
    const document = parseCorpusDocument({
      assets: [],
      corpusId: "calculus",
      extensions: [],
      format: "lineage.corpus",
      formatVersion: 1,
      interoperability: [],
      materials: [],
      migrations: [],
      prompts: [
        {
          challenge: ["What is a derivative?"],
          id: "derivative",
          kind: "basic",
          resolution: ["The instantaneous rate of change"],
          response: { capture: "none", mode: "self-check" },
          revision: 1,
          withheld: ["The instantaneous rate of change"],
        },
      ],
      provenance: [],
      relationships: [],
      repetitionCorrections: [],
      repetitions: [],
      sources: [],
    })
    renderPage({
      baseDigest: "digest",
      canonicalJson: JSON.stringify(document),
      diagnostics: [],
      generatedIds: ["derivative"],
      input,
      memories: document.prompts,
      provider: { model: "test", provider: "fake", requestId: "request" },
      repairCount: 0,
      valid: true,
    })

    expect(
      screen.getByRole("checkbox", { name: /include basic memory/i }),
    ).toBeChecked()
    expect(screen.getByLabelText("Challenge")).toHaveValue(
      "What is a derivative?",
    )
    expect(screen.getByLabelText("Answer")).toHaveValue(
      "The instantaneous rate of change",
    )
    expect(
      screen.getByRole("button", { name: "Accept selected memories" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Regenerate" }),
    ).toBeInTheDocument()
  })
})

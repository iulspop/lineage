import type {
  CorpusDocument,
  LineageDiagnostic,
  ReviewContract,
} from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"
import type { CorpusCandidatePreview } from "./author-corpus.server"
import { validateCorpusCandidate } from "./author-corpus.server"

export type ManualMemoryDraft = {
  answer: string
  challenge: string
  corpusId: string
  hint?: string
  kind: "basic" | "cloze"
  promptId: string
  responseMode: "self-check" | "text"
}

export type ManualMemoryDraftResult =
  | { valid: true; preview: CorpusCandidatePreview }
  | { valid: false; diagnostics: LineageDiagnostic[] }

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function baseDocument(corpusId: string): CorpusDocument {
  return {
    assets: [],
    corpusId,
    extensions: [],
    format: "lineage.corpus",
    formatVersion: 1,
    interoperability: [],
    materials: [],
    migrations: [],
    prompts: [],
    provenance: [],
    relationships: [],
    repetitionCorrections: [],
    repetitions: [],
    sources: [],
  }
}

export function draftToPrompt(draft: ManualMemoryDraft): ReviewContract {
  const challenge = lines(draft.challenge)
  const answer = draft.answer.trim()
  const response =
    draft.responseMode === "text"
      ? ("text" as const)
      : ({ capture: "none", mode: "self-check" } as const)

  if (draft.kind === "cloze") {
    const hint = draft.hint?.trim()
    return {
      challenge,
      clozeTargets: [
        {
          answer,
          ...(hint ? { hints: [hint] } : {}),
          id: `${draft.promptId}-target-1`,
        },
      ],
      id: draft.promptId.trim(),
      kind: "cloze",
      resolution: [answer],
      response,
      revision: 1,
      withheld: [answer],
    }
  }

  return {
    challenge,
    id: draft.promptId.trim(),
    kind: "basic",
    resolution: [answer],
    response,
    revision: 1,
    withheld: [answer],
  }
}

export function validateManualMemoryDraft({
  base,
  draft,
  validator,
}: {
  base: CorpusDocument | null
  draft: ManualMemoryDraft
  validator: ReviewContractValidator
}): ManualMemoryDraftResult {
  const document = structuredClone(base ?? baseDocument(draft.corpusId.trim()))
  const result = validateCorpusCandidate({
    candidateJson: JSON.stringify({
      ...document,
      prompts: [...document.prompts, draftToPrompt(draft)],
    }),
    maxRepairs: 0,
    validator,
  })
  return result.valid
    ? result
    : { diagnostics: result.diagnostics, valid: false }
}

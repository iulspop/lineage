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
  collectionIds?: string[]
  corpusId: string
  hint?: string
  kind: "basic" | "cloze"
  promptId: string
  responseMode: "self-check" | "text"
}

export type ManualMemoryDraftResult =
  | { valid: true; preview: CorpusCandidatePreview }
  | { valid: false; diagnostics: LineageDiagnostic[] }

export type QuickMemoryCaptureResult =
  | { drafts: ManualMemoryDraft[]; valid: true }
  | { message: string; valid: false }

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function baseDocument(corpusId: string): CorpusDocument {
  return {
    assets: [],
    collectionMemberships: [],
    collections: [],
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

function slug(value: string) {
  return (
    value
      .normalize("NFKD")
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "memory"
  )
}

function availablePromptId(baseId: string, usedIds: Set<string>) {
  let candidate = baseId
  let suffix = 2
  while (usedIds.has(candidate)) {
    candidate = `${baseId}-${suffix}`
    suffix += 1
  }
  usedIds.add(candidate)
  return candidate
}

export function parseQuickMemoryCapture({
  corpusId,
  existingPromptIds = [],
  input,
}: {
  corpusId: string
  existingPromptIds?: string[]
  input: string
}): QuickMemoryCaptureResult {
  const value = input.trim()
  if (!value) return { message: "Type a memory first.", valid: false }

  const usedIds = new Set(existingPromptIds)
  const clozes = [...value.matchAll(/\{\{([^{}]+)\}\}/g)]
  if (clozes.length > 0) {
    const plainText = value.replace(/\{\{([^{}]+)\}\}/g, "$1")
    const baseId = slug(plainText)
    const drafts = clozes.flatMap((match, index) => {
      const answer = match[1]?.trim() ?? ""
      if (!answer || match.index === undefined) return []
      const before = value
        .slice(0, match.index)
        .replace(/\{\{([^{}]+)\}\}/g, "$1")
      const after = value
        .slice(match.index + match[0].length)
        .replace(/\{\{([^{}]+)\}\}/g, "$1")
      return [
        {
          answer,
          challenge: `${before}[…]${after}`,
          corpusId,
          kind: "cloze" as const,
          promptId: availablePromptId(
            clozes.length === 1 ? baseId : `${baseId}-cloze-${index + 1}`,
            usedIds,
          ),
          responseMode: "self-check" as const,
        },
      ]
    })
    return drafts.length > 0
      ? { drafts, valid: true }
      : {
          message: "Put text between {{ and }} to create a cloze.",
          valid: false,
        }
  }

  const separator = value.indexOf(">>")
  if (separator < 0)
    return {
      message:
        "Use “question >> answer” or wrap a cloze answer in {{double braces}}.",
      valid: false,
    }
  const challenge = value.slice(0, separator).trim()
  const answer = value.slice(separator + 2).trim()
  if (!(challenge && answer))
    return { message: "Add text on both sides of >>.", valid: false }

  return {
    drafts: [
      {
        answer,
        challenge,
        corpusId,
        kind: "basic",
        promptId: availablePromptId(slug(challenge), usedIds),
        responseMode: "self-check",
      },
    ],
    valid: true,
  }
}

export function validateQuickMemoryCapture({
  base,
  drafts,
  validator,
}: {
  base: CorpusDocument | null
  drafts: ManualMemoryDraft[]
  validator: ReviewContractValidator
}): ManualMemoryDraftResult {
  const document = structuredClone(
    base ?? baseDocument(drafts[0]?.corpusId ?? ""),
  )
  const result = validateCorpusCandidate({
    candidateJson: JSON.stringify({
      ...document,
      collectionMemberships: [
        ...document.collectionMemberships,
        ...drafts.flatMap((draft) =>
          (draft.collectionIds ?? []).map((collectionId) => ({
            collectionId,
            promptId: draft.promptId,
          })),
        ),
      ],
      prompts: [...document.prompts, ...drafts.map(draftToPrompt)],
    }),
    maxRepairs: 0,
    validator,
  })
  return result.valid
    ? result
    : { diagnostics: result.diagnostics, valid: false }
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
      collectionMemberships: [
        ...document.collectionMemberships,
        ...(draft.collectionIds ?? []).map((collectionId) => ({
          collectionId,
          promptId: draft.promptId,
        })),
      ],
      prompts: [...document.prompts, draftToPrompt(draft)],
    }),
    maxRepairs: 0,
    validator,
  })
  return result.valid
    ? result
    : { diagnostics: result.diagnostics, valid: false }
}

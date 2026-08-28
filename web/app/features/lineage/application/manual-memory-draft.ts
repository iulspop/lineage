import { createId } from "@paralleldrive/cuid2"

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
  clozeTargetId?: string
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

function availablePromptId(usedIds: Set<string>) {
  let candidate = createId()
  while (usedIds.has(candidate)) candidate = createId()
  usedIds.add(candidate)
  return candidate
}

function parseQuickMemoryLine({
  corpusId,
  usedIds,
  value,
}: {
  corpusId: string
  usedIds: Set<string>
  value: string
}): QuickMemoryCaptureResult {
  const clozes = [...value.matchAll(/\{\{([^{}]+)\}\}/g)]
  if (clozes.length > 0) {
    const drafts = clozes.flatMap((match) => {
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
          clozeTargetId: createId(),
          corpusId,
          kind: "cloze" as const,
          promptId: availablePromptId(usedIds),
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
        promptId: availablePromptId(usedIds),
        responseMode: "self-check",
      },
    ],
    valid: true,
  }
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
  const entries = input
    .split("\n")
    .map((value, index) => ({ lineNumber: index + 1, value: value.trim() }))
    .filter(({ value }) => value && !/^```[^`]*$/i.test(value))
  if (entries.length === 0)
    return { message: "Type one or more memories first.", valid: false }

  const drafts: ManualMemoryDraft[] = []
  const usedIds = new Set(existingPromptIds)
  for (const entry of entries) {
    const parsed = parseQuickMemoryLine({
      corpusId,
      usedIds,
      value: entry.value,
    })
    if (!parsed.valid)
      return {
        message: `Line ${entry.lineNumber}: ${parsed.message}`,
        valid: false,
      }
    drafts.push(...parsed.drafts)
  }

  return { drafts, valid: true }
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
          id: draft.clozeTargetId ?? createId(),
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

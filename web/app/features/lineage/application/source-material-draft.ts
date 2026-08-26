import type { CorpusDocument, LineageDiagnostic } from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"
import type { CorpusCandidatePreview } from "./author-corpus.server"
import { validateCorpusCandidate } from "./author-corpus.server"

export type KnowledgeDraft =
  | {
      content: string
      id: string
      kind: "source"
      linkedPromptIds: string[]
      title: string
    }
  | {
      content: string
      id: string
      kind: "material"
      linkedPromptIds: string[]
      sourceIds: string[]
    }

export type KnowledgeDraftResult =
  | { valid: true; preview: CorpusCandidatePreview }
  | { diagnostics: LineageDiagnostic[]; valid: false }

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function validateKnowledgeDraft({
  base,
  draft,
  validator,
}: {
  base: CorpusDocument
  draft: KnowledgeDraft
  validator: ReviewContractValidator
}): KnowledgeDraftResult {
  const document = structuredClone(base)
  const current =
    draft.kind === "source"
      ? document.sources.find(({ id }) => id === draft.id)
      : document.materials.find(({ id }) => id === draft.id)
  if (draft.kind === "source") {
    const source = {
      assets: current?.assets ?? [],
      content: draft.content.trim(),
      id: draft.id.trim(),
      provenance: current?.provenance ?? [],
      revision: current ? current.revision + 1 : 1,
      title: draft.title.trim(),
    }
    document.sources = current
      ? document.sources.map((item) => (item.id === source.id ? source : item))
      : [...document.sources, source]
  } else {
    const material = {
      assets: current?.assets ?? [],
      content: lines(draft.content),
      id: draft.id.trim(),
      provenance: current?.provenance ?? [],
      revision: current ? current.revision + 1 : 1,
      sources: draft.sourceIds,
    }
    document.materials = current
      ? document.materials.map((item) =>
          item.id === material.id ? material : item,
        )
      : [...document.materials, material]
  }
  document.prompts = document.prompts.map((prompt) => {
    const selected = draft.linkedPromptIds.includes(prompt.id)
    const references =
      draft.kind === "source" ? prompt.sources : prompt.materials
    const currentlyLinked = references.includes(draft.id)
    if (selected === currentlyLinked) return prompt
    return {
      ...prompt,
      [draft.kind === "source" ? "sources" : "materials"]: selected
        ? [...references, draft.id]
        : references.filter((id) => id !== draft.id),
      revision: prompt.revision + 1,
    }
  })
  return validateCorpusCandidate({
    candidateJson: JSON.stringify(document),
    maxRepairs: 0,
    validator,
  })
}

import { createId } from "@paralleldrive/cuid2"

import type {
  AuthoringProvider,
  AuthoringProviderResult,
  AuthoringRequest,
} from "../domain/authoring-provider"
import type {
  CorpusDocument,
  LineageDiagnostic,
  ReviewContract,
} from "../domain/corpus"
import { parseCorpusDocument } from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"
import { validateCorpusCandidate } from "./author-corpus.server"

const AUTHORING_SPECIFICATION = `Lineage corpus v1 authoring contract. Return one lineage.corpus JSON document. Every Prompt has a stable non-empty id, positive revision, challenge, withheld, resolution, and response. Basic and cloze memories are supported. Challenge and accessible fallback content must not reveal withheld answers. Resolution must disclose every withheld answer. Cloze targets require stable ids. Do not invent assets, media bytes, byte sizes, hashes, paths, retrieval claims, or archive integrity metadata. Output JSON only.`

export type AssistedAuthoringInput = Omit<
  AuthoringRequest,
  "authoringSpecification"
>

export type AssistedCandidate = {
  canonicalJson: string
  diagnostics: LineageDiagnostic[]
  memories: ReviewContract[]
  provider: Omit<AuthoringProviderResult, "candidateJson">
  repairCount: number
  valid: true
}

export type AssistedCandidateFailure = {
  diagnostics: LineageDiagnostic[]
  provider?: Omit<AuthoringProviderResult, "candidateJson">
  valid: false
}

function generatedProvenance(result: AuthoringProviderResult) {
  return {
    agent: `${result.provider}/${result.model}`,
    id: `ai-${createId()}`,
    kind: "authored" as const,
    note: `Untrusted assisted-authoring candidate ${result.requestId}; persisted only after human approval.`,
    recordedAt: new Date().toISOString(),
    sources: [],
  }
}

function mergeCandidate({
  base,
  generated,
  input,
  result,
}: {
  base: CorpusDocument | null
  generated: CorpusDocument
  input: AssistedAuthoringInput
  result: AuthoringProviderResult
}): CorpusDocument {
  const provenance = generatedProvenance(result)
  const document = structuredClone(
    base ?? {
      ...generated,
      prompts: [],
    },
  )
  const existingById = new Map(
    document.prompts.map((prompt) => [prompt.id, prompt]),
  )
  const generatedPrompts = generated.prompts.map((prompt) => {
    const existing = existingById.get(prompt.id)
    return {
      ...prompt,
      provenance: [...prompt.provenance, provenance.id],
      revision:
        input.intent === "improve-memory" && existing
          ? existing.revision + 1
          : prompt.revision,
    }
  })

  return {
    ...document,
    corpusId: input.corpusId,
    prompts:
      input.intent === "improve-memory"
        ? [
            ...document.prompts.filter(
              (prompt) => prompt.id !== input.promptId,
            ),
            ...generatedPrompts,
          ]
        : [...document.prompts, ...generatedPrompts],
    provenance: [...document.provenance, provenance],
  }
}

export async function generateCorpusCandidate({
  base,
  input,
  provider,
  signal,
  validator,
}: {
  base: CorpusDocument | null
  input: AssistedAuthoringInput
  provider: AuthoringProvider
  signal?: AbortSignal
  validator: ReviewContractValidator
}): Promise<AssistedCandidate | AssistedCandidateFailure> {
  const result = await provider.generate(
    { ...input, authoringSpecification: AUTHORING_SPECIFICATION },
    signal,
  )
  const providerMetadata = {
    model: result.model,
    provider: result.provider,
    requestId: result.requestId,
    usage: result.usage,
  }

  let generated: CorpusDocument
  try {
    generated = parseCorpusDocument(JSON.parse(result.candidateJson))
  } catch {
    return {
      diagnostics: [
        {
          code: "structure.invalid",
          message: "The authoring provider returned malformed corpus JSON.",
          path: "/",
          severity: "error",
        },
      ],
      provider: providerMetadata,
      valid: false,
    }
  }

  const merged = mergeCandidate({ base, generated, input, result })
  const validation = validateCorpusCandidate({
    candidateJson: JSON.stringify(merged),
    maxRepairs: 2,
    validator,
  })
  if (!validation.valid) {
    return {
      diagnostics: validation.diagnostics,
      provider: providerMetadata,
      valid: false,
    }
  }

  return {
    canonicalJson: validation.preview.canonicalJson,
    diagnostics: validation.preview.diagnostics,
    memories: validation.preview.document.prompts.filter((prompt) =>
      generatedPromptsIds(generated).has(prompt.id),
    ),
    provider: providerMetadata,
    repairCount: validation.preview.repairCount,
    valid: true,
  }
}

function generatedPromptsIds(document: CorpusDocument) {
  return new Set(document.prompts.map(({ id }) => id))
}

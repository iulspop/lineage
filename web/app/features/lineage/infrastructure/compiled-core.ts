import type {
  CorpusDocument,
  LineageDiagnostic,
  ReviewContract,
} from "../domain/corpus"
import {
  corpusDocumentSchema,
  responseDescriptor,
  structuralDiagnostics,
} from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"

type RawReviewContract = unknown

type CompiledLineageApi = {
  isValidReviewContract(raw: RawReviewContract): boolean
  rawReviewContract(
    challenge: string[],
  ): (
    resolution: string[],
  ) => (response: string) => (withheld: string[]) => RawReviewContract
}

export function createCompiledCoreValidator(
  api: CompiledLineageApi,
): ReviewContractValidator {
  const isValid = (contract: ReviewContract) => {
    const raw = api.rawReviewContract(contract.challenge)(contract.resolution)(
      responseDescriptor(contract),
    )(contract.withheld)
    return api.isValidReviewContract(raw)
  }

  return {
    isValid,
    validateCorpus(input) {
      const parsed = corpusDocumentSchema.safeParse(input)
      if (!parsed.success)
        return {
          diagnostics: structuralDiagnostics(parsed.error),
          valid: false,
        }

      const diagnostics = semanticDiagnostics(parsed.data, isValid)
      return diagnostics.length > 0
        ? { diagnostics, valid: false }
        : { diagnostics: [], document: parsed.data, valid: true }
    },
  }
}

function semanticDiagnostics(
  document: CorpusDocument,
  coreValid: (contract: ReviewContract) => boolean,
): LineageDiagnostic[] {
  const diagnostics: LineageDiagnostic[] = []
  const promptKeys = new Set<string>()
  const assets = new Set(document.assets.map((asset) => asset.id))

  document.prompts.forEach((prompt, promptIndex) => {
    const path = `/prompts/${promptIndex}`
    const key = `${prompt.id}\u0000${prompt.revision}`
    if (promptKeys.has(key))
      diagnostics.push({
        code: "identity.duplicate-prompt-revision",
        message: "Prompt identity and revision pairs must be unique.",
        path,
        severity: "error",
      })
    promptKeys.add(key)

    prompt.withheld.forEach((answer, withheldIndex) => {
      const normalizedAnswer = answer.toLocaleLowerCase()
      const challengeIndex = prompt.challenge.findIndex((item) =>
        item.toLocaleLowerCase().includes(normalizedAnswer),
      )
      if (challengeIndex >= 0)
        diagnostics.push({
          code: "disclosure.answer-leaked",
          message: "Challenge content contains a withheld answer.",
          path: `${path}/challenge/${challengeIndex}`,
          relatedPath: `${path}/withheld/${withheldIndex}`,
          severity: "error",
        })
      if (!prompt.resolution.includes(answer))
        diagnostics.push({
          code: "disclosure.answer-missing",
          message: "Resolution content omits a withheld answer.",
          path: `${path}/resolution`,
          relatedPath: `${path}/withheld/${withheldIndex}`,
          severity: "error",
        })
    })

    if (
      !coreValid(prompt) &&
      !diagnostics.some((item) => item.path.startsWith(path))
    )
      diagnostics.push({
        code: "structure.invalid",
        message: "The compiled Lineage core rejected this review contract.",
        path,
        severity: "error",
      })

    if (prompt.kind === "cloze" && !prompt.clozeTargets)
      diagnostics.push({
        code: "cloze.targets-required",
        message: "Cloze prompts require at least one stable target.",
        path: `${path}/clozeTargets`,
        severity: "error",
      })

    if (prompt.kind === "image-occlusion") {
      if (!prompt.sourceAsset)
        diagnostics.push({
          code: "occlusion.source-required",
          message: "Image occlusion requires a source asset.",
          path: `${path}/sourceAsset`,
          severity: "error",
        })
      if (!prompt.occlusionRegions)
        diagnostics.push({
          code: "occlusion.regions-required",
          message: "Image occlusion requires at least one stable region.",
          path: `${path}/occlusionRegions`,
          severity: "error",
        })
    }

    if (prompt.sourceAsset && !assets.has(prompt.sourceAsset))
      diagnostics.push({
        code: "asset.unresolved",
        message: `Referenced asset ${prompt.sourceAsset} is not declared.`,
        path: `${path}/sourceAsset`,
        severity: "error",
      })
  })

  return diagnostics
}

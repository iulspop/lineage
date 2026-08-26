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
  const isValid = (contract: ReviewContract) =>
    api.isValidReviewContract(
      api.rawReviewContract(contract.challenge)(contract.resolution)(
        responseDescriptor(contract),
      )(contract.withheld),
    )
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
      return diagnostics.length
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
  const assets = new Set(document.assets.map(({ id }) => id))
  const sources = new Set(document.sources.map(({ id }) => id))
  const materials = new Set(document.materials.map(({ id }) => id))
  const provenance = new Set(document.provenance.map(({ id }) => id))
  const extensions = new Map(document.extensions.map((item) => [item.id, item]))
  const promptKeys = new Set<string>()
  const repetitionIds = new Set<string>()

  document.prompts.forEach((prompt, promptIndex) => {
    const path = `/prompts/${promptIndex}`
    const key = `${prompt.id}\u0000${prompt.revision}`
    duplicate(
      promptKeys,
      key,
      `${path}`,
      diagnostics,
      "identity.duplicate-prompt-revision",
    )

    prompt.withheld.forEach((answer, withheldIndex) => {
      const normalized = answer.toLocaleLowerCase()
      const challengeIndex = prompt.challenge.findIndex((item) =>
        item.toLocaleLowerCase().includes(normalized),
      )
      if (challengeIndex >= 0)
        diagnostics.push(
          error(
            "disclosure.answer-leaked",
            `${path}/challenge/${challengeIndex}`,
            "Challenge content contains a withheld answer.",
            `${path}/withheld/${withheldIndex}`,
          ),
        )
      if (!prompt.resolution.some((item) => item.includes(answer)))
        diagnostics.push(
          error(
            "disclosure.answer-missing",
            `${path}/resolution`,
            "Resolution content omits a withheld answer.",
            `${path}/withheld/${withheldIndex}`,
          ),
        )
    })
    if (
      !coreValid(prompt) &&
      !diagnostics.some((item) => item.path.startsWith(path))
    )
      diagnostics.push(
        error(
          "structure.invalid",
          path,
          "The compiled Lineage core rejected this review contract.",
        ),
      )
    if (prompt.kind === "cloze" && !prompt.clozeTargets)
      diagnostics.push(
        error(
          "cloze.targets-required",
          `${path}/clozeTargets`,
          "Cloze prompts require at least one stable target.",
        ),
      )
    if (prompt.kind === "image-occlusion") {
      if (!prompt.sourceAsset)
        diagnostics.push(
          error(
            "occlusion.source-required",
            `${path}/sourceAsset`,
            "Image occlusion requires a source asset.",
          ),
        )
      if (!prompt.occlusionRegions)
        diagnostics.push(
          error(
            "occlusion.regions-required",
            `${path}/occlusionRegions`,
            "Image occlusion requires at least one stable region.",
          ),
        )
    }
    checkReferences(
      prompt.assets,
      assets,
      `${path}/assets`,
      diagnostics,
      "asset.unresolved",
    )
    checkReferences(prompt.sources, sources, `${path}/sources`, diagnostics)
    checkReferences(
      prompt.materials,
      materials,
      `${path}/materials`,
      diagnostics,
    )
    checkReferences(
      prompt.provenance,
      provenance,
      `${path}/provenance`,
      diagnostics,
    )
    if (prompt.sourceAsset && !assets.has(prompt.sourceAsset))
      diagnostics.push(
        error(
          "asset.unresolved",
          `${path}/sourceAsset`,
          `Referenced asset ${prompt.sourceAsset} is not declared.`,
        ),
      )
    prompt.extensions.required.forEach((extensionId, index) => {
      if (!extensions.has(extensionId))
        diagnostics.push(
          error(
            "reference.unresolved",
            `${path}/extensions/required/${index}`,
            `Required extension ${extensionId} is not declared.`,
          ),
        )
    })
  })

  document.materials.forEach((material, index) => {
    checkReferences(
      material.assets,
      assets,
      `/materials/${index}/assets`,
      diagnostics,
    )
    checkReferences(
      material.sources,
      sources,
      `/materials/${index}/sources`,
      diagnostics,
    )
  })
  document.sources.forEach((source, index) => {
    checkReferences(
      source.assets,
      assets,
      `/sources/${index}/assets`,
      diagnostics,
    )
  })
  document.extensions.forEach((extension, index) => {
    if (extension.requirement === "optional" && !extension.fallback)
      diagnostics.push(
        error(
          "extension.optional-fallback-missing",
          `/extensions/${index}/fallback`,
          "Optional extensions require a portable fallback.",
        ),
      )
  })
  document.interoperability.forEach((report, index) => {
    if (report.status === "lossy" && report.losses.length === 0)
      diagnostics.push(
        error(
          "interoperability.loss-unreported",
          `/interoperability/${index}/losses`,
          "Lossy conversions must identify at least one loss.",
        ),
      )
    if (report.status === "exact" && report.losses.length > 0)
      diagnostics.push(
        error(
          "interoperability.loss-unreported",
          `/interoperability/${index}/status`,
          "An exact conversion cannot report losses.",
        ),
      )
  })
  document.migrations.forEach((migration, index) => {
    if (migration.toVersion <= migration.fromVersion)
      diagnostics.push(
        error(
          "migration.chain-invalid",
          `/migrations/${index}/toVersion`,
          "Migrations must advance the format version.",
        ),
      )
    if (
      index > 0 &&
      document.migrations[index - 1]?.toVersion !== migration.fromVersion
    )
      diagnostics.push(
        error(
          "migration.chain-invalid",
          `/migrations/${index}/fromVersion`,
          "Migration history must be contiguous.",
        ),
      )
  })
  document.repetitions.forEach((repetition, index) => {
    duplicate(
      repetitionIds,
      repetition.id,
      `/repetitions/${index}`,
      diagnostics,
      "identity.duplicate",
    )
    if (
      !promptKeys.has(
        `${repetition.promptId}\u0000${repetition.promptRevision}`,
      )
    )
      diagnostics.push(
        error(
          "history.prompt-unresolved",
          `/repetitions/${index}/promptId`,
          "Repetition does not resolve to the exact served Prompt revision.",
          `/repetitions/${index}/promptRevision`,
        ),
      )
  })
  document.repetitionCorrections.forEach((correction, index) => {
    if (
      correction.id === correction.targetRepetitionId ||
      !repetitionIds.has(correction.targetRepetitionId)
    )
      diagnostics.push(
        error(
          "history.correction-invalid",
          `/repetitionCorrections/${index}/targetRepetitionId`,
          "Correction targets must resolve to a distinct Repetition.",
        ),
      )
  })
  return diagnostics
}

function checkReferences(
  values: string[],
  known: Set<string>,
  path: string,
  diagnostics: LineageDiagnostic[],
  code = "reference.unresolved",
) {
  values.forEach((value, index) => {
    if (!known.has(value))
      diagnostics.push(
        error(
          code,
          `${path}/${index}`,
          `Referenced entity ${value} is not declared.`,
        ),
      )
  })
}
function duplicate(
  set: Set<string>,
  key: string,
  path: string,
  diagnostics: LineageDiagnostic[],
  code: string,
) {
  if (set.has(key))
    diagnostics.push(
      error(code, path, "Stable identities must be unique in their namespace."),
    )
  set.add(key)
}
function error(
  code: string,
  path: string,
  message: string,
  relatedPath?: string,
): LineageDiagnostic {
  return { code, message, path, relatedPath, severity: "error" }
}

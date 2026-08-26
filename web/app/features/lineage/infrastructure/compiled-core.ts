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

type AgdaValue = unknown
type AgdaConstructor = (value: unknown) => AgdaValue
type RawReviewContract = unknown
type CompiledLineageApi = {
  isValidReviewContract(raw: RawReviewContract): boolean
  rawReviewContract(
    challenge: string[],
  ): (
    resolution: string[],
  ) => (response: string) => (withheld: string[]) => RawReviewContract
  some: (erased: unknown) => AgdaConstructor
  none: AgdaConstructor
  promptKind: AgdaConstructor
  lifecycle: AgdaConstructor
  requirementLevel: AgdaConstructor
  relationshipKind: AgdaConstructor
  repetitionRating: AgdaConstructor
  provenanceKind: AgdaConstructor
  conversionStatus: AgdaConstructor
  responseInteraction: AgdaConstructor
  entityReference: AgdaConstructor
  extensionSet: AgdaConstructor
  normalizedPoint: AgdaConstructor
  rectangleGeometry: AgdaConstructor
  polygonGeometry: AgdaConstructor
  rectangleGeometryValue: AgdaConstructor
  polygonGeometryValue: AgdaConstructor
  assetReference: AgdaConstructor
  clozeTarget: AgdaConstructor
  occlusionRegion: AgdaConstructor
  sourceRevision: AgdaConstructor
  materialRevision: AgdaConstructor
  prompt: AgdaConstructor
  schedulerObservation: AgdaConstructor
  repetition: AgdaConstructor
  repetitionCorrection: AgdaConstructor
  relationship: AgdaConstructor
  provenanceRecord: AgdaConstructor
  extensionDeclaration: AgdaConstructor
  migrationRecord: AgdaConstructor
  interoperabilityReport: AgdaConstructor
  corpusDocument: AgdaConstructor
  validateCorpus(document: AgdaValue): AgdaValue[]
}

const apply = (agdaConstructor: AgdaConstructor, ...values: unknown[]) =>
  values.reduce<AgdaValue>(
    (current, value) => (current as AgdaConstructor)(value),
    agdaConstructor,
  )

const natural = (value: number) => BigInt(value)

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
      const diagnostics = api
        .validateCorpus(toAgdaCorpus(api, parsed.data))
        .map(decodeDiagnostic)
      return diagnostics.length
        ? { diagnostics, valid: false }
        : { diagnostics: [], document: parsed.data, valid: true }
    },
  }
}

// This is the explicit canonical-host → Agda boundary. Zod materializes all
// documented defaults before this function runs; absent wire values become
// Agda Maybe.none, while wire names such as sha256 map positionally to the
// identically named canonical Agda fields. Keep this mapping exhaustive.
function toAgdaCorpus(api: CompiledLineageApi, document: CorpusDocument) {
  const maybe = (value: unknown) =>
    value === undefined ? api.none(undefined) : api.some(undefined)(value)
  const strings = (values: string[]) => values
  const reference = (value: { id: string; revision?: number }) =>
    apply(
      api.entityReference,
      value.id,
      maybe(value.revision && natural(value.revision)),
    )
  const extensionSet = (value: { optional: string[]; required: string[] }) =>
    apply(api.extensionSet, strings(value.required), strings(value.optional))
  const geometry = (
    value: CorpusDocument["prompts"][number]["occlusionRegions"] extends
      | (infer Region)[]
      | undefined
      ? Region extends { geometry: infer Geometry }
        ? Geometry
        : never
      : never,
  ) => {
    if (value.type === "rectangle")
      return api.rectangleGeometryValue(
        apply(
          api.rectangleGeometry,
          value.x,
          value.y,
          value.width,
          value.height,
        ),
      )
    return api.polygonGeometryValue(
      api.polygonGeometry(
        value.points.map((point) =>
          apply(api.normalizedPoint, point.x, point.y),
        ),
      ),
    )
  }
  const prompts = document.prompts.map((value) =>
    apply(
      api.prompt,
      value.id,
      natural(value.revision),
      api.lifecycle(value.status),
      api.promptKind(value.kind),
      value.challenge,
      value.withheld,
      value.resolution,
      api.responseInteraction(
        typeof value.response === "string"
          ? value.response
          : value.response.mode,
      ),
      value.materials,
      value.sources,
      value.assets,
      maybe(
        value.clozeTargets?.map((target) =>
          apply(api.clozeTarget, target.id, target.answer, maybe(target.hints)),
        ),
      ),
      maybe(value.sourceAsset),
      maybe(
        value.occlusionRegions?.map((region) =>
          apply(
            api.occlusionRegion,
            region.id,
            region.label,
            geometry(region.geometry),
            region.accessibleDescription,
          ),
        ),
      ),
      value.presentationProfile,
      extensionSet(value.extensions),
      value.provenance,
    ),
  )
  const sources = document.sources.map((value) =>
    apply(
      api.sourceRevision,
      value.id,
      natural(value.revision),
      value.title,
      value.content,
      value.assets,
      value.provenance,
    ),
  )
  const materials = document.materials.map((value) =>
    apply(
      api.materialRevision,
      value.id,
      natural(value.revision),
      value.content,
      value.sources,
      value.assets,
      value.provenance,
    ),
  )
  const assets = document.assets.map((value) =>
    apply(
      api.assetReference,
      value.id,
      value.mediaType,
      value.sha256,
      natural(value.byteSize),
      value.path,
      maybe(value.accessibleDescription),
    ),
  )
  const relationships = document.relationships.map((value) =>
    apply(
      api.relationship,
      value.id,
      api.relationshipKind(value.kind),
      reference(value.source),
      reference(value.target),
    ),
  )
  const repetitions = document.repetitions.map((value) => {
    const scheduler = value.scheduler
      ? apply(
          api.schedulerObservation,
          value.scheduler.family,
          value.scheduler.version,
          maybe(value.scheduler.parameterDigest),
          maybe(
            value.scheduler.previousIntervalMinutes === undefined
              ? undefined
              : natural(value.scheduler.previousIntervalMinutes),
          ),
          maybe(
            value.scheduler.nextIntervalMinutes === undefined
              ? undefined
              : natural(value.scheduler.nextIntervalMinutes),
          ),
          maybe(value.scheduler.dueAt),
        )
      : undefined
    return apply(
      api.repetition,
      value.id,
      value.promptId,
      natural(value.promptRevision),
      maybe(value.snapshotDigest),
      maybe(value.presentationDigest),
      value.reviewedAt,
      maybe(
        value.durationMilliseconds === undefined
          ? undefined
          : natural(value.durationMilliseconds),
      ),
      maybe(value.capturedResponse),
      api.repetitionRating(value.assessment),
      maybe(scheduler),
      value.provenance,
    )
  })
  const repetitionCorrections = document.repetitionCorrections.map((value) =>
    apply(
      api.repetitionCorrection,
      value.id,
      value.targetRepetitionId,
      value.correctedAt,
      value.reason,
      maybe(
        value.replacementAssessment
          ? api.repetitionRating(value.replacementAssessment)
          : undefined,
      ),
      maybe(value.replacementResponse),
      value.provenance,
    ),
  )
  const provenance = document.provenance.map((value) =>
    apply(
      api.provenanceRecord,
      value.id,
      api.provenanceKind(value.kind),
      value.recordedAt,
      maybe(value.agent),
      maybe(value.citation),
      maybe(value.license),
      maybe(value.note),
      value.sources,
    ),
  )
  const extensions = document.extensions.map((value) =>
    apply(
      api.extensionDeclaration,
      value.id,
      value.version,
      api.requirementLevel(value.requirement),
      maybe(value.fallback),
    ),
  )
  const migrations = document.migrations.map((value) =>
    apply(
      api.migrationRecord,
      value.id,
      natural(value.fromVersion),
      natural(value.toVersion),
      value.appliedAt,
      value.tool,
      value.toolVersion,
    ),
  )
  const interoperability = document.interoperability.map((value) =>
    apply(
      api.interoperabilityReport,
      value.id,
      value.sourceFormat,
      value.targetFormat,
      api.conversionStatus(value.status),
      value.losses,
      value.preservedArtifacts,
    ),
  )
  return apply(
    api.corpusDocument,
    document.format,
    natural(document.formatVersion),
    document.corpusId,
    prompts,
    sources,
    materials,
    assets,
    relationships,
    repetitions,
    repetitionCorrections,
    provenance,
    extensions,
    migrations,
    interoperability,
  )
}

type AgdaVisitor<T> = Record<string, (...values: never[]) => T>

function visitAgda<T>(value: AgdaValue, visitor: AgdaVisitor<T>): T {
  if (typeof value === "function")
    return (value as (visitor: AgdaVisitor<T>) => T)(visitor)
  const record = value as Record<string, (visitor: AgdaVisitor<T>) => T>
  const constructorName = Object.keys(record)[0]
  if (!constructorName) throw new Error("Agda value has no constructor")
  return record[constructorName](visitor)
}

function decodeDiagnostic(value: AgdaValue): LineageDiagnostic {
  return visitAgda(value, {
    diagnostic: (code, _severity, path, message, relatedPath) => ({
      code,
      message,
      path,
      relatedPath: decodeMaybeString(relatedPath),
      severity: "error",
    }),
  })
}

function decodeMaybeString(value: AgdaValue): string | undefined {
  return visitAgda(value, {
    just: (item) => item,
    nothing: () => undefined,
  })
}

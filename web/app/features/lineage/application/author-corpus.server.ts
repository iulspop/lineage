import type { CorpusDocument, LineageDiagnostic } from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"

export type CorpusCandidatePreview = {
  document: CorpusDocument
  canonicalJson: string
  diagnostics: LineageDiagnostic[]
  repairCount: number
}

export type CorpusCandidateResult =
  | { valid: true; preview: CorpusCandidatePreview }
  | { valid: false; diagnostics: LineageDiagnostic[]; candidateJson: string }

function structureDiagnostic(message: string): LineageDiagnostic {
  return {
    code: "structure.invalid",
    message,
    path: "/",
    severity: "error",
  }
}

function repairCandidate(
  candidate: unknown,
  diagnostics: LineageDiagnostic[],
): unknown {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate))
    return candidate

  const document = structuredClone(candidate) as Record<string, unknown>
  if (!Array.isArray(document.assets)) document.assets = []
  if (!Array.isArray(document.prompts)) return document

  for (const diagnostic of diagnostics) {
    const match = diagnostic.path.match(/^\/prompts\/(\d+)\/(.+)$/)
    if (!match) continue
    const prompt = document.prompts[Number(match[1])]
    if (!prompt || typeof prompt !== "object" || Array.isArray(prompt)) continue
    const value = prompt as Record<string, unknown>

    if (diagnostic.code === "disclosure.answer-leaked") {
      const related = diagnostic.relatedPath?.match(/\/withheld\/(\d+)$/)
      const answer = Array.isArray(value.withheld)
        ? value.withheld[Number(related?.[1] ?? 0)]
        : undefined
      if (typeof answer === "string" && Array.isArray(value.challenge))
        value.challenge = value.challenge.filter((item) => item !== answer)
    }

    if (diagnostic.code === "disclosure.answer-missing") {
      const related = diagnostic.relatedPath?.match(/\/withheld\/(\d+)$/)
      const answer = Array.isArray(value.withheld)
        ? value.withheld[Number(related?.[1] ?? 0)]
        : undefined
      if (typeof answer === "string" && Array.isArray(value.resolution))
        value.resolution = [...value.resolution, answer]
    }
  }

  return document
}

export function validateCorpusCandidate({
  candidateJson,
  maxRepairs = 2,
  validator,
}: {
  candidateJson: string
  maxRepairs?: number
  validator: ReviewContractValidator
}): CorpusCandidateResult {
  let candidate: unknown
  try {
    candidate = JSON.parse(candidateJson)
  } catch (error) {
    return {
      candidateJson,
      diagnostics: [
        structureDiagnostic(
          error instanceof Error
            ? error.message
            : "Candidate is not valid JSON.",
        ),
      ],
      valid: false,
    }
  }

  let repairCount = 0
  while (true) {
    const validation = validator.validateCorpus?.(candidate)
    if (!validation)
      return {
        candidateJson,
        diagnostics: [
          structureDiagnostic("Structured corpus validation is unavailable."),
        ],
        valid: false,
      }

    if (validation.valid) {
      return {
        preview: {
          canonicalJson: `${JSON.stringify(validation.document, null, 2)}\n`,
          diagnostics: [],
          document: validation.document,
          repairCount,
        },
        valid: true,
      }
    }

    if (repairCount >= maxRepairs)
      return {
        candidateJson: `${JSON.stringify(candidate, null, 2)}\n`,
        diagnostics: validation.diagnostics,
        valid: false,
      }

    const repaired = repairCandidate(candidate, validation.diagnostics)
    if (JSON.stringify(repaired) === JSON.stringify(candidate))
      return {
        candidateJson: `${JSON.stringify(candidate, null, 2)}\n`,
        diagnostics: validation.diagnostics,
        valid: false,
      }

    candidate = repaired
    repairCount += 1
  }
}

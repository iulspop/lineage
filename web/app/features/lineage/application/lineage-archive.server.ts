import { createHash } from "node:crypto"
import { unzipSync, zipSync } from "fflate"

import type {
  CorpusDocument,
  LineageDiagnostic,
  LineageManifest,
} from "../domain/corpus"
import {
  corpusDocumentSchema,
  lineageManifestSchema,
  structuralDiagnostics,
} from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"

export type ArchiveFiles = ReadonlyMap<string, Uint8Array>
export type ValidatedLineageArchive = {
  corpus: CorpusDocument
  manifest: LineageManifest
}
export type ArchiveValidationResult =
  | { diagnostics: []; valid: true; value: ValidatedLineageArchive }
  | { diagnostics: LineageDiagnostic[]; valid: false }

const MAX_ARCHIVE_BYTES = 50 * 1024 * 1024
const MAX_EXTRACTED_BYTES = 250 * 1024 * 1024
const MAX_ENTRY_BYTES = 100 * 1024 * 1024
const MAX_ENTRY_COUNT = 2000

export function decodeLineageArchive(bytes: Uint8Array): ArchiveFiles {
  if (bytes.byteLength > MAX_ARCHIVE_BYTES)
    throw new Error("Archive exceeds 50 MB")
  const extracted = unzipSync(bytes)
  const entries = Object.entries(extracted)
  if (entries.length > MAX_ENTRY_COUNT)
    throw new Error("Archive has too many entries")
  let total = 0
  const files = new Map<string, Uint8Array>()
  for (const [path, contents] of entries) {
    if (!isSafeArchivePath(path))
      throw new Error(`Unsafe archive path: ${path}`)
    if (contents.byteLength > MAX_ENTRY_BYTES)
      throw new Error(`Archive entry is too large: ${path}`)
    total += contents.byteLength
    if (total > MAX_EXTRACTED_BYTES)
      throw new Error("Archive expands beyond 250 MB")
    files.set(path, contents)
  }
  return files
}

export function encodeLineageArchive(files: ArchiveFiles): Uint8Array {
  return zipSync(Object.fromEntries(files), { level: 6 })
}

export function validateLineageArchive({
  files,
  validator,
}: {
  files: ArchiveFiles
  validator: ReviewContractValidator
}): ArchiveValidationResult {
  const diagnostics: LineageDiagnostic[] = []
  const manifestBytes = files.get("manifest.json")
  if (!manifestBytes)
    return invalid(
      "archive.entry-missing",
      "/manifest.json",
      "Archive has no manifest.json entry.",
    )

  let manifestInput: unknown
  try {
    manifestInput = JSON.parse(new TextDecoder().decode(manifestBytes))
  } catch {
    return invalid(
      "structure.invalid",
      "/manifest.json",
      "Archive manifest is not valid JSON.",
    )
  }
  const parsedManifest = lineageManifestSchema.safeParse(manifestInput)
  if (!parsedManifest.success)
    return {
      diagnostics: structuralDiagnostics(parsedManifest.error),
      valid: false,
    }
  const manifest = parsedManifest.data
  const normalizedPaths = new Set<string>()
  for (const [index, entry] of manifest.entries.entries()) {
    if (normalizedPaths.has(entry.path))
      diagnostics.push(
        error(
          "archive.duplicate-path",
          `/entries/${index}/path`,
          "Archive entry paths must be unique.",
        ),
      )
    normalizedPaths.add(entry.path)
    const bytes = files.get(entry.path)
    if (!bytes) {
      if (entry.required)
        diagnostics.push(
          error(
            "archive.entry-missing",
            `/entries/${index}/path`,
            `Required archive entry ${entry.path} is missing.`,
          ),
        )
      continue
    }
    if (bytes.byteLength !== entry.byteSize)
      diagnostics.push(
        error(
          "archive.digest-mismatch",
          `/entries/${index}/byteSize`,
          `Archive entry ${entry.path} has the wrong byte size.`,
        ),
      )
    if (digest(bytes) !== entry.sha256)
      diagnostics.push(
        error(
          "archive.digest-mismatch",
          `/entries/${index}/sha256`,
          `Archive entry ${entry.path} has the wrong SHA-256 digest.`,
        ),
      )
  }
  const corpusBytes = files.get(manifest.corpus)
  if (!corpusBytes)
    diagnostics.push(
      error(
        "archive.entry-missing",
        "/corpus",
        "Manifest corpus entry is missing.",
      ),
    )
  else if (digest(corpusBytes) !== manifest.corpusSha256)
    diagnostics.push(
      error(
        "archive.digest-mismatch",
        "/corpusSha256",
        "Manifest corpus digest does not match corpus bytes.",
      ),
    )
  if (diagnostics.length || !corpusBytes) return { diagnostics, valid: false }

  let corpusInput: unknown
  try {
    corpusInput = JSON.parse(new TextDecoder().decode(corpusBytes))
  } catch {
    return invalid(
      "structure.invalid",
      `/${manifest.corpus}`,
      "Corpus entry is not valid JSON.",
    )
  }
  const validation = validator.validateCorpus?.(corpusInput)
  if (!validation)
    return invalid(
      "structure.invalid",
      `/${manifest.corpus}`,
      "Structured corpus validation is unavailable.",
    )
  if (!validation.valid) return validation
  if (validation.document.corpusId !== manifest.corpusId)
    return invalid(
      "manifest.corpus-mismatch",
      "/corpusId",
      "Manifest corpus identity differs from corpus.json.",
    )

  const declaredPaths = new Set(manifest.entries.map(({ path }) => path))
  validation.document.assets.forEach((asset, index) => {
    if (!declaredPaths.has(asset.path) || !files.has(asset.path))
      diagnostics.push(
        error(
          "archive.entry-missing",
          `/assets/${index}/path`,
          `Asset bytes for ${asset.id} are missing from the archive.`,
        ),
      )
    const bytes = files.get(asset.path)
    if (
      bytes &&
      (bytes.byteLength !== asset.byteSize || digest(bytes) !== asset.sha256)
    )
      diagnostics.push(
        error(
          "archive.digest-mismatch",
          `/assets/${index}/sha256`,
          `Asset integrity failed for ${asset.id}.`,
        ),
      )
  })
  return diagnostics.length
    ? { diagnostics, valid: false }
    : {
        diagnostics: [],
        valid: true,
        value: { corpus: validation.document, manifest },
      }
}

export function createLineageManifest({
  corpusBytes,
  corpusId,
  entries,
  timestamp,
}: {
  corpusBytes: Uint8Array
  corpusId: string
  entries: {
    bytes: Uint8Array
    mediaType: string
    path: string
    required?: boolean
    role?: "asset" | "preserved-original"
  }[]
  timestamp: string
}): LineageManifest {
  return corpusDocumentSchema.parse(
    JSON.parse(new TextDecoder().decode(corpusBytes)),
  ).corpusId === corpusId
    ? lineageManifestSchema.parse({
        corpus: "corpus.json",
        corpusId,
        corpusSha256: digest(corpusBytes),
        createdAt: timestamp,
        entries: [
          {
            byteSize: corpusBytes.byteLength,
            mediaType: "application/json",
            path: "corpus.json",
            required: true,
            role: "corpus",
            sha256: digest(corpusBytes),
          },
          ...entries.map((entry) => ({
            byteSize: entry.bytes.byteLength,
            mediaType: entry.mediaType,
            path: entry.path,
            required: entry.required ?? true,
            role: entry.role ?? "asset",
            sha256: digest(entry.bytes),
          })),
        ],
        format: "lineage.manifest",
        formatVersion: 1,
        modifiedAt: timestamp,
      })
    : (() => {
        throw new Error(
          "Corpus identity does not match requested manifest identity",
        )
      })()
}

function digest(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex")
}

function isSafeArchivePath(path: string) {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    path
      .split("/")
      .every((segment) => segment !== "" && segment !== "." && segment !== "..")
  )
}

function invalid(
  code: string,
  path: string,
  message: string,
): ArchiveValidationResult {
  return { diagnostics: [error(code, path, message)], valid: false }
}
function error(code: string, path: string, message: string): LineageDiagnostic {
  return { code, message, path, severity: "error" }
}

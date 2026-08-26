import { createHash } from "node:crypto"
import { describe, expect, test } from "vitest"

import { parseCorpusDocument, serializeCorpusDocument } from "../domain/corpus"
import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import {
  createLineageManifest,
  decodeLineageArchive,
  encodeLineageArchive,
  validateLineageArchive,
} from "./lineage-archive.server"

const encoder = new TextEncoder()
const corpus = {
  assets: [
    {
      byteSize: 3,
      id: "diagram",
      mediaType: "image/png",
      path: "assets/diagram.png",
      sha256: "unused",
    },
  ],
  corpusId: "archive-corpus",
  format: "lineage.corpus",
  formatVersion: 1,
  prompts: [
    {
      assets: ["diagram"],
      challenge: ["Identify the diagram."],
      id: "diagram-prompt",
      resolution: ["heart"],
      response: { capture: "none", mode: "self-check" },
      revision: 1,
      withheld: ["heart"],
    },
  ],
} as const
const assetBytes = new Uint8Array([1, 2, 3])

describe("Lineage archive validation", () => {
  test("validates manifest, corpus, media integrity, and dependency closure", () => {
    const assetDigest = createHash("sha256").update(assetBytes).digest("hex")
    const canonical = serializeCorpusDocument(
      parseCorpusDocument({
        ...corpus,
        assets: [{ ...corpus.assets[0], sha256: assetDigest }],
      }),
    )
    const corpusBytes = encoder.encode(canonical)
    const manifest = createLineageManifest({
      corpusBytes,
      corpusId: corpus.corpusId,
      entries: [
        {
          bytes: assetBytes,
          mediaType: "image/png",
          path: "assets/diagram.png",
        },
      ],
      timestamp: "2026-08-26T12:00:00Z",
    })
    const result = validateLineageArchive({
      files: new Map([
        ["manifest.json", encoder.encode(JSON.stringify(manifest))],
        ["corpus.json", corpusBytes],
        ["assets/diagram.png", assetBytes],
      ]),
      validator: lineageRuntime,
    })
    expect(result.valid).toBe(true)
  })

  test("round-trips ZIP bytes and rejects traversal paths", () => {
    const bytes = encodeLineageArchive(
      new Map([
        ["manifest.json", encoder.encode("{}")],
        ["assets/diagram.png", assetBytes],
      ]),
    )
    expect(decodeLineageArchive(bytes).get("assets/diagram.png")).toEqual(
      assetBytes,
    )

    const unsafe = encodeLineageArchive(
      new Map([["../outside.txt", encoder.encode("unsafe")]]),
    )
    expect(() => decodeLineageArchive(unsafe)).toThrow("Unsafe archive path")
  })

  test("rejects invented or mismatched media integrity", () => {
    const corpusBytes = encoder.encode(
      serializeCorpusDocument(
        parseCorpusDocument({
          ...corpus,
          assets: [{ ...corpus.assets[0], sha256: "0".repeat(64) }],
        }),
      ),
    )
    const manifest = createLineageManifest({
      corpusBytes,
      corpusId: corpus.corpusId,
      entries: [
        {
          bytes: assetBytes,
          mediaType: "image/png",
          path: "assets/diagram.png",
        },
      ],
      timestamp: "2026-08-26T12:00:00Z",
    })
    const result = validateLineageArchive({
      files: new Map([
        ["manifest.json", encoder.encode(JSON.stringify(manifest))],
        ["corpus.json", corpusBytes],
        ["assets/diagram.png", assetBytes],
      ]),
      validator: lineageRuntime,
    })
    expect(result.valid).toBe(false)
    if (result.valid) throw new Error("Expected invalid archive")
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: "archive.digest-mismatch" }),
    )
  })
})

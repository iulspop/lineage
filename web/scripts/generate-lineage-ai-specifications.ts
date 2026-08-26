import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import lineageCore from "../app/features/lineage/generated/lineage-core.mjs"
import {
  decodeFormatDescription,
  toAuthoringSpec,
  toBriefSpec,
  toFullSpec,
  toJsonSchema,
  toSerializableDescription,
  toTypeScript,
} from "./lineage-format-description"

type GeneratedFile = { content: string; relativePath: string }

const outputDirectory = path.resolve(
  process.argv[2] ?? "../generated/lineage-ai",
)
const description = decodeFormatDescription(lineageCore.formatDescription)
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`

const files: GeneratedFile[] = [
  {
    content: toBriefSpec(description),
    relativePath: "spec/lineage-ai-brief.md",
  },
  {
    content: toAuthoringSpec(description),
    relativePath: "spec/lineage-ai-authoring.md",
  },
  {
    content: toFullSpec(description),
    relativePath: "spec/lineage-ai-full.md",
  },
  {
    content: json(
      toJsonSchema(
        description,
        "CorpusDocument",
        "https://lineage.dev/schema/lineage-corpus.schema.json",
        "Lineage corpus version 1",
      ),
    ),
    relativePath: "schema/lineage-corpus.schema.json",
  },
  {
    content: json(
      toJsonSchema(
        description,
        "Manifest",
        "https://lineage.dev/schema/lineage-manifest.schema.json",
        "Lineage archive manifest version 1",
      ),
    ),
    relativePath: "schema/lineage-manifest.schema.json",
  },
  {
    content: toTypeScript(description),
    relativePath: "types/lineage-corpus.ts",
  },
  ...description.examples.map((example) => ({
    content: json(example.document),
    relativePath: `examples/${example.fileName}`,
  })),
  ...description.fixtures.map((fixture) => ({
    content: json(
      fixture.expectation.kind === "valid"
        ? { document: fixture.document }
        : {
            document: fixture.document,
            expectedDiagnostic: {
              code: fixture.expectation.code,
              path: fixture.expectation.path,
            },
          },
    ),
    relativePath: `conformance/${fixture.expectation.kind}/${fixture.fileName}`,
  })),
  {
    content: json(toSerializableDescription(description)),
    relativePath: "format-description.json",
  },
]

await rm(outputDirectory, { force: true, recursive: true })
for (const file of files) {
  const destination = path.join(outputDirectory, file.relativePath)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, file.content)
}
console.log(
  `Generated ${files.length} Lineage AI specification artifacts in ${outputDirectory}`,
)
